import Config from './Config'

window.onload = () => {
  if (window.location.href.includes('pages/promptConfiguration.html')) {
    let promptConfiguration = new PromptConfiguration()
    promptConfiguration.init()
  }
}

class PromptConfiguration {
  init () {
    // ANNOTATE PROMPT
    const annotateDefaultPrompt = Config.prompts.annotatePrompt
    document.querySelector('#annotatePromptButton').addEventListener('click', () => {
      let messageLabel = document.querySelector('#annotatePromptMessage')
      this.setPrompt('annotatePrompt', annotateDefaultPrompt)
      let currentPrompt = document.querySelector('#annotatePrompt')
      currentPrompt.value = annotateDefaultPrompt
      messageLabel.innerHTML = 'Prompt saved'
    })

    document.querySelector('#annotatePromptSaveButton').addEventListener('click', () => {
      let currentPrompt = document.querySelector('#annotatePrompt').value
      let messageLabel = document.querySelector('#annotatePromptMessage')
      if (this.checkAnnotatePrompt(currentPrompt)) {
        this.setPrompt('annotatePrompt', currentPrompt)
      } else {
        messageLabel.innerHTML = 'Invalid prompt'
      }
    })

    chrome.runtime.sendMessage({ scope: 'prompt', cmd: 'getPrompt', data: {type: 'annotatePrompt'} }, ({ prompt }) => {
      if (prompt && prompt !== '') {
        document.querySelector('#annotatePrompt').value = prompt
      } else {
        document.querySelector('#annotatePrompt').value = annotateDefaultPrompt
        this.setPrompt('annotatePrompt', annotateDefaultPrompt)
      }
    })

    // COMPILE PROMPT
    const compileDefaultPrompt = Config.prompts.compilePrompt
    document.querySelector('#compilePromptButton').addEventListener('click', () => {
      let messageLabel = document.querySelector('#compilePromptMessage')
      this.setPrompt('compilePrompt', compileDefaultPrompt)
      let currentPrompt = document.querySelector('#compilePrompt')
      currentPrompt.value = compileDefaultPrompt
      messageLabel.innerHTML = 'Prompt saved'
    })

    document.querySelector('#compilePromptSaveButton').addEventListener('click', () => {
      let currentPrompt = document.querySelector('#compilePrompt').value
      let messageLabel = document.querySelector('#compilePromptMessage')
      if (this.checkCompilePrompt(currentPrompt)) {
        this.setPrompt('compilePrompt', currentPrompt)
      } else {
        messageLabel.innerHTML = 'Invalid prompt'
      }
    })

    chrome.runtime.sendMessage({ scope: 'prompt', cmd: 'getPrompt', data: {type: 'compilePrompt'} }, ({ prompt }) => {
      if (prompt && prompt !== '') {
        document.querySelector('#compilePrompt').value = prompt
      } else {
        document.querySelector('#compilePrompt').value = compileDefaultPrompt
        this.setPrompt('compilePrompt', compileDefaultPrompt)
      }
    })

    // ALTERNATIVE PROMPT
    const alternativeDefaultPrompt = Config.prompts.alternativePrompt
    document.querySelector('#alternativePromptButton').addEventListener('click', () => {
      let messageLabel = document.querySelector('#alternativePromptMessage')
      this.setPrompt('alternativePrompt', alternativeDefaultPrompt)
      let currentPrompt = document.querySelector('#alternativePrompt')
      currentPrompt.value = alternativeDefaultPrompt
      messageLabel.innerHTML = 'Prompt saved'
    })

    document.querySelector('#alternativePromptSaveButton').addEventListener('click', () => {
      let currentPrompt = document.querySelector('#alternativePrompt').value
      let messageLabel = document.querySelector('#alternativePromptMessage')
      if (this.checkAlternativePrompt(currentPrompt)) {
        this.setPrompt('alternativePrompt', currentPrompt)
      } else {
        messageLabel.innerHTML = 'Invalid prompt'
      }
    })

    chrome.runtime.sendMessage({ scope: 'prompt', cmd: 'getPrompt', data: {type: 'alternativePrompt'} }, ({ prompt }) => {
      if (prompt && prompt !== '') {
        document.querySelector('#alternativePrompt').value = prompt
      } else {
        document.querySelector('#alternativePrompt').value = alternativeDefaultPrompt
        this.setPrompt('alternativePrompt', alternativeDefaultPrompt)
      }
    })

    // CLARIFYING PROMPT
    const clarifyDefaultPrompt = Config.prompts.clarifyPrompt
    document.querySelector('#clarifyPromptButton').addEventListener('click', () => {
      let messageLabel = document.querySelector('#clarifyPromptMessage')
      this.setPrompt('clarifyPrompt', clarifyDefaultPrompt)
      let currentPrompt = document.querySelector('#clarifyPrompt')
      currentPrompt.value = clarifyDefaultPrompt
      messageLabel.innerHTML = 'Prompt saved'
    })

    document.querySelector('#clarifyPromptSaveButton').addEventListener('click', () => {
      let currentPrompt = document.querySelector('#clarifyPrompt').value
      let messageLabel = document.querySelector('#clarifyPromptMessage')
      if (this.checkClarifyPrompt(currentPrompt)) {
        this.setPrompt('clarifyPrompt', currentPrompt)
      } else {
        messageLabel.innerHTML = 'Invalid prompt'
      }
    })

    chrome.runtime.sendMessage({ scope: 'prompt', cmd: 'getPrompt', data: {type: 'clarifyPrompt'} }, ({ prompt }) => {
      if (prompt && prompt !== '') {
        document.querySelector('#clarifyPrompt').value = prompt
      } else {
        document.querySelector('#clarifyPrompt').value = clarifyDefaultPrompt
        this.setPrompt('clarifyPrompt', clarifyDefaultPrompt)
      }
    })

    // FACT-CHECKING PROMPT
    const factCheckingDefaultPrompt = Config.prompts.factCheckingPrompt
    document.querySelector('#factCheckingPromptButton').addEventListener('click', () => {
      let messageLabel = document.querySelector('#factCheckingPromptMessage')
      this.setPrompt('factCheckingPrompt', clarifyDefaultPrompt)
      let currentPrompt = document.querySelector('#factCheckingPrompt')
      currentPrompt.value = factCheckingDefaultPrompt
      messageLabel.innerHTML = 'Prompt saved'
    })

    document.querySelector('#factCheckingPromptSaveButton').addEventListener('click', () => {
      let currentPrompt = document.querySelector('#factCheckingPrompt').value
      let messageLabel = document.querySelector('#factCheckingPromptMessage')
      if (this.checkFactCheckingPrompt(currentPrompt)) {
        this.setPrompt('factCheckingPrompt', currentPrompt)
      } else {
        messageLabel.innerHTML = 'Invalid prompt'
      }
    })

    chrome.runtime.sendMessage({ scope: 'prompt', cmd: 'getPrompt', data: {type: 'factCheckingPrompt'} }, ({ prompt }) => {
      if (prompt && prompt !== '') {
        document.querySelector('#factCheckingPrompt').value = prompt
      } else {
        document.querySelector('#factCheckingPrompt').value = factCheckingDefaultPrompt
        this.setPrompt('factCheckingPrompt', factCheckingDefaultPrompt)
      }
    })

    // SOCIAL JUDGE PROMPT
    const socialJudgeDefaultPrompt = Config.prompts.socialJudgePrompt
    document.querySelector('#socialJudgePromptButton').addEventListener('click', () => {
      let messageLabel = document.querySelector('#socialJudgePromptMessage')
      this.setPrompt('socialJudgePrompt', socialJudgeDefaultPrompt)
      let currentPrompt = document.querySelector('#socialJudgePrompt')
      currentPrompt.value = socialJudgeDefaultPrompt
      messageLabel.innerHTML = 'Prompt saved'
    })

    document.querySelector('#socialJudgePromptSaveButton').addEventListener('click', () => {
      let currentPrompt = document.querySelector('#socialJudgePrompt').value
      let messageLabel = document.querySelector('#socialJudgePromptMessage')
      if (this.checkSocialJudgePrompt(currentPrompt)) {
        this.setPrompt('socialJudgePrompt', currentPrompt)
      } else {
        messageLabel.innerHTML = 'Invalid prompt'
      }
    })

    chrome.runtime.sendMessage({ scope: 'prompt', cmd: 'getPrompt', data: {type: 'socialJudgePrompt'} }, ({ prompt }) => {
      if (prompt && prompt !== '') {
        document.querySelector('#socialJudgePrompt').value = prompt
      } else {
        document.querySelector('#socialJudgePrompt').value = socialJudgeDefaultPrompt
        this.setPrompt('socialJudgePrompt', socialJudgeDefaultPrompt)
      }
    })
  }

