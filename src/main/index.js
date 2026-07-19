const { app, BrowserWindow } = require('electron');
const path = require('path');
const { registerIpcHandlers } = require('./ipc');
const { init: initAutoUpdater } = require('./services/update/autoUpdater');
const discordPresence = require('./services/discord/discordPresence');

const isDev = process.argv.includes('--dev');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 740,
    minWidth: 960,
    minHeight: 620,
    title: 'Zeus Launcher',
    icon: path.join(__dirname, '..', '..', 'assets', 'icons', 'icon.png'),
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow.webContents.closeDevTools();
    });

    mainWindow.webContents.on('before-input-event', (event, input) => {
      const key = input.key.toLowerCase();
      const isDevToolsShortcut =
        key === 'f12' ||
        ((input.control || input.meta) && input.shift && ['i', 'j', 'c'].includes(key)) ||
        (input.meta && input.alt && key === 'i');
      if (isDevToolsShortcut) {
        event.preventDefault();
      }
    });
  }

  registerIpcHandlers(mainWindow);

  if (!isDev) {
    initAutoUpdater(mainWindow);
  }
}

app.whenReady().then(() => {
  createWindow();
  discordPresence.init();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  discordPresence.destroy();
});
