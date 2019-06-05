const { MIME_PNG } = require('jimp')
const { recognize } = require('penteract')

const recogniseText = async image => {
  return new Promise((resolve, reject) => {
    image.getBuffer(MIME_PNG, async (err, buff) => {
      if (err) reject(err)

      const text = await recognize(buff)
      resolve(text)
    })
  })
}

const toDocumentNode = async (id, image) => {
  const { width, height } = image.bitmap
  const area = width * height
  const text = await recogniseText(image)
  return {
    id,
    text,
    area,
    prominence: Math.floor(area / text.length),
    children: {},
  }
}

const getDocumentGraph = async (regionManager, parent) => {
  const { id, originalImage, subRegions } = regionManager
  const thisNode = await toDocumentNode(id, originalImage)

  if (parent) thisNode.parent = parent
  if (subRegions) {
    for (const region of subRegions) {
      thisNode.children[region.id] = await getDocumentGraph(region, thisNode)
    }
  }

  return thisNode
}

module.exports = getDocumentGraph
