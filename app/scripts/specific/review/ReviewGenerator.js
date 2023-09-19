/* eslint-disable */
import AnnotationExporter from './AnnotationExporter'
import AnnotationImporter from './AnnotationImporter'
import Config from '../../Config'
import Alerts from '../../utils/Alerts'
import AnthropicManager from '../../llm/anthropic/AnthropicManager'
import OpenAIManager from '../../llm/openAI/OpenAIManager'
import FileUtils from '../../utils/FileUtils'
import AnnotationUtils from '../../utils/AnnotationUtils'


const ReviewSchema = require('../../model/schema/Review')
const ImportSchema = require('./ImportSchema')
const axios = require('axios')
const _ = require('lodash')
const LanguageUtils = require('../../utils/LanguageUtils')
const Screenshots = require('./Screenshots')
const $ = require('jquery')
require('jquery-contextmenu/dist/jquery.contextMenu')

const {Review, AssessedTag, Annotation} = require('../../exporter/reviewModel.js')

const FileSaver = require('file-saver')

const Events = require('../../contentScript/Events')
const DefaultCriteria = require('./DefaultCriteria')
const jsYaml = require('js-yaml')

let Swal = null
if (document && document.head) {
  Swal = require('sweetalert2')
}

class ReviewGenerator {
  init (callback) {
    // Create generator button
    let generatorWrapperURL = chrome.runtime.getURL('pages/specific/review/generator.html')
    axios.get(generatorWrapperURL).then((response) => {
      document.querySelector('#abwaSidebarContainer').insertAdjacentHTML('afterbegin', response.data)
      this.container = document.querySelector('#reviewGenerator')
      // Set generator image and event
      let generatorImageURL = chrome.runtime.getURL('/images/generator.png')
      this.generatorImage = this.container.querySelector('#reviewGeneratorButton')
      this.generatorImage.src = generatorImageURL
      this.generatorImage.addEventListener('click', () => {
        this.generateReviewButtonHandler()
      })
      // Set delete annotations image and event
      let deleteAnnotationsImageURL = chrome.runtime.getURL('/images/deleteAnnotations.png')
      this.deleteAnnotationsImage = this.container.querySelector('#deleteAnnotationsButton')
      this.deleteAnnotationsImage.src = deleteAnnotationsImageURL
      this.deleteAnnotationsImage.addEventListener('click', () => {
        this.deleteAnnotations()
      })
      // Set create canvas image and event
      let overviewImageURL = chrome.runtime.getURL('/images/overview.png')
      this.overviewImage = this.container.querySelector('#overviewButton')
      this.overviewImage.src = overviewImageURL
      this.overviewImage.addEventListener('click', () => {
        this.generateCanvas()
      })
      // Set import export image and event
      let importExportImageURL = chrome.runtime.getURL('/images/importExport.png')
      this.importExportImage = this.container.querySelector('#importExportButton')
      this.importExportImage.src = importExportImageURL
      this.importExportImage.addEventListener('click', () => {
        this.importExportButtonHandler()
      })
      // Set configuration button
      let configurationImageURL = chrome.runtime.getURL('/images/configuration.png')
      this.configurationImage = this.container.querySelector('#configurationButton')
      this.configurationImage.src = configurationImageURL
      this.configurationImage.addEventListener('click', () => {
        this.configurationButtonHandler()
      })
      if (_.isFunction(callback)) {
        callback()
      }
    })
  }
  parseAnnotations (annotations){
    let currentTags = window.abwa.tagManager.currentTags
    console.log(currentTags)
    const criterionTag = Config.review.namespace + ':' + Config.review.tags.grouped.relation + ':'
    const levelTag = Config.review.namespace + ':' + Config.review.tags.grouped.subgroup + ':'


    let r = new Review()

    for (let a in annotations) {
      let criterion = null
      let level = null
      let group = null
      for (let t in annotations[a].tags) {
        if (annotations[a].tags[t].indexOf(criterionTag) != -1) criterion = annotations[a].tags[t].replace(criterionTag, '').trim()
        if (annotations[a].tags[t].indexOf(levelTag) != -1) level = annotations[a].tags[t].replace(levelTag, '').trim()
      }
      if(criterion!=null){
        let g = window.abwa.tagManager.currentTags.find((el) => {return el.config.name === criterion})
        if (g!=null) group = g.config.options.group
      }
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
      r.insertAnnotation(new Annotation(annotations[a].id,criterion,level,group,highlightText,pageNumber,comment,suggestedLiterature))
    }
    currentTags.forEach( (tag) => {
      let resume = null
      if (tag.config.options.resume) {
        resume = tag.config.options.resume
      }
      let alternative = null
      if (tag.config.options.alternative) {
        alternative = tag.config.options.alternative
        if (alternative.isArray) {
          alternative = alternative.join('\n')
        }
      }
      if (resume || alternative) {
        let data = {}
        data.criterion = tag.config.name
        if (resume) {
          data.resume = resume
        }
        if (alternative) {
          data.alternative = alternative
        }
        let assessedTag = new AssessedTag(data)
        r.insertAssessedCriteria(assessedTag)
      }
    })
    console.log(r)
    return r
  }

