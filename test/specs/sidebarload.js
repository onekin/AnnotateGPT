/* eslint-env mocha, browser */
const puppeteer = require('puppeteer')
const assert = require('assert')
const path = require('path')
const extensionPath = path.join(__dirname, '/../../dist/chrome/') // For instance, 'dist'
let browser = null

describe('Sidebar loading testing', function () {
  this.timeout(20000) // default is 2 seconds and that may not be enough to boot browsers and pages.
  before(async () => {
    await boot()
  })

  describe('Web location', async function () {
    it('Sidebar loaded in web html document', async function () {
      let extensionPage = await browser.newPage()
      await extensionPage.goto('https://en.wikipedia.org/wiki/Hypothes.is#rag:f')

      let sidebarWidthCollapsed = await extensionPage.$eval('#abwaSidebarContainer', elem => elem.offsetWidth)

      extensionPage.click('#abwaSidebarButton')

      await delay(1000)

      let sidebarWidthOpened = await extensionPage.$eval('#abwaSidebarContainer', elem => elem.offsetWidth)

      assert.equal(sidebarWidthOpened, 164)
    })

    it('Sidebar loaded in web pdf document', async function () {
      let extensionPage = await browser.newPage()
      await extensionPage.goto('http://www.africau.edu/images/default/sample.pdf#rag:f')

      await delay(3000)

      // It is opened by default
      let sidebarWidthOpened = await extensionPage.$eval('#abwaSidebarContainer', elem => elem.offsetWidth)

      extensionPage.click('#abwaSidebarButton')

      await delay(1000)

      let sidebarWidthCollapsed = await extensionPage.$eval('#abwaSidebarContainer', elem => elem.offsetWidth)

      console.log(sidebarWidthCollapsed + ' ' + sidebarWidthOpened)

      assert.equal(sidebarWidthCollapsed, 1)
      assert.equal(sidebarWidthOpened, 164)
    })
  })

  after(async function () {
    await browser.close()
  })
})

async function boot () {
  browser = await puppeteer.launch({
    headless: false, // extension are allowed only in head-full mode
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`
    ]
  })
}

function delay (time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time)
  })
}
