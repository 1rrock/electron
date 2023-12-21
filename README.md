# electron

## 시작
```
npm init

npm install --save-dev electron
```

## package.json에 scripts 추가
```json
"scripts": {
"start": "electron ."
},
```

## main.js, preload.js 생성
### main.js
```
const { app, BrowserWindow } = require('electron');
const path = require('path');
 
const createWindow = () => {
    const win = new BrowserWindow({
        width: 640,
        height: 480,
        webPreferences: { preload: path.join(__dirname, 'preload.js') }
    });
 
    win.loadFile('index.html');
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

### preload.js
```
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

## 웹 보안 무력화
webSecurity: false 추가
```
new BrowserWindow({
    webPreferences: { 
        webSecurity: false 
    },
});
```