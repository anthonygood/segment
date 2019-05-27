const assert = require('assert')
const {
  containsEmail,
  containsPhone,
  lengthLessThan50,
  noFullStops,
  capitalisedRatio
} = require('./features')

describe('features', () => {
  describe('lengthLessThan100', () => {
    it('is TRUE for string under 100 chars', () => {
      assert.equal(
        lengthLessThan50('Some fairly short string'),
        true
      )
    })
    it('is FALSE for string under 100 chars', () => {
      assert.equal(
        lengthLessThan50('Some string that goes on a bit and is quite a bit longer'),
        false
      )
    })
  })

  describe('noFullStops', () => {
    it('is TRUE for string with no full stops', () => {
      assert.equal(
        noFullStops('Some fairly short string'),
        true
      )
    })
    it('is FALSE for with full stops', () => {
      assert.equal(
        noFullStops('Some string that stops.'),
        false
      )
    })
  })

  describe('capitalisedRatio', () => {
    it('returns the number of capitalised words divided by total words', () => {
      assert.equal(
        capitalisedRatio('An Entirely Capitalised String'),
        1
      )

      assert.equal(
        capitalisedRatio('A not Entirely Capitalised String'),
        .8
      )

      assert.equal(
        capitalisedRatio('an string without a capital to its name'),
        0
      )

      assert.equal(
        capitalisedRatio('A "string" with ? other Bits & Pieces'),
        .5
      )
    })
  })

  describe('containsPhone', () => {
    it('is TRUE for phone-number-ish strings', () => {
      assert.equal(
        containsPhone('My number is 08002918942'),
        true
      )

      assert.equal(
        containsPhone('My number is 0800 291 8942, give me a ring'),
        true
      )

      assert.equal(
        containsPhone('My number is 0800-291-8942, give me a ring'),
        true
      )

      assert.equal(
        containsPhone('My number is 7291 8942, give me a ring'),
        true
      )
    })

    it('is FALSE for just number-ish strings', () => {
      assert.equal(
        containsPhone('My flat number is 351B'),
        false
      )

      assert.equal(
        containsPhone('There are over 4,500,000 species of this or that'),
        false
      )
    })
  })

  describe('containsEmail', () => {
    it('is TRUE for string with email', () => {
      assert.equal(
        containsEmail('contact: good.anthony@gmail.com'),
        true
      )
    })

    it('is FALSE for string without email', () => {
      assert.equal(
        containsEmail('just a string'),
        false
      )
    })
  })
})