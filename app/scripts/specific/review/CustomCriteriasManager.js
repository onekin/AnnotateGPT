import AnthropicManager from '../../llm/anthropic/AnthropicManager'
import LLMTextUtils from '../../utils/LLMTextUtils'
import OpenAIManager from '../../llm/openAI/OpenAIManager'
import Alerts from '../../utils/Alerts'
import LanguageUtils from '../../utils/LanguageUtils'
import Events from '../../contentScript/Events'
import Criteria from '../../model/schema/Criteria'
import Level from '../../model/schema/Level'
import Review from '../../model/schema/Review'
import DefaultCriteria from './DefaultCriteria'
import _ from 'lodash'
import $ from 'jquery'
import 'jquery-contextmenu/dist/jquery.contextMenu'
import Config from '../../Config'
import AnnotationUtils from '../../utils/AnnotationUtils'

class CustomCriteriasManager {
  constructor () {
    this.events = {}
  }

  init (callback) {
    this.createAddCustomCriteriaButtons(() => {
      // Initialize event handlers
      this.initEventHandler()
      // Init context menu for buttons
      this.initContextMenu()
      if (_.isFunction(callback)) {
        callback()
      }
    })
  }

  initEventHandler () {
    this.events.tagsUpdated = {
      element: document,
      event: Events.tagsUpdated,
      handler: () => {
        this.createAddCustomCriteriaButtons()
        this.initContextMenu()
      }
    }
    this.events.tagsUpdated.element.addEventListener(this.events.tagsUpdated.event, this.events.tagsUpdated.handler, false)
  }

  createAddCustomCriteriaButtons (callback) {
    this.createAddCustomThemeButton()
    let groups = _.map(document.querySelectorAll('.tagGroup'), (tagGroupElement) => {
      return tagGroupElement.dataset.groupName
    })
    for (let i = 0; i < groups.length; i++) {
      this.createAddCustomCriteriaButton(groups[i])
    }
    if (_.isFunction(callback)) {
      callback()
    }
  }

  createAddCustomThemeButton () {
    let addCustomThemeButton = document.querySelector('#addCustomThemeElement')
    if (!_.isElement(addCustomThemeButton)) {
      let criteriaHeader = document.querySelector('#groupSelectorContainerHeader')
      let addCustomThemeElement = document.createElement('span')
      addCustomThemeElement.id = 'addCustomThemeElement'
      addCustomThemeElement.classList.add('addCustomCriteriaWhite')
      criteriaHeader.insertAdjacentElement('afterbegin', addCustomThemeElement)
      addCustomThemeElement.addEventListener('click', this.createCustomTheme())
    }
  }

  createCustomTheme () {
    return () => {
      Alerts.inputTextAlert({
        title: 'Creating new factor',
        text: 'You can give a name to the factor that you want to review.',
        input: 'text',
        preConfirm: (themeName) => {
          let themeElement = document.querySelector('.tagGroup[data-group-name="' + themeName + '"')
          if (_.isElement(themeElement)) {
            const swal = require('sweetalert2')
            swal.showValidationMessage('A criteria group with that name already exists.')
            window.abwa.sidebar.openSidebar()
          } else {
            return themeName
          }
        },
        callback: (err, result) => {
          if (err) {
            window.alert('Unable to show form to add custom factor. Contact developer.')
          } else {
            let tagName = LanguageUtils.normalizeStringToValidID(result)
            this.createNewCustomCriteria({
              name: tagName,
              description: '',
              group: tagName,
              callback: () => {
                window.abwa.sidebar.openSidebar()
              }
            })
          }
        }
      })
    }
  }

  createAddCustomCriteriaButton (groupName) {
    // Get container
    let addCriteriaButton = document.querySelector('.groupName[title="' + groupName + '"]').previousElementSibling
    addCriteriaButton.title = 'Add new criteria to ' + groupName

    // Create button for new element
    addCriteriaButton.addEventListener('click', this.createAddCustomCriteriaButtonHandler(groupName))
  }

