const _ = require('lodash')
const Events = require('./Events')
const URLUtils = require('../utils/URLUtils')
const LanguageUtils = require('../utils/LanguageUtils')
const axios = require('axios')

const URL_CHANGE_INTERVAL_IN_SECONDS = 1

class ContentTypeManager {
  constructor () {
    this.pdfFingerprint = null
    this.documentURL = null
    this.urlChangeInterval = null
    this.urlParam = null
    this.documentType = ContentTypeManager.documentTypes.html // By default document type is html
    this.localFile = false
    this.fileMetadata = {}
  }

  init (callback) {
    // If we are already on the PDF viewer page, skip redirect detection
    const isAlreadyOnViewer = window.location.pathname === '/content/pdfjs/web/viewer.html'

    // Robust PDF detection: check embed, MIME type, and URL
    const hasPdfEmbed = document.querySelector('embed[type="application/pdf"]') ||
                        document.querySelector('embed[src$=".pdf"]')
    const isPdfContentType = document.contentType === 'application/pdf'
    const isPdfUrl = !isAlreadyOnViewer &&
                     (window.location.href.toLowerCase().endsWith('.pdf') ||
                      window.location.href.toLowerCase().includes('.pdf?') ||
                      window.location.href.toLowerCase().includes('.pdf#'))

    if (!isAlreadyOnViewer && (hasPdfEmbed || isPdfContentType || isPdfUrl)) {
      console.log('ContentTypeManager: PDF detected, redirecting to viewer')
      window.location = chrome.runtime.getURL('content/pdfjs/web/viewer.html') + '?file=' + encodeURIComponent(window.location.href)
      // Callback won't be reached due to redirect, but call it for consistency
      if (_.isFunction(callback)) {
        callback()
      }
    } else if (isAlreadyOnViewer) {
      // Load publication metadata
      this.tryToLoadDoi()
      this.tryToLoadPublicationPDF()
      this.tryToLoadURLParam()
      // Set document type as pdf and wait for viewer to load
      this.waitUntilPDFViewerLoad((pdfApp) => {
        if (!pdfApp || !pdfApp.pdfDocument) {
          console.error('ContentTypeManager: PDF.js application failed to initialize')
          this.documentType = ContentTypeManager.documentTypes.html
          if (_.isFunction(callback)) {
            callback()
          }
          return
        }
        // Save document type as pdf
        this.documentType = ContentTypeManager.documentTypes.pdf
        // Try to load title
        this.tryToLoadTitle()
        // Save pdf fingerprint
        this.pdfFingerprint = window.PDFViewerApplication.pdfDocument.pdfInfo.fingerprint
        // Get document URL
        if (this.urlParam) {
          this.documentURL = this.urlParam || 'urn:x-pdf:' + this.pdfFingerprint
          if (_.isFunction(callback)) {
            callback()
          }
        } else {
          // Is a local file
          if (window.PDFViewerApplication.url.startsWith('file:///')) {
            this.localFile = true
            this.localFilePath = URLUtils.retrieveMainUrl(window.PDFViewerApplication.url)
            if (_.isFunction(callback)) {
              callback()
            }
          } else { // Is an online resource
            // Support in ajax websites web url change, web url can change dynamically, but locals never do
            this.initSupportWebURLChange()
            this.documentURL = window.PDFViewerApplication.url
            if (_.isFunction(callback)) {
              callback()
            }
          }
        }
      })
    } else {
      // HTML document
      this.documentType = ContentTypeManager.documentTypes.html
      // Try to load title
      this.tryToLoadTitle()
      if (this.urlParam) {
        this.documentURL = this.urlParam
      } else {
        if (window.location.href.startsWith('file:///')) {
          this.localFile = true
          this.localFilePath = URLUtils.retrieveMainUrl(window.location.href)
          if (_.isFunction(callback)) {
            callback()
          }
        } else {
          // Support in ajax websites web url change, web url can change dynamically, but locals never do
          this.initSupportWebURLChange()
          this.documentURL = URLUtils.retrieveMainUrl(window.location.href)
          if (_.isFunction(callback)) {
            callback()
          }
        }
      }
    }
  }

  destroy (callback) {
    if (this.documentType === ContentTypeManager.documentTypes.pdf) {
      // Reload to original pdf website
      if (_.isUndefined(this.documentURL) || _.isNull(this.documentURL)) {
        window.location.href = window.PDFViewerApplication.baseUrl
      } else {
        window.location.href = this.documentURL
      }
    } else {
      if (_.isFunction(callback)) {
        callback()
      }
    }
    clearInterval(this.urlChangeInterval)
  }

  getContextAndItemIdInLocalFile () {
    this.fileMetadata.contextId = LanguageUtils.getStringBetween(this.fileMetadata.url, 'pluginfile.php/', '/assignsubmission_file')
    this.fileMetadata.itemId = LanguageUtils.getStringBetween(this.fileMetadata.url, 'submission_files/', '/')
  }

