const { LogisticRegressionClassifier } = require('natural')
const FILENAME = 'jobtitleClassifier.json'

class JobTitleClassifier {
  constructor() {
    this._classifier = new LogisticRegressionClassifier()
  }

  train(dataPath) {
    let candidateJobTitles
    try {
      jobtitles = require('./data/jobTitles')
    } catch (err) {
      throw new Error(`Could import job title training data: ${err}`)
    }

    jobTitles.forEach(title => {
      this._classifier.addDocument(
        title,
        'jobtitle'
      )
    })

    this._classifier.train()
  }

  save(filename = FILENAME) {
    return new Promise((resolve, reject) =>
      this._classifier.save(filename, (err, classifier) =>
        err ? reject(err) : resolve(classifier)
    )
  }
}

module.exports = JobTitleClassifier
