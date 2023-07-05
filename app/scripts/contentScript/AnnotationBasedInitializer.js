const _ = require('lodash')
const URLUtils = require('../utils/URLUtils')

const Config = require('../Config')

class AnnotationBasedInitializer {
  constructor () {
    this.initAnnotation = null
  }

  init (callback) {
    // Check if annotation is in hash params
    let annotationId = AnnotationBasedInitializer.getAnnotationHashParam()
    if (annotationId) {
      window.abwa.storageManager.client.fetchAnnotation(annotationId, (err, annotation) => {
        if (err) {
          console.error(err)
        } else {
          this.initAnnotation = annotation
        }
        if (_.isFunction(callback)) {
          callback(annotation)
        }
      })
    } else {
      if (_.isFunction(callback)) {
        callback(null)
      }
    }
  }

  static getAnnotationHashParam () {
    // Check if annotation is in hash params
    let decodedUri = decodeURIComponent(window.location.href)
    let params = URLUtils.extractHashParamsFromUrl(decodedUri)
    if (!_.isEmpty(params) && _.has(params, Config.review.urlParamName)) {
      return params[Config.review.urlParamName]
    } else {
      return false
    }
  }
}

module.exports = AnnotationBasedInitializer
