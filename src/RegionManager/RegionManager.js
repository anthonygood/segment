const Region = require('../Region/Region')
const RegionManagerConfig = require('./RegionManagerConfig')

let i = 0

class RegionManager {
  constructor(image, config, transformX = 0, transformY = 0) {
    this.config = config instanceof RegionManagerConfig ?
      config :
      new RegionManagerConfig(config)

    this.transformX = transformX
    this.transformY = transformY
    this.id = ++i

    this._regions = []
    this._originalImage = image
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

  // Return a tuple of two arrays: first includes all regions fulfilling fn(region),
  // second array includes all other regions.
  bisect(fn) {
    const yes = []
    const no = []

    this._regions.forEach(region => {
      const category = fn(region) ? yes : no
      category.push(region)
    })

    return [yes, no]
  }

  add(x, y) {
    const [touching, other] = this.bisect(region => region.touches(x, y))
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

    if (depth > 1) {
      console.log('Scanning region recursively.')

      this._rms = this._regions.map(
        region => {
          const {
            BLUR,
            RECURSIVE_BLUR_FACTOR,
            PROC_IMAGE_SCALE,
            RECURSIVE_SCALE_FACTOR,
          } = this.config
          // TODO: this logic could be moved to constructor?
          const scaled = region.scale(1 / PROC_IMAGE_SCALE)
          const { lo: [x1, y1] } = scaled
          const regionImage = this._originalImage.clone().crop(x1, y1, scaled.width, scaled.height)

          return new RegionManager(
            regionImage,
            {
              ...this.config,
              BLUR: BLUR * RECURSIVE_BLUR_FACTOR,
              PROC_IMAGE_SCALE: PROC_IMAGE_SCALE * RECURSIVE_SCALE_FACTOR, // Increment scale
            },
            ...scaled.lo
          ).scan(depth - 1)
        }
      )

      this.cleanRegionManagers()
    }

    return this
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
      regionManager._regions.length > 1
    )

    return this
  }

  draw(
    scale = 1,
    image = this._originalImage,
    colour = 0xff0000ff // red
  ) {
    this._regions.forEach(region => {
      const lines = region.scale(scale).border()

      for (const line of lines) {
        for (const [x, y] of line) {
          image.setPixelColour(colour, x + this.transformX, y + this.transformY)
        }
      }
    })

    if (this._rms) {
      // Need to apply a transformation to place regions correctly on image
      this._rms.forEach(regionManager =>
        regionManager.draw(
          scale / regionManager.config.RECURSIVE_SCALE_FACTOR,
          image,
          0x00ff00ff
        )
      )
    }

    return this
  }

  async save(filename, image = this._originalImage) {
    await image.write(filename)
    return this
  }

  get length() {
    return this._regions.length
  }
}

module.exports = RegionManager
