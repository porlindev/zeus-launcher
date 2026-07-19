const { Client } = require('@xhayper/discord-rpc');
const store = require('../../config/store');

let client = null;
let appStartTimestamp = null;
let launchStartTimestamp = null;

async function init() {
  const clientId = store.get('discordClientId');
  if (!clientId || !store.get('discordRpcEnabled')) {
    return;
  }

  client = new Client({ clientId });

  client.on('ready', () => {
    appStartTimestamp = Date.now();
    update({ details: 'Zeus Launcher', state: 'Idle', playing: false });
  });

  try {
    await client.login();
  } catch {
    client = null;
  }
}

function update({ details, state, playing }) {
  if (!client || !client.user) {
    return;
  }

  if (!playing) {
    launchStartTimestamp = null;
  } else if (!launchStartTimestamp) {
    launchStartTimestamp = Date.now();
  }

  const startTimestamp = playing ? launchStartTimestamp : appStartTimestamp;

  client.user
    .setActivity({
      details,
      state,
      startTimestamp: startTimestamp ?? undefined,
    })
    .catch(() => {});
}

async function destroy() {
  if (!client) return;
  try {
    await client.destroy();
  } catch {
    // ignore, Discord may already be disconnected
  }
  client = null;
}

module.exports = {
  init,
  update,
  destroy,
};
