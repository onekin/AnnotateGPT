import _ from 'lodash'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { TokenTextSplitter } from 'langchain/text_splitter'
import { loadQAStuffChain } from 'langchain/chains'
import Alerts from '../../utils/Alerts'
let Swal = null
if (document && document.head) {
  Swal = require('sweetalert2')
}

class OpenAIManager {
  static async askCriteria ({criterion, description, apiKey, documents, callback}) {
    let alert = function () {
      OpenAIManager.tryToLoadSwal()
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
            b.innerText = 'Splitting text'
            const splitter = new TokenTextSplitter({
              chunkSize: 500,
              chunkOverlap: 10
            })
            const output = await splitter.splitDocuments(documents)
            b.innerText = 'Creating LLM'
            // Create LLM
            const model = new ChatOpenAI({
              temperature: 0,
              model_name: 'gpt-3.5-turbo',
              openAIApiKey: apiKey
            })
            b.innerText = 'Creating embeddings and vectorstore'
            const docsearch = await MemoryVectorStore.fromDocuments(
              output, new OpenAIEmbeddings({ openAIApiKey: apiKey })
            )
            let query = 'I will provide you text content from a research paper. Then, you have to act as an academic reviewer and assess ' +
              'the criterion of the following paper. For the criterion, you have to assess if it is met considering these possible results:' +
              ' Met, Partially met, or Not met. For the criterion, you have to mention explain the reason why it is met or not met and provide three' +
              ' different text fragments from the article that supports the decision of the result. You have to provide the response in JSON format with' +
              ' the following keys: -name (contains the criteria name), -sentiment (met, partially met or not met), -comment (the reason of the results),' +
              ' -paragraphs (an array with the THREE text fragments written in the same way as in the article that support the result). Only response with the JSON' +
              '```' + criterion + ':' + description

            b.innerText = 'Retrieving embeddings'
            let results = await docsearch.similaritySearch(query, 6)
            const chainA = loadQAStuffChain(model)
            b.innerText = 'Asking OpenAI'
            let res = await chainA.call({
              input_documents: results,
              question: query
            })
            Swal.close()
            const jsonString = res.text
            let retrievedJSON = jsonString.substring(jsonString.indexOf('{') + 1)
            let lastIndex = retrievedJSON.lastIndexOf('}')
            retrievedJSON = retrievedJSON.substring(0, lastIndex)
            try {
              const jsonObject = JSON.parse('{' + retrievedJSON + '}')
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

export default OpenAIManager
