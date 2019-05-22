const range = require('../util/range')
const Config = require('../util/Config')

class RegionConfig extends Config {
  static get DEFAULTS() {
    return {
      margin: 1
    }
  }
}

const scale = (scale, ...values) =>
  values.map(_ => _ * scale)

// Quadrilateral region
class Region {
  constructor(
    x1 = 0,
    y1 = 0,
    x2 = x1,
    y2 = y1,
    config = {}
  ) {
    this.lo = [x1, y1]
    this.hi = [x2, y2]
    this.consolidated = false

    this.config = new RegionConfig(config)
  }

  add(x, y) {
    const [loX, loY] = this.lo
    const [hiX, hiY] = this.hi

    this.lo = [Math.min(loX, x), Math.min(loY, y)]
    this.hi = [Math.max(hiX, x), Math.max(hiY, y)]
    return this
  }

  addRegion({ lo, hi }) {
    this.add(...lo)
    this.add(...hi)
    this.consolidated = true
    return this
  }

  contains(x, y) {
    const [loX, loY] = this.lo
    const [hiX, hiY] = this.hi

    return (
      (loX <= x && loY <= y) &&
      (hiX >= x && hiY >= y)
    )
  }

  touches(x, y) {
    const [loX, loY] = this.lo
    const [hiX, hiY] = this.hi
    const { margin } = this.config

    const xIncludes = range(loX - margin, hiX + margin)
    const yIncludes = range(loY - margin, hiY + margin)

    return (
      xIncludes(x) &&
      yIncludes(y)
    )
  }

  bounds() {
    const [loX, loY] = this.lo
    const [hiX, hiY] = this.hi
    return [
      [loX, loY],
      [hiX, hiY],
      [hiX, loY],
      [hiX, hiY]
    ]
  }

  scale(num) {
    const [loX, loY] = this.lo
    const [hiX, hiY] = this.hi

    const [x1, y1, x2, y2] = scale(num, loX, loY, hiX, hiY)

    return new Region(x1, y1, x2, y2, this.config)
  }

  get width() {
    const [loX] = this.lo
    const [hiX] = this.hi
    return hiX - loX
  }

  get height() {
    const [, loY] = this.lo
    const [, hiY] = this.hi
    return hiY - loY
  }

  get area() {
    return this.width * this.height
  }
}

module.exports = Region
