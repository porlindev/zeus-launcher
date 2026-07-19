const { autoUpdater } = require('electron-updater');
const { IPC_CHANNELS } = require('../../../shared/constants');

const RECHECK_INTERVAL_MS = 2 * 60 * 60 * 1000;

let mainWindowRef = null;

function send(channel, payload) {
  if (mainWindowRef && !mainWindowRef.isDestroyed()) {
    mainWindowRef.webContents.send(channel, payload);
  }
}

function init(mainWindow) {
  mainWindowRef = mainWindow;
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('checking-for-update', () => {
    send(IPC_CHANNELS.UPDATE_CHECKING);
  });

  autoUpdater.on('update-available', (info) => {
    send(IPC_CHANNELS.UPDATE_AVAILABLE, { version: info.version });
  });

  autoUpdater.on('update-not-available', () => {
    send(IPC_CHANNELS.UPDATE_NOT_AVAILABLE);
  });

  autoUpdater.on('download-progress', (progress) => {
    send(IPC_CHANNELS.UPDATE_PROGRESS, { percent: progress.percent });
  });

  autoUpdater.on('update-downloaded', (info) => {
    send(IPC_CHANNELS.UPDATE_DOWNLOADED, { version: info.version });
  });

  autoUpdater.on('error', (err) => {
    send(IPC_CHANNELS.UPDATE_ERROR, { message: err.message });
  });

  checkForUpdates();
  setInterval(checkForUpdates, RECHECK_INTERVAL_MS);
}

function checkForUpdates() {
  autoUpdater.checkForUpdates().catch(() => {});
}

function quitAndInstall() {
  autoUpdater.quitAndInstall();
}

module.exports = {
  init,
  checkForUpdates,
  quitAndInstall,
};
