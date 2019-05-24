const Config = require('../util/Config')

class RegionManagerConfig extends Config {
  static get DEFAULTS() {
    return {
      BLUR: 12,
      PROC_IMAGE_SCALE: .1,       // scale at which to process image
      THRESHOLD: 250,             // min pixel value to be added to region
      MIN_HEIGHT: 2,              // min height for region
      MIN_WIDTH: 2,               // min width for region
      RECURSIVE_SCALE_FACTOR: 2,  // scale multiplier for recursive scans
      RECURSIVE_BLUR_FACTOR: 0.5, // blur multiplier for recursive scans
    }
  }
}

module.exports = RegionManagerConfig
