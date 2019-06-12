const assert = require('assert')
const {
  containsEmail,
  containsPhone,
  egocentrism,
  noFullStops,
  capitalisedRatio
} = require('./features')

describe('features', () => {
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

  describe('egocentrism', () => {
    it('returns a number greater than 0 for egocentric prose', () => {
      assert.equal(
        egocentrism(
          "I was responsible for registering clients and understanding the brief of each case before referring them to the solicitors. I was therefore required to extract critical information for reporting to the solicitors while I was also in charge of managing client folders and ensuring they contain all the necessary information and documents needed for the provision of a legal advice. In addition, I shadowed 2 solicitors throughout client interviews and served as a note-taker during the process.",
        ),
        .05
      )
      assert.equal(
        egocentrism(
          "I flew and I flew. I flew further than I've ever flown.",
        ),
        .31
      )

      assert.equal(
        egocentrism(
          "I've been responsible for my own business awhile. I'm great."
        ),
        .17
      )
    })

    it('returns 0 for non-egocentric prose', () => {
      assert.equal(
        egocentrism(
          "Proving executive assistance to the Group HR Director, Assisting with Learning & development programmes, event & travel management, preparing Exco reports and presentations, expenses, email & diary management. HR Project work",
        ),
        0
      )
    })
  })
})
