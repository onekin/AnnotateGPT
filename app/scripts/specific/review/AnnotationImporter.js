const Alerts = require('../../utils/Alerts')
const FileUtils = require('../../utils/FileUtils')

class AnnotationImporter {
  static askUserToImportDocumentAnnotations (callback) {
    // Ask user to upload the file
    Alerts.inputTextAlert({
      title: 'Upload this document review annotations file',
      html: 'Here you can upload your json file with the annotations for this document.',
      input: 'file',
      callback: (err, file) => {
        if (err) {
          window.alert('An unexpected error happened when trying to load the alert.')
        } else {
          // Read json file
          FileUtils.readJSONFile(file, (err, jsonObject) => {
            if (err) {
              callback(new Error('Unable to read json file: ' + err.message))
            } else {
              callback(null, jsonObject)
            }
          })
        }
      }
    })
  }
}

module.exports = AnnotationImporter
