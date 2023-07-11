import { Document } from 'langchain/document'

class LLMTextUtils {
  static async loadDocument () {
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
    return documents
  }

  static compressText (text) {
    return text.replace(/\s/g, '').replaceAll(/-/g, '').replaceAll(/\r?\n|\r/g, '').replaceAll(/\?/g, '').replaceAll(/-\n-|-\r\n-|-\r-|\r\n|\r|\n/g, '').replaceAll(/[^a-zA-Z0-9 ]/g, '').toLowerCase()
  }
  static getPageNumberFromDocuments (paragraph, documents) {
    paragraph = this.compressText(paragraph)
    for (let i = 0; i < documents.length; i += 1) {
      let documentText = this.compressText(documents[i].pageContent)
      if (documentText.includes(paragraph)) {
        let pageNumber = documents[i].metadata.loc.pageNumber
        console.log('FOUND PAGE FOR ' + i + ':' + pageNumber)
        return pageNumber
      }
    }
    return null
  }

  /**
   * Finds the indexes for the matches of the given keyword in the text
   * @param {string} pageContent
   * @param {string} paragraph
   * @return {number}
   */
  static getIndexesOfParagraph (pageContent, paragraph) {
    let strList = paragraph.split(' ')
    for (let i = 0; i < strList.length - 3; i += 1) {
      let paragraphBegin = strList[i] + ' ' + strList[i + 1] + ' ' + strList[i + 2]
      let index = pageContent.toLowerCase().indexOf(paragraphBegin.toLowerCase(), 0)
      if (index > -1) {
        return index
      }
    }
    return null
  }

  static async getPageContent (pageNumber) {
    let pdf = window.PDFViewerApplication.pdfDocument
    const page = await pdf.getPage(pageNumber)
    const content = await page.getTextContent()
    let textItems = content.items
    let finalText = ''
    // Problem with spaces when removing accents
    for (let i = 0; i < textItems.length; i++) {
      let item = textItems[i]
      if (item.str.trim().length !== 0) {
        finalText += item.str.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        if (textItems[i + 1] && item.transform[5] === textItems[i + 1].transform[5]) {
          finalText += ' '
        }
      }
    }
    return finalText
  }
}

export default LLMTextUtils
