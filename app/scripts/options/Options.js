import Alerts from '../utils/Alerts'
import FileUtils from '../utils/FileUtils'
import LocalStorageManager from '../storage/local/LocalStorageManager'
import FileSaver from 'file-saver'

class Options {
  init () {
    if (window.location.href.includes('pages/options.html')) {
      this.initEndpointManagement()
      this.initLocalStorageManagement()
    }
  }

  // ─── Endpoint Management ───────────────────────────────────────

  initEndpointManagement () {
    const step2 = document.querySelector('#step2')
    const step3 = document.querySelector('#step3')
    const apiKeyInput = document.querySelector('#endpointAPIKey')
    const urlInput = document.querySelector('#endpointURL')
    const urlGroup = document.querySelector('#endpointURLGroup')
    const modelDropdown = document.querySelector('#modelDropdown')
    const saveButton = document.querySelector('#saveEndpointButton')
    const deleteButton = document.querySelector('#deleteEndpointButton')
    const changeButton = document.querySelector('#changeProviderButton')
    const loadingIndicator = document.querySelector('#modelsLoadingIndicator')
    const summary = document.querySelector('#currentConfigSummary')
    const providerGrid = document.querySelector('#providerGrid')
    const apiKeyHelpLink = document.querySelector('#apiKeyHelpLink')

    const providers = [
      { id: 'preset_openai', name: 'OpenAI', icon: '🤖', desc: 'GPT-4, GPT-4o…', url: 'https://api.openai.com/v1', needsKey: true, keyUrl: 'https://platform.openai.com/api-keys' },
      { id: 'preset_gemini', name: 'Google Gemini', icon: '✨', desc: 'Gemini 1.5…', url: 'https://generativelanguage.googleapis.com/v1beta/openai', needsKey: true, keyUrl: 'https://aistudio.google.com/apikey' },
      { id: 'preset_groq', name: 'Groq', icon: '⚡', desc: 'Fast inference', url: 'https://api.groq.com/openai/v1', needsKey: true, keyUrl: 'https://console.groq.com/keys' },
      { id: 'preset_openrouter', name: 'OpenRouter', icon: '🔀', desc: '200+ models', url: 'https://openrouter.ai/api/v1', needsKey: true, keyUrl: 'https://openrouter.ai/keys' },
      { id: 'preset_deepseek', name: 'DeepSeek', icon: '🔬', desc: 'DeepSeek R1…', url: 'https://api.deepseek.com/v1', needsKey: true, keyUrl: 'https://platform.deepseek.com/api_keys' },
      { id: 'preset_mistral', name: 'Mistral AI', icon: '💨', desc: 'Mistral, Codestral…', url: 'https://api.mistral.ai/v1', needsKey: true, keyUrl: 'https://console.mistral.ai/api-keys' },
      { id: 'preset_together', name: 'Together AI', icon: '🌐', desc: 'Open models', url: 'https://api.together.xyz/v1', needsKey: true, keyUrl: 'https://api.together.ai/settings/api-keys' },
      { id: 'preset_custom', name: 'Local / Custom', icon: '🖥️', desc: 'Ollama, LM Studio…', url: '', needsKey: false, keyUrl: '' }
    ]

    let selectedProvider = null
    let currentEndpointId = null
    let savedEndpoints = []

    // ─── Render provider grid ──────────────────────────────────
    const renderProviders = () => {
      providerGrid.innerHTML = ''
      providers.forEach(p => {
        // Check if this provider is already saved
        const saved = savedEndpoints.find(ep => ep.url === p.url || ep.id === p.id)
        const card = document.createElement('div')
        card.className = 'provider-card' + (saved ? ' selected' : '')
        card.dataset.id = p.id
        card.innerHTML = `
          <span class="provider-icon">${p.icon}</span>
          <div class="provider-name">${p.name}</div>
          <div class="provider-desc">${saved ? '✓ Configured' : p.desc}</div>
        `
        card.addEventListener('click', () => selectProvider(p, saved))
        providerGrid.appendChild(card)
      })
    }

    // ─── Step 1 → Step 2 ──────────────────────────────────────
    const selectProvider = (provider, existingSaved) => {
      selectedProvider = provider

      // Update card selection
      document.querySelectorAll('.provider-card').forEach(c => c.classList.remove('selected'))
      document.querySelector('[data-id="' + provider.id + '"]').classList.add('selected')

      // If already saved, jump straight to step 3
      if (existingSaved) {
        currentEndpointId = existingSaved.id
        step2.style.display = 'none'
        showStep3(existingSaved)
        return
      }

      // Show step 2
      step3.style.display = 'none'
      step2.style.display = 'block'
      apiKeyInput.value = ''
      urlInput.value = provider.url || ''

      // Show URL field only for custom
      urlGroup.style.display = provider.id === 'preset_custom' ? 'block' : 'none'

      // API key help link
      if (provider.keyUrl) {
        apiKeyHelpLink.href = provider.keyUrl
        apiKeyHelpLink.style.display = 'inline'
      } else {
        apiKeyHelpLink.style.display = 'none'
      }

      // Placeholder for key
      apiKeyInput.placeholder = provider.needsKey ? 'Paste your ' + provider.name + ' API key here' : 'No key required (leave blank)'

      apiKeyInput.focus()
    }

    // ─── Step 2 → Step 3 ──────────────────────────────────────
    saveButton.addEventListener('click', () => {
      const apiKey = apiKeyInput.value.trim()
      const url = (selectedProvider.id === 'preset_custom' ? urlInput.value.trim() : selectedProvider.url)

      if (!url) {
        Alerts.errorAlert({ text: 'Please enter the base URL for your local endpoint.' })
        return
      }

      loadingIndicator.style.display = 'block'
      saveButton.disabled = true

      const endpointData = {
        id: currentEndpointId || selectedProvider.id,
        name: selectedProvider.name,
        url: url,
        apiKey: apiKey
      }

      chrome.runtime.sendMessage({
        scope: 'llm',
        cmd: 'saveEndpointAndFetchModels',
        data: { endpoint: endpointData }
      }, ({ success, models, error, endpointId: savedId }) => {
        loadingIndicator.style.display = 'none'
        saveButton.disabled = false
        if (success) {
          currentEndpointId = savedId
          step2.style.display = 'none'
          loadSavedEndpoints(() => {
            showStep3({ id: savedId, name: selectedProvider.name, url, apiKey, models })
          })
        } else {
          Alerts.errorAlert({ text: 'Failed to connect: ' + (error || 'Check the URL and API key and try again.') })
        }
      })
    })

    // ─── Show Step 3 ──────────────────────────────────────────
    const showStep3 = (ep) => {
      step3.style.display = 'block'
      deleteButton.style.display = 'inline-block'

      // Populate model dropdown
      chrome.runtime.sendMessage({ scope: 'llm', cmd: 'getCachedModels', data: { endpointId: ep.id } }, ({ models }) => {
        if (models && models.length > 0) {
          populateModelDropdown(models, ep.id)
          summary.style.display = 'block'
          summary.innerHTML = '✅ Connected to <strong>' + ep.name + '</strong>'
        } else {
          modelDropdown.innerHTML = '<option value="">No models found</option>'
          summary.style.display = 'block'
          summary.innerHTML = '⚠️ No models found. Check your API key.'
        }
      })
    }

    // ─── Populate model dropdown ───────────────────────────────
    const populateModelDropdown = (models, endpointId) => {
      modelDropdown.innerHTML = '<option value="">-- Select a model --</option>'
      models.forEach(m => {
        const option = document.createElement('option')
        option.value = m.id || m
        option.textContent = m.id || m
        modelDropdown.appendChild(option)
      })
      modelDropdown.disabled = false
      chrome.runtime.sendMessage({ scope: 'llm', cmd: 'getSelectedModel', data: { endpointId } }, ({ model }) => {
        if (model) modelDropdown.value = model
      })
    }

    // ─── Model selection ───────────────────────────────────────
    modelDropdown.addEventListener('change', (event) => {
      const model = event.target.value
      if (model && currentEndpointId) {
        chrome.runtime.sendMessage({
          scope: 'llm',
          cmd: 'setSelectedModel',
          data: { endpointId: currentEndpointId, model }
        })
      }
    })

    // ─── Change provider ───────────────────────────────────────
    changeButton.addEventListener('click', () => {
      step2.style.display = 'none'
      step3.style.display = 'none'
      currentEndpointId = null
      selectedProvider = null
      document.querySelectorAll('.provider-card').forEach(c => c.classList.remove('selected'))
    })

    // ─── Delete endpoint ───────────────────────────────────────
    deleteButton.addEventListener('click', () => {
      if (!currentEndpointId) return
      Alerts.confirmAlert({
        title: 'Remove this AI provider?',
        alertType: Alerts.alertType.warning,
        text: 'Your API key and model selection will be removed.',
        callback: () => {
          chrome.runtime.sendMessage({
            scope: 'llm',
            cmd: 'deleteEndpoint',
            data: { endpointId: currentEndpointId }
          }, () => {
            step2.style.display = 'none'
            step3.style.display = 'none'
            currentEndpointId = null
            selectedProvider = null
            loadSavedEndpoints(() => renderProviders())
            Alerts.successAlert({ text: 'Provider removed.' })
          })
        }
      })
    })

    // ─── Load saved endpoints ──────────────────────────────────
    const loadSavedEndpoints = (callback) => {
      chrome.runtime.sendMessage({ scope: 'llm', cmd: 'getEndpoints' }, ({ endpoints }) => {
        savedEndpoints = endpoints || []
        if (callback) callback()
      })
    }

    // ─── Init ──────────────────────────────────────────────────
    loadSavedEndpoints(() => {
      renderProviders()
      // Auto-select if there's a saved endpoint
      chrome.runtime.sendMessage({ scope: 'llm', cmd: 'getSelectedEndpoint' }, ({ endpointId }) => {
        if (endpointId) {
          const saved = savedEndpoints.find(ep => ep.id === endpointId)
          if (saved) {
            const provider = providers.find(p => saved.url === p.url || saved.id === p.id) || providers[providers.length - 1]
            selectedProvider = { ...provider, ...saved }
            currentEndpointId = endpointId
            document.querySelector('[data-id="' + (provider.id) + '"]').classList.add('selected')
            showStep3(saved)
          }
        }
      })
    })
  }

