const { t } = window.zeusI18n;

// ---------- Copy / drag protection ----------

document.addEventListener('dragstart', (e) => e.preventDefault());

document.addEventListener('copy', (e) => {
  const tag = e.target.tagName;
  if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
    e.preventDefault();
  }
});

document.addEventListener('contextmenu', (e) => e.preventDefault());

const tabButtons = document.querySelectorAll('.tab-btn');
const views = {
  home: document.getElementById('view-home'),
  instances: document.getElementById('view-instances'),
  modrinth: document.getElementById('view-modrinth'),
  changelog: document.getElementById('view-changelog'),
  settings: document.getElementById('view-settings'),
};

const accountBtn = document.getElementById('account-btn');
const accountPopover = document.getElementById('account-popover');
const accountNameEl = document.getElementById('account-name');
const accountList = document.getElementById('account-list');
const msLoginBtn = document.getElementById('ms-login-btn');

const instanceBtn = document.getElementById('instance-btn');
const instancePopover = document.getElementById('instance-popover');
const instanceNameEl = document.getElementById('instance-name');
const instanceQuickList = document.getElementById('instance-quick-list');

const newInstanceBtn = document.getElementById('new-instance-btn');
const instancesGrid = document.getElementById('instances-grid');
const newInstanceForm = document.getElementById('new-instance-form');
const newInstanceNameInput = document.getElementById('new-instance-name');
const createInstanceBtn = document.getElementById('create-instance-btn');
const cancelInstanceBtn = document.getElementById('cancel-instance-btn');

const newInstanceVersionSelect = window.createCustomSelect({ placeholder: t('instances.selectVersion') });
document.getElementById('new-instance-version').replaceWith(newInstanceVersionSelect.el);
newInstanceVersionSelect.el.id = 'new-instance-version';

const newInstanceModloaderSelect = window.createCustomSelect({});
document.getElementById('new-instance-modloader').replaceWith(newInstanceModloaderSelect.el);
newInstanceModloaderSelect.el.id = 'new-instance-modloader';
newInstanceModloaderSelect.setOptions([
  { value: 'vanilla', label: 'Vanilla' },
  { value: 'forge', label: 'Forge' },
  { value: 'fabric', label: 'Fabric' },
]);

const newInstanceLoaderVersionSelect = window.createCustomSelect({});
document.getElementById('new-instance-loader-version').replaceWith(newInstanceLoaderVersionSelect.el);
newInstanceLoaderVersionSelect.el.id = 'new-instance-loader-version';
newInstanceLoaderVersionSelect.setVisible(false);

const launchBtn = document.getElementById('launch-btn');
const launchLog = document.getElementById('launch-log');

const settingsLanguageSelect = document.getElementById('settings-language');
const settingsFontSelect = document.getElementById('settings-font');
const settingsCloseOnLaunchInput = document.getElementById('settings-close-on-launch');
const settingsMemoryMinInput = document.getElementById('settings-memory-min');
const settingsMemoryMaxInput = document.getElementById('settings-memory-max');
const settingsWindowWidthInput = document.getElementById('settings-window-width');
const settingsWindowHeightInput = document.getElementById('settings-window-height');
const settingsOpenFolderBtn = document.getElementById('settings-open-folder-btn');
const settingsCheckUpdateBtn = document.getElementById('settings-check-update-btn');
const settingsUpdateStatus = document.getElementById('settings-update-status');

const changelogList = document.getElementById('changelog-list');

const modrinthSearchInput = document.getElementById('modrinth-search-input');
const modrinthSearchBtn = document.getElementById('modrinth-search-btn');
const modrinthInstanceHint = document.getElementById('modrinth-instance-hint');
const modrinthResults = document.getElementById('modrinth-results');

const LANGUAGE_NAMES = {
  ko: '한국어',
  en: 'English',
  ja: '日本語',
  zh: '中文',
};