  createAddCustomCriteriaButtonHandler (groupName) {
    return () => {
      let criteriaName
      let criteriaDescription
      Alerts.multipleInputAlert({
        title: 'Creating a new criterion for factor ' + groupName,
        html: '<div>' +
          '<input id="criteriaName" class="swal2-input customizeInput" placeholder="Type your criteria name..."/>' +
          '</div>' +
          '<div>' +
          '<textarea id="criteriaDescription" class="swal2-input customizeInput" placeholder="Type your criteria description..."></textarea>' +
          '</div>',
        preConfirm: () => {
          // Retrieve values from inputs
          criteriaName = document.getElementById('criteriaName').value
          criteriaDescription = document.getElementById('criteriaDescription').value
          // Find if criteria name already exists
          let currentTags = _.map(window.abwa.tagManager.currentTags, tag => tag.config.name)
          let criteriaExists = _.find(currentTags, tag => tag === criteriaName)
          if (_.isString(criteriaExists)) {
            const swal = require('sweetalert2')
            swal.showValidationMessage('A criteria with that name already exists.')
            window.abwa.sidebar.openSidebar()
          }
        },
        callback: (err) => {
          if (err) {
            Alerts.errorAlert({text: 'Unable to create this custom criteria, try it again.'})
          } else {
            // Check if not selected cancel or esc
            if (criteriaName) {
              this.createNewCustomCriteria({
                name: criteriaName,
                description: criteriaDescription,
                group: groupName,
                callback: () => {
                  window.abwa.sidebar.openSidebar()
                }
              })
            }
          }
        }
      })
    }
  }

  createNewCustomCriteria ({name, description = 'Custom criteria', group, callback}) {
    let review = new Review({reviewId: ''})
    review.storageGroup = window.abwa.groupSelector.currentGroup
    let criteria = new Criteria({name, description, review, group: group, custom: true})
    // Create levels for the criteria
    let levels = DefaultCriteria.defaultLevels
    criteria.levels = []
    for (let j = 0; j < levels.length; j++) {
      let level = new Level({name: levels[j].name, criteria: criteria})
      criteria.levels.push(level)
    }
    let annotations = criteria.toAnnotations()
    // Push annotations to storage
    window.abwa.storageManager.client.createNewAnnotations(annotations, (err) => {
      if (err) {
        Alerts.errorAlert({title: 'Unable to create a custom category', text: 'Error when trying to create a new custom category. Please try again.'})
        callback(err)
      } else {
        // Reload sidebar
        window.abwa.tagManager.reloadTags(() => {
          if (_.isFunction(callback)) {
            callback()
          }
        })
      }
    })
  }

  destroy () {
    // Remove event listeners
    let events = _.values(this.events)
    for (let i = 0; i < events.length; i++) {
      events[i].element.removeEventListener(events[i].event, events[i].handler)
    }
  }

  deleteTag (tagGroup, callback) {
    // Get tags used in storage to store this tag or annotations with this tag
    let annotationsToDelete = []
    // Get annotation of the tag group
    annotationsToDelete.push(tagGroup.config.annotation.id)
    window.abwa.storageManager.client.searchAnnotations({
      tags: Config.review.namespace + ':' + Config.review.tags.grouped.relation + ':' + tagGroup.config.name
    }, (err, annotations) => {
      if (err) {
        // TODO Send message unable to delete
      } else {
        annotationsToDelete = annotationsToDelete.concat(_.map(annotations, 'id'))
        // Delete all the annotations
        let promises = []
        for (let i = 0; i < annotationsToDelete.length; i++) {
          promises.push(new Promise((resolve, reject) => {
            window.abwa.storageManager.client.deleteAnnotation(annotationsToDelete[i], (err) => {
              if (err) {
                reject(new Error('Unable to delete annotation id: ' + annotationsToDelete[i]))
              } else {
                resolve()
              }
            })
            return true
          }))
        }
        // When all the annotations are deleted
        Promise.all(promises).catch(() => {
          Alerts.errorAlert({text: 'There was an error when trying to delete all the annotations for this tag, please reload and try it again.'})
        }).then(() => {
          if (_.isFunction(callback)) {
            callback()
          }
        })
      }
    })
  }

