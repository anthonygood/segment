const path = require('path')
const jimp = require('jimp')
const Region = require('./Region/Region')
const range = require('./util/range')

const TEST_IMG_PATH = path.resolve(__dirname, 'img/wiki-excerpt.png')
const OUTPUT_PATH = 'wiki-excerpt-PROCESSED.png'
const THRESHOLD = 240
const BLUR = 10
const SCALE = .1

const scale = (scale, ...values) =>
  values.map(_ => _ / scale)

function* lineX(constant, i1, i2) {
  const [constantS, is1, is2] = scale(SCALE, constant, i1, i2)
  for (const i of range(is1, is2)) {
    yield [constantS, i]
  }
}

// Similar to above but yielded values are flipped
function* lineY(y, x1, x2) {
  for (const [sy, sx] of lineX(y, x1, x2)) {
    yield [sx, sy]
  }
}

class RegionManager {
  constructor(image) {
    this._image = this.preprocess(image)
    this._regions = []
  }

  preprocess(image) {
    return image
      .clone()
      .greyscale()
      .blur(BLUR)
      .scale(SCALE)
  }

  findByLocation(x, y) {
    return this._regions.find(region => region.touches(x, y))
  }

  add(x, y) {
    const region = this.findByLocation(x, y)

    if (region) {
      region.add(x, y)
    } else {
      this._regions.push(new Region(x, y))
    }

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
      redVal < THRESHOLD && this.add(x, y)
    })

    return this
  }

  draw(image = this._image) {
    this._regions.forEach((region, i) => {
      const red = 0xff0000ff

      console.debug(`Drawing region ${region.lo}, ${region.hi} of area ${region.area}`)

      const { lo: [x1, y1], hi: [x2, y2] } = region
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

  get length() {
    return this._regions.length
  }
}

const main = async () => {
  const image = await jimp.read(TEST_IMG_PATH)
  const regions = new RegionManager(image).scan()

  regions.draw(image)

  await image.write(OUTPUT_PATH)
}

main()
