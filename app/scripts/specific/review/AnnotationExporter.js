const ExportSchema = require('./ExportSchema')
const FileSaver = require('file-saver')
const _ = require('lodash')

class AnnotationExporter {
  static exportCurrentDocumentAnnotations () {
    // Get annotations from tag manager and content annotator
    let modelAnnotations = window.abwa.tagManager.model.groupAnnotations
    // Export model annotations to export schema format
    let model = ExportSchema.exportConfigurationSchemeToJSObject(modelAnnotations)
    let currentDocumentAnnotations = _.clone(window.abwa.contentAnnotator.allAnnotations)
    // Remove not necessary information from annotations (group, permissions, user ¿?,...)
    let exportedDocumentAnnotations = _.map(currentDocumentAnnotations, (annotation) => {
      // Remove group id where annotation was created in
      annotation.group = ''
      // Remove permissions from the created annotation
      annotation.permissions = {}
      // Remove local file links in document metadata
      _.remove(annotation.documentMetadata.link, (link) => {
        return link.type === 'localfile'
      })
      _.remove(annotation.document.link, (link) => {
        return link.type === 'localfile'
      })
      return annotation
    })
    // Create object to be exported
    let object = {
      model: model,
      documentAnnotations: exportedDocumentAnnotations
    }
    // Stringify JS object
    let stringifyObject = JSON.stringify(object, null, 2)
    // Download the file
    let blob = new window.Blob([stringifyObject], {
      type: 'text/plain;charset=utf-8'
    })
    FileSaver.saveAs(blob, 'reviewAnnotationsFor ' + window.abwa.contentTypeManager.documentTitle + '.json') // Add document title
  }
}

module.exports = AnnotationExporter