  // ─── Local Storage Management ──────────────────────────────────

  initLocalStorageManagement () {
    // Local storage restore
    if (document.querySelector('#restoreDatabaseButton')) {
      document.querySelector('#restoreDatabaseButton').addEventListener('click', () => {
        Alerts.inputTextAlert({
          title: 'Upload your database backup file',
          html: 'Danger zone! <br/>This operation will override current local storage database, deleting all the annotations for all your documents. Please make a backup first.',
          type: Alerts.alertType.warning,
          input: 'file',
          callback: (err, file) => {
            if (err) {
              window.alert('An unexpected error happened when trying to load the alert.')
            } else {
              FileUtils.readJSONFile(file, (err, jsonObject) => {
                if (err) {
                  Alerts.errorAlert({ text: 'Unable to read json file: ' + err.message })
                } else {
                  this.restoreDatabase(jsonObject, (err) => {
                    if (err) {
                      Alerts.errorAlert({ text: 'Something went wrong when trying to restore the database' })
                    } else {
                      Alerts.successAlert({ text: 'Database restored.' })
                    }
                  })
                }
              })
            }
          }
        })
      })
    }
    // Local storage backup
    if (document.querySelector('#backupDatabaseButton')) {
      document.querySelector('#backupDatabaseButton').addEventListener('click', () => {
        this.backupDatabase()
      })
    }
    // Local storage delete
    if (document.querySelector('#deleteDatabaseButton')) {
      document.querySelector('#deleteDatabaseButton').addEventListener('click', () => {
        Alerts.confirmAlert({
          title: 'Deleting your database',
          alertType: Alerts.alertType.warning,
          text: 'Danger zone! <br/>This operation will override current local storage database, deleting all the annotations for all your documents. Please make a backup first.',
          callback: () => {
            this.deleteDatabase((err) => {
              if (err) {
                Alerts.errorAlert({ text: 'Error deleting the database, please try it again or contact developer.' })
              } else {
                Alerts.successAlert({ text: 'Local storage successfully deleted' })
              }
            })
          }
        })
      })
    }
  }

  restoreDatabase (jsonObject, callback) {
    window.options.localStorage = new LocalStorageManager()
    window.options.localStorage.init(() => {
      window.options.localStorage.saveDatabase(jsonObject, callback)
    })
  }

  backupDatabase () {
    window.options.localStorage = new LocalStorageManager()
    window.options.localStorage.init(() => {
      let stringifyObject = JSON.stringify(window.options.localStorage.annotationsDatabase, null, 2)
      let blob = new window.Blob([stringifyObject], {
        type: 'text/plain;charset=utf-8'
      })
      let dateString = (new Date()).toISOString()
      FileSaver.saveAs(blob, 'reviewAndGo-databaseBackup' + dateString + '.json')
    })
  }

  deleteDatabase (callback) {
    window.options.localStorage = new LocalStorageManager()
    window.options.localStorage.init(() => {
      window.options.localStorage.cleanDatabase(callback)
    })
  }
}

export default Options
