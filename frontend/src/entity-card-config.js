"use strict";

// The card of an entity and its size, the same on the homepage (favorites
// and area views) and on the devices page.

const SPAN_KEYS = Object.freeze([
  ["rowSpan", "row_span"],
  ["colSpan", "col_span"],
  ["rowSpanLg", "row_span_lg"],
  ["colSpanLg", "col_span_lg"],
  ["rowSpanXl", "row_span_xl"],
  ["colSpanXl", "col_span_xl"],
]);

// Home Assistant's cards for these device types; every other type gets a tile.
const DEVICE_TYPE_CARDS = Object.freeze({
  camera: () => ({ type: "picture-entity", camera_view: "auto" }),
  climate: () => ({
    type: "thermostat",
    features: [
      { type: "climate-fan-modes", fan_modes: ["quiet", "low", "medium", "high"] },
      { type: "climate-hvac-modes", hvac_modes: ["heat_cool", "heat", "dry", "fan_only", "cool", "off"] },
    ],
  }),
  cover: () => ({
    type: "tile",
    features: [{ type: "cover-open-close" }, { type: "cover-position" }],
  }),
  light: () => ({
    type: "tile",
    features: [{ type: "light-brightness" }],
  }),
});

function deviceTypeCard(domain, entityId, friendlyName) {
  const { type, ...rest } = (DEVICE_TYPE_CARDS[domain] || (() => ({ type: "tile" })))();
  return {
    entity: entityId,
    type,
    // A camera shows its picture without a name.
    ...(friendlyName && domain !== "camera" ? { name: friendlyName } : {}),
    ...rest,
  };
}

/**
 * The card configuration of an entity and its row and column spans.
 *
 * In this order: the entity's own card (when switched on), the card of its
 * device type, a sensor graph for sensors with a unit (unless the option
 * "Disable sensor graph" is on), else Home Assistant's card for the type.
 * Spans set for the entity win over the default (a camera takes 2 by 2).
 */
function entityCardConfig({ entityId, domain, friendlyName, configuration, stateObj }) {
  const settings = configuration?.entities?.[entityId];
  const ownCard = settings?.custom_card ? configuration?.entity_cards?.[entityId] : undefined;
  const typeCard = configuration?.devices_card?.[domain];
  let config;
  let defaultSpan = "1";
  if (ownCard) {
    config = { input_name: friendlyName, input_entity: entityId, ...ownCard };
  } else if (typeCard) {
    config = { input_name: friendlyName, input_entity: entityId, ...typeCard };
  } else if (
    domain === "sensor"
    && stateObj?.attributes?.unit_of_measurement
    && !configuration?.homepage_header?.disable_sensor_graph
  ) {
    config = {
      graph: "line",
      type: "sensor",
      hours_to_show: 24,
      detail: 1,
      entity: entityId,
      ...(friendlyName ? { name: friendlyName } : {}),
    };
  } else {
    config = deviceTypeCard(domain, entityId, friendlyName);
    if (domain === "camera") defaultSpan = "2";
  }
  const spans = {};
  for (const [key, setting] of SPAN_KEYS) {
    spans[key] = settings?.[setting] || defaultSpan;
  }
  return { config, spans };
}

module.exports = { entityCardConfig };