const FONT_OPTIONS = ['monocraft', 'system', 'mono'];
const FONT_LABEL_KEYS = {
  monocraft: 'settings.fontMonocraft',
  system: 'settings.fontSystem',
  mono: 'settings.fontMono',
};

const CHEVRON_SVG =
  '<svg viewBox="0 0 12 8" width="9" height="6"><path d="M1 1l5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const CHANGELOG_ICONS = {
  added:
    '<svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 1v10M1 6h10"/></svg>',
  removed:
    '<svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M1 6h10"/></svg>',
  fixed:
    '<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
};

let versionsLoaded = false;
let modrinthLoaded = false;
let modInstallEligible = false;
let lastModResults = null;
let activeInstanceForLaunch = null;
let currentView = 'home';
let isPlaying = false;

// ---------- Custom scrollbars ----------

window.attachCustomScrollbar(accountList, { maxHeight: '220px' });
window.attachCustomScrollbar(instanceQuickList, { maxHeight: '240px' });
window.attachCustomScrollbar(changelogList, { flex: true });

// ---------- Discord presence ----------

const DISCORD_VIEW_LABELS = {
  home: () => 'Idle',
  instances: () => t('nav.instances'),
  modrinth: () => 'Modrinth',
  changelog: () => t('nav.changelog'),
  settings: () => t('nav.settings'),
};

function pushViewPresence(view) {
  const labelFn = DISCORD_VIEW_LABELS[view];
  window.zeus.discord.updatePresence({
    details: 'Zeus Launcher',
    state: labelFn ? labelFn() : view,
    playing: false,
  });
}

// ---------- Tabs ----------

function switchView(name) {
  currentView = name;
  tabButtons.forEach((btn) => btn.classList.toggle('active', btn.dataset.view === name));
  Object.entries(views).forEach(([key, el]) => el.classList.toggle('hidden', key !== name));
  if (!isPlaying) pushViewPresence(name);
}

tabButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    switchView(btn.dataset.view);
    if (btn.dataset.view === 'modrinth' && !modrinthLoaded) {
      modrinthLoaded = true;
      searchModrinth();
    }
  });
});

// ---------- Popovers ----------

function closePopovers(except) {
  [accountPopover, instancePopover].forEach((el) => {
    if (el !== except) el.classList.add('hidden');
  });
}

accountBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  const willOpen = accountPopover.classList.contains('hidden');
  closePopovers();
  accountPopover.classList.toggle('hidden', !willOpen);
});

instanceBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  const willOpen = instancePopover.classList.contains('hidden');
  closePopovers();
  instancePopover.classList.toggle('hidden', !willOpen);
});

document.addEventListener('click', () => {
  closePopovers();
  closeRowMenus();
});
accountPopover.addEventListener('click', (e) => {
  e.stopPropagation();
  closeRowMenus();
});
instancePopover.addEventListener('click', (e) => e.stopPropagation());

// ---------- Accounts ----------

function accountTypeLabel() {
  return 'Microsoft';
}

function closeRowMenus(except) {
  document.querySelectorAll('.row-menu.open').forEach((el) => {
    if (el !== except) {
      el.classList.remove('open');
      el.querySelector('.row-menu-list').classList.add('hidden');
    }
  });
}

function renderAccountRows(accounts, activeUuid) {
  if (accounts.length === 0) {
    accountList.innerHTML = `<div class="empty-hint">${t('home.accountEmpty')}</div>`;
    return;
  }

  accountList.innerHTML = accounts
    .map(
      (acc) => `
        <div class="row-item ${acc.uuid === activeUuid ? 'active' : ''}">
          <div class="row-item-label">
            <strong>${acc.name}</strong>
            <small>${accountTypeLabel()}</small>
          </div>
          <div class="row-item-actions">
            <button class="btn select-account-btn" data-uuid="${acc.uuid}">${t('home.select')}</button>
            <div class="row-menu">
              <button class="btn row-menu-trigger" data-uuid="${acc.uuid}">
                ${t('home.moreActions')}
                <span class="row-menu-chevron">${CHEVRON_SVG}</span>
              </button>
              <div class="row-menu-list hidden">
                <button class="row-menu-item" data-action="skin-change" data-uuid="${acc.uuid}">${t('home.skinChange')}</button>
                <button class="row-menu-item" data-action="skin-reset" data-uuid="${acc.uuid}">${t('home.skinReset')}</button>
                <button class="row-menu-item row-menu-item-danger" data-action="remove" data-uuid="${acc.uuid}">${t('home.remove')}</button>
              </div>
            </div>
          </div>
        </div>`,
    )
    .join('');
}

