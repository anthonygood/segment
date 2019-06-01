const {
  WordTokenizer,
  SentenceTokenizer
} = require('natural')
const { precision } = require('../util/util')

const twoDecimalPlaces = precision(100)

// Taken without much thought from https://emailregex.com
const EMAIL_REGEX = /(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const PHONE_REGEX = /[0-9\- ]{7,}/

const tokenizer = new WordTokenizer()
const sTokenizer = new SentenceTokenizer()

const count = (arr, fn) => arr.reduce(
  (count, item) => fn(item) ? count + 1 : count,
  0
)

const lengthLessThan50 = str => str.length < 50
const noFullStops = str => !str.includes('.')

const capitalisedRatio = str => {
  const tokens = tokenizer.tokenize(str)
  const matches = count(tokens, token => token.match(/^[A-Z]/))

  return matches / tokens.length
}

const sentences = str =>
  sTokenizer.tokenize(str)

const countSentences = str =>
  sentences(str).length

const containsEmail = str =>
  !!str.match(EMAIL_REGEX)

const containsPhone = str =>
  !!str.match(PHONE_REGEX)

const egocentrism = str => {
  const Is = str.match(/\bI\b/g) || []

  const numberOfWords = tokenizer.tokenize(str).length
  const numberOfIs = Is.length

  return twoDecimalPlaces(numberOfIs / numberOfWords)
}

module.exports = {
  containsEmail,
  containsPhone,
  countSentences,
  egocentrism,
  lengthLessThan50,
  noFullStops,
  capitalisedRatio
}
