/* eslint-env mocha, browser */
const puppeteer = require('puppeteer')
const assert = require('assert')

const path = require('path')
const extensionPath = path.join(__dirname, '/../../dist/chrome/') // For instance, 'dist'
let extensionPage = null
let browser = null

describe('Extension UI Testing', function () {
  this.timeout(20000) // default is 2 seconds and that may not be enough to boot browsers and pages.
  before(async () => {
    await boot()
  })

  describe('Home Page', async function () {
    it('Test', async function () {
      const inputElementHandler = await extensionPage.$('#main-container > div > h2')
      const text = await extensionPage.evaluate(inputElement => inputElement.innerText, inputElementHandler)
      assert.equal(text, 'Review&Go configuration')
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

  const targets = await browser.targets()
  const extensionTarget = targets.find(({ _targetInfo }) => {
    return _targetInfo.title === 'Review&Go'
  })

  const extensionUrl = extensionTarget._targetInfo.url || ''
  const [,, extensionID] = extensionUrl.split('/')

  extensionPage = await browser.newPage()
  await extensionPage.goto(`chrome-extension://${extensionID}/pages/options.html`)
}
