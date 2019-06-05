const Region = require('../Region/Region')
const RegionManagerConfig = require('./RegionManagerConfig')
const { bisect } = require('../util/util')
const { BLUE, GREEN, RED } = require('../util/draw')
const getDocumentGraph = require('../DocumentGraph/getDocumentGraph')

let i = 0

const getNextColour = colour =>
  ({
    [RED]: BLUE,
    [BLUE]: GREEN,
    [GREEN]: RED,
  }[colour])

class RegionManager {
  constructor(image, config, translateX = 0, translateY = 0) {
    this.config = config instanceof RegionManagerConfig ?
      config :
      new RegionManagerConfig(config)

    this.translateX = translateX
    this.translateY = translateY
    this.id = ++i
    this.originalImage = image

    this._regions = []
    this._image = this.preprocess(image)
  }

  preprocess(image) {
    const {
      BLUR,
      PROC_IMAGE_SCALE
    } = this.config

    return image
      .clone()
      .greyscale()
      .blur(BLUR)
      .scale(PROC_IMAGE_SCALE)
  }

  add(x, y) {
    const [touching, other] = bisect(this._regions, region => region.touches(x, y))
    const [region, ...rest] = touching.length ? touching : [new Region(x, y)]

    // If more than one region touches this location,
    // consolidate regions before adding location to region.
    if (rest.length) {
      rest.forEach(r => region.addRegion(r))
    }

    region.add(x, y)

    // Reset _regions in case consolidation occurred
    // TODO: should only do this if it does?
    this._regions = other
    this._regions.push(region)

    return this
  }

  scan(depth = 1) {
    const x = 0
    const y = 0
    const w = this._image.bitmap.width
    const h = this._image.bitmap.height
    const image = this._image
    const bitmap = image.bitmap.data
    const { THRESHOLD } = this.config

    console.debug(`Scanning image w ${w} h ${h}.`)

    image.scan(x, y, w, h, (x, y, idx) => {
      // RGB all equal value in greyscale image
      const redVal = bitmap[idx]
      redVal < THRESHOLD && this.add(x, y)
    })

    this.cleanRegions()

    // Potentially the _regions.length check will mean large undifferentiated
    // regions won't get sub-divided (imagine a big page with a small area of detail)
    // but this may be appropriate or even desirable.
    if (depth > 1 && this._regions.length > 1) {
      this.recursiveScan(depth)
    }

    return this
  }

  recursiveScan(depth) {
    const {
      originalImage,
      _regions,
      config,
      translateX,
      translateY
    } = this
    const {
      BLUR,
      RECURSIVE_BLUR_FACTOR,
      PROC_IMAGE_SCALE,
      RECURSIVE_SCALE_FACTOR,
    } = config

    this._rms = _regions.map(
      region => {
        // TODO: this logic could be moved to constructor?
        const { lo: [x1, y1], width, height } = region.scale(1 / PROC_IMAGE_SCALE)
        const regionImage = originalImage.clone().crop(x1, y1, width, height)

        return new RegionManager(
          regionImage,
          {
            ...config,
            BLUR: BLUR * RECURSIVE_BLUR_FACTOR,
            PROC_IMAGE_SCALE: PROC_IMAGE_SCALE * RECURSIVE_SCALE_FACTOR, // Increment scale
          },
          x1 + translateX,
          y1 + translateY
        ).scan(depth - 1)
      }
    )

    this.cleanRegionManagers()
  }

  cleanRegions() {
    const { MIN_HEIGHT, MIN_WIDTH } = this.config

    this._regions = this._regions.filter(
      region => region.area &&
        region.height > MIN_HEIGHT &&
        region.width > MIN_WIDTH
    )

    return this
  }

  cleanRegionManagers() {
    if (this._rms) this._rms = this._rms.filter(regionManager =>
      regionManager._regions.length
    )

    return this
  }

  draw(
    scale = 1,
    image = this.originalImage,
    colour = RED
  ) {
    this._regions.forEach(region => {
      const lines = region.scale(scale).border()

      for (const line of lines) {
        for (const [x, y] of line) {
          image.setPixelColour(colour, x + this.translateX, y + this.translateY)
        }
      }
    })

    if (this._rms) {
      this._rms.forEach(regionManager =>
        regionManager.draw(
          scale / regionManager.config.RECURSIVE_SCALE_FACTOR,
          image,
          getNextColour(colour)
        )
      )
    }

    return this
  }

  async getDocumentGraph(parent) {
    return getDocumentGraph(this)
  }

  async save(filename, image = this.originalImage) {
    await image.write(filename)
    return this
  }

  get length() {
    return this._regions.length
  }

  get subRegions() {
    return this._rms || null
  }
}

module.exports = RegionManager
