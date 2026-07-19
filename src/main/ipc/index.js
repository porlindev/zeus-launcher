const { ipcMain, dialog, shell } = require('electron');
const fs = require('fs');
const { IPC_CHANNELS } = require('../../shared/constants');
const accountManager = require('../services/auth/accountManager');
const instanceManager = require('../services/minecraft/instanceManager');
const skinManager = require('../services/minecraft/skinManager');
const { listVersions } = require('../services/minecraft/versionManager');
const launcher = require('../services/minecraft/launcher');
const store = require('../config/store');
const { getGameDirectory, getInstanceDirectory } = require('../config/paths');
const forgeLoader = require('../services/modloader/forge');
const fabricLoader = require('../services/modloader/fabric');
const modrinthApi = require('../services/modrinth/modrinthApi');
const modManager = require('../services/modrinth/modManager');
const discordPresence = require('../services/discord/discordPresence');
const autoUpdaterService = require('../services/update/autoUpdater');

function registerIpcHandlers(mainWindow) {
  ipcMain.handle(IPC_CHANNELS.AUTH_STATUS, () => {
    return {
      account: accountManager.getActive(),
      accounts: accountManager.list(),
    };
  });

  ipcMain.handle(IPC_CHANNELS.AUTH_ACCOUNTS_LIST, () => {
    return accountManager.list();
  });

  ipcMain.handle(IPC_CHANNELS.AUTH_ACCOUNT_ADD_MICROSOFT, async () => {
    return accountManager.addMicrosoftAccount();
  });

  ipcMain.handle(IPC_CHANNELS.AUTH_ACCOUNT_REFRESH, async (_event, uuid) => {
    return accountManager.refreshAccount(uuid);
  });

  ipcMain.handle(IPC_CHANNELS.AUTH_ACCOUNT_REMOVE, (_event, uuid) => {
    return accountManager.remove(uuid);
  });

  ipcMain.handle(IPC_CHANNELS.AUTH_ACCOUNT_SET_ACTIVE, (_event, uuid) => {
    return accountManager.setActive(uuid);
  });

  ipcMain.handle(IPC_CHANNELS.SKIN_CHANGE, async (_event, { uuid, variant }) => {
    const account = accountManager.get(uuid);
    if (!account || account.type !== 'microsoft') {
      throw new Error('Microsoft 계정으로 로그인해야 스킨을 변경할 수 있습니다.');
    }

    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      title: '스킨 이미지 선택',
      filters: [{ name: 'PNG Image', extensions: ['png'] }],
      properties: ['openFile'],
    });
    if (canceled || filePaths.length === 0) {
      return null;
    }

    return skinManager.changeSkin(account.mclcProfile.access_token, filePaths[0], variant);
  });

  ipcMain.handle(IPC_CHANNELS.SKIN_RESET, async (_event, { uuid }) => {
    const account = accountManager.get(uuid);
    if (!account || account.type !== 'microsoft') {
      throw new Error('Microsoft 계정으로 로그인해야 스킨을 초기화할 수 있습니다.');
    }
    return skinManager.resetSkin(account.mclcProfile.access_token);
  });

  ipcMain.handle(IPC_CHANNELS.INSTANCES_LIST, () => {
    return {
      instances: instanceManager.list(),
      activeInstanceId: store.get('activeInstanceId'),
    };
  });

  ipcMain.handle(IPC_CHANNELS.INSTANCES_CREATE, (_event, payload) => {
    return instanceManager.create(payload);
  });

  ipcMain.handle(IPC_CHANNELS.INSTANCES_REMOVE, (_event, id) => {
    return instanceManager.remove(id);
  });

  ipcMain.handle(IPC_CHANNELS.INSTANCES_SET_ACTIVE, (_event, id) => {
    return instanceManager.setActive(id);
  });

  ipcMain.handle(IPC_CHANNELS.VERSIONS_LIST, async () => {
    return listVersions();
  });

  ipcMain.handle(IPC_CHANNELS.MODLOADER_VERSIONS_LIST, async (_event, { type, minecraftVersion }) => {
    if (type === 'forge') {
      return forgeLoader.listLoaderVersions(minecraftVersion);
    }
    if (type === 'fabric') {
      return fabricLoader.listLoaderVersions(minecraftVersion);
    }
    return [];
  });

  ipcMain.handle(IPC_CHANNELS.SETTINGS_GET, () => {
    return {
      language: store.get('language'),
      font: store.get('font'),
      closeOnLaunch: store.get('closeOnLaunch'),
      memory: store.get('memory'),
      windowSize: store.get('windowSize'),
    };
  });

  ipcMain.handle(IPC_CHANNELS.SETTINGS_SET, (_event, settings) => {
    if (settings.language !== undefined) {
      store.set('language', settings.language);
    }
    if (settings.font !== undefined) {
      store.set('font', settings.font);
    }
    if (settings.closeOnLaunch !== undefined) {
      store.set('closeOnLaunch', settings.closeOnLaunch);
    }
    if (settings.memory !== undefined) {
      store.set('memory', settings.memory);
    }
    if (settings.windowSize !== undefined) {
      store.set('windowSize', settings.windowSize);
    }
    return {
      language: store.get('language'),
      font: store.get('font'),
      closeOnLaunch: store.get('closeOnLaunch'),
      memory: store.get('memory'),
      windowSize: store.get('windowSize'),
    };
  });

  ipcMain.handle(IPC_CHANNELS.MODRINTH_SEARCH, async (_event, { query, limit, offset } = {}) => {
    const instance = instanceManager.getActive();
    const loader =
      instance && instance.modloader && instance.modloader.type !== 'vanilla' ? instance.modloader.type : undefined;
    const gameVersion = instance ? instance.version.number : undefined;

    return modrinthApi.searchMods({ query, loader, gameVersion, limit, offset });
  });

  ipcMain.handle(IPC_CHANNELS.MODRINTH_INSTALL, async (_event, projectId) => {
    const instance = instanceManager.getActive();
    if (!instance) {
      throw new Error('선택된 인스턴스가 없습니다.');
    }
    return modManager.installMod(projectId, instance);
  });

  ipcMain.handle(IPC_CHANNELS.SHELL_OPEN_GAME_DIRECTORY, async () => {
    const dir = getGameDirectory();
    await fs.promises.mkdir(dir, { recursive: true });
    const result = await shell.openPath(dir);
    if (result) {
      throw new Error(result);
    }
    return dir;
  });

  ipcMain.handle(IPC_CHANNELS.LAUNCH_START, async () => {
    const account = accountManager.getActive();
    const instance = instanceManager.getActive();
    if (!account) {
      throw new Error('선택된 계정이 없습니다.');
    }
    if (!instance) {
      throw new Error('선택된 인스턴스가 없습니다.');
    }

    launcher.onData((data) => mainWindow.webContents.send(IPC_CHANNELS.LAUNCH_LOG, data.toString()));
    launcher.onClose((code) => {
      mainWindow.webContents.send(IPC_CHANNELS.LAUNCH_EXIT, code);
      if (store.get('closeOnLaunch') && !mainWindow.isDestroyed()) {
        mainWindow.show();
      }
    });

    const result = await launcher.launch({
      authorization: account.mclcProfile,
      version: instance.version,
      modloader: instance.modloader,
      gameDirectory: getGameDirectory(),
      instanceDirectory: getInstanceDirectory(instance.id),
      memory: store.get('memory'),
      windowSize: store.get('windowSize'),
    });

    if (store.get('closeOnLaunch')) {
      mainWindow.hide();
    }

    return result;
  });

  ipcMain.on(IPC_CHANNELS.DISCORD_PRESENCE_UPDATE, (_event, payload) => {
    discordPresence.update(payload);
  });

  ipcMain.handle(IPC_CHANNELS.UPDATE_CHECK, () => {
    autoUpdaterService.checkForUpdates();
  });

  ipcMain.on(IPC_CHANNELS.UPDATE_INSTALL, () => {
    autoUpdaterService.quitAndInstall();
  });

  ipcMain.on(IPC_CHANNELS.WINDOW_MINIMIZE, () => {
    mainWindow.minimize();
  });

  ipcMain.on(IPC_CHANNELS.WINDOW_MAXIMIZE, () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });

  ipcMain.on(IPC_CHANNELS.WINDOW_CLOSE, () => {
    mainWindow.close();
  });
}

module.exports = {
  registerIpcHandlers,
};
