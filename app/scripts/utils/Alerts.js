import _ from 'lodash'
import TextAnnotator from '../contentScript/contentAnnotators/TextAnnotator'
import LanguageUtils from './LanguageUtils'
import Events from '../contentScript/Events'
import CustomCriteriasManager from '../specific/review/CustomCriteriasManager'
import jsYaml from 'js-yaml'

let swal = null
if (document && document.head) {
  swal = require('sweetalert2')
}

class Alerts {
  static confirmAlert ({alertType = Alerts.alertType.info, title = '', text = '', cancelButtonText = 'Cancel', confirmButtonText = 'OK', showCancelButton = true, callback}) {
    Alerts.tryToLoadSwal()
    if (_.isNull(swal)) {
      if (_.isFunction(callback)) {
        callback(new Error('Unable to load swal'))
      }
    } else {
      swal.fire({
        title: title,
        html: text,
        icon: alertType,
        showCancelButton: showCancelButton,
        cancelButtonText: cancelButtonText,
        confirmButtonText: confirmButtonText
      }).then((result) => {
        if (result.value) {
          if (_.isFunction(callback)) {
            callback(null, result.value)
          }
        }
      })
    }
  }

  static chooseAlert ({alertType = Alerts.alertType.info, title = '', text = '', cancelButtonText, confirmButtonText, callback}) {
    Alerts.tryToLoadSwal()
    if (_.isNull(swal)) {
      if (_.isFunction(callback)) {
        callback(new Error('Unable to load swal'))
      }
    } else {
      swal.fire({
        title: title,
        html: text,
        type: alertType,
        showCancelButton: true,
        cancelButtonText: cancelButtonText,
        confirmButtonText: confirmButtonText
      }).then((result) => {
        if (_.isFunction(callback)) {
          callback(null, result.value)
        }
      })
    }
  }

  static infoAlert ({text = chrome.i18n.getMessage('expectedInfoMessageNotFound'), title = 'Info', callback, confirmButtonText = 'OK'}) {
    Alerts.tryToLoadSwal()
    if (_.isNull(swal)) {
      if (_.isFunction(callback)) {
        callback(new Error('Unable to load swal'))
      }
    } else {
      swal.fire({
        type: Alerts.alertType.info,
        title: title,
        confirmButtonText: confirmButtonText,
        html: text
      }).then(() => {
        if (_.isFunction(callback)) {
          callback(null)
        }
      })
    }
  }

  static criterionInfoAlert ({text = chrome.i18n.getMessage('expectedInfoMessageNotFound'), title = 'Info', callback, confirmButtonText = 'OK', width}) {
    Alerts.tryToLoadSwal()
    if (_.isNull(swal)) {
      if (_.isFunction(callback)) {
        callback(new Error('Unable to load swal'))
      }
    } else {
      swal.fire({
        type: Alerts.alertType.info,
        title: title,
        confirmButtonText: confirmButtonText,
        html: text,
        onBeforeOpen: () => {
          let element = document.querySelector('.swal2-popup')
          element.style.width = '900px'
        }
      }).then(() => {
        if (_.isFunction(callback)) {
          callback(null)
        }
      })
    }
  }

  static errorAlert ({text = chrome.i18n.getMessage('unexpectedError'), title = 'Oops...', callback, onClose}) {
    Alerts.tryToLoadSwal()
    if (_.isNull(swal)) {
      if (_.isFunction(callback)) {
        callback(new Error('Unable to load swal'))
      }
    } else {
      swal.fire({
        type: Alerts.alertType.error,
        title: title,
        html: text,
        onClose: onClose
      }).then(() => {
        if (_.isFunction(callback)) {
          callback(null)
        }
      })
    }
  }

  static successAlert ({text = 'Your process is correctly done', title = 'Great!', callback}) {
    Alerts.tryToLoadSwal()
    if (_.isNull(swal)) {
      if (_.isFunction(callback)) {
        callback(new Error('Unable to load swal'))
      }
    } else {
      swal.fire({
        icon: 'success',
        title: title,
        html: text
      })
    }
  }

  static temporalAlert ({text = 'It is done', title = 'Finished', type = Alerts.alertType.info, timer = 1500, position = 'top-end', callback}) {
    Alerts.tryToLoadSwal()
    if (_.isNull(swal)) {
      if (_.isFunction(callback)) {
        callback(new Error('Unable to load swal'))
      }
    } else {
      swal.fire({
        position: position,
        icon: type,
        title: title, // TODO i18n
        html: text,
        showConfirmButton: false,
        timer: timer
      })
    }
  }

