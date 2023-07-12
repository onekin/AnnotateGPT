const Alerts = require('../utils/Alerts')
const FileUtils = require('../utils/FileUtils')
const LocalStorageManager = require('../storage/local/LocalStorageManager')
const FileSaver = require('file-saver')
const _ = require('lodash')

class Options {
  init () {
    const defaultQuery = 'I will provide you the content of a research paper. Then, you have to act as an academic reviewer and assess ' +
      ' the [C_NAME] criterion which description is separated by triple backticks ```[C_DESCRIPTION]```. For the criterion, you have to assess if it is met considering these possible results:' +
      ' Met, Partially met, or Not met. Then, you have to explain  why it is met or not met and finally provide three' +
      ' text fragments as pieces of evidence from the provided article that supports the decision of the result. You have to provide the response in JSON format with' +
      ' the following keys: -name (contains the criteria name), -sentiment (met, partially met or not met), -comment (the reason of the results),' +
      ' -paragraphs (an array with the THREE text fragments written in the same way as in the article that support the result)'
    // Storage type
    document.querySelector('#LLMDropdown').addEventListener('change', (event) => {
      // Get value
      if (event.target.selectedOptions && event.target.selectedOptions[0] && event.target.selectedOptions[0].value) {
        this.setLLM(event.target.selectedOptions[0].value)
        // Show/hide configuration for selected storage
        this.showSelectedLLMConfiguration(event.target.selectedOptions[0].value)
      }
    })

    document.querySelector('#saveQueryButton').addEventListener('click', () => {
      let currentQuery = document.querySelector('#criterionQuery').value
      let messageLabel = document.querySelector('#criterionQueryMessage')
      if (this.checkQuery(currentQuery)) {
        this.setCriterionQuery(currentQuery)
      } else {
        messageLabel.innerHTML = 'Invalid query'
      }
    })

    chrome.runtime.sendMessage({ scope: 'llm', cmd: 'getCriterionQuery' }, ({ criterionQuery }) => {
      if (criterionQuery && criterionQuery !== '') {
        document.querySelector('#criterionQuery').value = criterionQuery
      } else {
        document.querySelector('#criterionQuery').value = defaultQuery
        this.setCriterionQuery(defaultQuery)
      }
    })

    chrome.runtime.sendMessage({ scope: 'llm', cmd: 'getSelectedLLM' }, ({ llm = 'anthropic' }) => {
      document.querySelector('#LLMDropdown').value = llm || 'anthropic'
      this.showSelectedLLMConfiguration(llm || 'anthropic')
    })

    // Get all the buttons with the same class name
    const validationButtons = document.getElementsByClassName('APIKeyValidationButton')
    // Iterate over the buttons and add a listener to each button
    Array.from(validationButtons).forEach(button => {
      button.addEventListener('click', () => {
        let selectedLLM = document.querySelector('#LLMDropdown').value
        let button = document.querySelector('#' + selectedLLM + '-APIKeyValidationButton')
        if (button.innerHTML === 'Change API Key value') {
          let input = document.querySelector('#' + selectedLLM + '-APIKey')
          input.disabled = false
          button.innerHTML = 'Validate and Save'
        } else {
          let apiKey = document.querySelector('#' + selectedLLM + '-APIKey').value
          if (selectedLLM && apiKey) {
            this.setAPIKey(selectedLLM, apiKey)
          }
        }
      })
    })

    // Local storage restore
    document.querySelector('#restoreDatabaseButton').addEventListener('click', () => {
      Alerts.inputTextAlert({
        title: 'Upload your database backup file',
        html: 'Danger zone! <br/>This operation will override current local storage database, deleting all the annotations for all your documents. Please make a backup first.',
        type: Alerts.alertType.warning,
        input: 'file',
        callback: (err, file) => {
          if (err) {
            window.alert('An unexpected error happened when trying to load the alert.')
          } else {
            // Read json file
            FileUtils.readJSONFile(file, (err, jsonObject) => {
              if (err) {
                Alerts.errorAlert({ text: 'Unable to read json file: ' + err.message })
              } else {
                this.restoreDatabase(jsonObject, (err) => {
                  if (err) {
                    Alerts.errorAlert({ text: 'Something went wrong when trying to restore the database' })
                  } else {
                    Alerts.successAlert({ text: 'Database restored.' })
                  }
                })
              }
            })
          }
        }
      })
    })
    // Local storage backup
    document.querySelector('#backupDatabaseButton').addEventListener('click', () => {
      this.backupDatabase()
    })
    // Local storage delete
    document.querySelector('#deleteDatabaseButton').addEventListener('click', () => {
      Alerts.confirmAlert({
        title: 'Deleting your database',
        alertType: Alerts.alertType.warning,
        text: 'Danger zone! <br/>This operation will override current local storage database, deleting all the annotations for all your documents. Please make a backup first.',
        callback: () => {
          this.deleteDatabase((err) => {
            if (err) {
              Alerts.errorAlert({ text: 'Error deleting the database, please try it again or contact developer.' })
            } else {
              Alerts.successAlert({ text: 'Local storage successfully deleted' })
            }
          })
        }
      })
    })
  }

