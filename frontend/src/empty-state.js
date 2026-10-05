"use strict";

// What the homepage and the devices page show when they have nothing to list,
// and a safe selection for an empty list.

// The selected id, or the first one, or "" when there is none.
function initialSelection(current, ids) {
  if (typeof current === "string" && current.length) return current;
  return ids.find((id) => typeof id === "string" && id.length) ?? "";
}

// undefined while there are areas to show; otherwise why there are none.
function homepageEmptyReason({ areas, disabledAreas, data }) {
  if (data?.length) return undefined;
  if (!areas?.length) return "no_areas";
  if (disabledAreas?.length && disabledAreas.length >= areas.length) return "all_areas_disabled";
  return "no_entities";
}

// undefined while there are device types to show; otherwise why there are none.
function devicesEmptyReason({ data, disabledDevices }) {
  if (data && Object.keys(data).length) return undefined;
  if (disabledDevices?.length) return "all_domains_hidden";
  return "no_entities";
}

// Translation keys of the message for a reason.
const EMPTY_STATE_TEXTS = Object.freeze({
  no_areas: { title: "area.empty_no_areas", hint: "area.empty_no_areas_hint", icon: "mdi:floor-plan" },
  all_areas_disabled: { title: "area.empty_all_disabled", hint: "area.empty_all_disabled_hint", icon: "mdi:eye-off-outline" },
  no_entities: { title: "area.empty_no_entities", hint: "area.empty_no_entities_hint", icon: "mdi:devices" },
  all_domains_hidden: { title: "device.empty_all_hidden", hint: "device.empty_all_hidden_hint", icon: "mdi:eye-off-outline" },
  no_devices: { title: "device.empty_no_entities", hint: "device.empty_no_entities_hint", icon: "mdi:devices" },
});

function emptyStateTexts(page, reason) {
  if (!reason) return undefined;
  if (page === "devices" && reason === "no_entities") return EMPTY_STATE_TEXTS.no_devices;
  return EMPTY_STATE_TEXTS[reason];
}

module.exports = { devicesEmptyReason, emptyStateTexts, homepageEmptyReason, initialSelection };
