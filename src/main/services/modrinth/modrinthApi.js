const API_BASE = 'https://api.modrinth.com/v2';
const USER_AGENT = 'zeus-launcher/0.1.0 (github.com/zeus-launcher)';

async function searchMods({ query = '', loader, gameVersion, limit = 20, offset = 0 } = {}) {
  const facets = [['project_type:mod']];
  if (loader) facets.push([`categories:${loader}`]);
  if (gameVersion) facets.push([`versions:${gameVersion}`]);

  const url = new URL(`${API_BASE}/search`);
  url.searchParams.set('query', query);
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('offset', String(offset));
  url.searchParams.set('facets', JSON.stringify(facets));

  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) {
    throw new Error(`Modrinth search failed: ${res.status}`);
  }
  const data = await res.json();

  return data.hits.map((hit) => ({
    id: hit.project_id,
    slug: hit.slug,
    title: hit.title,
    description: hit.description,
    iconUrl: hit.icon_url || null,
    downloads: hit.downloads,
    author: hit.author,
  }));
}

async function getCompatibleVersion(projectId, { loader, gameVersion } = {}) {
  const url = new URL(`${API_BASE}/project/${projectId}/version`);
  if (loader) {
    url.searchParams.set('loaders', JSON.stringify([loader]));
  }
  if (gameVersion) {
    url.searchParams.set('game_versions', JSON.stringify([gameVersion]));
  }

  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) {
    throw new Error(`Failed to fetch mod versions: ${res.status}`);
  }
  const versions = await res.json();
  if (versions.length === 0) {
    throw new Error('No compatible version found for this instance.');
  }
  return versions[0];
}

module.exports = {
  searchMods,
  getCompatibleVersion,
};
