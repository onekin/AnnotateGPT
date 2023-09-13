class Popup {
  constructor () {
    this.activated = false
  }

  deactivate () {
    this.activated = false
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'destroyContentScript'}, (response) => {
        // chrome.action.setIcon({tabId: tabs[0].id, path: 'images/icon-38-bw.png'})
      })
    })
  }

  activate () {
    this.activated = true
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'initContentScript'}, (response) => {
        // chrome.action.setIcon({tabId: tabs[0].id, path: 'images/icon-38.png'})
      })
    })
  }
}

export default Popup
