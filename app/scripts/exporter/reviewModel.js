/* eslint-disable */

export class Review {
  constructor(){
    this._annotations = []
    this._assessedCriteria = []
  }
  insertAnnotation(annotation){
    this._annotations.push(annotation)
  }

  insertAssessedCriteria(annotation){
    this._assessedCriteria.push(annotation)
  }
  get annotations(){
    return this._annotations
  }
  groupByCriterionInsideLevel (level){
    let that = this
    let groups = []
    let levelAnnotations = this._annotations.filter((e) => {return e.level===level})
    for(let i in levelAnnotations){
      if(groups.find((e) => {return e.annotations[0].criterion===levelAnnotations[i].criterion})!=null) continue;
      groups.push(new AnnotationGroup(levelAnnotations.filter((e) => {return e.criterion===levelAnnotations[i].criterion}),that));
    }
    return groups;
  }
  get strengths(){
    return this.groupByCriterionInsideLevel("Strength")
  }
  get minorConcerns(){
    return this.groupByCriterionInsideLevel("Minor weakness")
  }
  get majorConcerns(){
    return this.groupByCriterionInsideLevel("Major weakness")
  }
  get typos(){
    return this.annotations.filter((e) => {return e.criterion==="Typos"})
  }
  get presentationErrors(){
    let that = this
    let groups = []
    let presentationAnnotations = this._annotations.filter((el) => {return el.group === "Presentation"})
    for(let i in presentationAnnotations){
      if(groups.find((el) => {return el.annotations[0].criterion===presentationAnnotations[i].criterion})!=null) continue
      groups.push(new AnnotationGroup(presentationAnnotations.filter((el) => {return el.criterion===presentationAnnotations[i].criterion}),that))
    }
    return groups
  }

  get unsortedAnnotations(){
    //return this.annotations.filter((e) => {return e.criterion!=="Typos"&&(e.level==null||e.level=="")})
    return this.annotations.filter((e) => {return e.group!=="Presentation"&&(e.level==null||e.level=="")})
  }
  toString(){
    // Summary of the work
    let t = "<Summarize the work>\r\n\r\n";

    // Criterion Assessment
    t += "<Criterion assessments>\r\n\r\n";
    this._assessedCriteria.forEach( (assessedCriteria) => {
      t+= assessedCriteria.criterion + " assessment:\r\n\r\n";
      if (assessedCriteria.compile) {
        t += "-Compilation:- "+assessedCriteria.compile+"\r\n\r\n";
      }
      if (assessedCriteria.alternative) {
        t += "-Alternative viewpoints:- "+assessedCriteria.alternative+"\r\n\r\n";
      }
      t += "\r\n";
    })
    // Strengths
    if(this.strengths.length>0){
      t+= "STRENGTHS:\r\n\r\n";
      for(let s in this.strengths){
        t += "- "+this.strengths[s].toString()+"\r\n\r\n";
      }
      t += "\r\n";
    }

    // Major concerns
    if(this.majorConcerns.length>0){
      t += "MAJOR WEAKNESSES:\r\n\r\n"
      for(let i=0;i<this.majorConcerns.length;i++){
        t += (i+1)+"- "+this.majorConcerns[i].toString()+"\r\n\r\n";
      }
      t += "\r\n";
    }

    // Minor concerns
    if(this.minorConcerns.length>0){
      t += "MINOR WEAKNESSES:\r\n\r\n"
      for(let i=0;i<this.minorConcerns.length;i++){
        t += (i+1)+"- "+this.minorConcerns[i].toString()+"\r\n\r\n";
      }
      t += "\r\n";
    }

    // Presentation errors
    if(this.presentationErrors.length>0){
      t += "PRESENTATION:\r\n\r\n"
      for(let i=0;i<this.presentationErrors.length;i++){
        t += "- "+this.presentationErrors[i].toString()+"\r\n\r\n"
      }
      t += "\r\n"
    }

    // Other comments
    if(this.unsortedAnnotations.length>0){
      t += "OTHER COMMENTS:\r\n\r\n"
      for(let i=0;i<this.unsortedAnnotations.length;i++){
        t += "\t- "
        if(this.unsortedAnnotations[i].page!=null) t+= '(Page '+this.unsortedAnnotations[i].page+'): '
        t += '"'+this.unsortedAnnotations[i].highlightText+'"'
        if(this.unsortedAnnotations[i].comment!=null&&this.unsortedAnnotations[i].comment!="") t+= '\r\n\t'+this.unsortedAnnotations[i].comment
        t += '\r\n'
      }
    }
    t += "\r\n<Comments to editors>";

    return t;
  }

