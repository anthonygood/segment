const jimp = require('jimp')

const { RegionManager, RegionManagerConfig } = require('./RegionManager/RegionManager')
const { getPath, getOutputPath } = require('./util/fs')

const PROC_IMAGE_TO_FULL_SIZE_SCALE = 1 / RegionManagerConfig.DEFAULTS.PROC_IMAGE_SCALE

const process = async filename => {
  const filepath = getPath(filename)
  const outputFile = getOutputPath(filename)
  const image = await jimp.read(filepath)
  const regions = new RegionManager(image).scan(2)

  await regions.drawAndOpen('region_' + outputFile)
  await regions.drawAndOpen(outputFile, image, PROC_IMAGE_TO_FULL_SIZE_SCALE)
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
