(function () {
  const FALLBACK = 'en';
  let currentLang = 'ko';

  function lookup(lang, key) {
    const dict = window.ZEUS_LOCALES[lang];
    return dict ? dict[key] : undefined;
  }

  function t(key, params) {
    const raw = lookup(currentLang, key) ?? lookup(FALLBACK, key) ?? key;
    if (!params) return raw;
    return raw.replace(/\{(\w+)\}/g, (_, name) => (params[name] !== undefined ? params[name] : `{${name}}`));
  }

  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      el.placeholder = t(el.dataset.i18nPlaceholder);
    });
    document.querySelectorAll('[data-i18n-title]').forEach((el) => {
      el.title = t(el.dataset.i18nTitle);
    });
  }

  function setLanguage(lang) {
    if (!window.ZEUS_LOCALES[lang]) return;
    currentLang = lang;
    document.documentElement.lang = lang;
    applyTranslations();
  }

  function getLanguage() {
    return currentLang;
  }

  function languages() {
    return Object.keys(window.ZEUS_LOCALES);
  }

  window.zeusI18n = { t, setLanguage, getLanguage, applyTranslations, languages };
})();