  groupByCategory(){
    // Summary of the work
    let t = "<Summarize the work>\r\n\r\n";

    // Criterion Assessment
    t += "<Criterion assessments>\r\n\r\n";
    this._assessedCriteria.forEach( (assessedCriteria) => {
      t+= assessedCriteria.criterion.toUpperCase() + " ASSESSMENT:\r\n\r\n";
      if (assessedCriteria.compile) {
        t += "-Compilation:- "+assessedCriteria.compile.answer+"\r\n\r\n";
      }
      if (assessedCriteria.alternative) {
        t += "-Alternative viewpoints: "+assessedCriteria.alternative+"\r\n\r\n";
      }
      t += "\r\n";
      // Strengths
      if(this.strengths.length>0) {
        for(let s in this.strengths){
          if (this.strengths[s].annotations[0].criterion === assessedCriteria.criterion){
            t+= '\t' + "***Strengths***\r\n\r\n";
            t += '\t' + (this.strengths[s].toGroupByCategories())+ "\r\n\r\n";
          }
        }
        t += "\r\n";
      }

      // Major concerns
      if(this.majorConcerns.length>0) {
        for(let i=0;i<this.majorConcerns.length;i++) {
          if (this.majorConcerns[i].annotations[0].criterion === assessedCriteria.criterion) {
            t += '\t' +"***Major weaknesses***\r\n\r\n"
            t += '\t' + (this.majorConcerns[i].toGroupByCategories()) + "\r\n\r\n";
          }
        }
        t += "\r\n";
      }

      // Minor concerns
      if(this.minorConcerns.length>0){
        for(let i=0;i<this.minorConcerns.length;i++){
          if (this.minorConcerns[i].annotations[0].criterion === assessedCriteria.criterion) {
            t += '\t' +"***Minor weaknesses***\r\n\r\n"
            t += '\t' + (this.minorConcerns[i].toGroupByCategories()) + "\r\n\r\n";
          }
        }
        t += "\r\n";
      }
    })

    // Presentation errors
    if(this.presentationErrors.length>0){
      t += "PRESENTATION:\r\n\r\n"
      for(let i=0;i<this.presentationErrors.length;i++){
        t += "- "+this.presentationErrors[i].toGroupByCategories()+"\r\n\r\n"
      }
      t += "\r\n"
    }

    // Other comments
    t += "OTHER COMMENTS:\r\n\r\n"
    if(this.unsortedAnnotations.length>0){
      for(let i=0;i<this.unsortedAnnotations.length;i++){
        t += "\t- "
        if(this.unsortedAnnotations[i].page!=null) t+= '(Page '+this.unsortedAnnotations[i].page+'): '
        t += '"'+this.unsortedAnnotations[i].highlightText+'"'
        if(this.unsortedAnnotations[i].comment!=null&&this.unsortedAnnotations[i].comment!="") t+= '\r\n\t'+this.unsortedAnnotations[i].comment
        t += '\r\n'
      }
    }

    t += "\r\n<Comments to editors>";

    return t;
  }

  groupBySentiment(){
    // Summary of the work
    let t = "<Summarize the work>\r\n\r\n";

    // Strengths
    let strengtCriteria = this._assessedCriteria.filter(e => {
      if (e.compile && e.compile.sentiment) {
        return e.compile.sentiment === "Strength"
      }
    })
    if(this.strengths.length>0 || strengtCriteria.length>0){
      t+= "STRENGTHS:\r\n\r\n";
      for (let i=0; i<strengtCriteria.length; i++) {
        t += "- "+strengtCriteria[i].compile.answer+"\r\n\r\n";
      }
      for(let s in this.strengths){
        t += "- "+this.strengths[s].toString()+"\r\n\r\n";
      }
      t += "\r\n";
    }

    // Major concerns
    let majorWeaknessCriteria = this._assessedCriteria.filter(e => {
      if (e.compile && e.compile.sentiment) {
        return e.compile.sentiment === "Major weakness"
      }
    })
    if(this.majorConcerns.length>0 || majorWeaknessCriteria.length>0){
      t += "MAJOR WEAKNESSES:\r\n\r\n"

      for (let i=0; i<majorWeaknessCriteria.length; i++) {
        t += "- "+majorWeaknessCriteria[i].criterion + ': ' + majorWeaknessCriteria[i].compile.answer+"\r\n\r\n";
      }
      for(let i=0;i<this.majorConcerns.length;i++){
        t += (i+1)+"- "+this.majorConcerns[i].toString()+"\r\n\r\n";
      }
      t += "\r\n";
    }

    // Minor concerns
    let minorWeaknessCriteria = this._assessedCriteria.filter(e => {
      if (e.compile && e.compile.sentiment) {
        return e.compile.sentiment === "Minor weakness"
      }
    })
    if(this.minorConcerns.length>0 || minorWeaknessCriteria.length>0){
      t += "MINOR WEAKNESSES:\r\n\r\n"
      for (let i=0; i<minorWeaknessCriteria.length; i++) {
        t += "- "+minorWeaknessCriteria[i].compile.answer+"\r\n\r\n";
      }
      for(let i=0;i<this.minorConcerns.length;i++){
        t += (i+1)+"- "+this.minorConcerns[i].toString()+"\r\n\r\n";
      }
      t += "\r\n";
    }

    // Presentation errors
    if(this.presentationErrors.length>0){
      t += "PRESENTATION:\r\n\r\n"
      for(let i=0;i<this.presentationErrors.length;i++){
        t += "- "+this.presentationErrors[i].toString()+"\r\n\r\n"
      }
      t += "\r\n"
    }

    // Other comments
    t += "OTHER COMMENTS:\r\n\r\n"
    this._assessedCriteria.forEach( (assessedCriteria) => {
      if (assessedCriteria.alternative) {
        t += "- Alternatives for " + assessedCriteria.criterion.toUpperCase() + ': ' + assessedCriteria.alternative + "\r\n\r\n";
      }
    })
    if(this.unsortedAnnotations.length>0){
      for(let i=0;i<this.unsortedAnnotations.length;i++){
        t += "\t- "
        if(this.unsortedAnnotations[i].page!=null) t+= '(Page '+this.unsortedAnnotations[i].page+'): '
        t += '"'+this.unsortedAnnotations[i].highlightText+'"'
        if(this.unsortedAnnotations[i].comment!=null&&this.unsortedAnnotations[i].comment!="") t+= '\r\n\t'+this.unsortedAnnotations[i].comment

        t += '\r\n'
      }
    }
    t += "\r\n<Comments to editors>";

    return t;
  }
}

