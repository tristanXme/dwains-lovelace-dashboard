import translateEngine from './translate-engine';
const { reportOutdatedPage, reportSaveError } = require('./save-error');
const { confirmDelete } = require('./confirm-delete');

// reportSaveError with the dashboard's strings.
export function showSaveError(hass, error) {
  reportSaveError(error, { translate: (key) => translateEngine(hass, key) });
}

// reportOutdatedPage with the dashboard's strings; Home Assistant's own
// "Refresh" for the button where it has one.
export function showReloadHint() {
  const hass = document.querySelector('home-assistant')?.hass;
  if (!hass) return;
  const refresh = hass.localize?.('ui.common.refresh');
  reportOutdatedPage({
    translate: (key) => translateEngine(hass, key),
    ...(refresh ? { refreshText: refresh } : {}),
  });
}

// confirmDelete with the dashboard's strings: true when the user agrees.
export function askDelete(hass, name) {
  return confirmDelete(name, { translate: (key) => translateEngine(hass, key) });
}

// The editor saves a more page with the content it shows, so a page that uses
// !include or a template would lose them: ask first. true when there is
// nothing to ask or the user agrees.
export function confirmTemplatedEdit(hass, page) {
  if (!page?.templated || typeof globalThis.confirm !== 'function') return true;
  return Boolean(globalThis.confirm(translateEngine(hass, 'more.edit_templated')));
}
