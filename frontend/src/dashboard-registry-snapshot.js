"use strict";

const { websocketReadStore } = require("./websocket-read-store");
const { buildRegistryIndexes } = require("./registry-indexes");
const { READ_MESSAGES } = require("./websocket-read-messages");

// Home Assistant keeps the registries in the browser (hass.entities,
// hass.devices, hass.areas, hass.floors) and replaces them on every change.
// Reading them there avoids downloading the full lists, which are several MB
// on large installations. Devices, areas and floors are the same entries the
// list commands return. Entities come in HA's display form and are mapped to
// the fields the dashboard reads; disabled entities are not part of it.
// Without these objects (unexpected on supported HA versions) the lists are
// downloaded as before.

const valuesOf = (registry) => (registry && typeof registry === "object" ? Object.values(registry) : undefined);

// The display entry's name is the user-set name, else the integration's
// name. A user-set name is also exactly the friendly name; the integration's
// name usually is not (device name in front, or translated). Where both are
// the same, the dashboard's name order gives the same result either way
// unless the entity has a device.
function entityFromDisplayEntry(entry, states) {
  const friendlyName = states?.[entry.entity_id]?.attributes?.friendly_name;
  const userNamed = entry.name != null && friendlyName === entry.name;
  return {
    ...entry,
    device_id: entry.device_id ?? null,
    area_id: entry.area_id ?? null,
    name: userNamed ? entry.name : null,
    original_name: userNamed ? null : (entry.name ?? null),
    hidden_by: entry.hidden ? "user" : null,
  };
}

function registriesFromHass(hass) {
  const entities = valuesOf(hass?.entities);
  const devices = valuesOf(hass?.devices);
  const areas = valuesOf(hass?.areas);
  if (!entities || !devices || !areas) return undefined;
  return {
    entities: entities.map((entry) => entityFromDisplayEntry(entry, hass.states)),
    devices,
    areas,
    floors: valuesOf(hass.floors),
  };
}

async function loadDashboardCoreSnapshot(
  hass,
  { optionalRegistries = false, readStore = websocketReadStore } = {},
) {
  const fromHass = registriesFromHass(hass);
  const readRegistry = optionalRegistries
    ? (message) => readStore.readOptional(hass, message, [])
    : (message) => readStore.read(hass, message);
  const [devices, entities, configuration] = await Promise.all([
    fromHass ? fromHass.devices : readRegistry(READ_MESSAGES.devices),
    fromHass ? fromHass.entities : readRegistry(READ_MESSAGES.entities),
    readStore.read(hass, READ_MESSAGES.configuration),
  ]);
  return {
    devices,
    entities,
    configuration,
    ...buildRegistryIndexes(devices, entities),
  };
}

async function loadDashboardRegistrySnapshot(
  hass,
  { includeFloors = false, readStore = websocketReadStore } = {},
) {
  const fromHass = registriesFromHass(hass);
  const reads = [
    fromHass ? fromHass.areas : readStore.read(hass, READ_MESSAGES.areas),
    loadDashboardCoreSnapshot(hass, { readStore }),
  ];
  if (includeFloors) {
    reads.push(fromHass?.floors ?? readStore.readOptional(hass, READ_MESSAGES.floors, []));
  }

  const [areas, core, floors] = await Promise.all(reads);
  return {
    areas,
    ...core,
    ...(includeFloors ? {
      floors,
      floorsById: new Map((floors || []).map((floor) => [floor.floor_id, floor])),
    } : {}),
  };
}

module.exports = {
  entityFromDisplayEntry,
  loadDashboardCoreSnapshot,
  loadDashboardRegistrySnapshot,
};
