const VERSION_MANIFEST_URL =
  'https://launchermeta.mojang.com/mc/game/version_manifest_v2.json';

async function fetchVersionManifest() {
  const res = await fetch(VERSION_MANIFEST_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch version manifest: ${res.status}`);
  }
  return res.json();
}

async function listVersions({ releasesOnly = true } = {}) {
  const manifest = await fetchVersionManifest();
  return releasesOnly
    ? manifest.versions.filter((v) => v.type === 'release')
    : manifest.versions;
}

module.exports = {
  fetchVersionManifest,
  listVersions,
};