  initContextMenu () {
    this.initContextMenuForCriteria()
    this.initContextMenuForCriteriaGroups()
  }

  initContextMenuForCriteriaGroups () {
    let items = {}
    // Modify menu element
    items['modify'] = { name: 'Modify criteria group' }
    // If custom criteria, it is also possible to delete it
    items['delete'] = { name: 'Delete criteria group' }
    $.contextMenu({
      selector: '.tagGroup[data-group-name]',
      build: () => {
        return {
          callback: (key, ev) => {
            let criteriaGroupName = ev.$trigger.attr('data-group-name')
            if (key === 'delete') {
              // TODO
              this.deleteCriteriaGroup(criteriaGroupName)
            } else if (key === 'modify') {
              // TODO
              this.modifyCriteriaGroup(criteriaGroupName)
            }
          },
          items: items
        }
      }
    })
  }

  modifyCriteriaGroup (criteriaGroupName, callback) {
    // Get all criteria with criteria group name
    let arrayOfTagGroups = _.filter(_.values(window.abwa.tagManager.currentTags), tag => tag.config.options.group === criteriaGroupName)
    Alerts.inputTextAlert({
      title: 'Rename criteria group ' + criteriaGroupName,
      inputValue: criteriaGroupName,
      inputPlaceholder: 'Write the group name here...',
      input: 'text',
      preConfirm: (themeName) => {
        if (_.isEmpty(themeName)) {
          const swal = require('sweetalert2')
          swal.showValidationMessage('The criteria group name cannot be empty.')
        } else if (themeName === criteriaGroupName) {
          return null
        } else {
          let themeElement = document.querySelector('.tagGroup[data-group-name="' + themeName + '"')
          if (_.isElement(themeElement)) {
            const swal = require('sweetalert2')
            swal.showValidationMessage('A criteria group with that name already exists.')
            window.abwa.sidebar.openSidebar()
          } else {
            return themeName
          }
        }
      },
      callback: (err, groupName) => {
        if (err) {
          window.alert('Unable to show form to modify custom criteria group. Contact developer.')
        } else {
          if (_.isNull(groupName)) {
            window.abwa.sidebar.openSidebar()
          } else {
            // Modify group in all criteria and update tag manager
            let promises = []
            for (let i = 0; i < arrayOfTagGroups.length; i++) {
              let tagGroup = arrayOfTagGroups[i]
              promises.push(new Promise((resolve, reject) => {
                this.modifyCriteria({
                  tagGroup,
                  group: groupName,
                  callback: (err) => {
                    if (err) {
                      reject(err)
                    } else {
                      resolve()
                    }
                  }
                })
              }))
            }
            Promise.all(promises).catch(() => {
              Alerts.errorAlert({text: 'Unable to modify criteria group name.'})
            }).then(() => {
              window.abwa.tagManager.reloadTags(() => {
                window.abwa.contentAnnotator.updateAllAnnotations(() => {
                  window.abwa.sidebar.openSidebar()
                })
              })
            })
          }
        }
      }
    })
  }

  deleteCriteriaGroup (criteriaGroupName, callback) {
    // Get all criteria with criteria group name
    let arrayOfTagGroups = _.filter(_.values(window.abwa.tagManager.currentTags), tag => tag.config.options.group === criteriaGroupName)
    // Ask user if they are sure to delete the current tag
    Alerts.confirmAlert({
      alertType: Alerts.alertType.warning,
      title: chrome.i18n.getMessage('DeleteCriteriaGroupConfirmationTitle', criteriaGroupName),
      text: chrome.i18n.getMessage('DeleteCriteriaGroupConfirmationMessage'),
      callback: (err, toDelete) => {
        // It is run only when the user confirms the dialog, so delete all the annotations
        if (err) {
          // Nothing to do
        } else {
          let promises = []
          for (let i = 0; i < arrayOfTagGroups.length; i++) {
            promises.push(new Promise((resolve, reject) => {
              this.deleteTag(arrayOfTagGroups[i], () => {
                if (err) {
                  reject(err)
                } else {
                  resolve()
                }
              })
              return true
            }))
          }
          Promise.all(promises).catch((err) => {
            Alerts.errorAlert({text: 'Error when deleting criteria group. Error:<br/>' + err})
          }).then(() => {
            window.abwa.tagManager.reloadTags(() => {
              window.abwa.contentAnnotator.updateAllAnnotations(() => {
                window.abwa.sidebar.openSidebar()
                if (_.isFunction(callback)) {
                  callback()
                }
              })
            })
          })
        }
      }
    })
  }