  restoreDatabase (jsonObject, callback) {
    window.options.localStorage = new LocalStorageManager()
    window.options.localStorage.init(() => {
      window.options.localStorage.saveDatabase(jsonObject, callback)
    })
  }

  backupDatabase () {
    window.options.localStorage = new LocalStorageManager()
    window.options.localStorage.init(() => {
      let stringifyObject = JSON.stringify(window.options.localStorage.annotationsDatabase, null, 2)
      // Download the file
      let blob = new window.Blob([stringifyObject], {
        type: 'text/plain;charset=utf-8'
      })
      let dateString = (new Date()).toISOString()
      FileSaver.saveAs(blob, 'reviewAndGo-databaseBackup' + dateString + '.json')
    })
  }

  deleteDatabase (callback) {
    window.options.localStorage = new LocalStorageManager()
    window.options.localStorage.init(() => {
      window.options.localStorage.cleanDatabase(callback)
    })
  }

  setLLM (llm) {
    chrome.runtime.sendMessage({
      scope: 'llm',
      cmd: 'setSelectedLLM',
      data: {llm: llm}
    }, ({llm}) => {
      console.debug('LLM selected ' + llm)
    })
  }

  showSelectedLLMConfiguration (selectedLLM) {
    // Hide all storage configurations
    let APIKeyConfigurationCards = document.querySelectorAll('.APIKey-Configuration')
    APIKeyConfigurationCards.forEach((APIKeyConfigurationCard) => {
      APIKeyConfigurationCard.setAttribute('aria-hidden', 'true')
    })
    // Show corresponding selected LLM configuration card
    let selectedLLMConfiguration = document.querySelector('#' + selectedLLM + '-ApiKeyContainer')
    chrome.runtime.sendMessage({ scope: 'llm', cmd: 'getAPIKEY', data: selectedLLM }, ({ apiKey }) => {
      if (apiKey && apiKey !== '') {
        console.log('Retrieved API Key' + apiKey)
        let input = document.querySelector('#' + selectedLLM + '-APIKey')
        input.value = apiKey
        input.disabled = true
        let button = document.querySelector('#' + selectedLLM + '-APIKeyValidationButton')
        button.innerHTML = 'Change API Key value'
      } else {
        console.log('No retrieved API Key')
        document.querySelector('#' + selectedLLM + '-APIKey').value = 'No API KEY'
      }
    })
    if (_.isElement(selectedLLMConfiguration)) {
      selectedLLMConfiguration.setAttribute('aria-hidden', 'false')
    }
  }

  setAPIKey (selectedLLM, apiKey) {
    chrome.runtime.sendMessage({
      scope: 'llm',
      cmd: 'setAPIKEY',
      data: {llm: selectedLLM, apiKey: apiKey}
    }, ({apiKey}) => {
      console.log('APIKey stored ' + apiKey)
      let button = document.querySelector('#' + selectedLLM + '-APIKeyValidationButton')
      button.innerHTML = 'Change API Key value'
      let input = document.querySelector('#' + selectedLLM + '-APIKey')
      input.disabled = true
    })
  }

  setCriterionQuery (criterionQuery) {
    chrome.runtime.sendMessage({
      scope: 'llm',
      cmd: 'setCriterionQuery',
      data: {query: criterionQuery}
    }, ({query}) => {
      console.log('Query stored ' + query)
      let messageLabel = document.querySelector('#criterionQueryMessage')
      messageLabel.innerHTML = 'Query saved'
    })
  }

  checkQuery (query) {
    if (query.includes('[C_DESCRIPTION]') && query.includes('[C_NAME]')) {
      return true
    } else {
      return false
    }
  }
}

module.exports = Options
