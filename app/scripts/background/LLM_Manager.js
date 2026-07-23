import ChromeStorage from '../utils/ChromeStorage'
import { loadQAStuffChain } from 'langchain/chains'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { TokenTextSplitter } from 'langchain/text_splitter'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'

class LLMManager {
  init () {
    this.initRespondent()
  }

  initRespondent () {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.scope === 'llm') {
        // ── Legacy commands (backward compat) ──
        if (request.cmd === 'getSelectedLLM') {
          ChromeStorage.getData('llm.selected', ChromeStorage.sync, (err, llm) => {
            if (err) { sendResponse({ err: err }) } else {
              let parsedLLM = (llm && llm.data) ? JSON.parse(llm.data) : ''
              sendResponse({ llm: parsedLLM || '' })
            }
          })
        } else if (request.cmd === 'setSelectedLLM') {
          let selectedLLM = request.data.llm
          ChromeStorage.setData('llm.selected', { data: JSON.stringify(selectedLLM) }, ChromeStorage.sync, (err) => {
            if (err) { sendResponse({ err: err }) } else { sendResponse({ llm: selectedLLM }) }
          })
        } else if (request.cmd === 'getAPIKEY') {
          let llmKey = 'llm.' + request.data + 'key'
          ChromeStorage.getData(llmKey, ChromeStorage.sync, (err, apiKey) => {
            if (err) { sendResponse({ err: err }) } else {
              let parsedKey = (apiKey && apiKey.data) ? JSON.parse(apiKey.data) : ''
              sendResponse({ apiKey: parsedKey || '' })
            }
          })
        } else if (request.cmd === 'setAPIKEY') {
          let llm = 'llm.' + request.data.llm + 'key'
          ChromeStorage.setData(llm, { data: JSON.stringify(request.data.apiKey) }, ChromeStorage.sync, (err) => {
            if (err) { sendResponse({ err: err }) } else { sendResponse({ apiKey: request.data.apiKey }) }
          })
        // ── New generic endpoint commands ──
        } else if (request.cmd === 'getEndpoints') {
          ChromeStorage.getData('llm.endpoints', ChromeStorage.sync, (err, data) => {
            if (err) { sendResponse({ endpoints: [] }) } else {
              let endpoints = (data && data.data) ? JSON.parse(data.data) : []
              sendResponse({ endpoints })
            }
          })
        } else if (request.cmd === 'getSelectedEndpoint') {
          ChromeStorage.getData('llm.selectedEndpoint', ChromeStorage.sync, (err, data) => {
            if (err) { sendResponse({ endpointId: null }) } else {
              let endpointId = (data && data.data) ? JSON.parse(data.data) : null
              sendResponse({ endpointId })
            }
          })
        } else if (request.cmd === 'getSelectedModel') {
          const key = 'llm.model.' + request.data.endpointId
          ChromeStorage.getData(key, ChromeStorage.sync, (err, data) => {
            if (err) { sendResponse({ model: null }) } else {
              let model = (data && data.data) ? JSON.parse(data.data) : null
              sendResponse({ model })
            }
          })
        } else if (request.cmd === 'setSelectedModel') {
          const key = 'llm.model.' + request.data.endpointId
          ChromeStorage.setData(key, { data: JSON.stringify(request.data.model) }, ChromeStorage.sync, (err) => {
            if (err) { sendResponse({ err: err }) } else { sendResponse({ success: true }) }
          })
        } else if (request.cmd === 'getCachedModels') {
          const key = 'llm.modelsCache.' + request.data.endpointId
          ChromeStorage.getData(key, ChromeStorage.sync, (err, data) => {
            if (err) { sendResponse({ models: [] }) } else {
              let models = (data && data.data) ? JSON.parse(data.data) : []
              sendResponse({ models })
            }
          })
        } else if (request.cmd === 'saveEndpointAndFetchModels') {
          this.saveEndpointAndFetchModels(request.data.endpoint).then(
            res => sendResponse(res),
            err => sendResponse({ success: false, error: err.message })
          )
        } else if (request.cmd === 'deleteEndpoint') {
          this.deleteEndpoint(request.data.endpointId).then(
            res => sendResponse(res),
            err => sendResponse({ success: false, error: err.message })
          )
        }
        return true
      }
    })

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.scope === 'askLLM') {
        if (request.cmd === 'generic') {
          this.askLLMGeneric(request).then(
            res => sendResponse({ res: res }),
            err => sendResponse({ err: err })
          )
          return true
        }
      }
    })
  }

  // ─── Endpoint CRUD ──────────────────────────────────────────

  async saveEndpointAndFetchModels (endpoint) {
    // If this is a preset, generate a new real ID
    if (endpoint.id && endpoint.id.startsWith('preset_')) {
      endpoint.id = 'ep_' + Date.now()
    }
    // 1. Save endpoint to storage
    const endpoints = await this.getEndpointsFromStorage()
    const existingIndex = endpoints.findIndex(ep => ep.id === endpoint.id)
    if (existingIndex >= 0) {
      endpoints[existingIndex] = endpoint
    } else {
      endpoints.push(endpoint)
    }
    await this.setEndpointsToStorage(endpoints)

    // 2. Set as selected endpoint
    await this.setSelectedEndpointToStorage(endpoint.id)

    // 3. Fetch models from /models
    try {
      const models = await this.fetchModels(endpoint.url, endpoint.apiKey)
      // Cache models
      const cacheKey = 'llm.modelsCache.' + endpoint.id
      await new Promise((resolve, reject) => {
        ChromeStorage.setData(cacheKey, { data: JSON.stringify(models) }, ChromeStorage.sync, (err) => {
          if (err) reject(err); else resolve()
        })
      })
      return { success: true, models, endpointId: endpoint.id }
    } catch (err) {
      return { success: false, error: err.message, endpointId: endpoint.id }
    }
  }

  async deleteEndpoint (endpointId) {
    const endpoints = await this.getEndpointsFromStorage()
    const filtered = endpoints.filter(ep => ep.id !== endpointId)
    await this.setEndpointsToStorage(filtered)
    // Clear selected endpoint if it was this one
    const selected = await this.getSelectedEndpointFromStorage()
    if (selected === endpointId) {
      await this.setSelectedEndpointToStorage(null)
    }
    return { success: true }
  }

  async fetchModels (baseURL, apiKey) {
    // Normalize URL: ensure it ends with /models or add /models
    let url = baseURL.replace(/\/+$/, '')
    if (!url.endsWith('/models')) {
      url += '/models'
    }
    const headers = { 'Content-Type': 'application/json' }
    if (apiKey) {
      headers['Authorization'] = 'Bearer ' + apiKey
    }
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)
    try {
      const response = await fetch(url, { headers, signal: controller.signal })
      clearTimeout(timeoutId)
      if (!response.ok) {
        throw new Error('HTTP ' + response.status + ': ' + response.statusText)
      }
      const data = await response.json()
      // OpenAI returns { data: [{ id: 'gpt-4', ... }, ...] }
      // Ollama returns { models: [{ name: 'llama2', ... }, ...] }
      if (data && data.data) {
        return data.data.map(m => m.id || m.name || m)
      } else if (data && data.models) {
        return data.models.map(m => m.name || m.id || m)
      }
      return []
    } catch (err) {
      clearTimeout(timeoutId)
      throw err
    }
  }

  // ─── Storage helpers ────────────────────────────────────────

  getEndpointsFromStorage () {
    return new Promise((resolve) => {
      ChromeStorage.getData('llm.endpoints', ChromeStorage.sync, (err, data) => {
        if (err || !data || !data.data) { resolve([]) } else {
          resolve(JSON.parse(data.data))
        }
      })
    })
  }

  setEndpointsToStorage (endpoints) {
    return new Promise((resolve, reject) => {
      ChromeStorage.setData('llm.endpoints', { data: JSON.stringify(endpoints) }, ChromeStorage.sync, (err) => {
        if (err) reject(err); else resolve()
      })
    })
  }

  getSelectedEndpointFromStorage () {
    return new Promise((resolve) => {
      ChromeStorage.getData('llm.selectedEndpoint', ChromeStorage.sync, (err, data) => {
        if (err || !data || !data.data) { resolve(null) } else {
          resolve(JSON.parse(data.data))
        }
      })
    })
  }

  setSelectedEndpointToStorage (endpointId) {
    return new Promise((resolve, reject) => {
      ChromeStorage.setData('llm.selectedEndpoint', { data: JSON.stringify(endpointId) }, ChromeStorage.sync, (err) => {
        if (err) reject(err); else resolve()
      })
    })
  }

  // ─── Generic LLM Call (OpenAI-compatible endpoint) ──────────

  async askLLMGeneric (request) {
    const endpointId = request.data.endpointId
    const query = request.data.query
    const documents = request.data.documents

    // Load endpoint config
    const endpoints = await this.getEndpointsFromStorage()
    const endpoint = endpoints.find(ep => ep.id === endpointId)
    if (!endpoint) {
      return { error: 'No endpoint configured. Please set up an endpoint in the options page.' }
    }

    // Load selected model
    let modelName = 'gpt-3.5-turbo' // default fallback
    const modelKey = 'llm.model.' + endpointId
    await new Promise((resolve) => {
      ChromeStorage.getData(modelKey, ChromeStorage.sync, (err, data) => {
        if (!err && data && data.data) {
          modelName = JSON.parse(data.data)
        }
        resolve()
      })
    })

    const apiKey = endpoint.apiKey
    const baseURL = endpoint.url

    // Build the LLM with custom endpoint
    const model = new ChatOpenAI({
      temperature: 0,
      modelName: modelName,
      openAIApiKey: apiKey,
      configuration: {
        baseURL: baseURL
      },
      callbacks: [{
        handleLLMEnd: (output) => {
          const tokenUsage = output.llmOutput?.tokenUsage || {}
          console.log(`Tokens - completion: ${tokenUsage.completionTokens}, prompt: ${tokenUsage.promptTokens}`)
        }
      }]
    })

    const chain = loadQAStuffChain(model)
    console.log('QUERY (generic): ' + query)
    console.log('Using endpoint: ' + baseURL + ' | model: ' + modelName)

    try {
      const res = await chain.call({
        input_documents: documents,
        question: query
      })
      return res
    } catch (err) {
      console.log('LLM error: ' + err.toString())
      if (err.toString().startsWith('Error: 429')) {
        // Rate limit → try embedding-based fallback
        return this.resolveWithEmbeddings(documents, query, apiKey, model)
      } else if (err.toString().startsWith('Error: 401') || err.toString().includes('401')) {
        return { error: 'Incorrect API key provided.' }
      } else {
        return { error: 'LLM call failed: ' + err.toString() }
      }
    }
  }

  async resolveWithEmbeddings (documents, query, apiKey, model) {
    try {
      const splitter = new TokenTextSplitter({ chunkSize: 500, chunkOverlap: 20 })
      const output = await splitter.splitDocuments(documents)
      const docsearch = await MemoryVectorStore.fromDocuments(
        output, new OpenAIEmbeddings({ openAIApiKey: apiKey })
      )
      const results = await docsearch.similaritySearch(query, 22)
      const chainA = loadQAStuffChain(model)
      console.log('QUERY (embeddings fallback): ' + query)
      return chainA.call({ input_documents: results, question: query })
    } catch (err) {
      return { error: 'An error has occurred loading embeddings: ' + err.toString() }
    }
  }
}

export default LLMManager
