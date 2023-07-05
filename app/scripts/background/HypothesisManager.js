const HypothesisClientManager = require('../storage/hypothesis/HypothesisClientManager')
const HypothesisBackgroundManager = require('../storage/hypothesis/HypothesisBackgroundManager')
// const HypothesisManagerOAuth = require('./HypothesisManagerOAuth')

class HypothesisManager {
  constructor () {
    // Define token
    this.token = null
    // Hypothesis oauth manager
    this.hypothesisManagerOAuth = null
  }

  init () {
    /* this.hypothesisManagerOAuth = new HypothesisManagerOAuth()
    this.hypothesisManagerOAuth.init(() => {
      // Init hypothesis client manager
      this.initHypothesisClientManager()
    })

    // Init hypothesis background manager, who listens to commands from contentScript
    this.initHypothesisBackgroundManager() */
  }

  retrieveHypothesisToken (callback) {
    if (this.hypothesisManagerOAuth.checkTokenIsExpired()) {
      this.hypothesisManagerOAuth.refreshHypothesisToken((err) => {
        if (err) {
          callback(new Error('Unable to retrieve token'))
        } else {
          callback(null, this.hypothesisManagerOAuth.tokens.accessToken)
        }
      })
    } else {
      callback(null, this.hypothesisManagerOAuth.tokens.accessToken)
    }
  }

  initHypothesisClientManager () {
    this.annotationServerManager = new HypothesisClientManager()
    this.annotationServerManager.init((err) => {
      if (err) {
        console.debug('Unable to initialize hypothesis client manager. Error: ' + err.message)
      }
    })
  }

  initHypothesisBackgroundManager () {
    this.hypothesisBackgroundManager = new HypothesisBackgroundManager()
    this.hypothesisBackgroundManager.init()
  }
}

module.exports = HypothesisManager
