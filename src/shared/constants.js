const APP_NAME = 'Zeus Launcher';

const AUTH_MODE = {
  MICROSOFT: 'microsoft',
};

const MODLOADER = {
  VANILLA: 'vanilla',
  FORGE: 'forge',
  FABRIC: 'fabric',
};

const SUPPORTED_LANGUAGES = ['ko', 'en', 'ja', 'zh'];

const IPC_CHANNELS = {
  AUTH_STATUS: 'auth:status',
  AUTH_ACCOUNTS_LIST: 'auth:accounts:list',
  AUTH_ACCOUNT_ADD_MICROSOFT: 'auth:accounts:add-microsoft',
  AUTH_ACCOUNT_REFRESH: 'auth:accounts:refresh',
  AUTH_ACCOUNT_REMOVE: 'auth:accounts:remove',
  AUTH_ACCOUNT_SET_ACTIVE: 'auth:accounts:set-active',

  SKIN_CHANGE: 'skin:change',
  SKIN_RESET: 'skin:reset',

  INSTANCES_LIST: 'instances:list',
  INSTANCES_CREATE: 'instances:create',
  INSTANCES_REMOVE: 'instances:remove',
  INSTANCES_SET_ACTIVE: 'instances:set-active',

  VERSIONS_LIST: 'versions:list',
  VERSIONS_INSTALL: 'versions:install',

  MODLOADER_VERSIONS_LIST: 'modloader:versions:list',

  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',

  SHELL_OPEN_GAME_DIRECTORY: 'shell:open-game-directory',

  LAUNCH_START: 'launch:start',
  LAUNCH_EXIT: 'launch:exit',
  LAUNCH_LOG: 'launch:log',

  UPDATE_CHECK: 'update:check',
  UPDATE_CHECKING: 'update:checking',
  UPDATE_AVAILABLE: 'update:available',
  UPDATE_NOT_AVAILABLE: 'update:not-available',
  UPDATE_PROGRESS: 'update:progress',
  UPDATE_DOWNLOADED: 'update:downloaded',
  UPDATE_ERROR: 'update:error',
  UPDATE_INSTALL: 'update:install',

  MODPACK_INSTALL: 'modpack:install',

  MODRINTH_SEARCH: 'modrinth:search',
  MODRINTH_INSTALL: 'modrinth:install',

  DISCORD_PRESENCE_UPDATE: 'discord:presence:update',

  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_MAXIMIZE: 'window:maximize',
  WINDOW_CLOSE: 'window:close',
};

module.exports = {
  APP_NAME,
  AUTH_MODE,
  MODLOADER,
  SUPPORTED_LANGUAGES,
  IPC_CHANNELS,
};
