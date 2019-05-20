const range = require('../util/range')

const DEFAULTS = {
  margin: 1
}

class RegionConfig {
  constructor(config = {}) {
    Object.assign(this, DEFAULTS, config)
  }
}

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

    this.config = new RegionConfig(config)
  }

  add(x, y) {
    const [loX, loY] = this.lo
    const [hiX, hiY] = this.hi

    this.lo = [Math.min(loX, x), Math.min(loY, y)]
    this.hi = [Math.max(hiX, x), Math.max(hiY, y)]
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
