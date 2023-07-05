
class RecentActivity {
  constructor () {
    this.activated = false
  }
  activate () {
    this.activated = true
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.pageAction.setIcon({tabId: tabs[0].id, path: 'images/icon-38.png'})
    })
  }
  deactivate () {
    this.activated = false
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.pageAction.setIcon({tabId: tabs[0].id, path: 'images/icon-38-bw.png'})
    })
  }
}

module.exports = RecentActivity
