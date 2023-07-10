import _ from 'lodash'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { TokenTextSplitter } from 'langchain/text_splitter'
import { loadQAStuffChain } from 'langchain/chains'

class OpenAIManager {
  static async askCriteria ({criterion, description, apiKey, documents, callback}) {
    console.log('Splitting the document')
    // Split the documents into chunks
    const splitter = new TokenTextSplitter({
      chunkSize: 500,
      chunkOverlap: 10
    })
    const output = await splitter.splitDocuments(documents)

    // Create LLM
    const model = new ChatOpenAI({
      temperature: 0,
      model_name: 'gpt-3.5-turbo',
      openAIApiKey: apiKey
    })

    // Create embeddings and vectorstore
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

    // Retrieve
    let results = await docsearch.similaritySearch(query, 6)

    console.log('Retrieving...')
    const chainA = loadQAStuffChain(model)

    let res = await chainA.call({
      input_documents: results,
      question: query
    })

    const jsonString = res.text
    const jsonObject = JSON.parse(jsonString)
    if (_.isFunction(callback)) {
      callback(jsonObject, documents)
    }
  }
}

export default OpenAIManager