async function refreshAuthUI() {
  const { account, accounts } = await window.zeus.auth.status();
  accountNameEl.textContent = account ? account.name : t('home.accountNone');
  renderAccountRows(accounts, account ? account.uuid : null);
}

accountList.addEventListener('click', async (e) => {
  e.stopPropagation();
  const selectBtn = e.target.closest('.select-account-btn');
  const menuTrigger = e.target.closest('.row-menu-trigger');
  const menuItem = e.target.closest('.row-menu-item');
  const currentMenu = menuTrigger ? menuTrigger.closest('.row-menu') : null;

  closeRowMenus(currentMenu);

  if (selectBtn) {
    await window.zeus.auth.setActiveAccount(selectBtn.dataset.uuid);
    await refreshAuthUI();
    return;
  }

  if (menuTrigger) {
    const isOpen = currentMenu.classList.contains('open');
    currentMenu.classList.toggle('open', !isOpen);
    currentMenu.querySelector('.row-menu-list').classList.toggle('hidden', isOpen);
    return;
  }

  if (menuItem) {
    const uuid = menuItem.dataset.uuid;
    const action = menuItem.dataset.action;

    if (action === 'remove') {
      if (!confirm(t('home.confirmRemove'))) return;
      await window.zeus.auth.removeAccount(uuid);
      await refreshAuthUI();
    } else if (action === 'skin-change') {
      try {
        const result = await window.zeus.skin.change(uuid, 'classic');
        showToast(result ? t('status.skinChanged') : t('status.cancelled'), { type: result ? 'success' : 'info' });
      } catch (err) {
        showToast(t('toast.skinChangeFailed', { message: err.message }), { type: 'error' });
      }
    } else if (action === 'skin-reset') {
      try {
        await window.zeus.skin.reset(uuid);
        showToast(t('status.skinReset'), { type: 'success' });
      } catch (err) {
        showToast(t('toast.skinResetFailed', { message: err.message }), { type: 'error' });
      }
    }
  }
});

msLoginBtn.addEventListener('click', async () => {
  try {
    await window.zeus.auth.addMicrosoftAccount();
    await refreshAuthUI();
  } catch (err) {
    showToast(t('toast.msLoginFailed', { message: err.message }), { type: 'error' });
  }
});

// ---------- Instances ----------

function instanceMeta(instance) {
  return `${instance.version.number} · ${instance.modloader.type}`;
}

function renderInstanceQuickList(instances, activeId) {
  if (instances.length === 0) {
    instanceQuickList.innerHTML = `<div class="empty-hint">${t('home.instanceEmptyHint')}</div>`;
    return;
  }

  instanceQuickList.innerHTML = instances
    .map(
      (inst) => `
        <div class="row-item ${inst.id === activeId ? 'active' : ''}">
          <div class="row-item-label">
            <strong>${inst.name}</strong>
            <small>${instanceMeta(inst)}</small>
          </div>
          <div class="row-item-actions">
            <button class="btn select-instance-btn" data-id="${inst.id}">${t('home.select')}</button>
          </div>
        </div>`,
    )
    .join('');
}

