import _ from 'lodash'
// import { ChatAnthropic } from 'langchain/chat_models/anthropic'
// import { loadQAStuffChain } from 'langchain/chains'
import { Document } from 'langchain/dist/document'

class AnthropicManager {
  static async askCriteria (criteria, description, apiKey, callback) {
    let pdf = window.PDFViewerApplication.pdfDocument
    const meta = await pdf.getMetadata().catch(() => null)
    const documents = []
    for (let i = 1; i <= pdf.numPages; i += 1) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      if (content.items.length === 0) {
        continue;
      }
      const text = content.items
        .map((item) => item.str)
        .join('\n')
      documents.push(new Document({
        pageContent: text,
        metadata: {
          // ...metadata,
          pdf: {
            version: meta?.PDFFormatVersion,
            info: meta?.info,
            metadata: meta?.metadata,
            totalPages: pdf.numPages,
          },
          loc: {
            pageNumber: i,
          },
        },
      }))
    }
    let doc = documents
    console.log(doc[1])
    console.log(documents)
    /*
    const numPages = pdf.numPages
    const pagePromises = []
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      pagePromises.push(pdf.getPage(pageNum))
    }

    Promise.all(pagePromises)
      .then(pages => {
        // Extract text from each page
        pages.forEach(page => {
          page.getTextContent()
            .then(textContent => {
              const pageText = textContent.items.map(item => item.str).join(' ')
              console.log('Page text:', pageText)
            })
        })
      })
      .catch(error => {
        console.log('Error extracting text:', error)
      }
    }
    // Create LLM
    const model = new ChatAnthropic({
      temperature: 0,
      anthropicApiKey: apiKey
    })
    // Document QA
    let query = 'You have all the sections for this research paper. Now, act as an academic reviewer and assess the criterion of the following paper. For the criterion, you have to assess if it is met considering these possible results: Met, Partially met, or Not met. For the criterion, you have to mention the elaborated reason why it is met or not met and provide three text different text fragments from the article that supports the decision of the result. You have to provide the response in JSON format with the following keys: -name (contains the criteria name), -sentiment (met, partially met or not met), -comment (the reason of the results), -paragraphs (an array with the THREE text fragments from the article that support the result).```Describes the proposed artifact in adequate details, which means providing a thorough and sufficient explanation or depiction of the artifact that is being proposed. Adequate details imply that the description should be comprehensive enough to provide a clear understanding of the artifact, including its features, functions, design, materials, dimensions, and any other relevant information. The level of detail should be appropriate for the context and purpose of the proposal, ensuring that the readers or audience can form a complete picture of the artifact based on the provided description.'
    // Create QA chain
    const chain = loadQAStuffChain(model)
    let res = await chain.call({
      input_documents: documents,
      question: query
    })

    console.log({ res })

     */
    console.log(criteria + description + apiKey)
    if (_.isFunction(callback)) {
      callback('pepino')
    }
  }
}

export default AnthropicManager
