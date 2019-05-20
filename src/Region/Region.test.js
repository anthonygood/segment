const assert = require('assert')
const Region = require('./Region')

describe('Region', () => {
  // 4*4 grid like:
  // const pixels = [
  //   [0,0,0,0],
  //   [0,0,1,0],
  //   [0,0,0,0],
  //   [0,0,0,0]
  // ]
  // const region = [
  //   [0,0,0,0],
  //   [0,0,x,0],
  //   [0,0,0,0],
  //   [0,0,0,0]
  // ]

  // Creating a region from '1' pixel above
  const region = new Region(2, 1)

  describe('#touches', () => {
    it('returns TRUE if pixel is on border of region', () => {
      assert.equal(
        region.touches(2, 2),
        true
      )
    })

    it('returns TRUE if pixel borders on corner', () => {
      assert.equal(
        new Region(81, 110).touches(82, 111),
        true
      )
    })

    it('returns FALSE if pixel is NOT on border of region', () => {
      assert.equal(
        region.touches(0, 0),
        false
      )
    })
  })

  describe('#add', () => {
    describe('adding pixel BEFORE region', () => {
      // New arrangement
      // const pixels = [
      //   [0,0,0,1],
      //   [0,0,1,0],
      //   [0,0,0,0],
      //   [0,0,0,0]
      // ]
      // Region should be:
      // const region = [
      //   [0,0,x,x],
      //   [0,0,x,x],
      //   [0,0,0,0],
      //   [0,0,0,0]
      // ]

      const region = new Region(2, 1).add(3, 0)

      it('changes lo values', () => {
        const [loX, loY] = region.lo
        assert.equal(loX, 2)
        assert.equal(loY, 0)
      })

      it('changes hi values', () => {
        const [hiX, hiY] = region.hi
        assert.equal(hiX, 3)
        assert.equal(hiY, 1)
      })
    })

    describe('adding pixel AFTER region', () => {
      // New arrangement
      // const pixels = [
      //   [0,0,0,0],
      //   [0,0,1,0],
      //   [0,0,0,1],
      //   [0,0,0,0]
      // ]
      // Region should be:
      // const region = [
      //   [0,0,0,0],
      //   [0,0,x,x],
      //   [0,0,x,x],
      //   [0,0,0,0]
      // ]

      const region = new Region(2, 1).add(3, 2)

      it('does NOT change lo values', () => {
        const [loX, loY] = region.lo
        assert.equal(loX, 2)
        assert.equal(loY, 1)
      })

      it('changes hi values', () => {
        const [hiX, hiY] = region.hi
        assert.equal(hiX, 3)
        assert.equal(hiY, 2)
      })
    })
  })
})
