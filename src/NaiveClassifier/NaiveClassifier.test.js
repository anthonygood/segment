const NaiveClassifier = require('./NaiveClassifier')
const { sample } = require('../util/shuffle')
const assert = require('assert')

const descriptions = require('../trainingData/descriptions')
const jobtitles = require('../trainingData/jobTitles')
const headings = require('../trainingData/headings')
const skills = require('../trainingData/skills')

const itClassifiesRandomSampleFrom = json => {
  const samples = sample(json, 10)
  return {
    as: classification => {
      samples.forEach(sample => {
        it(`correctly classifies ${sample} as ${classification}`, () => {
          assert.equal(
            NaiveClassifier.classify(sample),
            classification
          )
        })
      })
    }
  }
}

describe('NaiveClassifier', () => {
  describe('job titles', () => {
    itClassifiesRandomSampleFrom(jobtitles).as('job title')
  })

  describe('job descriptions', () => {
    itClassifiesRandomSampleFrom(descriptions).as('job description')
  })

  describe('headings', () => {
    itClassifiesRandomSampleFrom(headings).as('heading')
  })
})
