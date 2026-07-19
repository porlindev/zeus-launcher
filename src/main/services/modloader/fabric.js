async function listLoaderVersions(minecraftVersion) {
  const res = await fetch(`https://meta.fabricmc.net/v2/versions/loader/${minecraftVersion}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch Fabric loader versions: ${res.status}`);
  }
  const entries = await res.json();
  return entries.map((entry) => entry.loader.version);
}

function toModloaderVersion(minecraftVersion, fabricLoaderVersion) {
  return {
    type: 'fabric',
    versionId: `fabric-loader-${fabricLoaderVersion}-${minecraftVersion}`,
  };
}

module.exports = {
  listLoaderVersions,
  toModloaderVersion,
};