  generateReviewButtonHandler () {
    // Create context menu
    $.contextMenu({
      selector: '#reviewGeneratorButton',
      trigger: 'left',
      build: () => {
        // Create items for context menu
        let items = {}
        items['report'] = {name: 'Generate basic report'}
        items['llmReport'] = {name: 'Generate guidelines based report'}
        items['screenshot'] = {name: 'Generate annotated PDF'}
        return {
          callback: (key, opt) => {
            if (key === 'report') {
              this.generateReview()
            } else if (key === 'llmReport') {
              this.generateLLMReview()
            } else if (key === 'screenshot') {
              this.generateScreenshot()
            }
          },
          items: items
        }
      }
    })
  }

  importAnnotationsMetaReview (importedReview,reviewerName) {
    let reviewerAnnotations = importedReview.documentAnnotations || []
    if (reviewerAnnotations.length === 0) {
      Alerts.errorAlert({text:"Invalid json file."})
      return
    }
    let selectedGroup = window.abwa.groupSelector.currentGroup.id
    let metaReviewFactors = ["Strength","Minor weakness","Major weakness"/*,"Other comments"*/]

    let getCriterion = (factor,reviewer) => {
      return reviewer+' - '+factor
    }

    let isMetaReviewGroup = (groupAnnotations) => {
      let factors = []
      groupAnnotations.forEach((annotation) => {
        if(annotation.text==null||annotation.text==='') return
        let text = jsYaml.load(annotation.text)
        if((text.group!=null || text.group!=='')&&factors.indexOf(text.group)==-1) factors.push(text.group)
      })
      for(let i=0;i<metaReviewFactors.length;i++){
        if(factors.indexOf(metaReviewFactors[i])==-1) return false
      }
      return true
    }
    let removeConfAnnotations = (groupAnnotations) => {
      return new Promise((resolve,reject) => {
        window.abwa.storageManager.client.deleteAnnotations(groupAnnotations.filter((annotation) => {return annotation.tags.indexOf('review:default') == -1}).map((annotation) => annotation.id),() => {
          resolve()
        })
      })
    }
    let insertMetaReviewCriteria = () => {
      return new Promise((resolve,reject) => {
        let storageUri = window.abwa.storageManager.storageUrl + '/groups/'+selectedGroup
        window.abwa.storageManager.client.getUserProfile((err,user) => {
          if (user == null || user.userid == null){
            resolve()
            return
          }
          let userId = user.userid
          let annotationPermissions = {
            admin: [userId],
            delete: [userId],
            read: ['group:'+selectedGroup],
            update: [userId]
          }
          let annotationsToCreate = metaReviewFactors.map((factor) => {
            let yamlText = jsYaml.dump({description:factor+'s of '+reviewerName,group:factor,custom:false})
            return {
              uri: storageUri,
              tags: [Config.review.namespace+':'+Config.review.tags.grouped.group+':'+getCriterion(factor,reviewerName)],
              text: yamlText,
              permissions: annotationPermissions,
              group: selectedGroup
            }
          })
          window.abwa.storageManager.client.createNewAnnotations(annotationsToCreate,() => {
            resolve()
          })
        })
      })
    }
    let transformAnnotations = (annotationsToImport) => {
      return new Promise((resolve,reject) => {
        window.abwa.storageManager.client.getUserProfile((err,user) => {
          if (user == null || user.userid == null) {
            resolve()
            return
          }
          let newAnnotations = []
          let userId = user.userid
          let annotationPermissions = {
            admin: [userId],
            delete: [userId],
            read: ['group:' + selectedGroup],
            update: [userId]
          }
          annotationsToImport.forEach((annotation) => {
            let ann = {}
            let annotationLevel = annotation.tags.find((tag) => {return tag.indexOf(Config.review.namespace + ':' + Config.review.tags.grouped.subgroup + ':') != -1})
            let level
            if (annotationLevel == null) level = 'Other comments'
            else level = annotationLevel.replace(Config.review.namespace + ':' + Config.review.tags.grouped.subgroup + ':', '')
            let annotationCriterion = annotation.tags.find((tag) => {return tag.indexOf(Config.review.namespace + ':' + Config.review.tags.grouped.relation + ':') != -1})
            if (annotationCriterion == null) return
            let criterion = annotationCriterion.replace(Config.review.namespace + ':' + Config.review.tags.grouped.relation + ':', '')
            if (metaReviewFactors.indexOf(level) == -1) return
            ann["tags"] = [Config.review.namespace + ':' + Config.review.tags.grouped.relation + ':' + getCriterion(level, reviewerName)]
            if (annotation['document']) ann['document'] = annotation['document']
            if (annotation['documentMetadata'] != null) ann['documentMetadata'] = annotation['documentMetadata']
            ann['group'] = selectedGroup
            ann['permissions'] = annotationPermissions
            if (annotation['target']) ann['target'] = annotation['target']
            if (annotation['uri']) ann['uri'] = annotation['uri']
            let text = JSON.parse(annotation.text) == null ? {} : JSON.parse(annotation.text)
            if (text.comment != null) text.comment = criterion + '. ' + text.comment
            else text.comment = criterion
            ann['text'] = JSON.stringify(text)
            newAnnotations.push(ann)
          })
          resolve(newAnnotations)
        })
      })
    }
    let insertAnnotations = (newAnnotations) => {
      return new Promise((resolve,reject) => {
        window.abwa.storageManager.client.createNewAnnotations(newAnnotations,() => {
          resolve()
        })
      })
    }

    window.abwa.storageManager.client.searchAnnotations({group:selectedGroup},(err,groupAnnotations) => {

      let importAnnotations = () => {
        insertMetaReviewCriteria().then(() => {
          transformAnnotations(reviewerAnnotations).then((transformedAnnotations) => {
            insertAnnotations(transformedAnnotations).then(() => {
              window.abwa.contentScriptManager.reloadContentByGroup()
            })
          })
        })
      }

      if(!isMetaReviewGroup(groupAnnotations)){
        ReviewGenerator.tryToLoadSwal()
        if (_.isNull(Swal)) {
          Alerts.errorAlert({text: 'Unable to load swal'})
        } else {
          Swal.fire({
            title: 'Are you sure?',
            text: "Annotations made in this review model will be removed.",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, go ahead!'
          }).then((result) => {
            if (result.value) {
              removeConfAnnotations(groupAnnotations).then(() => {
                importAnnotations()
              })
            }
          })
        }
      }
      else{
        importAnnotations()
      }
    })
  }

