import _ from 'lodash'
import { ChatAnthropic } from 'langchain/chat_models/anthropic'
import { loadQAStuffChain } from 'langchain/chains'

class AnthropicManager {
  static async askCriteria ({criterion, description, apiKey, documents, callback}) {
    console.log('Creating LLM connection')
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
    const chain = loadQAStuffChain(model)
    console.log('Calling Anthropic')
    let res = await chain.call({
      input_documents: documents,
      question: query
    })
    const jsonString = res.text
    let retrievedJSON = jsonString.substring(jsonString.indexOf('{') + 1)
    const jsonObject = JSON.parse('{' + retrievedJSON)
    if (_.isFunction(callback)) {
      callback(jsonObject)
    }
  }
}

export default AnthropicManager
