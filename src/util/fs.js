const proc = require('child_process')
const path = require('path')

const getPath = name => path.resolve(__dirname, '../img', `${name}.png`)
const getOutputPath = name => `${name}-PROCESSED.png`
const open = name => setTimeout(() => proc.execSync(`open ${name}`), 250)

module.exports = {
  getPath, getOutputPath, open
}