function renderInstanceGrid(instances, activeId) {
  if (instances.length === 0) {
    instancesGrid.innerHTML = `<div class="empty-hint">${t('instances.empty')}</div>`;
    return;
  }

  instancesGrid.innerHTML = instances
    .map(
      (inst) => `
        <div class="instance-card ${inst.id === activeId ? 'active' : ''}">
          <div class="instance-card-title">${inst.name}</div>
          <div class="instance-card-meta">${instanceMeta(inst)}</div>
          <div class="instance-card-actions">
            <button class="btn select-instance-btn" data-id="${inst.id}">${t('home.select')}</button>
            <button class="btn btn-danger remove-instance-btn" data-id="${inst.id}">${t('home.remove')}</button>
          </div>
        </div>`,
    )
    .join('');
}

async function refreshInstancesUI() {
  const { instances, activeInstanceId } = await window.zeus.instances.list();
  const active = instances.find((i) => i.id === activeInstanceId);
  activeInstanceForLaunch = active ?? null;
  instanceNameEl.textContent = active ? active.name : t('home.instanceNone');
  renderInstanceQuickList(instances, activeInstanceId);
  renderInstanceGrid(instances, activeInstanceId);
  refreshModrinthEligibility(active);
}

async function handleInstanceListClick(e) {
  const selectBtn = e.target.closest('.select-instance-btn');
  const removeBtn = e.target.closest('.remove-instance-btn');
  if (selectBtn) {
    await window.zeus.instances.setActive(selectBtn.dataset.id);
    await refreshInstancesUI();
  } else if (removeBtn) {
    await window.zeus.instances.remove(removeBtn.dataset.id);
    await refreshInstancesUI();
  }
}

instanceQuickList.addEventListener('click', handleInstanceListClick);
instancesGrid.addEventListener('click', handleInstanceListClick);

async function ensureVersionsLoaded() {
  if (versionsLoaded) return;
  const versions = await window.zeus.versions.list();
  newInstanceVersionSelect.setOptions(versions.map((v) => ({ value: v.id, label: v.id })));
  versionsLoaded = true;
}

async function refreshLoaderVersionOptions() {
  const type = newInstanceModloaderSelect.value;
  const minecraftVersion = newInstanceVersionSelect.value;

  if (type === 'vanilla' || !minecraftVersion) {
    newInstanceLoaderVersionSelect.setOptions([]);
    newInstanceLoaderVersionSelect.setVisible(false);
    return;
  }

  newInstanceLoaderVersionSelect.setVisible(true);
  newInstanceLoaderVersionSelect.setOptions([]);
  newInstanceLoaderVersionSelect.setPlaceholder(t('instances.loaderLoading'));
  newInstanceLoaderVersionSelect.setDisabled(true);

  try {
    const loaderVersions = await window.zeus.modloader.listVersions(type, minecraftVersion);
    newInstanceLoaderVersionSelect.setOptions(loaderVersions.map((v) => ({ value: v, label: v })));
  } catch (err) {
    newInstanceLoaderVersionSelect.setOptions([]);
    newInstanceLoaderVersionSelect.setPlaceholder(t('instances.loaderFailed'));
    showToast(t('toast.loaderVersionsFailed', { message: err.message }), { type: 'error' });
  } finally {
    newInstanceLoaderVersionSelect.setDisabled(false);
  }
}

newInstanceModloaderSelect.onChange(refreshLoaderVersionOptions);
newInstanceVersionSelect.onChange(refreshLoaderVersionOptions);

newInstanceBtn.addEventListener('click', async () => {
  await ensureVersionsLoaded();
  newInstanceForm.classList.remove('hidden');
  await refreshLoaderVersionOptions();
});

cancelInstanceBtn.addEventListener('click', () => {
  newInstanceForm.classList.add('hidden');
  newInstanceNameInput.value = '';
  newInstanceLoaderVersionSelect.setVisible(false);
  newInstanceLoaderVersionSelect.setOptions([]);
});