  initContextMenuForCriteria () {
    // Define context menu items
    let arrayOfTagGroups = _.values(window.abwa.tagManager.currentTags)
    for (let i = 0; i < arrayOfTagGroups.length; i++) {
      let tagGroup = arrayOfTagGroups[i]
      let criterion = tagGroup.config.name
      let description = tagGroup.config.options.description
      let items = {}
      // Modify menu element
      items['modify'] = { name: 'Modify' }
      // If custom criteria, it is also possible to delete it
      if (tagGroup.config.options.custom) {
        items['delete'] = { name: 'Delete' }
      }
      // Modify menu element
      items['llmAssistance'] = { name: 'Highlight by LLM' }
      // Modify menu element
      items['llmResume'] = { name: 'Resume by LLM' }
      // Modify menu element
      items['llmAlternative'] = { name: 'Alternative by LLM' }
      $.contextMenu({
        selector: '[data-mark="' + tagGroup.config.name + '"]',
        build: () => {
          return {
            callback: (key) => {
              // Get latest version of tag
              let currentTagGroup = _.find(window.abwa.tagManager.currentTags, currentTag => currentTag.config.annotation.id === tagGroup.config.annotation.id)
              if (key === 'delete') {
                this.deleteCriteriaHandler(currentTagGroup)
              } else if (key === 'modify') {
                this.modifyCriteriaHandler(currentTagGroup)
              } else if (key === 'llmAssistance') {
                if (description.length < 20) {
                  Alerts.infoAlert({ text: 'You have to provide a description for the given criterion' })
                } else {
                  // this.modifyCriteriaHandler(currentTagGroup)
                  chrome.runtime.sendMessage({ scope: 'llm', cmd: 'getSelectedLLM' }, async ({ llm }) => {
                    if (llm === '') {
                      llm = Config.review.defaultLLM
                    }
                    if (llm && llm !== '') {
                      let selectedLLM = llm
                      Alerts.confirmAlert({
                        title: 'Find annotations for ' + criterion,
                        text: 'Do you want to create new annotations for this criterion using ' + llm + '?',
                        cancelButtonText: 'Cancel',
                        callback: async () => {
                          let documents = []
                          let model = window.abwa.tagManager.model
                          let tags = [
                            model.namespace + ':' + model.config.grouped.relation + ':' + criterion
                          ]
                          documents = await LLMTextUtils.loadDocument()
                          chrome.runtime.sendMessage({
                            scope: 'llm',
                            cmd: 'getAPIKEY',
                            data: selectedLLM
                          }, ({ apiKey }) => {
                            let callback = (json) => {
                              // let comment = json.comment
                              let sentiment = json.sentiment
                              Alerts.infoAlert({
                                title: 'The criterion ' + criterion + ' has been highlighted ',
                                text: llm + ' has created new annotations',
                                confirmButtonText: 'OK',
                                showCancelButton: false,
                                callback: () => {
                                  let annotations = []
                                  for (let i = 0; i < json.paragraphs.length; i += 1) {
                                    let paragraph = json.paragraphs[i]
                                    let selectors = this.getSelectorsFromLLM(paragraph, documents)
                                    let annotation = {
                                      paragraph: paragraph,
                                      selectors: selectors
                                    }
                                    annotations.push(annotation)
                                    if (selectors.length > 0) {
                                      let commentData = {
                                        comment: paragraph,
                                        sentiment: sentiment,
                                        llm: llm
                                      }
                                      LanguageUtils.dispatchCustomEvent(Events.annotateByLLM, {
                                        tags: tags,
                                        selectors: selectors,
                                        commentData: commentData
                                      })
                                    }
                                  }
                                  let noCreatedAnnotations = annotations.filter((annotation) => annotation.selectors.length === 0)
                                  let createdAnnotations = annotations.filter((annotation) => annotation.selectors.length === 3)
                                  console.log('Created: ' + createdAnnotations.length)
                                  console.log('No created: ' + noCreatedAnnotations.length)
                                  if (createdAnnotations.length > 0) {
                                    CustomCriteriasManager.showAnnotatedParagraphs(createdAnnotations, noCreatedAnnotations)
                                  } else if (noCreatedAnnotations.length > 0) {
                                    CustomCriteriasManager.showParagraphs(noCreatedAnnotations)
                                  }
                                }
                              })
                            }
                            if (apiKey && apiKey !== '') {
                              chrome.runtime.sendMessage({ scope: 'llm', cmd: 'getCriterionQuery' }, async ({ criterionQuery }) => {
                                criterionQuery = criterionQuery.replaceAll('[C_DESCRIPTION]', description).replaceAll('[C_NAME]', criterion)
                                let params = {
                                  criterion: criterion,
                                  description: description,
                                  apiKey: apiKey,
                                  documents: documents,
                                  callback: callback,
                                  criterionQuery: criterionQuery
                                }
                                if (selectedLLM === 'anthropic') {
                                  AnthropicManager.askCriteria(params)
                                } else if (selectedLLM === 'openAI') {
                                  console.log('OpenAIQuestion')
                                  OpenAIManager.askCriteria(params)
                                }
                              })
                            } else {
                              let callback = () => {
                                window.open(chrome.runtime.getURL('pages/options.html'))
                              }
                              Alerts.infoAlert({
                                text: 'Please, configure your LLM.',
                                title: 'Please select a LLM and provide your API key',
                                callback: callback()
                              })
                            }
                          })
                        }
                      })
                    }
                  })
                }
              } else if (key === 'llmResume') {
                if (description.length < 20) {
                  Alerts.infoAlert({ text: 'You have to provide a description for the given criterion' })
                } else {
                  // this.modifyCriteriaHandler(currentTagGroup)
                  chrome.runtime.sendMessage({ scope: 'llm', cmd: 'getSelectedLLM' }, async ({ llm }) => {
                    if (llm === '') {
                      llm = Config.review.defaultLLM
                    }
                    if (llm && llm !== '') {
                      let selectedLLM = llm
                      Alerts.confirmAlert({
                        title: criterion + ' assessment',
                        text: 'Do you want to assess this criterion using ' + llm + '?',
                        cancelButtonText: 'Cancel',
                        callback: async () => {
                          let documents = []
                          documents = await LLMTextUtils.loadDocument()
                          chrome.runtime.sendMessage({
                            scope: 'llm',
                            cmd: 'getAPIKEY',
                            data: selectedLLM
                          }, ({ apiKey }) => {
                            let callback = (json) => {
                              let comment = json.comment
                              let sentiment = json.sentiment
                              Alerts.infoAlert({
                                title: 'The criterion ' + criterion + ' is ' + sentiment,
                                text: comment,
                                confirmButtonText: 'OK',
                                showCancelButton: false,
                                callback: () => {
                                  console.log('Save annotation')
                                }
                              })
                            }
                            if (apiKey && apiKey !== '') {
                              let resumeQuery = Config.review.resumeQuery
                              resumeQuery = resumeQuery.replaceAll('[C_DESCRIPTION]', description).replaceAll('[C_NAME]', criterion)
                              let params = {
                                criterion: criterion,
                                description: description,
                                apiKey: apiKey,
                                documents: documents,
                                callback: callback,
                                criterionQuery: resumeQuery
                              }
                              if (selectedLLM === 'anthropic') {
                                AnthropicManager.askCriteria(params)
                              } else if (selectedLLM === 'openAI') {
                                console.log('OpenAIQuestion')
                                OpenAIManager.askCriteria(params)
                              }
                            } else {
                              let callback = () => {
                                window.open(chrome.runtime.getURL('pages/options.html'))
                              }
                              Alerts.infoAlert({
                                text: 'Please, configure your LLM.',
                                title: 'Please select a LLM and provide your API key',
                                callback: callback()
                              })
                            }
                          })
                        }
                      })
                    }
                  })
                }
              } else if (key === 'llmAlternative') {
                if (description.length < 20) {
                  Alerts.infoAlert({ text: 'You have to provide a description for the given criterion' })
                } else {
                  // this.modifyCriteriaHandler(currentTagGroup)
                  chrome.runtime.sendMessage({ scope: 'llm', cmd: 'getSelectedLLM' }, async ({ llm }) => {
                    if (llm === '') {
                      llm = Config.review.defaultLLM
                    }
                    if (llm && llm !== '') {
                      let selectedLLM = llm
                      Alerts.confirmAlert({
                        title: criterion + ' assessment',
                        text: 'Do you want to generate alternative view points for this criterion using ' + llm + '?',
                        cancelButtonText: 'Cancel',
                        callback: async () => {
                          let documents = []
                          documents = await LLMTextUtils.loadDocument()
                          chrome.runtime.sendMessage({
                            scope: 'llm',
                            cmd: 'getAPIKEY',
                            data: selectedLLM
                          }, ({ apiKey }) => {
                            let callback = (json) => {
                              let comment = json.answer
                              Alerts.infoAlert({
                                title: 'These are the alternative viewpoint for ' + criterion,
                                text: comment,
                                confirmButtonText: 'OK',
                                showCancelButton: false,
                                callback: () => {
                                  console.log('Save annotation')
                                }
                              })
                            }
                            if (apiKey && apiKey !== '') {
                              let alternativeQuery = Config.review.alternativeQuery
                              alternativeQuery = alternativeQuery.replaceAll('[C_DESCRIPTION]', description).replaceAll('[C_NAME]', criterion)
                              let params = {
                                criterion: criterion,
                                description: description,
                                apiKey: apiKey,
                                documents: documents,
                                callback: callback,
                                criterionQuery: alternativeQuery
                              }
                              if (selectedLLM === 'anthropic') {
                                AnthropicManager.askCriteria(params)
                              } else if (selectedLLM === 'openAI') {
                                console.log('OpenAIQuestion')
                                OpenAIManager.askCriteria(params)
                              }
                            } else {
                              let callback = () => {
                                window.open(chrome.runtime.getURL('pages/options.html'))
                              }
                              Alerts.infoAlert({
                                text: 'Please, configure your LLM.',
                                title: 'Please select a LLM and provide your API key',
                                callback: callback()
                              })
                            }
                          })
                        }
                      })
                    }
                  })
                }
              }
            },
            items: items
          }
        }
      })
    }
  }

