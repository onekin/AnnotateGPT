import _ from 'lodash'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { TokenTextSplitter } from 'langchain/text_splitter'
import { loadQAStuffChain } from 'langchain/chains'
import Alerts from '../../utils/Alerts'
import Config from '../../Config'
let Swal = null
if (document && document.head) {
  Swal = require('sweetalert2')
}

class OpenAIManager {
  static async askCriteria ({description, apiKey, documents, callback, criterionQuery}) {
    let alert = function () {
      OpenAIManager.tryToLoadSwal()
      if (_.isNull(Swal)) {
        if (_.isFunction(callback)) {
          Alerts.errorAlert({text: 'Unable to load swal'})
        }
      } else {
        Swal.fire({
          title: 'Asking OpenAI',
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

  static async createReview ({apiKey, report, guidelines, callback}) {
    let alert = function () {
      OpenAIManager.tryToLoadSwal()
      if (_.isNull(Swal)) {
        if (_.isFunction(callback)) {
          Alerts.errorAlert({text: 'Unable to load swal'})
        }
      } else {
        Swal.fire({
          title: 'Asking OpenAI',
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
            const output = await splitter.splitDocuments(guidelines)
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
            let query
            query = Config.review.llmReviewQuery
            query = query.replaceAll('[C_REVIEW]', report.replace(/(\r\n|\n|\r)/gm, ''))

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
                text: 'Please try again. You may need to provide more clear guidelines',
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
