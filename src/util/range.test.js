const assert = require('assert')
const range = require('./range')

describe('range', () => {
  describe('range of 5..16', () => {
    const from5to16 = range(5, 16)

    it('TRUE for 5, 10, 16', () => {
      [5, 10, 16].forEach(_ =>
        assert.equal(
          from5to16(_),
          true
        )
      )
    })

    it('FALSE for 0, 4, 17', () => {
      [0, 4, 17].forEach(_ =>
        assert.equal(
          from5to16(_),
          false
        )
      )
    })

    it('is iterable', () => {
      assert.deepEqual(
        [...from5to16],
        [5,6,7,8,9,10,11,12,13,14,15,16]
      )
    })
  })
})
