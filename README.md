# electron


## 개발 환경 설정법
### 시작
```
npm init

npm install --save-dev electron
```

### package.json에 scripts 추가
``` json
"scripts": {
    "start": "electron ."
},
```

### main.js, preload.js 생성
1.  __main.js__
``` js
const { app, BrowserWindow } = require('electron');
const path = require('path');
 
const createWindow = () => {
    const win = new BrowserWindow({
        width: 640,
        height: 480,
        webPreferences: { preload: path.join(__dirname, 'preload.js') }
    });
 
    win.loadFile('index.html'); // 실행할 html 경로
};
 
app.whenReady().then(() => {
    createWindow();
 
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});
 
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
```

2.  __preload.js__
``` js
window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector)
        if (element) element.innerText = text
    }
 
    for (const type of ['chrome', 'node', 'electron']) {
        replaceText(`${type}-version`, process.versions[type]);
    }
});
```

## 웹 보안(CORS) 무력화 설정 방법
> webSecurity: false 추가
``` js
new BrowserWindow({
    webPreferences: { 
        webSecurity: false 
    },
});
```

## Inter-Process Communication(프로세스 간 통신)
### 단방향
1. main.js
``` js
const { ipcMain } = require('electron/main')

ipcMain.on('message', (event, msg) => { // renderer.js -> main.js 수신
    console.log(msg); // 'hello'
    event.reply('selected-json', 'message'); // main.js -> renderer.js 송신
});
```

2. preload.js
``` js
const { contextBridge, ipcRenderer } = require('electron/renderer');

contextBridge.exposeInMainWorld('electronAPI', {
  sendMessage: (msg) => ipcRenderer.send('message', msg), // renderer.js -> main.js 송신
});
```

3. renderer.js
``` js
document.getElementById('button').addEventListener('click', () => {
    electronAPI.sendMessage('hello'); // preload.js에서 정의한 electronAPI 호출
});
```

### 양방향
1. main.js
``` js
const { app, ipcMain } = require('electron/main')

app.whenReady().then(() => {
    ipcMain.handle('my-invokable-ipc', async (event, msg) => {
        const result = await somePromise(msg)
        return result
    })
});
```

2. preload.js
``` js
const { contextBridge, ipcRenderer } = require('electron/renderer');

contextBridge.exposeInMainWorld('electronAPI', {
    sendMessage: async (msg) => {
        const result = await ipcRenderer.invoke('my-invokable-ipc', msg) // renderer.js -> main.js 송신 및 main.js의 return값 수신
        return result
    },
});
```

3. renderer.js
``` js
document.getElementById('button').addEventListener('click', async () => {
    const res = await electronAPI.sendMessage('hello'); // preload.js에서 정의한 electronAPI 호출
    console.log(res) // 'bye'
});
```

## 파일 읽기/쓰기
### 파일 읽기
- main.js
``` js
const { dialog } = require('electron');
const fs = require('node:fs');

const res = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
        { name: 'json', extensions: ['json'] },
        // { name: 'img', extensions: ['png', 'jpg', 'jpeg']}
        // { name: 'All Files', extensions: ['*'] }
    ]
});

console.log(res) // { canceled: false, filePaths: ['/Users/1rrock/Documents/study/electron-quick-start/src/assets/sample.json'} }
if (!res.canceled) {
    const filePath = res.filePaths[0]
    const file = fs.readFileSync(filePath, 'utf-8');
    console.log(file) // 파일 내용
}
```

### 파일 쓰기
- main.js
```
const buildPath = `${__dirname}/build`; // 저장할 경로

if(!fs.existsSync(buildPath)){ // 저장할 디렉토리 있는지 확인
    fs.mkdirSync(buildPath); // 저장할 디렉토리가 없으면 디렉토리 생성
}

fs.writeFileSync(`${buildPath}/test.json`, JSON.stringify({ // 저장항 경로에 test.json 파일 생성
    "name": "1rrock"
}));
```