const Config = {
  review: {
    groupName: 'ReviewAndGo',
    namespace: 'review',
    urlParamName: 'rag',
    tags: { // Defined tags for the domain
      grouped: { // Grouped annotations
        group: 'criteria',
        subgroup: 'level',
        relation: 'isCriteriaOf'
      }
    }
  }
}

module.exports = Config
