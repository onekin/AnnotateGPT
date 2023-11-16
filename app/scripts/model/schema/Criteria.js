const GuideElement = require('./GuideElement')
const jsYaml = require('js-yaml')
const Level = require('./Level')
const LanguageUtils = require('../../utils/LanguageUtils')

class Criteria extends GuideElement {
  constructor ({name, color, review, group = 'Other', description, custom = false, compile, alternative}) {
    super({name, color, parentElement: review})
    this.levels = this.childElements
    this.group = group
    this.review = this.parentElement
    this.description = description
    this.custom = custom
    if (compile) {
      this.compile = compile
    }
    if (alternative) {
      this.alternative = alternative
    }
  }

  toAnnotations () {
    let annotations = []
    // Create its annotations
    annotations.push(this.toAnnotation())
    // Create its children annotations
    for (let i = 0; i < this.levels.length; i++) {
      annotations = annotations.concat(this.levels[i].toAnnotations())
    }
    return annotations
  }

  toAnnotation () {
    let review = this.getAncestor()
    let compile
    if (this.compile) {
      compile = this.compile
    } else {
      compile = ''
    }
    let alternative
    if (this.alternative) {
      alternative = this.alternative
    } else {
      alternative = ''
    }
    return {
      group: review.storageGroup.id,
      permissions: {
        read: ['group:' + review.storageGroup.id]
      },
      references: [],
      tags: ['review:criteria:' + LanguageUtils.normalizeString(this.name)],
      target: [],
      text: jsYaml.dump({
        description: this.description,
        group: this.group,
        custom: this.custom,
        alternative: alternative,
        compile: compile
      }),
      uri: review.storageGroup.links ? review.storageGroup.links.html : review.storageGroup.url // Compatibility with both group representations getGroups and userProfile
    }
  }

  static createCriteriaFromObject (criteria, rubric) {
    criteria.parentElement = rubric
    criteria.rubric = criteria.parentElement
    // Instance criteria object
    let instancedCriteria = Object.assign(new Criteria({}), criteria)
    // Instance levels
    for (let i = 0; i < criteria.levels.length; i++) {
      instancedCriteria.levels[i] = Level.createLevelFromObject(criteria.levels[i], instancedCriteria)
    }
    return instancedCriteria
  }

  toObject () {
    let object = {
      name: this.name,
      group: this.group,
      description: this.description,
      levels: []
    }
    if (this.custom) {
      object.custom = true
    }
    // For each level
    for (let i = 0; i < this.levels.length; i++) {
      let level = this.levels[i]
      if (LanguageUtils.isInstanceOf(level, Level)) {
        object.levels.push(level.toObject())
      }
    }
    return object
  }
}

module.exports = Criteria
