const { dialog } = require('electron');
const { app, BrowserWindow, ipcMain } = require('electron/main');
const path = require('node:path');
const fs = require('node:fs');

function createWindow() {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false
    }
  });

  ipcMain.on('fileSelect', async (event) => {
    const res = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'json', extensions: ['json'] }
      ]
    });

    if (!res.canceled) {
      const filePath = res.filePaths[0]
      const file = fs.readFileSync(filePath, 'utf-8');
      event.reply('selected-json', file);
    }
  });

  ipcMain.on('fileSave', (event, arg) => {
    const buildPath = `${__dirname}/build`;

    if(!fs.existsSync(buildPath)){
      fs.mkdirSync(buildPath);
    }

    fs.writeFileSync(`${buildPath}/test.json`, arg);
  });

  mainWindow.loadFile('src/index.html');
};

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});