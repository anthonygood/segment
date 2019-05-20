class Config {
  constructor(config = {}) {
    Object.assign(this, this.constructor.DEFAULTS, config)
  }

  static get DEFAULTS() {
    return {}
  }
}

module.exports = Config
