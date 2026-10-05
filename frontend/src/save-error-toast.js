import translateEngine from './translate-engine';
const { reportSaveError } = require('./save-error');

// reportSaveError with the dashboard's strings.
export function showSaveError(hass, error) {
  reportSaveError(error, { translate: (key) => translateEngine(hass, key) });
}
