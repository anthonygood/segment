const path = require('path')

const getPath = name => path.resolve(__dirname, '../img', `${name}.png`)
const getOutputPath = name => `${name}-PROCESSED.png`

module.exports = {
  getPath, getOutputPath
}