  static showParagraphs (annotations) {
    if (annotations.length > 0) {
      let annotation = annotations.pop()
      let buttonText
      if (annotations.length > 0) {
        buttonText = 'Next'
      } else {
        buttonText = 'OK'
      }
      Alerts.infoAlert({
        title: 'The LLM suggests this information for your criterion',
        text: annotation.paragraph,
        confirmButtonText: buttonText,
        showCancelButton: false,
        callback: () => {
          CustomCriteriasManager.showParagraphs(annotations)
        }
      })
    }
  }

  static showAnnotatedParagraphs (createdAnnotations, noCreatedAnnotations) {
    if (createdAnnotations.length > 0) {
      let annotation = createdAnnotations.pop()
      let buttonText
      if (createdAnnotations.length > 0 || noCreatedAnnotations.length > 0) {
        buttonText = 'Next'
      } else {
        buttonText = 'OK'
      }
      Alerts.confirmAlert({
        title: 'Annotation created!',
        text: 'The following text has been highlighted: \n' + annotation.paragraph,
        confirmButtonText: buttonText,
        showCancelButton: false,
        callback: () => {
          if (createdAnnotations.length > 0) {
            CustomCriteriasManager.showAnnotatedParagraphs(createdAnnotations, noCreatedAnnotations)
          } else if (noCreatedAnnotations.length > 0) {
            CustomCriteriasManager.showParagraphs(noCreatedAnnotations)
          }
        }
      })
    }
  }

