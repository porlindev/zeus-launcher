const fs = require('fs');
const path = require('path');
const modrinthApi = require('./modrinthApi');
const { getInstanceDirectory } = require('../../config/paths');

const INSTALLABLE_LOADERS = ['forge', 'fabric'];

async function downloadFile(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Download failed: ${res.status}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  await fs.promises.writeFile(destPath, buffer);
}

async function installMod(projectId, instance) {
  if (!instance.modloader || !INSTALLABLE_LOADERS.includes(instance.modloader.type)) {
    throw new Error('Forge 또는 Fabric 인스턴스에서만 모드를 설치할 수 있습니다.');
  }

  const version = await modrinthApi.getCompatibleVersion(projectId, {
    loader: instance.modloader.type,
    gameVersion: instance.version.number,
  });

  const primaryFile = version.files.find((file) => file.primary) ?? version.files[0];
  if (!primaryFile) {
    throw new Error('다운로드할 파일을 찾을 수 없습니다.');
  }

  const modsDir = path.join(getInstanceDirectory(instance.id), 'mods');
  await fs.promises.mkdir(modsDir, { recursive: true });
  const destPath = path.join(modsDir, primaryFile.filename);
  await downloadFile(primaryFile.url, destPath);

  return { filename: primaryFile.filename, versionNumber: version.version_number };
}

module.exports = {
  installMod,
};