createInstanceBtn.addEventListener('click', async () => {
  const name = newInstanceNameInput.value.trim();
  const modloaderType = newInstanceModloaderSelect.value;
  if (!name || !newInstanceVersionSelect.value) return;
  if (modloaderType !== 'vanilla' && !newInstanceLoaderVersionSelect.value) return;

  try {
    await window.zeus.instances.create({
      name,
      version: { number: newInstanceVersionSelect.value, type: 'release' },
      modloader: {
        type: modloaderType,
        loaderVersion: modloaderType !== 'vanilla' ? newInstanceLoaderVersionSelect.value : undefined,
      },
    });
  } catch (err) {
    showToast(t('toast.instanceCreateFailed', { message: err.message }), { type: 'error' });
    return;
  }

  newInstanceForm.classList.add('hidden');
  newInstanceNameInput.value = '';
  newInstanceLoaderVersionSelect.setVisible(false);
  newInstanceLoaderVersionSelect.setOptions([]);
  await refreshInstancesUI();
});

// ---------- Modrinth ----------

function formatDownloads(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n ?? 0);
}

function refreshModrinthEligibility(active) {
  modInstallEligible = !!active && active.modloader && ['forge', 'fabric'].includes(active.modloader.type);

  if (!active) {
    modrinthInstanceHint.textContent = t('modrinth.noInstance');
    modrinthInstanceHint.classList.remove('hidden');
  } else if (!modInstallEligible) {
    modrinthInstanceHint.textContent = t('modrinth.vanillaBlocked', { name: active.name });
    modrinthInstanceHint.classList.remove('hidden');
  } else {
    modrinthInstanceHint.classList.add('hidden');
  }

  modrinthResults.querySelectorAll('.mod-install-btn').forEach((btn) => {
    btn.disabled = !modInstallEligible;
  });
}

function renderModResults(mods) {
  if (mods.length === 0) {
    modrinthResults.innerHTML = `<div class="empty-hint">${t('modrinth.empty')}</div>`;
    return;
  }

  modrinthResults.innerHTML = mods
    .map(
      (mod) => `
        <div class="mod-card">
          <img class="mod-card-icon" src="${mod.iconUrl ?? ''}" alt="" loading="lazy" />
          <div class="mod-card-body">
            <div class="mod-card-title">${mod.title}</div>
            <div class="mod-card-author">${mod.author ?? ''}</div>
            <div class="mod-card-desc">${mod.description ?? ''}</div>
            <div class="mod-card-footer">
              <span class="mod-card-downloads">${formatDownloads(mod.downloads)} ${t('modrinth.downloads')}</span>
              <button
                class="btn btn-primary mod-install-btn"
                data-id="${mod.id}"
                ${modInstallEligible ? '' : 'disabled'}
              >${t('modrinth.install')}</button>
            </div>
          </div>
        </div>`,
    )
    .join('');
}

async function searchModrinth() {
  modrinthResults.innerHTML = `<div class="empty-hint">${t('modrinth.searching')}</div>`;
  try {
    const mods = await window.zeus.modrinth.search(modrinthSearchInput.value.trim());
    lastModResults = mods;
    renderModResults(mods);
  } catch (err) {
    modrinthResults.innerHTML = '';
    lastModResults = null;
    showToast(t('toast.modrinthSearchFailed', { message: err.message }), { type: 'error' });
  }
}

modrinthSearchBtn.addEventListener('click', searchModrinth);
modrinthSearchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') searchModrinth();
});

modrinthResults.addEventListener('click', async (e) => {
  const btn = e.target.closest('.mod-install-btn');
  if (!btn || btn.disabled) return;
  if (!modInstallEligible) {
    showToast(t('modrinth.vanillaBlockedShort'), { type: 'error' });
    return;
  }

  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = t('modrinth.installing');
  try {
    await window.zeus.modrinth.install(btn.dataset.id);
    showToast(t('toast.modInstalled'), { type: 'success' });
  } catch (err) {
    showToast(t('toast.modInstallFailed', { message: err.message }), { type: 'error' });
  } finally {
    btn.disabled = !modInstallEligible;
    btn.textContent = originalText;
  }
});

