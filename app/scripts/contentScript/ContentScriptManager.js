const _ = require('lodash')
const ContentTypeManager = require('./ContentTypeManager')
const Sidebar = require('./Sidebar')
const TagManager = require('./TagManager')
const Events = require('./Events')
const ModeManager = require('./ModeManager')
const RolesManager = require('./RolesManager')
const GroupSelector = require('./GroupSelector')
const AnnotationBasedInitializer = require('./AnnotationBasedInitializer')
const HypothesisClientManager = require('../storage/hypothesis/HypothesisClientManager')
const LocalStorageManager = require('../storage/local/LocalStorageManager')
const Config = require('../Config')
const Alerts = require('../utils/Alerts')

class ContentScriptManager {
  constructor () {
    this.events = {}
    this.status = ContentScriptManager.status.notInitialized
  }

  init () {
    console.debug('Initializing content script manager')
    this.status = ContentScriptManager.status.initializing
    this.loadContentTypeManager(() => {
      this.loadStorage(() => {
        window.abwa.sidebar = new Sidebar()
        window.abwa.sidebar.init(() => {
          window.abwa.annotationBasedInitializer = new AnnotationBasedInitializer()
          window.abwa.annotationBasedInitializer.init(() => {
            window.abwa.groupSelector = new GroupSelector()
            window.abwa.groupSelector.init(() => {
              this.reloadContentByGroup(() => {
                // Initialize listener for group change to reload the content
                this.initListenerForGroupChange()
                // Set status as initialized
                this.status = ContentScriptManager.status.initialized
                console.debug('Initialized content script manager')
              })
            })
          })
        })
      })
    })
  }

  destroyContentAnnotator () {
    // Destroy current content annotator
    if (!_.isEmpty(window.abwa.contentAnnotator)) {
      window.abwa.contentAnnotator.destroy()
    }
  }

  destroyTagsManager () {
    if (!_.isEmpty(window.abwa.tagManager)) {
      window.abwa.tagManager.destroy()
    }
  }

  destroy (callback) {
    console.debug('Destroying content script manager')
    this.destroyContentTypeManager(() => {
      this.destroyTagsManager()
      this.destroyContentAnnotator()
      // TODO Destroy groupSelector, roleManager,
      window.abwa.groupSelector.destroy(() => {
        // Remove group change event listener
        document.removeEventListener(Events.groupChanged, this.events.groupChangedEvent)
        window.abwa.sidebar.destroy(() => {
          window.abwa.storageManager.destroy(() => {
            this.status = ContentScriptManager.status.notInitialized
            console.debug('Correctly destroyed content script manager')
            if (_.isFunction(callback)) {
              callback()
            }
          })
        })
      })
    })
  }

  initListenerForGroupChange () {
    this.events.groupChangedEvent = this.groupChangedEventHandlerCreator()
    document.addEventListener(Events.groupChanged, this.events.groupChangedEvent, false)
  }

  groupChangedEventHandlerCreator () {
    return (event) => {
      this.reloadContentByGroup()
    }
  }

  reloadContentByGroup (callback) {
    this.reloadRolesManager(() => {
      // Load tag manager
      this.reloadTagManager(() => {
        // Load content annotator
        this.reloadContentAnnotator(() => {
          // Reload specific content script
          this.reloadSpecificContentScript(() => {
            if (_.isFunction(callback)) {
              callback()
            }
          })
        })
      })
    })
  }

  reloadRolesManager (callback) {
    if (window.abwa.rolesManager) {
      window.abwa.rolesManager.destroy()
    }
    window.abwa.rolesManager = new RolesManager()
    window.abwa.rolesManager.init(() => {
      if (_.isFunction(callback)) {
        callback()
      }
    })
  }

  reloadModeManager (callback) {
    if (window.abwa.modeManager) {
      window.abwa.modeManager.destroy()
    }
    window.abwa.modeManager = new ModeManager()
    window.abwa.modeManager.init(() => {
      if (_.isFunction(callback)) {
        callback()
      }
    })
  }

  reloadTagManager (callback) {
    if (window.abwa.tagManager) {
      window.abwa.tagManager.destroy()
    }
    window.abwa.tagManager = new TagManager(Config.review.namespace, Config.review.tags)
    window.abwa.tagManager.init(() => {
      if (_.isFunction(callback)) {
        callback()
      }
    })
  }

  reloadContentAnnotator (callback) {
    if (window.abwa.contentAnnotator) {
      window.abwa.contentAnnotator.destroy()
    }
    const TextAnnotator = require('./contentAnnotators/TextAnnotator')
    window.abwa.contentAnnotator = new TextAnnotator(Config.review)
    window.abwa.contentAnnotator.init(() => {
      if (_.isFunction(callback)) {
        callback()
      }
    })
  }

  reloadSpecificContentScript (callback) {
    if (window.abwa.specificContentManager) {
      window.abwa.specificContentManager.destroy()
    }
    const ReviewContentScript = require('../specific/review/ReviewContentScript')
    window.abwa.specificContentManager = new ReviewContentScript(Config.review)
    window.abwa.specificContentManager.init(() => {
      if (_.isFunction(callback)) {
        callback()
      }
    })
  }

  loadContentTypeManager (callback) {
    window.abwa.contentTypeManager = new ContentTypeManager()
    window.abwa.contentTypeManager.init(() => {
      if (_.isFunction(callback)) {
        callback()
      }
    })
  }

  destroyContentTypeManager (callback) {
    if (window.abwa.contentTypeManager) {
      window.abwa.contentTypeManager.destroy(() => {
        if (_.isFunction(callback)) {
          callback()
        }
      })
    }
  }

  loadStorage (callback) {
    chrome.runtime.sendMessage({scope: 'storage', cmd: 'getSelectedStorage'}, ({storage}) => {
      if (storage === 'hypothesis') {
        // Hypothesis
        window.abwa.storageManager = new HypothesisClientManager()
      } else if (storage === 'localStorage') {
        // Local storage
        window.abwa.storageManager = new LocalStorageManager()
      } else {
        // By default it is selected Hypothes.is
        window.abwa.storageManager = new LocalStorageManager()
      }
      window.abwa.storageManager.init((err) => {
        if (err) {
          Alerts.errorAlert({text: 'Unable to initialize storage manager. Error: ' + err.message + '. ' +
              'Please reload webpage and try again.'})
        } else {
          window.abwa.storageManager.isLoggedIn((err, isLoggedIn) => {
            if (err) {
              if (_.isFunction(callback)) {
                callback(err)
              }
            } else {
              if (isLoggedIn) {
                if (_.isFunction(callback)) {
                  callback()
                }
              } else {
                window.abwa.storageManager.logIn((err) => {
                  if (err) {
                    callback(err)
                  } else {
                    if (_.isFunction(callback)) {
                      callback()
                    }
                  }
                })
              }
            }
          })
        }
      })
    })
  }
}

ContentScriptManager.status = {
  initializing: 'initializing',
  initialized: 'initialized',
  notInitialized: 'notInitialized'
}

module.exports = ContentScriptManager