  importAnnotationsMetaReviewButtonHandler (){

    let selectedGroup = window.abwa.groupSelector.currentGroup.id
    window.abwa.storageManager.client.searchAnnotations({group:selectedGroup},(err,annotations) => {

      // Calculate how many reviewers are there in the review model by looking at the number of criteria in the "Strength" factor
      let strengthFactorCriteria = annotations.filter((annotation) => {
        if(annotation.tags.find((tag) => {return tag.indexOf(Config.review.namespace+':'+Config.review.tags.grouped.group)!=-1})==null) return false
        if(annotation.text == null || annotation.text == '') return false
        let textYaml = jsYaml.load(annotation.text)
        if(textYaml.group == null || textYaml.group !== 'Strength') return false
        return true
      })
      let reviewerNumber = strengthFactorCriteria.length + 1
      let reviewerName = "Reviewer "+reviewerNumber

      let html = 'Annotations: <input id="annotationsFile" class="swal2-input" type="file">' + '<br/>' +
        'Reviewer: <input id="reviewerName" class="swal2-input" type="text" value="'+reviewerName+'">'

      Alerts.multipleInputAlert({title:'Upload reviewers\' annotations',html:html,preConfirm:() => {
          let file = document.getElementById("annotationsFile")
          let refereeName = document.getElementById("reviewerName")
          if(refereeName.value == null || refereeName.value === '') Alerts.errorAlert({text: 'You have to provide a name for the reviewer.'})
          else {
            FileUtils.readJSONFile(file.files[0], (err, jsonObject) => {
              if (err) {
                Alerts.errorAlert({text: 'Unable to parse json file. Error:<br/>' + err.message})
              }
              else{
                this.importAnnotationsMetaReview(jsonObject,refereeName.value)
              }
            })
          }
        },showCancelButton:true})
    })
  }

