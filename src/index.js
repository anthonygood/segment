const jimp = require('jimp')

const RegionManager = require('./RegionManager/RegionManager')
const RegionManagerConfig = require('./RegionManager/RegionManagerConfig')
const { getPath, getOutputPath, open } = require('./util/fs')

const PROC_IMAGE_TO_FULL_SIZE_SCALE = 1 / RegionManagerConfig.DEFAULTS.PROC_IMAGE_SCALE

const process = async filename => {
  const filepath = getPath(filename)
  const outputFile = getOutputPath(filename)
  const image = await jimp.read(filepath)
  const regions = await new RegionManager(image)
    .scan(2)
    .draw(PROC_IMAGE_TO_FULL_SIZE_SCALE)
    .save(outputFile)

  open(outputFile)

  await regions.draw(1, regions._image).save('region_' + outputFile, regions._image)
  open('region_' + outputFile)

  return regions
}

const main = async () => {
  // [
    // 'cv',
    // 'ft',
    // 'gmail',
    // 'guardian',
    // 'wiki-excerpt',
  // ].forEach(process)

  return process('CVs/CV1')

  // Array.from({ length: 5 }).fill()
  //   .map((_, i) => `CVs/CV${i + 1}`)
  //   .forEach(process)
}

main()
module.exports = main
