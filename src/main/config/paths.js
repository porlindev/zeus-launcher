const path = require('path');
const os = require('os');
const store = require('./store');

function getGameDirectory() {
  return store.get('gameDirectory') || path.join(os.homedir(), '.zeus-launcher', 'minecraft');
}

function getInstanceDirectory(instanceId) {
  return path.join(getGameDirectory(), 'instances', instanceId);
}

module.exports = {
  getGameDirectory,
  getInstanceDirectory,
};
