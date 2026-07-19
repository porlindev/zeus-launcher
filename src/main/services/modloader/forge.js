const METADATA_URL = 'https://maven.minecraftforge.net/net/minecraftforge/forge/maven-metadata.xml';

async function listLoaderVersions(minecraftVersion) {
  const res = await fetch(METADATA_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch Forge metadata: ${res.status}`);
  }
  const xml = await res.text();
  const versions = [...xml.matchAll(/<version>([^<]+)<\/version>/g)].map((m) => m[1]);

  return versions
    .filter((v) => v.startsWith(`${minecraftVersion}-`))
    .map((v) => v.slice(minecraftVersion.length + 1))
    .reverse();
}

function toModloaderVersion(minecraftVersion, forgeVersion) {
  return {
    type: 'forge',
    versionId: `${minecraftVersion}-forge-${forgeVersion}`,
  };
}

module.exports = {
  listLoaderVersions,
  toModloaderVersion,
};
