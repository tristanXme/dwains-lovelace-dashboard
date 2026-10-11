import translateEngine from './translate-engine';

// The title of an edit dialog, naming what is edited ("Wohnzimmer bearbeiten").
export function editTitle(hass, name) {
  return translateEngine(hass, 'global.edit_named').replace('{name}', name);
}

export function entityEditTitle(hass, entityId) {
  return editTitle(hass, hass.states?.[entityId]?.attributes?.friendly_name || entityId);
}
