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
  get references(){
    let references = [].concat.apply([],this.annotations.map((e) => {return e.suggestedLiterature!=null ? e.suggestedLiterature : []}))
    return references.filter((item,pos) => {return references.indexOf(item) === pos}).sort()
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
      if (assessedCriteria.resume) {
        t += "-Resume:- "+assessedCriteria.resume+"\r\n\r\n";
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
      let reviewReferences = this.references
      for(let i=0;i<this.unsortedAnnotations.length;i++){
        t += "\t- "
        if(this.unsortedAnnotations[i].page!=null) t+= '(Page '+this.unsortedAnnotations[i].page+'): '
        t += '"'+this.unsortedAnnotations[i].highlightText+'"'
        if(this.unsortedAnnotations[i].comment!=null&&this.unsortedAnnotations[i].comment!="") t+= '\r\n\t'+this.unsortedAnnotations[i].comment
        let literature = this.unsortedAnnotations[i].suggestedLiterature!=null ? this.unsortedAnnotations[i].suggestedLiterature : []
        if(literature.length>0){
          t += '\r\n\tI would encourage the authors to look at the following papers: ';
          for(let j in literature){
            t += '['+(reviewReferences.indexOf(literature[j])+1)+']'
            if(j===literature.length-2&&literature.length>1) t += ' and '
            else if(literature.length>1&&j<literature.length-1) t += ', '
          }
        }
        t += '\r\n'
      }
    }

    // References
    let references = this.references
    if(references.length>0){
      t += "REFERENCES:\r\n"
      for(let i=0;i<references.length;i++){
        t += "\r\n["+(i+1)+"] "+references[i]
      }
    }

    t += "\r\n<Comments to editors>";

    return t;
  }
}

export class Annotation {
  constructor(id,criterion,level,group,highlightText,page,comment,suggestedLiterature){
    this._criterion = criterion
    this._level = level
    this._group = group
    this._highlightText = highlightText
    this._page = page
    this._comment = comment
    this._suggestedLiterature = suggestedLiterature
    this._id = id
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
  get suggestedLiterature(){
    return this._suggestedLiterature
  }
  get id(){
    return this._id
  }
}

export class AssessedTag {
  constructor({ criterion, resume = null, alternative = null }){
    this._criterion = criterion
    this._resume = resume
    this._alternative = alternative
  }
  get criterion(){
    return this._criterion
  }
  get resume(){
    return this._resume
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
      t += '"' + this._annotations[i].highlightText.replace(/(\r\n|\n|\r)/gm, '') + '". ';
      if (this._annotations[i].comment != null && this._annotations[i].comment != "") t += '\r\n\t' + this._annotations[i].comment.replace(/(\r\n|\n|\r)/gm, '');
    }
    let literature = [].concat.apply([], this._annotations.map((e) => {return e.suggestedLiterature}))
    let reviewReferences = this._review.references
    if (literature.length > 0) {
      t += '\n\tI would encourage the authors to look at the following papers: ';
      for (let j in literature) {
        t += '[' + (reviewReferences.indexOf(literature[j]) + 1) + ']'
        if (j === literature.length - 2 && literature.length > 1) t += ' and '
        else if (literature.length > 1 && j < literature.length - 1) t += ', '
      }
    }
    return t
  }
}