  deleteCriteriaHandler (tagGroup) {
    window.abwa.sidebar.closeSidebar()
    // Ask user if they are sure to delete the current tag
    Alerts.confirmAlert({
      alertType: Alerts.alertType.warning,
      title: chrome.i18n.getMessage('DeleteCriteriaConfirmationTitle'),
      text: chrome.i18n.getMessage('DeleteCriteriaConfirmationMessage'),
      callback: (err, toDelete) => {
        // It is run only when the user confirms the dialog, so delete all the annotations
        if (err) {
          // Nothing to do
        } else {
          this.deleteTag(tagGroup, () => {
            window.abwa.tagManager.reloadTags(() => {
              window.abwa.contentAnnotator.updateAllAnnotations(() => {
                window.abwa.sidebar.openSidebar()
              })
            })
          })
        }
      }
    })
  }

  modifyCriteriaHandler (tagGroup, defaultNameValue = null, defaultDescriptionValue = null) {
    let criteriaName
    let criteriaDescription
    let formCriteriaNameValue = defaultNameValue || tagGroup.config.name
    let formCriteriaDescriptionValue = defaultDescriptionValue || tagGroup.config.options.description
    let custom = tagGroup.config.options.custom || false
    Alerts.multipleInputAlert({
      title: 'Modifying name and description for criterion ' + formCriteriaNameValue,
      html: '<div>' +
        '<input id="criteriaName" class="swal2-input customizeInput" value="' + formCriteriaNameValue + '"/>' +
        '</div>' +
        '<div>' +
        '<textarea id="criteriaDescription" class="swal2-input customizeInput" placeholder="Description">' + formCriteriaDescriptionValue + '</textarea>' +
        '</div>',
      preConfirm: () => {
        // Retrieve values from inputs
        criteriaName = document.getElementById('criteriaName').value
        criteriaDescription = document.getElementById('criteriaDescription').value
      },
      callback: () => {
        // Revise to execute only when OK button is pressed or criteria name and descriptions are not undefined
        if (!_.isUndefined(criteriaName) && !_.isUndefined(criteriaDescription)) {
          this.modifyCriteria({
            tagGroup: tagGroup,
            name: criteriaName,
            description: criteriaDescription,
            custom,
            callback: (err) => {
              if (err) {
                Alerts.errorAlert({text: 'Unable to update criteria. Error:<br/>' + err.message})
              } else {
                window.abwa.tagManager.reloadTags(() => {
                  window.abwa.contentAnnotator.updateAllAnnotations(() => {
                    window.abwa.sidebar.openSidebar()
                  })
                })
              }
            }
          })
        }
      }
    })
  }