export class Annotation {
  constructor(id,criterion,level,group,highlightText,page,comment,clarifications,factChecking,socialJudgement){
    this._criterion = criterion
    this._level = level
    this._group = group
    this._highlightText = highlightText
    this._page = page
    this._comment = comment
    this._id = id
    this._clarifications = clarifications
    this._factChecking = factChecking
    this._socialJudgement = socialJudgement
  }
  get criterion(){
    return this._criterion
  }
  get level(){
    return this._level
  }
  get group(){
    return this._group
  }
  get highlightText(){
    return this._highlightText
  }
  get page(){
    return this._page
  }
  get comment(){
    return this._comment
  }

  get id(){
    return this._id
  }

  get clarifications(){
    return this._clarifications
  }

  get factChecking(){
    return this._factChecking
  }

  get socialJudgement(){
    return this._socialJudgement
  }
}

export class AssessedTag {
  constructor({ criterion, compile = null, alternative = null }){
    this._criterion = criterion
    this._compile = compile
    this._alternative = alternative
  }
  get criterion(){
    return this._criterion
  }
  get compile(){
    return this._compile
  }
  get alternative(){
    return this._alternative
  }
}

export class AnnotationGroup {
  constructor (annotations, review) {
    this._annotations = annotations
    this._review = review
  }

  get annotations () {
    return this._annotations
  }

  toString () {
    let t = this._annotations[0].criterion + ':'
    for (let i in this._annotations) {
      if (this._annotations[i].highlightText === null) continue
      t += '\r\n\t* '
      if (this._annotations[i].page !== null) t += '(Page ' + this._annotations[i].page + '): '
      t += '"' + this._annotations[i].highlightText + '". ';
      if (this._annotations[i].comment != null && this._annotations[i].comment != "") t += '\r\n\t' + this._annotations[i].comment.replace(/(\r\n|\n|\r)/gm, '');
    }
    return t
  }

  toGroupByCategories () {
    let t = ''
    for (let i in this._annotations) {
      if (this._annotations[i].highlightText === null) continue
      t += '\t' + '\r\n\t* '
      if (this._annotations[i].page !== null) t += '(Page ' + this._annotations[i].page + '): '
      t += '\t' + '"' + this._annotations[i].highlightText + '". ';
      if (this._annotations[i].comment != null && this._annotations[i].comment != "") t += '\r\n\t\t' + this._annotations[i].comment.replace(/(\r\n|\n|\r)/gm, '');
      if (this._annotations[i].factChecking != null && this._annotations[i].factChecking != "") t += '\r\n\t Fact checking suggests that ' + this._annotations[i].factChecking.replace(/(\r\n|\n|\r)/gm, '');
      if (this._annotations[i].socialJudgement != null && this._annotations[i].socialJudgement != "") t += '\r\n\t Social Judgement suggests that: ' + this._annotations[i].socialJudgement.replace(/(\r\n|\n|\r)/gm, '');
      if (this._annotations[i].clarifications && this._annotations[i].clarifications.length > 0) {
        for (let j in this._annotations[i].clarifications) {
          t += '\n\t[' + this._annotations[i].clarifications[j].question + ']: ' + this._annotations[i].clarifications[j].answer.replace(/(\r\n|\n|\r)/gm, '');
        }
      }
    }
    return t
  }
}
