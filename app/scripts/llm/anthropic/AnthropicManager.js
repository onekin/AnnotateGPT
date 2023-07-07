import _ from 'lodash'
import { ChatAnthropic } from 'langchain/chat_models/anthropic'
import { loadQAStuffChain } from 'langchain/chains'
// import { Document } from '../Document'
import { Document } from 'langchain/document'
// import { Document } from 'langchain/dist/document'

class AnthropicManager {
  static async askCriteria (criteria, description, apiKey, callback) {
    console.log('Loading document')
    let pdf = window.PDFViewerApplication.pdfDocument
    const meta = await pdf.getMetadata().catch(() => null)
    const documents = []
    for (let i = 1; i <= pdf.numPages; i += 1) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      if (content.items.length === 0) {
        continue
      }
      const text = content.items
        .map((item) => item.str)
        .join('\n')
      documents.push(new Document({
        pageContent: text,
        metadata: {
          pdf: {
            version: meta?.PDFFormatVersion,
            info: meta?.info,
            metadata: meta?.metadata,
            totalPages: pdf.numPages
          },
          loc: {
            pageNumber: i
          }
        }
      }))
    }
    console.log('Creating LLM connection')
    // Create LLM
    const model = new ChatAnthropic({
      temperature: 0.2,
      anthropicApiKey: apiKey
    })
    // Document QA
    let query = 'You have all the sections for this research paper. Now, act as an academic reviewer and assess the criterion of the following paper. For the criterion, you have to assess if it is met considering these possible results: Met, Partially met, or Not met. For the criterion, you have to mention the elaborated reason why it is met or not met and provide three text different text fragments from the article that supports the decision of the result. You have to provide the response in JSON format with the following keys: -name (contains the criteria name), -sentiment (met, partially met or not met), -comment (the reason of the results), -paragraphs (an array with the THREE text fragments from the article that support the result).```Describes the proposed artifact in adequate details, which means providing a thorough and sufficient explanation or depiction of the artifact that is being proposed. Adequate details imply that the description should be comprehensive enough to provide a clear understanding of the artifact, including its features, functions, design, materials, dimensions, and any other relevant information. The level of detail should be appropriate for the context and purpose of the proposal, ensuring that the readers or audience can form a complete picture of the artifact based on the provided description.'
    // Create QA chain
    console.log('Creating chain')
    const chain = loadQAStuffChain(model)
    console.log('Calling Anthropic')
    let res = await chain.call({
      input_documents: documents,
      question: query
    })
    const jsonString = res.text
    const jsonObject = JSON.parse(jsonString)
    this.retrieveFragmentSelectors(jsonObject, documents, (schema) => {
      let fragmentSelector = schema
      if (_.isFunction(callback)) {
        callback(jsonObject)
      }
    })
  }

  static compressText (text) {
    return text.replace(/\s/g, '').replaceAll(/-/g, '').replaceAll(/\r?\n|\r/g, '').replaceAll(/\?/g, '').replaceAll(/-\n-|-\r\n-|-\r-|\r\n|\r|\n/g, '').toLowerCase()
  }

  static retrieveFragmentSelectors (json, documents, callback) {
    let annotationSchema = { textFragments: [] }
    for (let i = 0; i < json.paragraphs.length; i += 1) {
      let paragraph = json.paragraphs[i]
      paragraph = this.compressText(paragraph)
      for (let j = 1; j < documents.length; j += 1) {
        let documentText = documents[j].pageContent
        documentText = this.compressText(documentText)
        if (documentText.includes(paragraph)) {
          let pageNumber = documents[j].metadata.loc.pageNumber
          console.log(paragraph)
          console.log('FOUND PAGE FOR ' + i + ':' + pageNumber)
          let textFragment = {
            text: json.paragraphs[i],
            pageNumber: pageNumber
          }
          annotationSchema.textFragments.push(textFragment)
        }
      }
    }
    if (_.isFunction(callback)) {
      callback(annotationSchema)
    }
  }
}

export default AnthropicManager
