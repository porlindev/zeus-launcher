const { Client } = require('minecraft-launcher-core');
const path = require('path');
const os = require('os');

const launcher = new Client();

function launch({ authorization, version, modloader, gameDirectory, instanceDirectory, memory, windowSize }) {
  const opts = {
    authorization,
    root: gameDirectory || path.join(os.homedir(), '.zeus-launcher', 'minecraft'),
    version: {
      number: version.number,
      type: version.type,
      custom: modloader && modloader.type !== 'vanilla' ? modloader.versionId : undefined,
    },
    memory: {
      min: `${memory?.min ?? 1024}M`,
      max: `${memory?.max ?? 2048}M`,
    },
    window: {
      width: windowSize?.width ?? 854,
      height: windowSize?.height ?? 480,
    },
    overrides: instanceDirectory ? { gameDirectory: instanceDirectory } : undefined,
  };

  return launcher.launch(opts);
}

function onData(callback) {
  launcher.on('data', callback);
}

function onClose(callback) {
  launcher.on('close', callback);
}

function onDebug(callback) {
  launcher.on('debug', callback);
}

module.exports = {
  launch,
  onData,
  onClose,
  onDebug,
};
