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
          element.style.width = '800px'
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
        icon: Alerts.alertType.success,
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

  static answerCriterionAlert ({ title = 'This is the answer', answer = '', paragraphs = '', description = '', annotation = '', type, criterion = '' }) {
    Alerts.tryToLoadSwal()
    if (_.isNull(swal)) {

    } else {
      const buttons = '<button id="llmAnswerOKButton" >Ok</button></br><button id="redoButton" class="llmAnswerButton">Redo</brbutton><button id="summaryButton" class="llmAnswerButton">Save answer</button>'
      swal.fire({
        title: title,
        html: '<div>' + answer + '</div></br>' + buttons,
        showCancelButton: false,
        showConfirmButton: false,
        onBeforeOpen: () => {
          // Add event listeners to the buttons after they are rendered
          document.getElementById('llmAnswerOKButton').addEventListener('click', () => {
            swal.close()
            console.log('OK')
          })
          document.getElementById('redoButton').addEventListener('click', () => {
            console.log('Redo question')
            swal.close()
            if (type === 'resume') {
              CustomCriteriasManager.resumeByLLMHandler(criterion, description, paragraphs)
            } else if (type === 'alternative') {
              CustomCriteriasManager.alternativeByLLMHandler(criterion, description)
            }
          })
          document.getElementById('summaryButton').addEventListener('click', () => {
            let data
            if (annotation.text) {
              data = jsYaml.load(annotation.text)
              if (type === 'resume') {
                data.resume = answer
              } else if (type === 'alternative') {
                data.alternative = answer
              }
            }
            annotation.text = jsYaml.dump(data)
            LanguageUtils.dispatchCustomEvent(Events.updateTagAnnotation, {annotation: annotation})
            swal.close()
            Alerts.successAlert({title: 'Saved', text: 'the text has been saved in the report'})
          })
        }
      })
    }
  }

  static answerTextFragmentAlert ({title = 'This is the answer', answer = '', paragraph = '', question = '', criterion = '', type, annotation}) {
    Alerts.tryToLoadSwal()
    if (_.isNull(swal)) {

    } else {
      const buttons = '<button id="llmAnswerOKButton" >Ok</button></br><button id="redoButton" class="llmAnswerButton">Redo</brbutton><button id="summaryButton" class="llmAnswerButton">Save answer</button>'
      swal.fire({
        title: title,
        html: '<div>' + answer + '</div></br>' + buttons,
        showCancelButton: false,
        showConfirmButton: false,
        onBeforeOpen: () => {
          // Add event listeners to the buttons after they are rendered
          document.getElementById('llmAnswerOKButton').addEventListener('click', () => {
            swal.close()
            console.log('OK')
          })

          document.getElementById('redoButton').addEventListener('click', () => {
            console.log('Redo question')
            swal.close()
            if (type === 'clarification') {
              TextAnnotator.askQuestionClarify(paragraph, question, criterion)
            } else if (type === 'socialJudge') {
              TextAnnotator.askQuestionSocialJudge(paragraph, question, criterion)
            } else if (type === 'factChecking') {
              TextAnnotator.askQuestionFactChecking(paragraph, question, criterion)
            }
          })

          document.getElementById('summaryButton').addEventListener('click', () => {
            console.log(annotation)
            let data
            if (annotation.text) {
              data = JSON.parse(annotation.text)
              if (data.comment !== '') {
                data.comment += '\n\n'
              } if (type === 'clarification') {
                data.comment += question + ': ' + answer
              } else if (type === 'socialJudge') {
                data.comment += 'Social judge: ' + answer
              } else if (type === 'factChecking') {
                data.comment += 'Fact checking: ' + answer
              }
            } else {
              data = {
                comment: ''
              }
              if (type === 'clarification') {
                data.comment += question + ': ' + answer
              } else if (type === 'socialJudge') {
                data.comment += 'Social judge: ' + answer
              } else if (type === 'factChecking') {
                data.comment += 'Fact checking: ' + answer
              }
            }
            annotation.text = JSON.stringify(data)
            LanguageUtils.dispatchCustomEvent(Events.updateAnnotation, {annotation: annotation})
            swal.close()
            Alerts.successAlert({title: 'Saved', text: 'the answer has been saved.'})
          })
        }
      })
    }
  }

  static answerAlert ({title = 'This is the answer', answer = ''}) {
    Alerts.tryToLoadSwal()
    if (_.isNull(swal)) {

    } else {
      const buttons = '<button id="llmAnswerOKButton" >Ok</button></br><button id="copyButton" class="llmAnswerButton">Copy to clipboard</brbutton><button id="summaryButton" class="llmAnswerButton">Copy to Summary</button>'
      swal.fire({
        title: title,
        html: '<div>' + answer + '</div></br>' + buttons,
        showCancelButton: false,
        showConfirmButton: false,
        onBeforeOpen: () => {
          // Add event listeners to the buttons after they are rendered
          document.getElementById('llmAnswerOKButton').addEventListener('click', () => {
            swal.close()
            console.log('OK')
          })

          document.getElementById('copyButton').addEventListener('click', () => {
            // swal.close()
            console.log('Copy')
            navigator.clipboard.writeText(answer)
          })

          document.getElementById('summaryButton').addEventListener('click', () => {
            // swal.close()
            console.log('Copy to Summary')
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
