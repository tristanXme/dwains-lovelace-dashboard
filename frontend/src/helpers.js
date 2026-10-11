import { selectTree } from "./card-tools-compat";
import {
  computeDomain
} from './frontend-helpers';
const { isDwainsElementName } = require('./custom-element-registration');
const { closeCardToolsPopup } = require('./popup-host');
const { isEditorTag, loadEditors } = require('./lazy-modules');

/** Create a Lovelace card, a Dwains card ready configured. */
export async function createCardElementSafe(cardHelpers, config, hassObj) {
  const tag = typeof config?.type === 'string'
    ? config.type.replace(/^custom:/, '')
    : '';

  if (isEditorTag(tag)) {
    try {
      await loadEditors();
    } catch (err) {
      console.error('Dwains Dashboard: failed to load the editors (reload the page after an update)', err);
    }
  }

  if (isDwainsElementName(tag) && customElements.get(tag)) {
    // Dwains cards and dialogs read hass in setConfig and some set up
    // asynchronously, so they get hass first and are awaited. An error
    // leaves it to Home Assistant, which shows it in an error card.
    try {
      const element = document.createElement(tag);
      if (hassObj) element.hass = hassObj;
      await element.setConfig(config);
      return element;
    } catch (err) {
      console.error(`Dwains Dashboard: failed to create ${tag}`, err);
    }
  }

  const element = await cardHelpers.createCardElement(config);
  if (hassObj) element.hass = hassObj;
  return element;
}

export async function closePopup() {
    return closeCardToolsPopup({ selectTree });
}

const normalizedName = (value) => typeof value === 'string' ? value.trim() : '';

/** Resolve one consistent display name for DD cards and popups. */
export function resolveEntityName(
  hassObj,
  configuration,
  entityId,
  entityRegistryEntry,
  deviceRegistryEntry,
) {
  const configuredName = normalizedName(
    configuration?.entities?.[entityId]?.friendly_name
  );
  const entityName = normalizedName(entityRegistryEntry?.name);
  const userDeviceName = normalizedName(deviceRegistryEntry?.name_by_user);
  const deviceName = normalizedName(deviceRegistryEntry?.name);
  const stateName = normalizedName(
    hassObj?.states?.[entityId]?.attributes?.friendly_name
  );
  const originalEntityName = normalizedName(entityRegistryEntry?.original_name);

  return configuredName
    || entityName
    || userDeviceName
    || deviceName
    || stateName
    || originalEntityName
    || entityId?.split('.').pop()?.replace(/_/g, ' ')
    || entityId;
}

const UNAVAILABLE = 'unavailable';
const UNKNOWN = 'unknown';

// Dates and times of input_datetime entities, in the user's language
// (a language code or hass.locale).
const formatDateParts = (date, language, options) => {
  try {
    const locale = typeof language === 'string' ? language : language?.language;
    return new Intl.DateTimeFormat(locale, options).format(date);
  } catch (error) {
    return new Intl.DateTimeFormat(undefined, options).format(date);
  }
};
const formatDate = (date, language) => formatDateParts(date, language, { dateStyle: 'medium' });
const formatTime = (date, language) => formatDateParts(date, language, { timeStyle: 'short' });
const formatDateTime = (date, language) => formatDateParts(date, language, { dateStyle: 'medium', timeStyle: 'short' });

export const myComputeStateDisplay = (
  localize,
  stateObj,
  language,
) => {

  if (stateObj.state === UNKNOWN || stateObj.state === UNAVAILABLE) {
    return localize(`state.default.${stateObj.state}`);
  }

  if (stateObj.attributes.unit_of_measurement) {
    return `${stateObj.state} ${stateObj.attributes.unit_of_measurement}`;
  }

  const domain = computeDomain(stateObj.entity_id);

  if (domain === 'input_datetime') {
    let date;
    if (!stateObj.attributes.has_time) {
      date = new Date(stateObj.attributes.year, stateObj.attributes.month - 1, stateObj.attributes.day);
      return formatDate(date, language);
    }
    if (!stateObj.attributes.has_date) {
      const now = new Date();
      date = new Date(
        // Due to bugs.chromium.org/p/chromium/issues/detail?id=797548
        // don't use artificial 1970 year.
        now.getFullYear(),
        now.getMonth(),
        now.getDay(),
        stateObj.attributes.hour,
        stateObj.attributes.minute,
      );
      return formatTime(date, language);
    }

    date = new Date(
      stateObj.attributes.year,
      stateObj.attributes.month - 1,
      stateObj.attributes.day,
      stateObj.attributes.hour,
      stateObj.attributes.minute,
    );
    return formatDateTime(date, language);
  }

  return (
    (stateObj?.translation_key &&
      localize(
        `component.${stateObj.platform}.entity.${domain}.${stateObj.translation_key}.state.${stateObj.state}`
      )) ||
    // Return device class translation
    (stateObj.attributes.device_class &&
      localize(
        `component.${domain}.entity_component.${stateObj.attributes.device_class}.state.${stateObj.state}`
      )) ||
    // Return default translation
    localize(`component.${domain}.entity_component._.state.${stateObj.state}`) ||
    // We don't know! Return the raw state.
    stateObj.state
  );
};