// ---------- Launch ----------

launchBtn.addEventListener('click', async () => {
  try {
    await window.zeus.launch.start();
    isPlaying = true;
    if (activeInstanceForLaunch) {
      const loaderType = activeInstanceForLaunch.modloader.type;
      const loaderLabel = loaderType.charAt(0).toUpperCase() + loaderType.slice(1);
      window.zeus.discord.updatePresence({
        details: activeInstanceForLaunch.name,
        state: `${loaderLabel} · ${activeInstanceForLaunch.version.number}`,
        playing: true,
      });
    }
  } catch (err) {
    showToast(t('toast.launchFailed', { message: err.message }), { type: 'error' });
  }
});

window.zeus.launch.onLog((line) => {
  launchLog.textContent += `${line}\n`;
  launchLog.scrollTop = launchLog.scrollHeight;
});

window.zeus.launch.onExit((code) => {
  launchLog.textContent += `\n${t('launch.exited', { code })}\n`;
  isPlaying = false;
  pushViewPresence(currentView);
});

// ---------- Settings ----------

function populateLanguageOptions() {
  settingsLanguageSelect.innerHTML = window.zeusI18n
    .languages()
    .map((code) => `<option value="${code}">${LANGUAGE_NAMES[code] ?? code}</option>`)
    .join('');
}

function populateFontOptions() {
  const current = settingsFontSelect.value;
  settingsFontSelect.innerHTML = FONT_OPTIONS.map(
    (code) => `<option value="${code}">${t(FONT_LABEL_KEYS[code])}</option>`,
  ).join('');
  if (current) settingsFontSelect.value = current;
}

function applyFont(font) {
  if (font && font !== 'monocraft') {
    document.body.dataset.font = font;
  } else {
    delete document.body.dataset.font;
  }
}

async function initSettings() {
  populateLanguageOptions();
  const settings = await window.zeus.settings.get();
  settingsLanguageSelect.value = settings.language;
  populateFontOptions();
  settingsFontSelect.value = settings.font;
  settingsCloseOnLaunchInput.checked = settings.closeOnLaunch;
  settingsMemoryMinInput.value = settings.memory.min;
  settingsMemoryMaxInput.value = settings.memory.max;
  settingsWindowWidthInput.value = settings.windowSize.width;
  settingsWindowHeightInput.value = settings.windowSize.height;
  window.zeusI18n.setLanguage(settings.language);
  applyFont(settings.font);
}

settingsLanguageSelect.addEventListener('change', async () => {
  window.zeusI18n.setLanguage(settingsLanguageSelect.value);
  await window.zeus.settings.set({ language: settingsLanguageSelect.value });
  populateFontOptions();
  await refreshAuthUI();
  await refreshInstancesUI();
  renderChangelog();
  if (lastModResults) renderModResults(lastModResults);
  showToast(t('toast.settingsSaved'), { type: 'success' });
});

settingsFontSelect.addEventListener('change', async () => {
  applyFont(settingsFontSelect.value);
  await window.zeus.settings.set({ font: settingsFontSelect.value });
  showToast(t('toast.settingsSaved'), { type: 'success' });
});

settingsCloseOnLaunchInput.addEventListener('change', async () => {
  await window.zeus.settings.set({ closeOnLaunch: settingsCloseOnLaunchInput.checked });
  showToast(t('toast.settingsSaved'), { type: 'success' });
});

async function saveMemorySettings() {
  const min = parseInt(settingsMemoryMinInput.value, 10);
  const max = parseInt(settingsMemoryMaxInput.value, 10);
  if (!Number.isFinite(min) || !Number.isFinite(max) || min <= 0 || max <= 0 || min > max) {
    showToast(t('toast.memoryInvalid'), { type: 'error' });
    return;
  }
  await window.zeus.settings.set({ memory: { min, max } });
  showToast(t('toast.settingsSaved'), { type: 'success' });
}

