const range = require('./range')

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

module.exports = {
  lineX, lineY
}
