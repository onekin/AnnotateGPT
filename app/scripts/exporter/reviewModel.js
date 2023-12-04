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

  isFirstComment (t) {
    if (t.endsWith("COMMENTS: ")) {
      return ''
    } else {
      return '\r\n\t\t-'
    }
  }

  isFirstCommentHTML (t) {
    if (t.endsWith("COMMENTS: ")) {
      return ''
    } else {
      return '\r\n\n-'
    }
  }

  groupByCategory(){
    // Summary of the work
    let t = "Review report date: " + new Date().toLocaleDateString() + "\r\n\r\n";

    // Criterion Assessment
    t += "<Criterion assessments>\r\n\r\n";
    this._assessedCriteria.forEach( (assessedCriteria) => {
      t += "Criterion Review: " + assessedCriteria.criterion.toUpperCase() + "\r\n\r\n";
      if (assessedCriteria.compile) {
        t += "Compilation:" + '(' + assessedCriteria.compile.sentiment + ')' + assessedCriteria.compile.answer + "\r\n";
      }
      if (assessedCriteria.alternative) {
        t += "Viewpoints:" + assessedCriteria.alternative.replaceAll('</br>','\n').replaceAll('<b>','').replaceAll('</b>','') + "\r\n";
      }
      t += "\r\n";
      // Strengths
      if (this.strengths.length > 0) {
        for (let s in this.strengths) {
          if (this.strengths[s].annotations[0].criterion === assessedCriteria.criterion) {
            t += '\t' + "***Strengths***\r\n";
            t += '\t' + (this.strengths[s].toGroupByCategories()) + "\r\n";
          }
        }
        t += "\r\n";
      }

      // Major concerns
      if (this.majorConcerns.length > 0) {
        for (let i = 0; i < this.majorConcerns.length; i++) {
          if (this.majorConcerns[i].annotations[0].criterion === assessedCriteria.criterion) {
            t += '\t' + "***Major weaknesses***\r\n"
            t += '\t' + (this.majorConcerns[i].toGroupByCategories()) + "\r\n";
          }
        }
        t += "\r\n";
      }

      // Minor concerns
      if (this.minorConcerns.length > 0) {
        for (let i = 0; i < this.minorConcerns.length; i++) {
          if (this.minorConcerns[i].annotations[0].criterion === assessedCriteria.criterion) {
            t += '\t' + "***Minor weaknesses***\r\n"
            t += '\t' + (this.minorConcerns[i].toGroupByCategories()) + "\r\n";
          }
        }
        t += "\r\n";
      }

      // Other Comments
      const criterionUnsortedAnnotations = this.unsortedAnnotations.filter((e) => {return e.criterion === assessedCriteria.criterion})
      if (criterionUnsortedAnnotations && criterionUnsortedAnnotations.length > 0) {
        // Other comments
        t += '\t' + '***Other comments***:\r\n'
        for (let i = 0; i < criterionUnsortedAnnotations.length; i++) {
          t += "\t* "
          if(criterionUnsortedAnnotations[i].page!=null) t+= 'EXCERPT: (Page '+criterionUnsortedAnnotations[i].page+'): '
          t += '"' + criterionUnsortedAnnotations[i].highlightText + '". ';
          if ((criterionUnsortedAnnotations[i].comment != null && criterionUnsortedAnnotations[i].comment != "") || (criterionUnsortedAnnotations[i].factChecking != null && criterionUnsortedAnnotations[i].factChecking != "") || (criterionUnsortedAnnotations[i].socialJudgement != null && criterionUnsortedAnnotations[i].socialJudgement != "") || (criterionUnsortedAnnotations[i].clarifications != null && criterionUnsortedAnnotations[i].clarifications != "")) {
            t += '\t' + '\r\n\t* COMMENTS: '
            if (criterionUnsortedAnnotations[i].comment != null && criterionUnsortedAnnotations[i].comment != "") t += this.isFirstComment(t) + + criterionUnsortedAnnotations[i].comment.replace(/(\r\n|\n|\r)/gm, '');
            if (criterionUnsortedAnnotations[i].factChecking != null && criterionUnsortedAnnotations[i].factChecking != "") t += this.isFirstComment(t) + '- Fact checking suggests that ' + criterionUnsortedAnnotations[i].factChecking.replace(/(\r\n|\n|\r)/gm, '');
            if (criterionUnsortedAnnotations[i].socialJudgement != null && criterionUnsortedAnnotations[i].socialJudgement != "") t += this.isFirstComment(t) + '- Social Judgement suggests that: ' + criterionUnsortedAnnotations[i].socialJudgement.replace(/(\r\n|\n|\r)/gm, '');
            if (criterionUnsortedAnnotations[i].clarifications && criterionUnsortedAnnotations[i].clarifications.length > 0) {
              for (let j in criterionUnsortedAnnotations[i].clarifications) {
                t += this.isFirstComment(t) + '[' + criterionUnsortedAnnotations[i].clarifications[j].question + ']: ' + criterionUnsortedAnnotations[i].clarifications[j].answer.replace(/(\r\n|\n|\r)/gm, '');
              }
            }
          }
          t += '\r\n'
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

    t += "\r\n<Comments to editors>";

    return t;
  }

  groupByCategoryHTML(){
    // Starting HTML structure with internal CSS
    let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Review Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
            h1, h2, h3 { color: navy; }
            h2 { border-bottom: 1px solid #ddd; padding-bottom: 5px; }
            .criterion { margin-top: 20px; }
            .excerpt { font-style: italic; margin-bottom: 10px; display: flex; align-items: center; }
            .excerpt img { margin-right: 5px; }
            .editable { margin-left: 20px; background-color: #f0f0f0; padding: 10px; }
            .editable textarea { width: 100%; height: 100px; }
      </style>
    </head>
    <body>
    `;
    // Adding date at the top
    htmlContent += "<h1>Review Report </h1><p>Date: "+ new Date().toLocaleDateString() + "</p>";

    // Criterion Assessment
    this._assessedCriteria.forEach( (assessedCriteria) => {
      htmlContent += "<div class='criterion'><h2>"+ assessedCriteria.criterion.toUpperCase() + "</h2>";

      if (assessedCriteria.compile) {
        htmlContent += "<div class='editable'><h3>Compilation: (" + assessedCriteria.compile.sentiment + ") </h3><textarea>" + assessedCriteria.compile.answer + "</textarea></div>";
      }

      if (assessedCriteria.alternative) {
        let alternativeText = assessedCriteria.alternative.replace(/<\/br>/g, '<br>').replace(/<b>/g, '<strong>').replace(/<\/b>/g, '</strong>');
        htmlContent += "<div class='editable'>" + alternativeText + "</div>";
      }

      // Adding strengths, major concerns, minor concerns, and other comments
      htmlContent += this.formatCategorySection('strength', this.strengths, assessedCriteria, 'green');
      htmlContent += this.formatCategorySection('minorConcern', this.minorConcerns, assessedCriteria, '#DAA520');
      htmlContent += this.formatCategorySection('majorConcern', this.majorConcerns, assessedCriteria, '#8b0000');
      const criterionUnsortedAnnotations = this.unsortedAnnotations.filter((e) => {return e.criterion === assessedCriteria.criterion})
      if (criterionUnsortedAnnotations && criterionUnsortedAnnotations.length > 0) {
        htmlContent += this.formatUnsortedAnnotations(criterionUnsortedAnnotations, assessedCriteria, '#00316e');
      }
      htmlContent += "</div>"
    });

    // Presentation errors
    if(this.presentationErrors.length>0){
      htmlContent += "<h3>PRESENTATION ERRORS</h3>";
      this.presentationErrors.forEach(error => {
        htmlContent += "<p>- " + error.toGroupByCategories() + "</p>";
      });
    }

    htmlContent += "<h3>Comments to Editors</h3><div class='editable'><textarea></textarea></div>";
    // Append any additional content here

    // Closing HTML tags
    htmlContent += "</body></html>";

    return htmlContent;
  }

// Function to format category sections like strengths, concerns, etc.
  formatCategorySection(title, categoryArray, assessedCriteria, color) {
    let htmlSection = "";
    if (categoryArray.length > 0) {
      categoryArray.forEach(item => {
        if (item.annotations[0].criterion === assessedCriteria.criterion) {
          htmlSection +=  item.toGroupByCategoriesHTML(color)
        }
      });
    }
    return htmlSection;
  }

// Function to format unsorted annotations
  formatUnsortedAnnotations(annotations, assessedCriteria, color) {
    let t = "";
    if (annotations.length > 0) {
      for (let i in annotations) {
        if (annotations[i].highlightText === null) continue
        t += "<div className='excerpt'>"
        t += `<li style="color: ${color};">`;
        if (annotations[i].page !== null) t += '(Page ' + annotations[i].page + '): '
        t += '"' + annotations[i].highlightText + '". ' + '</li>';
        if ((annotations[i].comment != null && annotations[i].comment != "") || (annotations[i].factChecking != null && annotations[i].factChecking != "") || (annotations[i].socialJudgement != null && annotations[i].socialJudgement != "") || (annotations[i].clarifications != null && annotations[i].clarifications != "")) {
          t += "<div class='editable'><textarea>COMMENTS: "
          if (annotations[i].comment != null && annotations[i].comment != "") t += this.isFirstCommentHTML(t) + + annotations[i].comment.replace(/(\r\n|\n|\r)/gm, '');
          if (annotations[i].factChecking != null && annotations[i].factChecking != "") t += this.isFirstCommentHTML(t) + 'Fact checking suggests that ' + this._annotations[i].factChecking.replace(/(\r\n|\n|\r)/gm, '');
          if (annotations[i].socialJudgement != null && annotations[i].socialJudgement != "") t += this.isFirstCommentHTML(t) + 'Social Judgement suggests that: ' + annotations[i].socialJudgement.replace(/(\r\n|\n|\r)/gm, '');
          if (annotations[i].clarifications && annotations[i].clarifications.length > 0) {
            for (let j in annotations[i].clarifications) {
              t += this.isFirstCommentHTML(t) + '[' + annotations[i].clarifications[j].question + ']: ' + annotations[i].clarifications[j].answer.replace(/(\r\n|\n|\r)/gm, '');
            }
          }
          t += '</textarea></div>'
        }
        t += '</div>'
      }
    }
    return t;
  }

  groupBySentiment(){
    // Summary of the work
    let t = "Review report date: " + new Date().toLocaleDateString() + "\r\n\r\n";

    // Strengths
    let strengtCriteria = this._assessedCriteria.filter(e => {
      if (e.compile && e.compile.sentiment) {
        return e.compile.sentiment === "Strength"
      }
    })
    if(this.strengths.length>0 || strengtCriteria.length>0){
      t+= "STRENGTHS:\r\n\r\n";
      for (let i=0; i<strengtCriteria.length; i++) {
        t += "- (" + strengtCriteria[i].criterion + ')' + strengtCriteria[i].compile.answer+"\r\n\r\n";
      }
      for(let s in this.strengths){
        t += "- "+this.strengths[s].toSentimentString()+"\r\n\r\n";
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
        t += '- ' + majorWeaknessCriteria[i].compile.answer+"\r\n\r\n";
      }
      for(let i=0;i<this.majorConcerns.length;i++){
        t += (i+1)+"- "+this.majorConcerns[i].toSentimentString()+"\r\n\r\n";
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
        t += (i+1)+" "+this.minorConcerns[i].toSentimentString()+"\r\n\r\n";
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
        if (!assessedCriteria.alternative.isArray) {
          t += "- Viewpoints for " + assessedCriteria.criterion + ': ' + assessedCriteria.alternative.replaceAll('</br>','\n\t').replaceAll('<b>','').replaceAll('</b>','') + "\r\n\r\n";
        }
      }
    })
    if(this.unsortedAnnotations.length>0){
      for(let i=0;i<this.unsortedAnnotations.length;i++){
        t += '\t* ' + this.unsortedAnnotations[i].criterion + ' '
        if(this.unsortedAnnotations[i].page!=null) t+= '(EXCERPT: Page '+this.unsortedAnnotations[i].page+'): '
        t += '"' + this.unsortedAnnotations[i].highlightText + '". ';
        if ((this.unsortedAnnotations[i].comment != null && this.unsortedAnnotations[i].comment != "") || (this.unsortedAnnotations[i].factChecking != null && this.unsortedAnnotations[i].factChecking != "") || (this.unsortedAnnotations[i].socialJudgement != null && this.unsortedAnnotations[i].socialJudgement != "") || (this.unsortedAnnotations[i].clarifications != null && this.unsortedAnnotations[i].clarifications != "")) {
          t += '\t' + '\r\n\t* COMMENTS: '
          if (this.unsortedAnnotations[i].comment != null && this.unsortedAnnotations[i].comment != "") t += this.isFirstComment(t) + this.unsortedAnnotations[i].comment.replace(/(\r\n|\n|\r)/gm, '');
          if (this.unsortedAnnotations[i].factChecking != null && this.unsortedAnnotations[i].factChecking != "") t += this.isFirstComment(t) + 'Fact checking suggests that ' + this.unsortedAnnotations[i].factChecking.replace(/(\r\n|\n|\r)/gm, '');
          if (this.unsortedAnnotations[i].socialJudgement != null && this.unsortedAnnotations[i].socialJudgement != "") t += this.isFirstComment(t) + 'Social Judgement suggests that: ' + this.unsortedAnnotations[i].socialJudgement.replace(/(\r\n|\n|\r)/gm, '');
          if (this.unsortedAnnotations[i].clarifications && this.unsortedAnnotations[i].clarifications.length > 0) {
            for (let j in this.unsortedAnnotations[i].clarifications) {
              t += this.isFirstComment(t) + '[' + this.unsortedAnnotations[i].clarifications[j].question + ']: ' + this.unsortedAnnotations[i].clarifications[j].answer.replace(/(\r\n|\n|\r)/gm, '');
            }
          }
        }
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

  isFirstComment (t) {
    if (t.endsWith("COMMENTS: ")) {
      return ''
    } else {
      return '\r\n\t\t-'
    }
  }

  isFirstCommentHTML (t) {
    if (t.endsWith("COMMENTS: ")) {
      return ''
    } else {
      return '\r\n\n-'
    }
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

  toSentimentString () {
    let t = '\t***' + this._annotations[0].criterion + '***'
    for (let i in this._annotations) {
      if (this._annotations[i].highlightText === null) continue
      t += '\r\n\t\t* '
      if (this._annotations[i].page !== null) t += 'EXCERPT: (Page ' + this._annotations[i].page + ') '
      t += '"' + this._annotations[i].highlightText + '". ';
      if ((this._annotations[i].comment != null && this._annotations[i].comment != "") || (this._annotations[i].factChecking != null && this._annotations[i].factChecking != "") || (this._annotations[i].socialJudgement != null && this._annotations[i].socialJudgement != "") || (this._annotations[i].clarifications != null && this._annotations[i].clarifications != "")) {
        t += '\t' + '\r\n\t* COMMENTS: '
        if (this._annotations[i].comment != null && this._annotations[i].comment != "") t += this.isFirstComment(t) + this._annotations[i].comment.replace(/(\r\n|\n|\r)/gm, '');
        if (this._annotations[i].factChecking != null && this._annotations[i].factChecking != "") t += this.isFirstComment(t) + 'Fact checking suggests that ' + this._annotations[i].factChecking.replace(/(\r\n|\n|\r)/gm, '');
        if (this._annotations[i].socialJudgement != null && this._annotations[i].socialJudgement != "") t += this.isFirstComment(t) + 'Social Judgement suggests that: ' + this._annotations[i].socialJudgement.replace(/(\r\n|\n|\r)/gm, '');
        if (this._annotations[i].clarifications && this._annotations[i].clarifications.length > 0) {
          for (let j in this._annotations[i].clarifications) {
            t += this.isFirstComment(t) + '[' + this._annotations[i].clarifications[j].question + ']: ' + this._annotations[i].clarifications[j].answer.replace(/(\r\n|\n|\r)/gm, '');
          }
        }
      }
    }
    return t
  }

  toGroupByCategoriesHTML (color) {
    let t = ''
    for (let i in this._annotations) {
      if (this._annotations[i].highlightText === null) continue
      t += "<div className='excerpt'>"
      t += `<li style="color: ${color};">`;
      if (this._annotations[i].page !== null) t += '(Page ' + this._annotations[i].page + '): '
      t += '"' + this._annotations[i].highlightText + '". ' + '</li>';
      if ((this._annotations[i].comment != null && this._annotations[i].comment != "") || (this._annotations[i].factChecking != null && this._annotations[i].factChecking != "") || (this._annotations[i].socialJudgement != null && this._annotations[i].socialJudgement != "") || (this._annotations[i].clarifications != null && this._annotations[i].clarifications != "")) {
        t += "<div class='editable'><textarea>COMMENTS: "
        if (this._annotations[i].comment != null && this._annotations[i].comment != "") t += this.isFirstCommentHTML(t) + + this._annotations[i].comment.replace(/(\r\n|\n|\r)/gm, '');
        if (this._annotations[i].factChecking != null && this._annotations[i].factChecking != "") t += this.isFirstCommentHTML(t) + 'Fact checking suggests that ' + this._annotations[i].factChecking.replace(/(\r\n|\n|\r)/gm, '');
        if (this._annotations[i].socialJudgement != null && this._annotations[i].socialJudgement != "") t += this.isFirstCommentHTML(t) + 'Social Judgement suggests that: ' + this._annotations[i].socialJudgement.replace(/(\r\n|\n|\r)/gm, '');
        if (this._annotations[i].clarifications && this._annotations[i].clarifications.length > 0) {
          for (let j in this._annotations[i].clarifications) {
            t += this.isFirstCommentHTML(t) + '[' + this._annotations[i].clarifications[j].question + ']: ' + this._annotations[i].clarifications[j].answer.replace(/(\r\n|\n|\r)/gm, '');
          }
        }
        t += '</textarea></div>'
      }
      t += '</div>'
    }
    return t
  }

  toGroupByCategories () {
    let t = ''
    for (let i in this._annotations) {
      if (this._annotations[i].highlightText === null) continue
      t += '\t' + '\r\n\t* '
      if (this._annotations[i].page !== null) t += 'EXCERPT: (Page ' + this._annotations[i].page + '): '
      t += '"' + this._annotations[i].highlightText + '". ';
      if ((this._annotations[i].comment != null && this._annotations[i].comment != "") || (this._annotations[i].factChecking != null && this._annotations[i].factChecking != "") || (this._annotations[i].socialJudgement != null && this._annotations[i].socialJudgement != "") || (this._annotations[i].clarifications != null && this._annotations[i].clarifications != "")) {
        t += '\t' + '\r\n\t* COMMENTS: '
        if (this._annotations[i].comment != null && this._annotations[i].comment != "") t += this.isFirstComment(t) + + this._annotations[i].comment.replace(/(\r\n|\n|\r)/gm, '');
        if (this._annotations[i].factChecking != null && this._annotations[i].factChecking != "") t += this.isFirstComment(t) + 'Fact checking suggests that ' + this._annotations[i].factChecking.replace(/(\r\n|\n|\r)/gm, '');
        if (this._annotations[i].socialJudgement != null && this._annotations[i].socialJudgement != "") t += this.isFirstComment(t) + 'Social Judgement suggests that: ' + this._annotations[i].socialJudgement.replace(/(\r\n|\n|\r)/gm, '');
        if (this._annotations[i].clarifications && this._annotations[i].clarifications.length > 0) {
          for (let j in this._annotations[i].clarifications) {
            t += this.isFirstComment(t) + '[' + this._annotations[i].clarifications[j].question + ']: ' + this._annotations[i].clarifications[j].answer.replace(/(\r\n|\n|\r)/gm, '');
          }
        }
      }
    }
    return t
  }
}