settingsMemoryMinInput.addEventListener('change', saveMemorySettings);
settingsMemoryMaxInput.addEventListener('change', saveMemorySettings);

async function saveWindowSizeSettings() {
  const width = parseInt(settingsWindowWidthInput.value, 10);
  const height = parseInt(settingsWindowHeightInput.value, 10);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    showToast(t('toast.windowSizeInvalid'), { type: 'error' });
    return;
  }
  await window.zeus.settings.set({ windowSize: { width, height } });
  showToast(t('toast.settingsSaved'), { type: 'success' });
}

settingsWindowWidthInput.addEventListener('change', saveWindowSizeSettings);
settingsWindowHeightInput.addEventListener('change', saveWindowSizeSettings);

settingsOpenFolderBtn.addEventListener('click', async () => {
  try {
    await window.zeus.shell.openGameDirectory();
  } catch (err) {
    showToast(t('toast.openFolderFailed', { message: err.message }), { type: 'error' });
  }
});

// ---------- Auto update ----------

settingsCheckUpdateBtn.addEventListener('click', () => {
  window.zeus.update.check();
});

window.zeus.update.onChecking(() => {
  settingsUpdateStatus.textContent = t('update.checking');
});

window.zeus.update.onNotAvailable(() => {
  settingsUpdateStatus.textContent = t('update.upToDate');
});

window.zeus.update.onAvailable(({ version }) => {
  settingsUpdateStatus.textContent = t('update.available', { version });
});

window.zeus.update.onProgress(({ percent }) => {
  settingsUpdateStatus.textContent = t('update.downloading', { percent: Math.round(percent) });
});

window.zeus.update.onDownloaded(() => {
  settingsUpdateStatus.textContent = t('update.readyRestart');
  showToast(t('update.readyRestart'), {
    type: 'success',
    duration: 0,
    action: {
      label: t('update.restartNow'),
      onClick: () => window.zeus.update.install(),
    },
  });
});

window.zeus.update.onError(({ message }) => {
  settingsUpdateStatus.textContent = t('update.error', { message });
});

// ---------- Changelog ----------

function changelogEntryText(entry) {
  const lang = window.zeusI18n.getLanguage();
  return entry.text[lang] ?? entry.text.en ?? entry.text.ko;
}

const changelogOpenState = new Set([0]);

function renderChangelog() {
  changelogList.innerHTML = window.ZEUS_CHANGELOG.map((release, index) => {
    const isOpen = changelogOpenState.has(index);
    return `
      <div class="changelog-version ${isOpen ? 'open' : ''}" data-index="${index}">
        <button type="button" class="changelog-version-title">
          <span class="changelog-version-chevron">${CHEVRON_SVG}</span>
          <span>${release.version}</span>
          <span class="changelog-date">${release.date}</span>
          <span class="changelog-count">${release.entries.length}</span>
        </button>
        <ul class="changelog-entries ${isOpen ? '' : 'hidden'}">
          ${release.entries
            .map(
              (entry) => `
                <li class="changelog-entry changelog-${entry.type}">
                  <span class="changelog-icon">${CHANGELOG_ICONS[entry.type] ?? ''}</span>
                  <span class="changelog-text">${changelogEntryText(entry)}</span>
                </li>`,
            )
            .join('')}
        </ul>
      </div>`;
  }).join('');
}

changelogList.addEventListener('click', (e) => {
  const header = e.target.closest('.changelog-version-title');
  if (!header) return;
  const versionEl = header.closest('.changelog-version');
  const index = Number(versionEl.dataset.index);
  if (changelogOpenState.has(index)) {
    changelogOpenState.delete(index);
  } else {
    changelogOpenState.add(index);
  }
  versionEl.classList.toggle('open');
  versionEl.querySelector('.changelog-entries').classList.toggle('hidden');
});

// ---------- Init ----------

initSettings().then(() => {
  refreshAuthUI();
  refreshInstancesUI();
  renderChangelog();
  pushViewPresence(currentView);
});
