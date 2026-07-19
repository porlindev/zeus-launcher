const extract = require('extract-zip');
const path = require('path');

async function installModpack(zipPath, targetDirectory) {
  await extract(zipPath, { dir: path.resolve(targetDirectory) });
  return targetDirectory;
}

module.exports = {
  installModpack,
};