  modifyCriteria ({tagGroup, name, description, custom = true, group, callback}) {
    // Check if name has changed
    if (name === tagGroup.config.name || _.isUndefined(name)) {
      // Check if description has changed
      if (description !== tagGroup.config.options.description || _.isUndefined(description)) {
        name = name || tagGroup.config.name
        description = description || tagGroup.config.options.description
        // Update annotation description
        let oldAnnotation = tagGroup.config.annotation
        // Create new annotation
        let review = new Review({reviewId: ''})
        review.storageGroup = window.abwa.groupSelector.currentGroup
        let criteria = new Criteria({name, description, group: group || tagGroup.config.options.group, review, custom: custom})
        let annotation = criteria.toAnnotation()
        window.abwa.storageManager.client.updateAnnotation(oldAnnotation.id, annotation, (err, annotation) => {
          if (err) {
            // TODO Show err
            console.error(err)
            if (_.isFunction(callback)) {
              callback(err)
            }
          } else {
            if (_.isFunction(callback)) {
              callback()
            }
          }
        })
      }
    } else {
      // If name has changed, check if there is not other criteria with the same value
      if (this.alreadyExistsThisCriteriaName(name)) {
        // Alert already exists
        Alerts.errorAlert({
          title: 'Criteria already exists',
          text: 'A criteria with the name ' + name + ' already exists.',
          callback: () => {
            this.modifyCriteriaHandler(tagGroup, name, description)
          }
        })
      } else {
        // Update all annotations review:isCriteriaOf:
        window.abwa.storageManager.client.searchAnnotations({
          tags: Config.review.namespace + ':' + Config.review.tags.grouped.relation + ':' + tagGroup.config.name
        }, (err, annotationsToUpdateTag) => {
          if (err) {
            // Unable to update
            Alerts.errorAlert({text: 'Unable to update criteria.'})
          } else {
            let oldTag = Config.review.namespace + ':' + Config.review.tags.grouped.relation + ':' + tagGroup.config.name
            let newTag = Config.review.namespace + ':' + Config.review.tags.grouped.relation + ':' + name
            // Update annotations tag
            annotationsToUpdateTag = _.map(annotationsToUpdateTag, (annotation) => {
              // Change isCriteriOf tag with the new one
              return AnnotationUtils.modifyTag(annotation, oldTag, newTag)
            })
            // Update all annotations
            let promises = []
            for (let i = 0; i < annotationsToUpdateTag.length; i++) {
              promises.push(new Promise((resolve, reject) => {
                window.abwa.storageManager.client.updateAnnotation(annotationsToUpdateTag[i].id, annotationsToUpdateTag[i], (err, annotation) => {
                  if (err) {
                    reject(err)
                  } else {
                    resolve(annotation)
                  }
                })
              }))
            }
            Promise.all(promises).catch(() => {
              // TODO Some annotations where unable to update
            }).then(() => {
              // Update tagGroup annotation
              let review = new Review({reviewId: ''})
              review.storageGroup = window.abwa.groupSelector.currentGroup
              let criteria = new Criteria({name, description, group: tagGroup.config.options.group, review, custom: custom})
              let annotation = criteria.toAnnotation()
              let oldAnnotation = tagGroup.config.annotation
              window.abwa.storageManager.client.updateAnnotation(oldAnnotation.id, annotation, (err, annotation) => {
                if (err) {
                  Alerts.errorAlert({text: 'Unable to update criteria. Error: ' + err.message})
                } else {
                  if (_.isFunction(callback)) {
                    callback()
                  }
                }
              })
            })
          }
        })
      }
    }
  }