  static loadingAlert ({text = 'If it takes too much time, please reload the page and try again.', position = 'top-end', title = 'Working on something, please be patient', confirmButton = false, timerIntervalHandler, callback}) {
    Alerts.tryToLoadSwal()
    if (_.isNull(swal)) {
      if (_.isFunction(callback)) {
        callback(new Error('Unable to load swal'))
      }
    } else {
      let timerInterval
      swal.fire({
        position: position,
        title: title,
        html: text,
        showConfirmButton: confirmButton,
        onBeforeOpen: () => {
          swal.showLoading()
          if (_.isFunction(timerIntervalHandler)) {
            timerInterval = setInterval(() => {
              if (swal.isVisible()) {
                timerIntervalHandler(swal)
              } else {
                clearInterval(timerInterval)
              }
            }, 100)
          }
        },
        onAfterClose: () => {
          clearInterval(timerInterval)
        }
      })
    }
  }

  static inputTextAlert ({title, input = 'text', type, inputPlaceholder = '', inputValue = '', preConfirm, cancelCallback, showCancelButton = true, html = '', callback}) {
    Alerts.tryToLoadSwal()
    if (_.isNull(swal)) {
      if (_.isFunction(callback)) {
        callback(new Error('Unable to load swal'))
      }
    } else {
      swal.fire({
        title: title,
        input: input,
        inputPlaceholder: inputPlaceholder,
        inputValue: inputValue,
        html: html,
        type: type,
        preConfirm: preConfirm,
        showCancelButton: showCancelButton
      }).then((result) => {
        if (result.value) {
          if (_.isFunction(callback)) {
            callback(null, result.value)
          }
        } else {
          if (_.isFunction(cancelCallback)) {
            cancelCallback()
          }
        }
      })
    }
  }

  static answerCriterionAlert ({ title = 'This is the answer:', answer = '', paragraphs = '', description = '', annotation = '', type, criterion = '', compileSentiment = '' }) {
    Alerts.tryToLoadSwal()
    if (_.isNull(swal)) {

    } else {
      const buttons = '<button id="llmAnswerOKButton" >Ok</button></br><button id="redoButton" class="llmAnswerButton">Redo</brbutton><button id="summaryButton" class="llmAnswerButton">Save answer</button>'
      swal.fire({
        title: title,
        html: '<div style="text-align: justify;text-justify: inter-word" width=550px>' + answer + '</div></br>' + buttons,
        showCancelButton: false,
        showConfirmButton: false,
        onBeforeOpen: () => {
          let element = document.querySelector('.swal2-popup')
          element.style.width = '600px'
          // Add event listeners to the buttons after they are rendered
          document.getElementById('llmAnswerOKButton').addEventListener('click', () => {
            swal.close()
          })
          document.getElementById('redoButton').addEventListener('click', () => {
            swal.close()
            if (type === 'compile') {
              CustomCriteriasManager.compile(criterion, description, paragraphs)
            } else if (type === 'alternative') {
              CustomCriteriasManager.alternative(criterion, description)
            }
          })
          document.getElementById('summaryButton').addEventListener('click', () => {
            let data
            if (annotation.text) {
              data = jsYaml.load(annotation.text)
              if (type === 'compile') {
                // Check if data.resume exists and is an array. If not, initialize it as an empty array.
                if (!Array.isArray(data.compile)) {
                  data.compile = []
                }
                let sentiment = TextAnnotator.findTagForSentiment(compileSentiment.toLowerCase())
                let parts = sentiment.split(':')
                let lastValue = parts[parts.length - 1]
                // Now that we're sure data.resume is an array, push the new object into it.
                data.compile.push({ document: window.abwa.contentTypeManager.pdfFingerprint, answer: answer, sentiment: lastValue })
              } else if (type === 'alternative') {
                // Check if data.alternative exists and is an array. If not, initialize it as an empty array.
                if (!Array.isArray(data.alternative)) {
                  data.alternative = []
                }
                // Now that we're sure data.alternative is an array, push the new object into it.
                data.alternative.push({ document: window.abwa.contentTypeManager.pdfFingerprint, answer: answer })
              }
            }
            annotation.text = jsYaml.dump(data)
            LanguageUtils.dispatchCustomEvent(Events.updateTagAnnotation, {annotation: annotation})
            swal.close()
            Alerts.successAlert({title: 'Saved', text: 'The text has been saved in the report'})
          })
        }
      })
    }
  }

