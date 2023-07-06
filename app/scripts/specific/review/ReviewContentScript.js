import CustomCriteriasManager from './CustomCriteriasManager'
import ReviewGenerator from './ReviewGenerator'
const _ = require('lodash')

class ReviewContentScript {
  constructor (config) {
    this.config = config
  }

  init (callback) {
    window.abwa.specific = window.abwa.specific || {}
    window.abwa.specific.reviewGenerator = new ReviewGenerator()
    window.abwa.specific.reviewGenerator.init(() => {

    })
    window.abwa.specific.customCriteriasManager = new CustomCriteriasManager()
    window.abwa.specific.customCriteriasManager.init(() => {

    })
    if (_.isFunction(callback)) {
      callback()
    }
  }

  destroy () {
    window.abwa.specific.reviewGenerator.destroy()
    window.abwa.specific.customCriteriasManager.destroy()
  }
}

export default ReviewContentScript
