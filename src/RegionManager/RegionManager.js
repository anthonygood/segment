const proc = require('child_process')
const Region = require('../Region/Region')
const Config = require('../util/Config')
const { lineX, lineY } = require('../util/draw')

class RegionManagerConfig extends Config {
  static get DEFAULTS() {
    return {
      BLUR: 1,
      PROC_IMAGE_SCALE: .1,
      THRESHOLD: 240,
    }
  }
}

class RegionManager {
  constructor(image, config) {
    this.config = new RegionManagerConfig(config)
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
      .scale(PROC_IMAGE_SCALE)
      .blur(BLUR)
  }

  // Return a tuple of two arrays: first includes all regions touching xy,
  // second array includes all other regions.
  bisect(x, y) {
    const touching = []
    const other = []

    this._regions.forEach(region => {
      const category = region.touches(x, y) ? touching : other
      category.push(region)
    })

    return [touching, other]
  }

  add(x, y) {
    const [touching, other] = this.bisect(x, y)
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
    x = 0,
    y = 0,
    w = this._image.bitmap.width,
    h = this._image.bitmap.height,
  ) {
    const image = this._image
    const bitmap = image.bitmap.data

    console.debug(`Scanning image w ${w} h ${h}.`)

    image.scan(x, y, w, h, (x, y, idx) => {
      // RGB all equal value in greyscale image
      const redVal = bitmap[idx]
      redVal < this.config.THRESHOLD && this.add(x, y)
    })

    return this
  }

  draw(image = this._image, scale = 1) {
    this._regions.forEach((region, i) => {
      const red = 0xff0000ff

      const { lo: [x1, y1], hi: [x2, y2] } = region.scale(scale)
      const lines = [
        lineY(y1, x1, x2),
        lineY(y2, x1, x2),
        lineX(x1, y1, y2),
        lineX(x2, y1, y2),
      ]

      for (const line of lines) {
        for (const [x, y] of line) {
          image.setPixelColour(red, x, y)
        }
      }
    })

    return this
  }

  drawAndSave(filename, image = this._image, scale = 1) {
    this.draw(image, scale)
    return image.write(filename)
  }

  async drawAndOpen(filename, image = this._image, scale = 1) {
    await this.drawAndSave(filename, image, scale)
    return setTimeout(() => proc.execSync(`open ${filename}`), 250)
  }

  get length() {
    return this._regions.length
  }
}

module.exports = {
  RegionManager, RegionManagerConfig
}