  static answerTextFragmentAlert ({title = 'This is the answer', answer = '', excerpt = '', question = '', criterion = '', type, annotation}) {
    Alerts.tryToLoadSwal()
    if (_.isNull(swal)) {

    } else {
      const buttons = '<button id="llmAnswerOKButton" >Ok</button></br><button id="redoButton" class="llmAnswerButton">Redo</brbutton><button id="summaryButton" class="llmAnswerButton">Save answer</button>'
      swal.fire({
        title: title,
        html: '<div style="text-align: justify;text-justify: inter-word" width=450px>' + answer + '</div></br>' + buttons,
        showCancelButton: false,
        showConfirmButton: false,
        onBeforeOpen: () => {
          let element = document.querySelector('.swal2-popup')
          element.style.width = '500px'
          // Add event listeners to the buttons after they are rendered
          document.getElementById('llmAnswerOKButton').addEventListener('click', () => {
            swal.close()
          })

          document.getElementById('redoButton').addEventListener('click', () => {
            swal.close()
            if (type === 'clarification') {
              TextAnnotator.askQuestionClarify(excerpt, question, criterion)
            } else if (type === 'socialJudge') {
              TextAnnotator.askQuestionSocialJudge(excerpt, criterion)
            } else if (type === 'factChecking') {
              TextAnnotator.askQuestionFactChecking(excerpt, criterion)
            }
          })

          document.getElementById('summaryButton').addEventListener('click', () => {
            let data
            if (annotation.text) {
              data = JSON.parse(annotation.text)
            } else {
              data = {}
            }
            if (type === 'clarification') {
              // Check if data.question exists and is an array. If not, initialize it as an empty array.
              if (!Array.isArray(data.clarifications)) {
                data.clarifications = []
              }
              // Now that we're sure data.question is an array, push the new object into it.
              data.clarifications.push({ question: question, answer: answer })
            } else if (type === 'socialJudge') {
              data.socialJudge = answer
            } else if (type === 'factChecking') {
              data.factChecking = answer
            }
            annotation.text = JSON.stringify(data)
            LanguageUtils.dispatchCustomEvent(Events.updateAnnotation, {annotation: annotation})
            swal.close()
            Alerts.successAlert({title: 'Saved', text: 'The answer has been saved.'})
          })
        }
      })
    }
  }

  static multipleInputAlert ({title = 'Input', html = '', preConfirm, showCancelButton = true, callback}) {
    Alerts.tryToLoadSwal()
    if (_.isNull(swal)) {
      if (_.isFunction(callback)) {
        callback(new Error('Unable to load swal'))
      }
    } else {
      swal.fire({
        title: title,
        html: html,
        focusConfirm: false,
        preConfirm: preConfirm,
        showCancelButton: showCancelButton
      }).then(() => {
        if (_.isFunction(callback)) {
          callback(null)
        }
      })
    }
  }

  static tryToLoadSwal () {
    if (_.isNull(swal)) {
      try {
        swal = require('sweetalert2')
      } catch (e) {
        swal = null
      }
    }
  }

  static threeOptionsAlert ({ title = 'Input', html = '', preConfirm, preDeny, position = Alerts.position.center, onBeforeOpen, showDenyButton = true, showCancelButton = true, confirmButtonText = 'Confirm', confirmButtonColor = '#4BB543', denyButtonText = 'Deny', denyButtonColor = '#3085D6', cancelButtonText = 'Cancel', allowOutsideClick = true, allowEscapeKey = true, callback, denyCallback, cancelCallback, customClass }) {
    Alerts.tryToLoadSwal()
    if (_.isNull(swal)) {
      if (_.isFunction(callback)) {
        callback(new Error('Unable to load swal'))
      }
    } else {
      swal.fire({
        title: title,
        html: html,
        focusConfirm: false,
        preConfirm: preConfirm,
        preDeny: preDeny,
        position: position,
        willOpen: onBeforeOpen,
        allowOutsideClick,
        allowEscapeKey,
        customClass: customClass,
        showDenyButton: showDenyButton,
        showCancelButton: showCancelButton,
        confirmButtonText: confirmButtonText,
        confirmButtonColor: confirmButtonColor,
        denyButtonText: denyButtonText,
        denyButtonColor: denyButtonColor,
        cancelButtonText: cancelButtonText

      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          if (_.isFunction(callback)) {
            callback(null, result.value)
          }
        } else if (result.isDenied) {
          if (_.isFunction(callback)) {
            denyCallback(null, result.value)
          }
        } else {
          if (_.isFunction(cancelCallback)) {
            cancelCallback(null)
          }
        }
      })
    }
  }

  static warningAlert ({text = 'Something that you need to worry about happened. ' + chrome.i18n.getMessage('ContactAdministrator'), title = 'Warning', callback}) {
    Alerts.tryToLoadSwal()
    if (_.isNull(swal)) {
      if (_.isFunction(callback)) {
        callback(new Error('Unable to load swal'))
      }
    } else {
      swal.fire({
        type: Alerts.alertType.warning,
        title: title,
        html: text
      })
    }
  }

  static closeAlert () {
    swal.close()
  }

  static isVisible () {
    return swal.isVisible()
  }
}

Alerts.alertType = {
  warning: 'warning',
  error: 'error',
  success: 'success',
  info: 'info',
  question: 'question'
}

Alerts.position = {
  top: 'top',
  topStart: 'top-start',
  topEnd: 'top-end',
  center: 'center',
  centerStart: 'center-start',
  centerEnd: 'center-end',
  bottom: 'bottom',
  bottomStart: 'bottom-start',
  bottomEnd: 'bottom-end'
}

export default Alerts
