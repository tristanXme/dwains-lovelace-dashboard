import en from './translations/en.json';
const { loadedLanguage, requestLanguage, stringsWhileLoading } = require('./language-loader');

//From Mini Media Player, Credits to Kalkih

const DEFAULT_LANG = 'en';

const getNestedProp = (obj, path) => path.split('.').reduce((p, c) => p && p[c] || null, obj);

// English is bundled; other languages are loaded on first use.
const strings = (code) => {
  if (code === DEFAULT_LANG) return en;
  const loaded = loadedLanguage(code);
  if (!loaded) requestLanguage(code);
  return loaded;
};

const translation = (hass, label, hassLabel = undefined, fallback = 'unknown') => {
  const lang = hass.selectedLanguage || hass.language || hass.locale && hass.locale.language || DEFAULT_LANG;
  const l639 = lang.split('-')[0];
  return getNestedProp(strings(lang), label)
    || hass && hass.resources && hass.resources[lang] && hass.resources[lang][hassLabel]
    || l639 !== lang && getNestedProp(strings(l639), label)
    || getNestedProp(stringsWhileLoading([lang, l639]), label)
    || getNestedProp(en, label)
    || fallback;
};

export default translation;
