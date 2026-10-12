import { showSaveError } from './save-error-toast';
const { hideItemWhileSaving } = require('./optimistic-item');

// Saves an on/off setting of an entity (hidden, disabled, excluded,
// hidden_in_area). With `target`, the clicked action's list item is hidden
// at once (see optimistic-item.js). A failure shows as a toast.
export function saveEntityBoolValue(hass, entityId, key, value, target = undefined) {
  return hideItemWhileSaving(target, () => hass.callWS({
    type: 'dwains_dashboard/edit_entity_bool_value',
    entityId,
    key,
    value,
  })).catch((err) => showSaveError(hass, err));
}
