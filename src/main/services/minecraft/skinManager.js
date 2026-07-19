const fs = require('fs/promises');
const path = require('path');

const SKIN_ENDPOINT = 'https://api.minecraftservices.com/minecraft/profile/skins';

async function changeSkin(accessToken, filePath, variant = 'classic') {
  const fileBuffer = await fs.readFile(filePath);
  const form = new FormData();
  form.append('variant', variant);
  form.append('file', new Blob([fileBuffer], { type: 'image/png' }), path.basename(filePath));

  const res = await fetch(SKIN_ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form,
  });

  if (!res.ok) {
    throw new Error(`Failed to change skin: ${res.status} ${await res.text()}`);
  }

  return res.json();
}

async function resetSkin(accessToken) {
  const res = await fetch(`${SKIN_ENDPOINT}/active`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok && res.status !== 204) {
    throw new Error(`Failed to reset skin: ${res.status}`);
  }
}

module.exports = {
  changeSkin,
  resetSkin,
};
