const proc = require('child_process')
const Region = require('../Region/Region')
const Config = require('../util/Config')
const { lineX, lineY } = require('../util/draw')

class RegionManagerConfig extends Config {
  static get DEFAULTS() {
    return {
      BLUR: 10,
      PROC_IMAGE_SCALE: .1, // scale for processing image at
      DRAW_SCALE: 10,       // scale back up from processed image to full size
      THRESHOLD: 240,
      MIN_HEIGHT: 2,
      MIN_WIDTH: 2
    }
  }
}

let i = 0

class RegionManager {
  constructor(image, config, transformX = 0, transformY = 0) {
    this.config = config instanceof RegionManagerConfig ?
      config :
      new RegionManagerConfig(config)

    // TODO: set bounds here? or in scan()?
    // Maybe no need, but possibly need a transform to apply region over master-region
    this.transformX = transformX
    this.transformY = transformY
    this.id = ++i

    console.log('this transform: ', this.id, this.transformX, this.transformY)

    // this.w = w
    // this.h = h
    this._regions = []
    this._originalImage = image
    this._image = this.preprocess(image) // With recursive scanning, this is onerous
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

  scan(
    depth = 1,
    x = 0,
    y = 0,
    w = this._image.bitmap.width,
    h = this._image.bitmap.height,
    scale = this.config.DRAW_SCALE
  ) {
    const image = this._image
    const bitmap = image.bitmap.data

    console.debug(`Scanning image w ${w} h ${h}.`)

    image.scan(x, y, w, h, (x, y, idx) => {
      // RGB all equal value in greyscale image
      const redVal = bitmap[idx]
      redVal < this.config.THRESHOLD && this.add(x, y)
    })

    this.cleanRegions()

    if (depth > 1) {
      console.log('Scanning region recursively.')

      this._rms = this._regions.map(
        region => {
          // TODO: this logic could be moved to constructor?
          const scaled = region.scale(scale)
          const { lo: [x1, y1] } = scaled
          const regionImage = image.clone().crop(x1, y1, scaled.width, scaled.height)
          return new RegionManager(
            regionImage,
            {
              ...this.config,
              BLUR: this.config.BLUR / depth,
              // PROC_IMAGE_SCALE: this.config.PROC_IMAGE_SCALE * 2, //TODO!
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
    image = this._image,
    scale = 1,
    colour = 0xff0000ff // red
  ) {
    const rmBorder = [
      lineY(0, 0, this._image.width),
      lineY(this._image.height, 0, this._image.width),
      lineX(0, 0, this._image.height),
      lineX(this._image.height, 0, this._image.height),
    ]

    for (const border of rmBorder) {
      for (const [x, y] of border) {
        image.setPixelColour(0xffff00ff, x, y)
      }
    }

    this._regions.forEach(region => {
      const { lo: [x1, y1], hi: [x2, y2] } = region.scale(scale)

      const lines = [
        lineY(y1, x1, x2),
        lineY(y2, x1, x2),
        lineX(x1, y1, y2),
        lineX(x2, y1, y2),
      ]

      for (const line of lines) {
        for (const [x, y] of line) {
          image.setPixelColour(colour, x + this.transformX, y + this.transformY)
        }
      }
    })

    if (this._rms) {
      // Need to apply a transformation to place regions correctly on image
      this._rms.forEach(regionManager =>
        regionManager.draw(image, scale, 0x00ff00ff)
      )
    }

    return this
  }

  drawAndSave(filename, image = this._image, scale = 1) {
    this.draw(image, scale)
    return image.write(filename)
  }

  async drawAndOpen(filename, image = this._image, scale = 1) {
    await this.drawAndSave(filename, image, scale)

    // Without setTimeout seems unreliable ...
    return setTimeout(() => proc.execSync(`open ${filename}`), 250)
  }

  get length() {
    return this._regions.length
  }
}

module.exports = {
  RegionManager, RegionManagerConfig
}
