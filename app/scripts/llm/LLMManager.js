import _ from 'lodash'
import Alerts from '../utils/Alerts'
let Swal = null
if (document && document.head) {
  Swal = require('sweetalert2')
}

class LLMManager {
  static async askCriteria ({ documents, callback, prompt }) {
    LLMManager.tryToLoadSwal()
    if (_.isNull(Swal)) {
      if (_.isFunction(callback)) {
        Alerts.errorAlert({ text: 'Unable to load swal' })
      }
      return
    }

    // Get the selected endpoint and model from background
    chrome.runtime.sendMessage({ scope: 'llm', cmd: 'getSelectedEndpoint' }, ({ endpointId }) => {
      if (!endpointId) {
        Alerts.errorAlert({
          text: 'Please configure an endpoint in the options page.',
          title: 'No endpoint configured'
        })
        return
      }

      // Also get the endpoint details to show name in UI
      chrome.runtime.sendMessage({ scope: 'llm', cmd: 'getEndpoints' }, ({ endpoints }) => {
        const endpoint = (endpoints || []).find(ep => ep.id === endpointId)
        const endpointName = endpoint ? endpoint.name : 'LLM'

        Swal.fire({
          title: 'Asking ' + endpointName,
          text: 'Please wait for the response',
          allowEscapeKey: false,
          allowOutsideClick: false,
          onOpen: async () => {
            Swal.showLoading()
            const b = document.getElementById('swal2-title')
            if (b) b.innerText = 'Asking ' + endpointName

            const query = prompt || ''

            chrome.runtime.sendMessage({
              scope: 'askLLM',
              cmd: 'generic',
              data: {
                endpointId: endpointId,
                documents: documents,
                query: query
              }
            }, function (response) {
              if (chrome.runtime.lastError) {
                Swal.close()
                Alerts.errorAlert({ text: 'Unable to ask LLM: ' + chrome.runtime.lastError.message })
              } else if (response.res && response.res.error) {
                Swal.close()
                Alerts.errorAlert({ text: 'Unable to ask LLM: ' + response.res.error })
              } else if (response.res) {
                Swal.close()
                const jsonString = response.res.text
                console.log('ANSWER: ' + jsonString)
                let retrievedJSON = jsonString.substring(jsonString.indexOf('{') + 1)
                let lastIndex = retrievedJSON.lastIndexOf('}')
                retrievedJSON = retrievedJSON.substring(0, lastIndex)
                retrievedJSON = retrievedJSON.replace(/(\r\n|\n|\r)/gm, '')
                if (!retrievedJSON.startsWith('{')) {
                  retrievedJSON = '{' + retrievedJSON
                }
                if (!retrievedJSON.endsWith('}')) {
                  retrievedJSON = retrievedJSON + '}'
                }
                try {
                  const jsonObject = JSON.parse(retrievedJSON)
                  if (_.isFunction(callback)) {
                    callback(jsonObject)
                  }
                } catch (err) {
                  Alerts.errorAlert({
                    text: 'Please try again. Try to repeat the question. Provided answer has been: ' + retrievedJSON,
                    title: 'Error parsing the answer'
                  })
                }
              } else {
                Swal.close()
                Alerts.errorAlert({ text: 'No response received from LLM.' })
              }
            })
          }
        })
      })
    })
  }

  static tryToLoadSwal () {
    if (_.isNull(Swal)) {
      try {
        Swal = require('sweetalert2')
      } catch (e) {
        Swal = null
      }
    }
  }
}

export default LLMManager
