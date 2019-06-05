const jimp = require('jimp')
const { recognize } = require('penteract')

const RegionManager = require('./RegionManager/RegionManager')
const RegionManagerConfig = require('./RegionManager/RegionManagerConfig')
const { getPath, getOutputPath, open } = require('./util/fs')

const PROC_IMAGE_TO_FULL_SIZE_SCALE = 1 / RegionManagerConfig.DEFAULTS.PROC_IMAGE_SCALE

const process = async filename => {
  const filepath = getPath(filename)
  const outputFile = getOutputPath(filename)
  const image = await jimp.read(filepath)

  const regions = await new RegionManager(image)
    .scan(3)
    // .draw(PROC_IMAGE_TO_FULL_SIZE_SCALE)
    // .save(outputFile)
    // .getText()
    .getDocumentGraph()

  console.log("ALL TEXT: ", regions)

  // open(outputFile)

  // await regions.draw(1, regions._image).save('region_' + outputFile, regions._image)
  // open('region_' + outputFile)

  return regions
}

const main = async () => {
  return process('CVs/CV1')

  // Array.from({ length: 1 }).fill()
  //   .map((_, i) => `CVs/CV${i + 1}`)
  //   .forEach(process)
}

main()
module.exports = process
