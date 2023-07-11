import _ from 'lodash'
import { ChatAnthropic } from 'langchain/chat_models/anthropic'
import { loadQAStuffChain } from 'langchain/chains'
import Alerts from '../../utils/Alerts'
let Swal = null
if (document && document.head) {
  Swal = require('sweetalert2')
}

class AnthropicManager {
  static async askCriteria ({criterion, description, apiKey, documents, callback}) {
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
            const model = new ChatAnthropic({
              temperature: 0.2,
              anthropicApiKey: apiKey
            })
            // Document QA
            let query = 'I will provide you the content of a research paper. Then, you have to act as an academic reviewer and assess ' +
              'assess the criterion that is separated by triple backticks for the following paper. For the criterion, you have to assess if it is met considering these possible results:' +
              ' Met, Partially met, or Not met. Then, you have to explain  why it is met or not met and finally provide three' +
              ' text fragments as pieces of evidence from the provided article that supports the decision of the result. You have to provide the response in JSON format with' +
              ' the following keys: -name (contains the criteria name), -sentiment (met, partially met or not met), -comment (the reason of the results),' +
              ' -paragraphs (an array with the THREE text fragments written in the same way as in the article that support the result). Only response with the JSON' +
              '```' + criterion + ':' + description
            // Create QA chain
            console.log('Creating chain')
            b.innerText = 'Creating chain'
            const chain = loadQAStuffChain(model)
            console.log('Calling Anthropic')
            b.innerText = 'Calling Anthropic'
            let res = await chain.call({
              input_documents: documents,
              question: query
            })
            Swal.close()
            const jsonString = res.text
            let retrievedJSON = jsonString.substring(jsonString.indexOf('{') + 1)
            try {
              const jsonObject = JSON.parse('{' + retrievedJSON)
              if (_.isFunction(callback)) {
                callback(jsonObject)
              }
            } catch (err) {
              Alerts.errorAlert({
                text: 'Please try again. You may need to provide a more accurate criterion description',
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
