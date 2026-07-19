const crypto = require('crypto');
const store = require('../../config/store');
const forgeLoader = require('../modloader/forge');
const fabricLoader = require('../modloader/fabric');

function list() {
  return store.get('instances');
}

function get(id) {
  return list().find((i) => i.id === id) ?? null;
}

function getActive() {
  const id = store.get('activeInstanceId');
  return id ? get(id) : null;
}

function resolveModloader(version, modloader) {
  if (!modloader || modloader.type === 'vanilla') {
    return { type: 'vanilla' };
  }
  if (modloader.type === 'forge') {
    return forgeLoader.toModloaderVersion(version.number, modloader.loaderVersion);
  }
  if (modloader.type === 'fabric') {
    return fabricLoader.toModloaderVersion(version.number, modloader.loaderVersion);
  }
  throw new Error(`Unknown modloader type: ${modloader.type}`);
}

function create({ name, version, modloader }) {
  const instance = {
    id: crypto.randomUUID(),
    name,
    version,
    modloader: resolveModloader(version, modloader),
    createdAt: Date.now(),
  };

  const instances = list();
  instances.push(instance);
  store.set('instances', instances);

  if (!store.get('activeInstanceId')) {
    store.set('activeInstanceId', instance.id);
  }

  return instance;
}

function remove(id) {
  const remaining = list().filter((i) => i.id !== id);
  store.set('instances', remaining);
  if (store.get('activeInstanceId') === id) {
    store.set('activeInstanceId', remaining[0]?.id ?? null);
  }
  return remaining;
}

function setActive(id) {
  store.set('activeInstanceId', id);
  return get(id);
}

module.exports = {
  list,
  get,
  getActive,
  create,
  remove,
  setActive,
};
