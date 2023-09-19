import LLMTextUtils from './LLMTextUtils'
import _ from 'lodash'

class FileUtils {
  static readTextFile (file, callback) {
    try {
      let reader = new window.FileReader()
      // Closure to capture the file information.
      reader.onload = (e) => {
        if (e && e.target && e.target.result) {
          callback(null, e.target.result)
        }
      }
      reader.readAsText(file)
    } catch (e) {
      callback(e)
    }
  }

  static readJSONFile (file, callback) {
    FileUtils.readTextFile(file, (err, text) => {
      if (err) {
        callback(err)
      } else {
        try {
          let json = JSON.parse(text)
          callback(null, json)
        } catch (err) {
          callback(err)
        }
      }
    })
  }

  static readGuidelinesFromTXT (file, callback) {
    FileUtils.readTextFile(file, async (err, text) => {
      if (err) {
        if (_.isFunction(callback)) {
          callback(err)
        }
      } else {
        if (_.isFunction(callback)) {
          let documents = await LLMTextUtils.textToDocument(text)
          callback(null, documents)
        }
      }
    })
  }

  static async readGuidelinesFromPDF (file) {
    let documents = await LLMTextUtils.loadDocument(file)
    return documents
  }
}

export default FileUtils