  importExportButtonHandler () {
    // Create context menu
    $.contextMenu({
      selector: '#importExportButton',
      trigger: 'left',
      build: () => {
        // Create items for context menu
        let items = {}
        items['importMetaReview'] = {name: 'Import annotations (meta-review)'}
        items['import'] = {name: 'Import review annotations'}
        items['export'] = {name: 'Export review annotations'}
        return {
          callback: (key, opt) => {
            if (key === 'import') {
              this.importReviewAnnotations()
            } else if (key === 'export') {
              this.exportReviewAnnotations()
            } else if (key === 'importMetaReview') {
              this.importAnnotationsMetaReviewButtonHandler()
            }
          },
          items: items
        }
      }
    })
  }

  configurationButtonHandler () {
    // Create context menu
    $.contextMenu({
      selector: '#configurationButton',
      trigger: 'left',
      build: () => {
        // Create items for context menu
        let items = {}
        items['manual'] = {name: 'User manual'}
        items['questionnaire'] = {name: 'Feedback'}
        items['recentActivity'] = {name: 'Recent activity'}
        items['config'] = {name: 'Configuration'}
        return {
          callback: (key, opt) => {
            if (key === 'manual') {
              window.open("https://github.com/haritzmedina/reviewAndGo/wiki/Review&Go-FAQ","_blank")
            } else if (key === 'questionnaire') {
              window.open("https://forms.gle/5u8wsh2xUW8KcdtC9","_blank")
            } else if (key === 'recentActivity') {
              window.open(chrome.runtime.getURL('/pages/specific/review/recentActivity.html'),"_blank")
            } else if (key === 'config') {
              window.open(chrome.runtime.getURL('/pages/options.html'),"_blank")
            }
          },
          items: items
        }
      }
    })
  }

  importReviewAnnotations () {
    AnnotationImporter.askUserToImportDocumentAnnotations((err, jsonObject) => {
      if (err) {
        Alerts.errorAlert({text: 'Unable to parse json file. Error:<br/>' + err.message})
      } else {
        Alerts.inputTextAlert({
          alertType: Alerts.alertType.warning,
          title: 'Give a name to your imported review model',
          text: 'When the configuration is imported a new highlighter is created. You can return to your other review models using the sidebar.',
          inputPlaceholder: 'Type here the name of your review model...',
          preConfirm: (groupName) => {
            if (_.isString(groupName)) {
              if (groupName.length <= 0) {
                const Swal = require('sweetalert2')
                Swal.showValidationMessage('Name cannot be empty.')
              } else if (groupName.length > 25) {
                const Swal = require('sweetalert2')
                Swal.showValidationMessage('The review model name cannot be higher than 25 characters.')
              } else {
                return groupName
              }
            }
          },
          callback: (err, reviewName) => {
            if (err) {
              window.alert('Unable to load alert. Unexpected error, please contact developer.')
            } else {
              window.abwa.storageManager.client.createNewGroup({name: reviewName}, (err, newGroup) => {
                if (err) {
                  Alerts.errorAlert({text: 'Unable to create a new annotation group. Error: ' + err.message})
                } else {
                  let review = ReviewSchema.fromCriterias(jsonObject.model.criteria)
                  review.storageGroup = newGroup
                  Alerts.loadingAlert({title: 'Configuration in progress', text: 'We are configuring everything to start reviewing.', position: Alerts.position.center})
                  ImportSchema.createConfigurationAnnotationsFromReview({
                    review,
                    callback: (err, annotations) => {
                      if (err) {
                        Alerts.errorAlert({ text: 'There was an error when configuring Review&Go highlighter. Error: ' + err.message })
                      } else {
                        Alerts.closeAlert()
                        // Set created group to document annotations
                        let toCreateDocumentAnnotations = _.map(jsonObject.documentAnnotations, (annotation) => {
                          annotation.group = review.storageGroup.id
                          return annotation
                        })
                        window.abwa.storageManager.client.createNewAnnotations(toCreateDocumentAnnotations, (err) => {
                          if (err) {
                            Alerts.errorAlert({text: 'Unable to import correctly document annotations. Error: ' + err.message})
                          } else {
                            // Update groups from storage
                            window.abwa.groupSelector.retrieveGroups(() => {
                              window.abwa.groupSelector.setCurrentGroup(review.storageGroup.id)
                            })
                          }
                        })
                      }
                    }
                  })
                }
              })
            }
          }
        })
      }
    })
  }

