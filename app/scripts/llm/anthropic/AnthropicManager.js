import _ from 'lodash'
import { ChatAnthropic } from 'langchain/chat_models/anthropic'
import { loadQAStuffChain } from 'langchain/chains'
import Alerts from '../../utils/Alerts'
import Config from '../../Config'
let Swal = null
if (document && document.head) {
  Swal = require('sweetalert2')
}

class AnthropicManager {
  static async askCriteria ({description, apiKey, documents, callback, criterionQuery}) {
    let alert = function () {
      AnthropicManager.tryToLoadSwal()
      if (_.isNull(Swal)) {
        if (_.isFunction(callback)) {
          Alerts.errorAlert({text: 'Unable to load swal'})
        }
      } else {
        Swal.fire({
          title: 'Asking Anthropic',
          text: 'Please wait to the response',
          allowEscapeKey: false,
          allowOutsideClick: false,
          onOpen: async () => {
            Swal.showLoading()
            const b = document.getElementById('swal2-title')
            b.innerText = 'Creating LLM connection'
            // Document QA
            let query
            if (criterionQuery) {
              query = criterionQuery
            } else {
              query = 'I will provide you the content of a research paper. Then, you have to act as an academic reviewer and assess ' +
                'assess the criterion that is separated by triple backticks for the following paper. For the criterion, you have to assess if it is met considering these possible results:' +
                ' Met, Partially met, or Not met. Then, you have to explain  why it is met or not met and finally provide three' +
                ' text fragments as pieces of evidence from the provided article that supports the decision of the result. You have to provide the response in JSON format with' +
                ' the following keys: -name (contains the criteria name), -sentiment (met, partially met or not met), -comment (the reason of the results),' +
                ' -paragraphs (an array with the THREE text fragments written in the same way as in the article that support the result)' +
                '```' + description + '```'
            }
            chrome.runtime.sendMessage({ scope: 'llmQuestion', cmd: 'askLLMAnthropic', data: {documents: documents, apiKey: apiKey, query: query} }, ({ res }) => {
              Swal.close()
              const jsonString = res.text
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
            })
          }
        })
      }
    }
    alert()
  }

  /* static async askCriteria2 ({description, apiKey, documents, callback, criterionQuery}) {
    let alert = function () {
      AnthropicManager.tryToLoadSwal()
      if (_.isNull(Swal)) {
        if (_.isFunction(callback)) {
          Alerts.errorAlert({text: 'Unable to load swal'})
        }
      } else {
        Swal.fire({
          title: 'Asking Anthropic',
          text: 'Please wait to the response',
          allowEscapeKey: false,
          allowOutsideClick: false,
          onOpen: async () => {
            Swal.showLoading()
            const b = document.getElementById('swal2-title')
            b.innerText = 'Creating LLM connection'
            // Create LLM
            // https://docs.anthropic.com/claude/reference/selecting-a-model
            const model = new ChatAnthropic({
              temperature: 0.2,
              anthropicApiKey: apiKey,
              modelName: 'claude-2.0',
              anthropicApiUrl: 'http://ikasten.io:3000/https://api.anthropic.com'
            })
            // Document QA
            let query
            if (criterionQuery) {
              query = criterionQuery
            } else {
              query = 'I will provide you the content of a research paper. Then, you have to act as an academic reviewer and assess ' +
                'assess the criterion that is separated by triple backticks for the following paper. For the criterion, you have to assess if it is met considering these possible results:' +
                ' Met, Partially met, or Not met. Then, you have to explain  why it is met or not met and finally provide three' +
                ' text fragments as pieces of evidence from the provided article that supports the decision of the result. You have to provide the response in JSON format with' +
                ' the following keys: -name (contains the criteria name), -sentiment (met, partially met or not met), -comment (the reason of the results),' +
                ' -paragraphs (an array with the THREE text fragments written in the same way as in the article that support the result)' +
                '```' + description + '```'
            }
            // Create QA chain
            b.innerText = 'Creating chain'
            const chain = loadQAStuffChain(model)
            b.innerText = 'Calling Anthropic'
            console.log('QUERY: ' + query)
            let res = await chain.call({
              input_documents: documents,
              question: query
            })
            Swal.close()
            const jsonString = res.text
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
          }
        })
      }
    }
    alert()
  } */

  static async createReview ({apiKey, report, guidelines, callback}) {
    let alert = function () {
      AnthropicManager.tryToLoadSwal()
      if (_.isNull(Swal)) {
        if (_.isFunction(callback)) {
          Alerts.errorAlert({text: 'Unable to load swal'})
        }
      } else {
        Swal.fire({
          title: 'Asking Anthropic',
          text: 'Please wait to the response',
          allowEscapeKey: false,
          allowOutsideClick: false,
          onOpen: async () => {
            Swal.showLoading()
            const b = document.getElementById('swal2-title')
            console.log('Creating LLM connection')
            b.innerText = 'Creating LLM connection'
            // Create LLM
            // https://docs.anthropic.com/claude/reference/selecting-a-model
            const model = new ChatAnthropic({
              temperature: 0.2,
              anthropicApiKey: apiKey,
              modelName: 'claude-2.0',
              anthropicApiUrl: 'http://ikasten.io:3000/https://api.anthropic.com'
            })
            // Document QA
            let query, res
            query = Config.review.llmReviewQuery
            query = query.replaceAll('[C_REVIEW]', report.replace(/(\r\n|\n|\r)/gm, ''))
            // Create QA chain
            const chain = loadQAStuffChain(model)
            b.innerText = 'Calling Anthropic'
            console.log('QUERY: ' + query)
            res = await chain.call({
              input_documents: guidelines,
              question: query
            })
            Swal.close()
            const jsonString = res.text
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
          }
        })
      }
    }
    alert()
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

export default AnthropicManager