  setPrompt (type, prompt) {
    chrome.runtime.sendMessage({
      scope: 'prompt',
      cmd: 'setPrompt',
      data: {
        prompt: prompt,
        type: type
      }
    }, ({prompt}) => {
      console.log('Prompt stored ' + prompt)
      let messageLabel = document.querySelector('#' + type + 'Message')
      messageLabel.innerHTML = 'Prompt saved'
    })
  }

  checkAnnotatePrompt (prompt) {
    if (prompt.includes('[C_DESCRIPTION]') && prompt.includes('[C_NAME]')) {
      return true
    } else {
      return false
    }
  }

  checkCompilePrompt (prompt) {
    if (prompt.includes('[C_DESCRIPTION]') && prompt.includes('[C_NAME]') && prompt.includes('[C_EXCERPTS]')) {
      return true
    } else {
      return false
    }
  }

  checkAlternativePrompt (prompt) {
    if (prompt.includes('[C_DESCRIPTION]') && prompt.includes('[C_NAME]') && prompt.includes('[C_EXCERPTS]')) {
      return true
    } else {
      return false
    }
  }

  checkClarifyPrompt (prompt) {
    if (prompt.includes('[C_DESCRIPTION]') && prompt.includes('[C_NAME]') && prompt.includes('[C_QUESTION]')) {
      return true
    } else {
      return false
    }
  }

  checkFactCheckingPrompt (prompt) {
    if (prompt.includes('[C_EXCERPT]')) {
      return true
    } else {
      return false
    }
  }

  checkSocialJudgePrompt (prompt) {
    if (prompt.includes('[C_EXCERPT]')) {
      return true
    } else {
      return false
    }
  }
}

export default PromptConfiguration