  exportReviewAnnotations () {
    AnnotationExporter.exportCurrentDocumentAnnotations()
  }

  generateScreenshot () {
    Screenshots.takeScreenshot()
  }

  generateReview () {
    Alerts.loadingAlert({text: chrome.i18n.getMessage('GeneratingReviewReport')})
    let review = this.parseAnnotations(window.abwa.contentAnnotator.allAnnotations)
    let report = review.toString()
    let blob = new Blob([report], {type: 'text/plain;charset=utf-8'})
    let title = window.PDFViewerApplication.baseUrl !== null ? window.PDFViewerApplication.baseUrl.split("/")[window.PDFViewerApplication.baseUrl.split("/").length-1].replace(/\.pdf/i,"") : ""
    let docTitle = 'Review report'
    if(title!=='') docTitle += ' for '+title
    FileSaver.saveAs(blob, docTitle+'.txt')
    Alerts.closeAlert()
  }

  generateLLMReview () {
    Alerts.loadingAlert({text: chrome.i18n.getMessage('GeneratingReviewReport')})
    let review = this.parseAnnotations(window.abwa.contentAnnotator.allAnnotations)
    let report = review.toString()
    Alerts.inputTextAlert({
      title: 'Upload your guidelines file',
      html: 'Here you can upload your guidelines in the .txt or .pdf format.',
      input: 'file',
      callback: async (err, file) => {
        if (err) {
          window.alert('An unexpected error happened when trying to load the alert.')
        } else {
          // Read file
          let extension = (file.name.substring(file.name.lastIndexOf('.'))).toLowerCase()
          if (extension !== '.pdf' && extension !== '.txt') {
            Alerts.errorAlert({ text:'The file must have a .txt or .pdf extension' })
          } else {
            await this.loadGuidelines(file, extension, (err, guidelines) => {
              if (err) {
                Alerts.errorAlert({ text: err.message })
              } else {
                chrome.runtime.sendMessage({ scope: 'llm', cmd: 'getSelectedLLM' }, async ({ llm }) => {
                  if (llm === '') {
                    llm = Config.review.defaultLLM
                  }
                  if (llm && llm !== '') {
                    let selectedLLM = llm
                    chrome.runtime.sendMessage({
                      scope: 'llm',
                      cmd: 'getAPIKEY',
                      data: selectedLLM
                    }, ({ apiKey }) => {
                      let callback = (json) => {
                        let answer = json.answer
                        let blob = new Blob([answer], { type: 'text/plain;charset=utf-8' })
                        let title = window.PDFViewerApplication.baseUrl !== null ? window.PDFViewerApplication.baseUrl.split("/")[window.PDFViewerApplication.baseUrl.split("/").length - 1].replace(/\.pdf/i, "") : ""
                        let docTitle = 'Review report'
                        if (title !== '') docTitle += ' for ' + title
                        FileSaver.saveAs(blob, docTitle + '.txt')
                        Alerts.closeAlert()
                      }
                      if (apiKey && apiKey !== '') {
                        let params = {
                          apiKey: apiKey,
                          report: report,
                          guidelines: guidelines,
                          extension: extension,
                          callback: callback
                        }
                        if (selectedLLM === 'anthropic') {
                          AnthropicManager.createReview(params)
                        } else if (selectedLLM === 'openAI') {
                          console.log('OpenAIQuestion')
                          OpenAIManager.createReview(params)
                        }
                      } else {
                        let callback = () => {
                          window.open(chrome.runtime.getURL('pages/options.html'))
                        }
                        Alerts.infoAlert({
                          text: 'Please, configure your LLM.',
                          title: 'Please select a LLM and provide your API key',
                          callback: callback()
                        })
                      }
                    })
                  }
                })
              }
            })
          }
        }
      }
    })
  }

