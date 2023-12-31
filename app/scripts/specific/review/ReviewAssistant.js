/* eslint-disable */
const Config = require('../../Config')
import {Review,Annotation} from '../../exporter/reviewModel.js'
import Swal from 'sweetalert2/dist/sweetalert2.js'

class ReviewAssistant {
  static parseAnnotations (annotations){
    const criterionTag = Config.review.namespace + ':' + Config.review.tags.grouped.relation + ':'
    const levelTag = Config.review.namespace + ':' + Config.review.tags.grouped.subgroup + ':'
    const majorConcernLevel = 'Major weakness'
    const minorConcernLevel = 'Minor weakness'
    const strengthLevel = 'Strength'
    let r = new Review()

    for (let a in annotations) {
      let criterion = null
      let level = null
      for (let t in annotations[a].tags) {
        if (annotations[a].tags[t].indexOf(criterionTag) != -1) criterion = annotations[a].tags[t].replace(criterionTag, '').trim()
        if (annotations[a].tags[t].indexOf(levelTag) != -1) level = annotations[a].tags[t].replace(levelTag, '').trim()
      }
      //if (criterion == null || level == null) continue
      let textQuoteSelector = null
      let highlightText = '';
      let pageNumber = null
      for (let k in annotations[a].target) {
        if (annotations[a].target[k].selector.find((e) => { return e.type === 'TextQuoteSelector' }) != null) {
          textQuoteSelector = annotations[a].target[k].selector.find((e) => { return e.type === 'TextQuoteSelector' })
          highlightText = textQuoteSelector.exact
        }
        if (annotations[a].target[k].selector.find((e) => { return e.type === 'FragmentSelector'}) != null){
          pageNumber = annotations[a].target[k].selector.find((e) => { return e.type === 'FragmentSelector'}).page
        }
      }
      let annotationText = annotations[a].text!==null&&annotations[a].text!=='' ? JSON.parse(annotations[a].text) : {comment:'',suggestedLiterature:[]}
      let comment = annotationText.comment !== null ? annotationText.comment : null
      let suggestedLiterature = annotationText.suggestedLiterature !== null ? annotationText.suggestedLiterature : []
      r.insertAnnotation(new Annotation(annotations[a].id,criterion,level,highlightText,pageNumber,comment,suggestedLiterature))
    }
    return r
  }

  static checkBalanced () {
    let review = this.parseAnnotations(window.abwa.contentAnnotator.allAnnotations);
    let strengthNum = review.strengths.length;
    let concernNum = review.majorConcerns.length + review.minorConcerns.length;
    if (strengthNum === 0 && concernNum > 0){
      Swal.fire({
        type: 'info',
        text: 'You should consider including strengths too.',
        toast: true,
        showConfirmButton: false,
        timer: 5000,
        position: 'bottom-end'
      })
    }
    else if (concernNum === 0 && strengthNum > 0) {
      Swal.fire({
        type: 'info',
        text: 'You should consider including weaknesses too.',
        toast: true,
        showConfirmButton: false,
        timer: 5000,
        position: 'bottom-end'
      })
    }
  }
}

export default ReviewAssistant
