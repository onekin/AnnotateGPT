import ReviewContentScript from '../specific/review/ReviewContentScript'
import AnnotationBasedInitializer from './AnnotationBasedInitializer'
import _ from 'lodash'
import ContentTypeManager from './ContentTypeManager'
import Sidebar from './Sidebar'
import TagManager from './TagManager'
import Events from './Events'
import GroupSelector from './GroupSelector'
import LocalStorageManager from '../storage/local/LocalStorageManager'
import Config from '../Config'
import Alerts from '../utils/Alerts'
import RolesManager from './RolesManager'
import TextAnnotator from './contentAnnotators/TextAnnotator'

class ContentScriptManager {
  constructor () {
    this.events = {}
    this.status = ContentScriptManager.status.notInitialized
  }

  init () {
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
    window.abwa.storageManager = new LocalStorageManager()
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
  }
}

ContentScriptManager.status = {
  initializing: 'initializing',
  initialized: 'initialized',
  notInitialized: 'notInitialized'
}

export default ContentScriptManager
