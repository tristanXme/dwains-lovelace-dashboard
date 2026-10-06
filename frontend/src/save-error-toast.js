import translateEngine from './translate-engine';
const { reportOutdatedPage, reportSaveError } = require('./save-error');

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
