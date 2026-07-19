const { contextBridge, ipcRenderer } = require('electron');
const { IPC_CHANNELS } = require('../shared/constants');

contextBridge.exposeInMainWorld('zeus', {
  auth: {
    status: () => ipcRenderer.invoke(IPC_CHANNELS.AUTH_STATUS),
    listAccounts: () => ipcRenderer.invoke(IPC_CHANNELS.AUTH_ACCOUNTS_LIST),
    addMicrosoftAccount: () => ipcRenderer.invoke(IPC_CHANNELS.AUTH_ACCOUNT_ADD_MICROSOFT),
    refreshAccount: (uuid) => ipcRenderer.invoke(IPC_CHANNELS.AUTH_ACCOUNT_REFRESH, uuid),
    removeAccount: (uuid) => ipcRenderer.invoke(IPC_CHANNELS.AUTH_ACCOUNT_REMOVE, uuid),
    setActiveAccount: (uuid) => ipcRenderer.invoke(IPC_CHANNELS.AUTH_ACCOUNT_SET_ACTIVE, uuid),
  },
  skin: {
    change: (uuid, variant) => ipcRenderer.invoke(IPC_CHANNELS.SKIN_CHANGE, { uuid, variant }),
    reset: (uuid) => ipcRenderer.invoke(IPC_CHANNELS.SKIN_RESET, { uuid }),
  },
  instances: {
    list: () => ipcRenderer.invoke(IPC_CHANNELS.INSTANCES_LIST),
    create: (payload) => ipcRenderer.invoke(IPC_CHANNELS.INSTANCES_CREATE, payload),
    remove: (id) => ipcRenderer.invoke(IPC_CHANNELS.INSTANCES_REMOVE, id),
    setActive: (id) => ipcRenderer.invoke(IPC_CHANNELS.INSTANCES_SET_ACTIVE, id),
  },
  versions: {
    list: () => ipcRenderer.invoke(IPC_CHANNELS.VERSIONS_LIST),
  },
  modloader: {
    listVersions: (type, minecraftVersion) =>
      ipcRenderer.invoke(IPC_CHANNELS.MODLOADER_VERSIONS_LIST, { type, minecraftVersion }),
  },
  settings: {
    get: () => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET),
    set: (settings) => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_SET, settings),
  },
  shell: {
    openGameDirectory: () => ipcRenderer.invoke(IPC_CHANNELS.SHELL_OPEN_GAME_DIRECTORY),
  },
  modrinth: {
    search: (query, options) => ipcRenderer.invoke(IPC_CHANNELS.MODRINTH_SEARCH, { query, ...options }),
    install: (projectId) => ipcRenderer.invoke(IPC_CHANNELS.MODRINTH_INSTALL, projectId),
  },
  discord: {
    updatePresence: (payload) => ipcRenderer.send(IPC_CHANNELS.DISCORD_PRESENCE_UPDATE, payload),
  },
  launch: {
    start: () => ipcRenderer.invoke(IPC_CHANNELS.LAUNCH_START),
    onLog: (callback) => ipcRenderer.on(IPC_CHANNELS.LAUNCH_LOG, (_event, line) => callback(line)),
    onExit: (callback) => ipcRenderer.on(IPC_CHANNELS.LAUNCH_EXIT, (_event, code) => callback(code)),
  },
  update: {
    check: () => ipcRenderer.invoke(IPC_CHANNELS.UPDATE_CHECK),
    install: () => ipcRenderer.send(IPC_CHANNELS.UPDATE_INSTALL),
    onChecking: (callback) => ipcRenderer.on(IPC_CHANNELS.UPDATE_CHECKING, () => callback()),
    onAvailable: (callback) => ipcRenderer.on(IPC_CHANNELS.UPDATE_AVAILABLE, (_event, data) => callback(data)),
    onNotAvailable: (callback) => ipcRenderer.on(IPC_CHANNELS.UPDATE_NOT_AVAILABLE, () => callback()),
    onProgress: (callback) => ipcRenderer.on(IPC_CHANNELS.UPDATE_PROGRESS, (_event, data) => callback(data)),
    onDownloaded: (callback) => ipcRenderer.on(IPC_CHANNELS.UPDATE_DOWNLOADED, (_event, data) => callback(data)),
    onError: (callback) => ipcRenderer.on(IPC_CHANNELS.UPDATE_ERROR, (_event, data) => callback(data)),
  },
  window: {
    minimize: () => ipcRenderer.send(IPC_CHANNELS.WINDOW_MINIMIZE),
    maximize: () => ipcRenderer.send(IPC_CHANNELS.WINDOW_MAXIMIZE),
    close: () => ipcRenderer.send(IPC_CHANNELS.WINDOW_CLOSE),
  },
});
