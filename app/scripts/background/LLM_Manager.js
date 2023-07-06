const ChromeStorage = require('../utils/ChromeStorage')

class LLMManager {
  init () {
    // Initialize replier for requests related to storage
    this.initRespondent()
  }

  initRespondent () {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.scope === 'llm') {
        if (request.cmd === 'getSelectedLLM') {
          ChromeStorage.getData('llm.selected', ChromeStorage.sync, (err, llm) => {
            if (err) {
              sendResponse({err: err})
            } else {
              if (llm.data) {
                let parsedLLM = JSON.parse(llm.data)
                sendResponse({llm: parsedLLM || ''})
              } else {
                sendResponse({llm: ''})
              }
            }
          })
        } else if (request.cmd === 'setSelectedLLM') {
          let selectedLLM = request.data.llm
          ChromeStorage.setData('llm.selected', {data: JSON.stringify(selectedLLM)}, ChromeStorage.sync, (err) => {
            if (err) {
              sendResponse({err: err})
            } else {
              sendResponse({llm: selectedLLM})
            }
          })
        } else if (request.cmd === 'getAPIKEY') {
          let llmKey = 'llm.' + request.data + 'key'
          ChromeStorage.getData(llmKey, ChromeStorage.sync, (err, apiKey) => {
            if (err) {
              sendResponse({err: err})
            } else {
              if (apiKey) {
                let parsedKey = JSON.parse(apiKey.data)
                sendResponse({apiKey: parsedKey || ''})
              } else {
                sendResponse({apiKey: ''})
              }
            }
          })
        } else if (request.cmd === 'setAPIKEY') {
          let llm = 'llm.' + request.data.llm + 'key'
          let apiKey = request.data.apiKey
          ChromeStorage.setData(llm, { data: JSON.stringify(apiKey) }, ChromeStorage.sync, (err) => {
            if (err) {
              sendResponse({ err: err })
            } else {
              sendResponse({ apiKey: apiKey })
            }
          })
        }
        return true
      }
    })
  }
}

module.exports = LLMManager