  async loadGuidelines (file, extension, callback) {
    let guidelines
    if (extension === '.pdf') {
      guidelines = await FileUtils.readGuidelinesFromPDF(file)
      if (_.isFunction(callback)) {
        callback(null, guidelines)
      }
    } else if (extension === '.txt') {
      FileUtils.readGuidelinesFromTXT(file, (err, guidelines) => {
        if (_.isFunction(callback)) {
          callback(err, guidelines)
        }
      })
    }
  }

  generateCanvas () {
    window.abwa.sidebar.closeSidebar()
    Alerts.loadingAlert({text: chrome.i18n.getMessage('GeneratingReviewReport')})
    let review = this.parseAnnotations(window.abwa.contentAnnotator.allAnnotations)
    let canvasPageURL = chrome.runtime.getURL('pages/specific/review/reviewCanvas.html')
    axios.get(canvasPageURL).then((response) => {
      document.body.lastChild.insertAdjacentHTML('afterend', response.data)
      document.querySelector("#abwaSidebarButton").style.display = "none"

      let canvasContainer = document.querySelector("#canvasContainer")
      document.querySelector("#canvasOverlay").addEventListener("click",function(){
        document.querySelector("#reviewCanvas").parentNode.removeChild(document.querySelector("#reviewCanvas"))
        document.querySelector("#abwaSidebarButton").style.display = "block"
      })
      document.querySelector("#canvasContainer").addEventListener("click",function(e){
        e.stopPropagation()
      })
      document.addEventListener("keydown",function(e){
        if(e.keyCode==27&&document.querySelector("#reviewCanvas")!=null) document.querySelector("#reviewCanvas").parentNode.removeChild(document.querySelector("#reviewCanvas"))
        document.querySelector("#abwaSidebarButton").style.display = "block"
      })
      document.querySelector("#canvasCloseButton").addEventListener("click",function(){
        document.querySelector("#reviewCanvas").parentNode.removeChild(document.querySelector("#reviewCanvas"))
        document.querySelector("#abwaSidebarButton").style.display = "block"
      })

      let canvasClusters = {}
      let criteriaList = []
      abwa.tagManager.currentTags.forEach((e) => {
        //if(e.config.name=="Typos") return
        criteriaList.push(e.config.name)
        if(canvasClusters[e.config.options.group]==null) canvasClusters[e.config.options.group] = [e.config.name]
        else canvasClusters[e.config.options.group].push(e.config.name)
      })

      review.annotations.forEach((e) => {
        if(e.criterion=="Typos"||criteriaList.indexOf(e.criterion)!=-1) return
        if(canvasClusters["Other"]==null) canvasClusters["Other"] = [e.criterion]
        else canvasClusters["Other"].push(e.criterion)
        criteriaList.push(e.criterion)
      })

      let clusterTemplate = document.querySelector("#propertyClusterTemplate")
      let columnTemplate = document.querySelector("#clusterColumnTemplate")
      let propertyTemplate = document.querySelector("#clusterPropertyTemplate")
      let annotationTemplate = document.querySelector("#annotationTemplate")
      //let clusterHeight = 100.0/Object.keys(canvasClusters).length

      let getCriterionLevel = (annotations) => {
        if(annotations.length===0) return 'emptyCluster'
        if(annotations[0].level==null||annotations[0].level=='') return 'unsorted'
        let criterionLevel = annotations[0].level
        for(let i=1;i<annotations.length;i++){
          if(annotations[i].level==null||annotations[i].level=='') return 'unsorted'
          else if(annotations[i].level!=criterionLevel) return 'unsorted'
        }
        return criterionLevel.replace(/\s/g,'')
      }

      let displayAnnotation = (annotation) => {
        let swalContent = '';
        if (annotation.highlightText != null && annotation.highlightText != '') swalContent += '<h2 style="text-align:left;margin-bottom:10px;">Highlight</h2><div style="text-align:justify;font-style:italic">"' + annotation.highlightText.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '"</div>'
        if (annotation.comment != null && annotation.comment != '') swalContent += '<h2 style="text-align:left;margin-top:10px;margin-bottom:10px;">Comment</h2><div style="text-align:justify;">' + annotation.comment.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</div>'
        if (annotation.suggestedLiterature != null && annotation.suggestedLiterature.length > 0) swalContent += '<h2 style="text-align:left;margin-top:10px;margin-bottom:10px;">Suggested literature</h2><div style="text-align:justify;"><ul style="padding-left:10px;">' + annotation.suggestedLiterature.map((e) => {return '<li>' + e.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</li>'}).join('') + '</ul></div>'
        ReviewGenerator.tryToLoadSwal()
        if (_.isNull(Swal)) {
          Alerts.errorAlert({text: 'Unable to load swal'})
        } else {
          Swal({
            html: swalContent,
            confirmButtonText: "View in context"
          }).then((result) => {
            if (result.value) {
              document.querySelector("#reviewCanvas").parentNode.removeChild(document.querySelector("#reviewCanvas"))
              window.abwa.contentAnnotator.goToAnnotation(window.abwa.contentAnnotator.allAnnotations.find((e) => {return e.id == annotation.id}))
              document.querySelector("#abwaSidebarButton").style.display = "block"
            }
          })
        }
      }
      let getGroupAnnotationCount = (group) => {
        let i = 0
        canvasClusters[group].forEach((e) => {i += review.annotations.filter((a) => {return a.criterion===e}).length})
        return i
      }
      let getColumnAnnotationCount = (properties) => {
        let i = 0
        properties.forEach((e) => {i += review.annotations.filter((a) => {return a.criterion===e}).length})
        return i
      }
      let getGroupHeight = (group) => {
        if(review.annotations.filter((e)=>{return e.criterion!=="Typos"}).length===0) return 33.3333
        return 15.0+getGroupAnnotationCount(group)*(100.0-15*Object.keys(canvasClusters).length)/review.annotations.filter((e)=>{return e.criterion!=="Typos"}).length
      }
      let getColumnWidth = (properties,group) => {
        let colNum = canvasClusters[group].length===2 ? 2 : Math.ceil(canvasClusters[group].length/2)
        if(getGroupAnnotationCount(group)===0) return 100.0/Math.ceil(canvasClusters[group].length/2)
        return 15.0+getColumnAnnotationCount(properties)*(100.0-15*colNum)/getGroupAnnotationCount(group)
      }
      let getPropertyHeight = (property,properties) => {
        if(properties.length==1) return 100
        if(getColumnAnnotationCount(properties)==0&&properties.length==2) return 50
        return 15.0+review.annotations.filter((e)=>{return e.criterion===property}).length*(100.0-15*2)/getColumnAnnotationCount(properties)
      }

      for(let key in canvasClusters){
        let clusterElement = clusterTemplate.content.cloneNode(true)
        //clusterElement.querySelector(".propertyCluster").style.height = clusterHeight+'%'
        clusterElement.querySelector(".propertyCluster").style.height = getGroupHeight(key)+'%'
        clusterElement.querySelector(".clusterLabel span").innerText = key
        let clusterContainer = clusterElement.querySelector('.clusterContainer')
        let currentColumn = null
        for(let i=0;i<canvasClusters[key].length;i++){
          if(i%2==0||canvasClusters[key].length==2){
            currentColumn = columnTemplate.content.cloneNode(true)
            if(canvasClusters[key].length==1) currentColumn.querySelector('.clusterColumn').style.width = "100%"
            /*else if(canvasClusters[key].length==2) currentColumn.querySelector('.clusterColumn').style.width = "50%"
            else currentColumn.querySelector('.clusterColumn').style.width = parseFloat(100.0/Math.ceil(canvasClusters[key].length/2)).toString()+'%'*/
            else{
              let columnWidth
              if (canvasClusters[key].length === 2) {
                columnWidth = getColumnWidth([canvasClusters[key][i]], key)
                if (getColumnAnnotationCount(canvasClusters[key]) === 0) {
                  currentColumn.querySelector('.clusterColumn').style.height = 50 + '%'
                }
              } else if (i < canvasClusters[key].length - 1) columnWidth = getColumnWidth([canvasClusters[key][i], canvasClusters[key][i + 1]], key)
              else columnWidth = getColumnWidth([canvasClusters[key][i]], key)
              currentColumn.querySelector('.clusterColumn').style.width = columnWidth + '%'
            }
          }
          let clusterProperty = propertyTemplate.content.cloneNode(true)
          clusterProperty.querySelector(".propertyLabel").innerText = canvasClusters[key][i]
          /*if(canvasClusters[key].length==1||canvasClusters[key].length==2||(canvasClusters[key].length%2==1&&i==canvasClusters[key].length-1)) clusterProperty.querySelector(".clusterProperty").style.height = "100%"
          else clusterProperty.querySelector(".clusterProperty").style.height = "50%";*/
          let propertyHeight = 100
          if(canvasClusters[key].length==2) propertyHeight = getPropertyHeight(canvasClusters[key][i],[canvasClusters[key][i]])
          else if(i%2==0&&i<canvasClusters[key].length-1) propertyHeight = getPropertyHeight(canvasClusters[key][i],[canvasClusters[key][i],canvasClusters[key][i+1]])
          else if(i%2==1) propertyHeight = getPropertyHeight(canvasClusters[key][i],[canvasClusters[key][i],canvasClusters[key][i-1]])
          clusterProperty.querySelector(".clusterProperty").style.height = propertyHeight+'%'
          clusterProperty.querySelector(".clusterProperty").style.width = "100%";

          let criterionAnnotations = review.annotations.filter((e) => {return e.criterion === canvasClusters[key][i]})
          if(criterionAnnotations.length==0) clusterProperty.querySelector('.propertyAnnotations').style.display = 'none'
          clusterProperty.querySelector('.clusterProperty').className += ' '+getCriterionLevel(criterionAnnotations)

          let annotationWidth = 100.0/criterionAnnotations.length
          for(let j=0;j<criterionAnnotations.length;j++){
            let annotationElement = annotationTemplate.content.cloneNode(true)
            annotationElement.querySelector('.canvasAnnotation').style.width = annotationWidth+'%'
            if(criterionAnnotations[j].highlightText!=null) annotationElement.querySelector('.canvasAnnotation').innerText = '"'+criterionAnnotations[j].highlightText+'"'
            if(criterionAnnotations[j].level!=null) annotationElement.querySelector('.canvasAnnotation').className += ' '+criterionAnnotations[j].level.replace(/\s/g,'')
            else annotationElement.querySelector('.canvasAnnotation').className += ' unsorted'
            annotationElement.querySelector('.canvasAnnotation').addEventListener('click',function(){
              displayAnnotation(criterionAnnotations[j])
            })
            clusterProperty.querySelector('.propertyAnnotations').appendChild(annotationElement)
          }

          currentColumn.querySelector('.clusterColumn').appendChild(clusterProperty)
          if(i%2==1||i==canvasClusters[key].length-1||canvasClusters[key].length==2) clusterContainer.appendChild(currentColumn)
        }
        canvasContainer.appendChild(clusterElement)
      }
      Alerts.closeAlert()
    })
  }

  deleteAnnotations () {
    // Ask user if they are sure to delete it
    Alerts.confirmAlert({
      alertType: Alerts.alertType.question,
      title: chrome.i18n.getMessage('DeleteAllAnnotationsConfirmationTitle'),
      text: chrome.i18n.getMessage('DeleteAllAnnotationsConfirmationMessage'),
      callback: (err, toDelete) => {
        // It is run only when the user confirms the dialog, so delete all the annotations
        if (err) {
          // Nothing to do
        } else {
          // Dispatch delete all annotations event
          LanguageUtils.dispatchCustomEvent(Events.deleteAllAnnotations)
          // TODO Check if it is better to maintain the sidebar opened or not
          window.abwa.sidebar.openSidebar()
        }
      }
    })

  }

  resume (){
    if(window.abwa.contentAnnotator.allAnnotations.length>0) window.abwa.contentAnnotator.goToAnnotation(window.abwa.contentAnnotator.allAnnotations.reduce((max,a) => new Date(a.updated) > new Date(max.updated) ? a : max))
  }

  destroy (callback) {
    // Remove toolbar
    this.container.remove()

    // Callback
    if (_.isFunction(callback)) {
      callback()
    }
  }

  static tryToLoadSwal () {
    if (_.isNull(Swal)) {
      try {
        Swal = require('sweetalert2')
      } catch (e) {
        Swal = null
      }
    }
  }
}

export default ReviewGenerator
