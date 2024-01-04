// /**
//  * The preload script runs before. It has access to web APIs
//  * as well as Electron's renderer process modules and some
//  * polyfilled Node.js functions.
//  *
//  * https://www.electronjs.org/docs/latest/tutorial/sandbox
//  */
// window.addEventListener('DOMContentLoaded', () => {
//   const replaceText = (selector, text) => {
//     const element = document.getElementById(selector)
//     if (element) element.innerText = text
//   }

//   for (const type of ['chrome', 'node', 'electron']) {
//     replaceText(`${type}-version`, process.versions[type])
//   }
// })

const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
  fileSelect: () => ipcRenderer.send('fileSelect'),
  fileSave: (json) => ipcRenderer.send('fileSave', json)
})

ipcRenderer.on('selected-json', (_event, arg) => {
  const textarea = document.getElementById('textarea');
  textarea.value = arg;
  textarea.disabled = false
})