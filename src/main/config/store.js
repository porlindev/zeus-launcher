const Store = require('electron-store');

const store = new Store({
  name: 'zeus-launcher-config',
  defaults: {
    accounts: [],
    activeAccountUuid: null,
    instances: [],
    activeInstanceId: null,
    gameDirectory: '',
    javaPath: '',
    language: 'ko',
    font: 'monocraft',
    closeOnLaunch: false,
    memory: {
      min: 1024,
      max: 2048,
    },
    windowSize: {
      width: 854,
      height: 480,
    },
    discordRpcEnabled: true,
    discordClientId: '1528306886418501632',
  },
});

module.exports = store;
