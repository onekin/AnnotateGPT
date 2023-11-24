class Popup {
  constructor () {
    this.activated = false
  }

  deactivate () {
    this.activated = false
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'destroyContentScript'})
    })
  }

  activate () {
    this.activated = true
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'initContentScript'})
    })
  }
}

export default Popup
