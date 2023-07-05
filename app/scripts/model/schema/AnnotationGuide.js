class AnnotationGuide {
  constructor ({name, storageGroup, guideElements = []}) {
    this.name = name.substr(0, 25)
    this.storageGroup = storageGroup
    this.guideElements = guideElements
  }

  toAnnotations () {

  }

  toAnnotation () {

  }

  fromAnnotation (annotation) {

  }

  fromAnnotations (annotations) {

  }
}

module.exports = AnnotationGuide
