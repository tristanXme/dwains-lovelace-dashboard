import translateEngine from './translate-engine';

const ENGLISH = { language: 'en' };

// Name of a device type (an entity domain): the dashboard's own string in
// the user's language, else Home Assistant's name for the domain, which is
// translated too ("Datum/Uhrzeit"), else the dashboard's English string, else
// the domain itself, so a type the dashboard does not know is not called
// "unknown".
export function deviceTypeName(hass, domain) {
  const own = translateEngine(hass, `device.${domain}`, undefined, '');
  const language = hass?.selectedLanguage || hass?.language || hass?.locale?.language || 'en';
  // A string missing in the user's language falls back to English.
  if (own && (language.startsWith('en') || own !== translateEngine(ENGLISH, `device.${domain}`, undefined, ''))) {
    return own;
  }
  return hass?.localize?.(`component.${domain}.entity_component._.name`)
    || hass?.localize?.(`component.${domain}.title`)
    || own
    || String(domain).replace(/_/g, ' ');
}
