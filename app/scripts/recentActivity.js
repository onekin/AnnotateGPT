/* eslint-disable */
const ChromeStorage = require('./utils/ChromeStorage')
const HypothesisClientManager = require('./storage/hypothesis/HypothesisClientManager')
const LocalStorageManager = require('./storage/local/LocalStorageManager')

let storageManager

let insertActivity = (docs) => {
  let cont = document.querySelector("#recentActivity")
  for(let i=0;i<docs.length;i++){
    let div = document.createElement("div")
    div.className = "reviewAndGoActivity"
    let docTitle = document.createElement("div")
    docTitle.className = "activityDocument"
    docTitle.innerText = docs[i].title
    let model = document.createElement("div")
    model.className = "activityModel"
    model.innerText = docs[i].model
    let lastAnnotation = document.createElement("div")
    lastAnnotation.className = "activityLastAnnotation"
    lastAnnotation.innerText = new Date(docs[i].lastAnnotation).toLocaleDateString()
    div.appendChild(docTitle)
    div.appendChild(model)
    div.appendChild(lastAnnotation)
    cont.appendChild(div)
    div.addEventListener("click",(e) => {
      window.location.href = docs[i].path+'#rag:'+docs[i].id
    })
  }
}
let callback = () => {
  storageManager.client.searchAnnotations({sort: "updated", order: "desc"}, (err, ann) => {
    storageManager.client.getListOfGroups({},(err,groups) => {
      let activities = []
      ann.forEach((annotation) => {
        if(annotation.documentMetadata == null) return
        if(annotation.documentMetadata.title == null) return
        if(annotation.group == null || annotation.group == '') return
        let group = groups.find((g) => {return annotation.group === g.id})
        if (group == null) return
        let reviewModel = group.name
        let title = annotation.documentMetadata.title
        if(annotation.documentMetadata.link == null) return
        let localfile = annotation.documentMetadata.link.find((link) => {return link.type === 'localfile'})
        if(localfile == null || localfile.href == null) return
        let path = localfile.href
        let act = activities.find((activity) => {
          if(activity.title !== title) return false
          if(activity.model !== reviewModel) return false
          if(activity.path !== path) return false
          return true
        })
        if(act == null) {
          activities.push({title:title,model:reviewModel,path:path,lastAnnotation:new Date(annotation.updated),id:annotation.id})
        }
        else if(annotation.updated!=null && new Date(annotation.updated) > act.lastAnnotation) {
          annotation.lastAnnotation = new Date(annotation.updated)
        }
      })
      insertActivity(activities)
    })
  })
}
let initStorage = (storage) => {
  if (storage === 'hypothesis') {
    // Hypothesis
    storageManager = new HypothesisClientManager()
  } else {
    // Local storage
    storageManager = new LocalStorageManager()
  }
  storageManager.init((err) => {
    if (_.isFunction(callback)) {
      if (err) {
        callback(err)
      } else {
        callback()
      }
    }
  })
}
ChromeStorage.getData('storage.selected', ChromeStorage.sync, (err, storage) => {
  if (err) {
    sendResponse({err: err})
  } else {
    if (storage) {
      let parsedStorage = JSON.parse(storage.data)
      initStorage(parsedStorage || '')
    } else {
      initStorage('')
    }
  }
})

