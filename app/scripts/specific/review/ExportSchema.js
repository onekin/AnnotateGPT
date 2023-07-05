const Criteria = require('../../model/schema/Criteria')
const Level = require('../../model/schema/Level')
const Review = require('../../model/schema/Review')
const _ = require('lodash')
const FileSaver = require('file-saver')
const Alerts = require('../../utils/Alerts')

const jsYaml = require('js-yaml')

class ExportSchema {
  static exportConfigurationSchemeToJSObject (schemeAnnotations) {
    // Get criteria annotations
    let criteriaAnnotations = _.filter(schemeAnnotations, (annotation) => {
      return _.find(annotation.tags, (tag) => { return tag.includes('review:criteria:') })
    })
    let criterias = _.map(criteriaAnnotations, (annotation) => {
      // Get criteria name
      let nameTag = _.find(annotation.tags, (tag) => { return tag.includes('review:criteria:') })
      let name = null
      if (nameTag) {
        name = nameTag.replace('review:criteria:', '')
      }
      if (name) {
        let description = ''
        let group = 'Other'
        let custom = false
        try {
          let config = jsYaml.load(annotation.text)
          description = config.description
          group = config.group
          custom = config.custom
        } catch (e) {
          console.debug('Unable to parse criteria from schema annotation:\n' + e.message)
        }
        return new Criteria({name: name, description: description, group: group, custom: custom})
      } else {
        return null
      }
    })
    // Remove nulls, etc.
    criterias = _.compact(criterias)
    // Get codes annotations
    let codeAnnotations = _.filter(schemeAnnotations, (annotation) => {
      return _.find(annotation.tags, (tag) => { return tag.includes('review:isCriteriaOf:') })
    })
    // Add to the corresponding criteria the levels in the scheme
    _.forEach(codeAnnotations, (annotation) => {
      let nameTag = _.find(annotation.tags, (tag) => { return tag.includes('review:level:') })
      let categoryNameTag = _.find(annotation.tags, (tag) => { return tag.includes('review:isCriteriaOf:') })
      if (nameTag && categoryNameTag) {
        // Get category
        let criteria = _.find(criterias, (criteria) => { return criteria.name === categoryNameTag.replace('review:isCriteriaOf:', '') })
        let name = nameTag.replace('review:level:', '')
        let description = ''
        try {
          let config = jsYaml.load(annotation.text)
          description = config.description
        } catch (e) {
          console.debug('Unable to parse level from schema annotation:\n' + e.message)
        }
        let level = new Level({name: name, criteria: criteria, description: description})
        criteria.levels.push(level)
      } else {
        return null
      }
    })
    let review = new Review({})
    review.criterias = review.criterias.concat(criterias)
    // Create a JS object with the review configuration
    return review.toObject()
  }

  static exportConfigurationSchemaToJSONFile (schemeAnnotations) {
    let object = ExportSchema.exportConfigurationSchemeToJSObject(schemeAnnotations)
    if (_.isObject(object)) {
      // Stringify JS object
      let stringifyObject = JSON.stringify(object, null, 2)
      // Download the file
      let blob = new window.Blob([stringifyObject], {
        type: 'text/plain;charset=utf-8'
      })
      FileSaver.saveAs(blob, 'reviewModel.json')
    } else {
      Alerts.errorAlert({text: 'An unexpected error happened when trying to retrieve review model configuration. Reload webpage and try again.'})
    }
  }
}

module.exports = ExportSchema