  /**
   * Returns true if this criteria already exists, otherwise false
   * @param name
   * @return {boolean}
   */
  alreadyExistsThisCriteriaName (name) {
    return !!_.find(window.abwa.tagManager.currentTags, (tag) => { return tag.config.name === name })
  }

  getSelectorsFromLLM (paragraph, documents) {
    let selectors = []
    let pageNumber = LLMTextUtils.getPageNumberFromDocuments(paragraph, documents)
    if (pageNumber) {
      let fragmentSelector = {
        type: 'FragmentSelector',
        conformsTo: 'http://tools.ietf.org/rfc/rfc3778',
        page: pageNumber
      }
      selectors.push(fragmentSelector)
      // let pageContent = LLMTextUtils.getPageContent(pageNumber)
      let page = documents.find(document => document.metadata.loc.pageNumber === pageNumber)
      let pageContent = page.pageContent
      let index = LLMTextUtils.getIndexesOfParagraph(pageContent, paragraph)
      let textPositionSelector = {
        type: 'TextPositionSelector',
        start: index,
        end: index + paragraph.length
      }
      selectors.push(textPositionSelector)
      let textQuoteSelector = {
        type: 'TextQuoteSelector',
        exact: pageContent.substring(index, index + paragraph.length),
        prefix: pageContent.substring(index - 32, index),
        suffix: pageContent.substring(index + paragraph.length, index + paragraph.length + 32)
      }
      selectors.push(textQuoteSelector)
    }
    return selectors
  }
}

export default CustomCriteriasManager