  waitUntilPDFViewerLoad (callback) {
    let attempts = 0
    const maxAttempts = 60 // 30 seconds max
    let interval = setInterval(() => {
      attempts++
      if (_.isObject(window.PDFViewerApplication) && _.isObject(window.PDFViewerApplication.pdfDocument)) {
        clearInterval(interval)
        if (_.isFunction(callback)) {
          callback(window.PDFViewerApplication)
        }
      } else if (attempts >= maxAttempts) {
        clearInterval(interval)
        console.error('ContentTypeManager: PDF viewer failed to load after ' + maxAttempts + ' attempts')
        if (_.isFunction(callback)) {
          callback(null)
        }
      }
    }, 500)
  }

  tryToLoadDoi () {
    // Try to load doi from hash param
    let decodedUri = decodeURIComponent(window.location.href)
    let params = URLUtils.extractHashParamsFromUrl(decodedUri)
    if (!_.isEmpty(params) && !_.isEmpty(params.doi)) {
      this.doi = params.doi
    }
    // Try to load doi from page metadata
    if (_.isEmpty(this.doi)) {
      try {
        this.doi = document.querySelector('meta[name="citation_doi"]').content
      } catch (e) {
      }
    }
    // TODO Try to load doi from chrome tab storage
  }

  tryToLoadURLParam () {
    let decodedUri = decodeURIComponent(window.location.href)
    let params = URLUtils.extractHashParamsFromUrl(decodedUri, '::')
    if (!_.isEmpty(params) && !_.isEmpty(params.url)) {
      this.urlParam = params.url
    }
  }

  tryToLoadPublicationPDF () {
    try {
      this.citationPdf = document.querySelector('meta[name="citation_pdf_url"]').content
    } catch (e) {
    }
  }

  getDocumentRootElement () {
    if (this.documentType === ContentTypeManager.documentTypes.pdf) {
      return document.querySelector('#viewer')
    } else if (this.documentType === ContentTypeManager.documentTypes.html) {
      return document.body
    }
  }

  getDocumentURIToSearchInStorage () {
    if (this.documentType === ContentTypeManager.documentTypes.pdf) {
      return 'urn:x-pdf:' + this.pdfFingerprint
    } else {
      return this.documentURL
    }
  }

  getDocumentURIToSaveInStorage () {
    if (this.localFile) {
      return 'urn:x-pdf:' + this.pdfFingerprint
    } else {
      return this.documentURL
    }
  }

  initSupportWebURLChange () {
    this.urlChangeInterval = setInterval(() => {
      let newUrl = URLUtils.retrieveMainUrl(window.location.href)
      if (newUrl !== this.documentURL) {
        this.documentURL = newUrl
        // Dispatch event
        LanguageUtils.dispatchCustomEvent(Events.updatedDocumentURL, {url: this.documentURL})
      }
    }, URL_CHANGE_INTERVAL_IN_SECONDS * 1000)
  }

  tryToLoadTitle () {
    // Try to load by doi
    let promise = new Promise((resolve, reject) => {
      if (this.doi) {
        let settings = {
          'async': true,
          'crossDomain': true,
          'url': 'https://doi.org/' + this.doi,
          'method': 'GET',
          'headers': {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }
        }
        // Call using axios
        axios(settings).then((response) => {
          if (response.data && response.data.title) {
            this.documentTitle = response.data.title
          }
          resolve()
        })
      } else {
        resolve()
      }
    })
    promise.then(() => {
      // Try to load title from page metadata
      if (_.isEmpty(this.documentTitle)) {
        try {
          let documentTitleElement = document.querySelector('meta[name="citation_title"]')
          if (!_.isNull(documentTitleElement)) {
            this.documentTitle = documentTitleElement.content
          }
          if (!this.documentTitle) {
            let documentTitleElement = document.querySelector('meta[property="og:title"]')
            if (!_.isNull(documentTitleElement)) {
              this.documentTitle = documentTitleElement.content
            }
            if (!this.documentTitle) {
              let promise = new Promise((resolve, reject) => {
                // Try to load title from pdf metadata
                if (this.documentType === ContentTypeManager.documentTypes.pdf) {
                  this.waitUntilPDFViewerLoad(() => {
                    if (window.PDFViewerApplication.documentInfo.Title) {
                      this.documentTitle = window.PDFViewerApplication.documentInfo.Title
                    }
                    resolve()
                  })
                } else {
                  resolve()
                }
              })
              promise.then(() => {
                // Try to load title from document title
                if (!this.documentTitle) {
                  this.documentTitle = document.title || 'Unknown document'
                }
              })
            }
          }
        } catch (e) {
        }
      }
    })
  }
}

ContentTypeManager.documentTypes = {
  html: {
    name: 'html',
    selectors: ['FragmentSelector', 'RangeSelector', 'TextPositionSelector', 'TextQuoteSelector']
  },
  pdf: {
    name: 'pdf',
    selectors: ['FragmentSelector', 'TextPositionSelector', 'TextQuoteSelector']
  }
}

export default ContentTypeManager
