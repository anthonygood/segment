const { twoDecimalPlaces } = require('../util/util')

class TextClassification {
  constructor(name, ...features) {
    this.name = name
    this.features = features
    this.validations = []
  }

  debugConfidence(str) {
    return {
      name: this.name,
      text: str,
      confidence: this.confidence(str),
      ...this.rateFeatures(str)
    }
  }

  confidence(str) {
    try {
      this.validations.forEach(fn => fn(str))
    } catch (validationErr) {
      return -1
    }

    const values = Object.values(
      this.rateFeatures(str)
    )
    const conditionsMet = values.reduce((sum, num) => sum + num)

    return twoDecimalPlaces(
      conditionsMet / (
        values.length || 1
      )
    )
  }

  rateFeatures(str) {
    return this.features.reduce(
      (acc, fn) => {
        acc[fn.name] = fn(str)
        return acc
      },
      {}
    )
  }
}

module.exports = TextClassification
