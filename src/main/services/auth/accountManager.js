const store = require('../../config/store');
const microsoft = require('./microsoftAuth');

function list() {
  return store.get('accounts');
}

function getActive() {
  const activeUuid = store.get('activeAccountUuid');
  return list().find((a) => a.uuid === activeUuid) ?? null;
}

function get(uuid) {
  return list().find((a) => a.uuid === uuid) ?? null;
}

function upsert(account) {
  const accounts = list();
  const index = accounts.findIndex((a) => a.uuid === account.uuid);
  if (index !== -1) {
    accounts[index] = account;
  } else {
    accounts.push(account);
  }
  store.set('accounts', accounts);
  return account;
}

async function addMicrosoftAccount() {
  const account = await microsoft.login();
  upsert(account);
  store.set('activeAccountUuid', account.uuid);
  return account;
}

async function refreshAccount(uuid) {
  const account = list().find((a) => a.uuid === uuid);
  if (!account) {
    throw new Error(`No saved account for uuid ${uuid}`);
  }
  if (account.type !== 'microsoft') {
    return account;
  }
  if (!account.refreshToken) {
    throw new Error(`Account ${account.name} has no refresh token, sign in again`);
  }
  const refreshed = await microsoft.refresh(account.refreshToken);
  return upsert(refreshed);
}

function setActive(uuid) {
  store.set('activeAccountUuid', uuid);
  return getActive();
}

function remove(uuid) {
  const remaining = list().filter((a) => a.uuid !== uuid);
  store.set('accounts', remaining);
  if (store.get('activeAccountUuid') === uuid) {
    store.set('activeAccountUuid', remaining[0]?.uuid ?? null);
  }
  return remaining;
}

module.exports = {
  list,
  getActive,
  get,
  addMicrosoftAccount,
  refreshAccount,
  setActive,
  remove,
};
