const path = require('path')
const jimp = require('jimp')
const Region = require('./Region/Region')
const range = require('./util/range')

const TEST_IMG_PATH = path.resolve(__dirname, 'img/wiki-excerpt.png')
const OUTPUT_PATH = 'wiki-excerpt-PROCESSED.png'
const THRESHOLD = 250

const OFFSET = 5
function* crosshair(x, y) {
  for (const xi of range(x - OFFSET, x + OFFSET)) {
    for (const yi of range(y - OFFSET, y + OFFSET)) {
      yield [xi, yi]
    }
  }
}

function* lineX(constant, i1, i2) {
  for (const i of range(i1, i2)) {
    yield [constant, i]
  }
}

// Similar to above but yielded values are flipped
function* lineY(y, x1, x2) {
  for (const [_, x] of lineX(y, x1, x2)) {
    yield [x, y]
  }
}

class RegionManager {
  constructor(image) {
    const { width, height } = image.bitmap
    this._image = image.clone().greyscale()
    this._width = width
    this._height = height
    this._regions = []
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
    w = this._width,
    h = this._height,
  ) {
    const image = this._image
    const bitmap = image.bitmap.data

    image.scan(x, y, w, h, (x, y, idx) => {
      // RGB all equal value in greyscale image
      const red = bitmap[idx]
      red < THRESHOLD && this.add(x, y)
    })

    return this
  }

  draw(image = this._image) {
    console.log('DRAW')
    this._regions.forEach((region, i) => {
      const red   = 0xff0000ff
      const green = 0x00ff00ff
      const blue  = 0x0000ffff

      const colour = i % 2 ? red : blue

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


      // region.bounds().forEach(point => {
      //   const { hi, lo } = reg
      //   process.stdout.write('o')

      //   console.log(point)

      //   for (const [x, y] of crosshair(...point)) {
      //     process.stdout.write('*')
      //     image.setPixelColour(red, x, y)
      //   }
      // })

      // image
        // .setPixelColour(red, ...r.lo)
        // .setPixelColour(green, ...r.hi)
    })

    return this
  }
}

const main = async () => {
  const image = await jimp.read(TEST_IMG_PATH)

  await image
    .blur(17)
    .scale(.1)
    // .contrast(.25)
    // .write(OUTPUT_PATH)

  const regions = new RegionManager(image).scan()

  regions.draw(image)

  await image.write(OUTPUT_PATH)
}

main()