window.onload = () => {
  let newDocumentButton = document.getElementById("openDocumentButton")
  newDocumentButton.addEventListener("dragover",(ev) => {
    if(newDocumentButton.className.indexOf("dragoverActive") == -1) newDocumentButton.className += ' dragoverActive'
    ev.stopPropagation()
    ev.preventDefault()
  })
  document.addEventListener("dragover",(ev) => {
    ev.preventDefault()
  })
  newDocumentButton.addEventListener("dragleave",(ev) => {
    if(newDocumentButton.className.indexOf("dragoverActive") != -1) newDocumentButton.className = newDocumentButton.className.replace('dragoverActive','')
    ev.preventDefault()
    ev.stopPropagation()
  })
  newDocumentButton.addEventListener("drop",(ev) => {
    chrome.runtime.sendMessage({scope:"RecentActivity",cmd:"initSidebar"})
    ev.stopPropagation()
  })
  document.addEventListener("drop",(ev) => {
    ev.preventDefault()
    ev.stopPropagation()
  })

  let getFolderDocuments = (path) => {
    return new Promise((resolve,reject) => {
      var xhttp = new XMLHttpRequest()
      let parseResponseText = (text) => {
        let files = []
        //let entryRegExp = /<script>addRow.+\n?.+<\/script>/gi
        let entryRegExp = /<script>addRow((?:.|\r?\n)*?)<\/script>/gi
        let entryNameRegExp = /"[^"]*"/gi
        let entries = text.match(entryRegExp)
        if(entries==null) return null
        for(let i=0;i<entries.length;i++){
          let entry = entries[i].replace("<script>","").replace("addRow(","").replace("</script>","").replace(/\\"/g,"%22").replace(/\n/g,"")
          let stringParams = entry.match(entryNameRegExp)
          if(stringParams==null||stringParams.length<4) continue
          let entryName = stringParams[0].replace(/\%22/gi,"\"")
          let dateModified = stringParams[3].replace(/\%22/gi,"\"")
          let entryType = entry.replace(entryNameRegExp,"").split(",")[2]
          let file = {
            name:entryName.substring(1,entryName.length-1),
            dateModified:dateModified.substring(1,dateModified.length-1)
          }
          if(entryType === "1") file["folder"] = true
          files.push(file)
        }
        return files
      }
      xhttp.onreadystatechange = function() {
        if(this.readyState == 4){
          let folderFiles = parseResponseText(this.responseText)
          resolve(folderFiles)
        }
      }
      xhttp.open("GET", path, true)
      xhttp.send()
    })
  }

  let displayFileSystemWindow = (files) => {
    let overlayDiv = document.createElement("div")
    overlayDiv.addEventListener("click",() => {
      let fsOverlay = document.getElementById("filesystemOverlay")
      let fsContainer = document.getElementById("filesystemContainer")
      if(fsOverlay!=null) fsOverlay.parentNode.removeChild(fsOverlay)
      if(fsContainer!=null) fsContainer.parentNode.removeChild(fsContainer)
    })
    overlayDiv.id = "filesystemOverlay"


    document.body.appendChild(overlayDiv)
    let div = document.createElement("div")
    div.id = "filesystemContainer"

    let closeButton = document.createElement("div")
    closeButton.id = "filesystemCloseButton"
    closeButton.appendChild(document.createElement("span"))
    closeButton.appendChild(document.createElement("span"))
    closeButton.appendChild(document.createElement("span"))
    closeButton.addEventListener("click",() => {
      let fsOverlay = document.getElementById("filesystemOverlay")
      let fsContainer = document.getElementById("filesystemContainer")
      if(fsOverlay!=null) fsOverlay.parentNode.removeChild(fsOverlay)
      if(fsContainer!=null) fsContainer.parentNode.removeChild(fsContainer)
    })
    div.appendChild(closeButton)

    let fsDiv = document.createElement("div")
    fsDiv.id = "filesystemDiv"

    let rootUl = document.createElement("ul")
    rootUl.id = "rootUl"

    let loadSubfolder = (parentUl, parentPath, subfolderEntries) => {

      for(let i=0;i<subfolderEntries.length;i++){
        if(subfolderEntries[i].name == null || subfolderEntries[i].name.charAt(0) === '.') continue
        let li = document.createElement("li")
        let span = document.createElement("span")
        span.innerText = subfolderEntries[i].name
        if(subfolderEntries[i].folder!=null&&subfolderEntries[i].folder) span.className = "folderClosed"
        else if(subfolderEntries[i].name.endsWith(".pdf")) span.className = "pdfFile"
        else span.className = "regularFile"
        span.setAttribute("path",parentPath+'/'+subfolderEntries[i].name)

        span.addEventListener("click",(e) => {
          let entry = e.target
          if(entry.className === 'pdfFile'){
            location.href = entry.getAttribute("path") + '#rag:f'
          }
          else if(entry.className === 'folderClosed'){
            let subfolder = entry.parentNode.querySelector("ul")
            if(subfolder == null){
              getFolderDocuments(entry.getAttribute('path')).then((subfolderFiles) => {
                let subfolderUl = document.createElement("ul")
                loadSubfolder(subfolderUl, entry.getAttribute('path'), subfolderFiles)
                entry.parentNode.appendChild(subfolderUl)
              })
            }
            entry.className = "folderOpen"
          }
          else if(entry.className === 'folderOpen'){
            entry.className = "folderClosed"
          }
        })
        li.appendChild(span)
        parentUl.appendChild(li)
      }
    }
    loadSubfolder(rootUl, 'file://', files)

    fsDiv.appendChild(rootUl)
    div.appendChild(fsDiv)
    //div.appendChild(rootUl)
    document.body.appendChild(div)
  }

  document.getElementById("openDocumentButton").addEventListener("click",(ev) => {
    if(window.navigator.userAgent.match(/windows/i)!=null){
      let letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
      let pL = []
      for(let i=0;i<letters.length;i++){
        pL.push(getFolderDocuments("file:///"+letters.charAt(i)+':'))
      }
      Promise.all(pL).then((units) => {
        let files = []
        for(let j=0;j<units.length;j++){
          if(units[j]!=null){
            files.push({
              name: letters.charAt(j)+':',
              folder: true
            })
          }
        }
        displayFileSystemWindow(files)
      })
    }
    else{
      getFolderDocuments("file://").then((files) => {
        displayFileSystemWindow(files)
      })
    }
  })

  document.addEventListener("keydown",(e) => {
    if(e.keyCode === 27){
      let fsOverlay = document.getElementById("filesystemOverlay")
      let fsContainer = document.getElementById("filesystemContainer")
      if(fsOverlay!=null) fsOverlay.parentNode.removeChild(fsOverlay)
      if(fsContainer!=null) fsContainer.parentNode.removeChild(fsContainer)
    }
  })
}
