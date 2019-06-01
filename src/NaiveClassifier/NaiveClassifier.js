const TextClassification = require('./TextClassification')
const {
  containsEmail,
  containsPhone,
  countSentences,
  egocentrism,
  lengthLessThan50,
  noFullStops,
  capitalisedRatio
} = require('./features')

const isQuiteCapitalised = str => capitalisedRatio(str) > .66
const mustNotBeMoreThan90Length = str => {
  if (str.length > 90) {
    throw new Error('String is longer than 90')
  }
}
const mustNotContainLineBreaks = str => {
  if (str.includes('\n')) {
    throw new Error('String contains line breaks')
  }
}

const jobTitle = new TextClassification(
  'job title',
  lengthLessThan50,
  noFullStops,
  isQuiteCapitalised,
)

jobTitle.validations = [
  mustNotBeMoreThan90Length,
  mustNotContainLineBreaks
]

const containsContact = str => /\bcontact\b/i.test(str)
const containsTel = str => /\btel/i.test(str)

const contactDetails = new TextClassification(
  'contact info',
  containsContact,
  containsEmail,
  containsPhone,
  containsTel
)

const lengthGreaterThan100 = str => str.length > 100
const lengthGreaterThan200 = str => str.length > 200
const containsManySentences = str => countSentences(str) > 3
const isQuiteListy = str => Math.max(
  str.split(',').length,
  str.split(';').length,
  str.split('●').length
) > 3
const isEgocentric = str => egocentrism(str) > 0.1

const jobDescription = new TextClassification(
  'job description',
  lengthGreaterThan100,
  lengthGreaterThan200,
  isQuiteListy,
  containsManySentences,
  isEgocentric
)

const classifications = [
  contactDetails,
  jobDescription,
  jobTitle
]

const NaiveClassifier = {
  classify(text) {
    return classifications.reduce((winner, next) =>
      winner.confidence(text) > next.confidence(text) ? winner : next
    ).name
  }
}

module.exports = NaiveClassifier
