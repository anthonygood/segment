const path = require('path')
const jimp = require('jimp')
const Region = require('./Region/Region')
const range = require('./util/range')

const THRESHOLD = 240
const BLUR = 10
const PROC_IMAGE_SCALE = .1
const PROC_IMAGE_TO_FULL_SIZE_SCALE = 1 / PROC_IMAGE_SCALE

function* lineX(constant, i1, i2) {
  for (const i of range(i1, i2)) {
    yield [constant, i]
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
      .scale(PROC_IMAGE_SCALE)
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

  get length() {
    return this._regions.length
  }
}

const getPath = name => path.resolve(__dirname, 'img', `${name}.png`)
const getOutputPath = name => `${name}-PROCESSED.png`

const process = async filename => {
  const image = await jimp.read(
    getPath(filename)
  )
  const regions = new RegionManager(image).scan()

  regions.draw(image, PROC_IMAGE_TO_FULL_SIZE_SCALE)

  await image.write(
    getOutputPath(filename)
  )

  regions.draw(regions._image)

  await regions._image.write(
    'region_' + getOutputPath(filename)
  )
}

const main = () => {
  [
    'cv',
    // 'ft',
    // 'gmail',
    // 'guardian',
    // 'wiki-excerpt',
  ].forEach(process)
}

main()
