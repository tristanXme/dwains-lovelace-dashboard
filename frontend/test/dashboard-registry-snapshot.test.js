"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const {
  entityFromDisplayEntry,
  loadDashboardRegistrySnapshot,
} = require("../src/dashboard-registry-snapshot");

const states = {
  "sensor.renamed": { attributes: { friendly_name: "My sensor" } },
  "sensor.device_named": { attributes: { friendly_name: "Thermostat Temperature" } },
  "sensor.plain": { attributes: { friendly_name: "Plain" } },
};

test("a user-set name stays the entity name", () => {
  const entity = entityFromDisplayEntry({ entity_id: "sensor.renamed", name: "My sensor", has_entity_name: true }, states);
  assert.equal(entity.name, "My sensor");
  assert.equal(entity.original_name, null);
});

test("the integration's name becomes the original name", () => {
  const entity = entityFromDisplayEntry({ entity_id: "sensor.device_named", name: "Temperature", has_entity_name: true, device_id: "d1" }, states);
  assert.equal(entity.name, null);
  assert.equal(entity.original_name, "Temperature");
  assert.equal(entity.device_id, "d1");
  assert.equal(entity.area_id, null);
});

test("hidden entities keep their hidden mark", () => {
  assert.equal(entityFromDisplayEntry({ entity_id: "sensor.plain", hidden: true }, states).hidden_by, "user");
  assert.equal(entityFromDisplayEntry({ entity_id: "sensor.plain" }, states).hidden_by, null);
});

const readStore = (reads) => ({
  read: async (_hass, message) => {
    reads.push(message.type);
    return message.type === "dwains_dashboard/configuration/get" ? { areas: {} } : [];
  },
  readOptional: async (_hass, message) => {
    reads.push(message.type);
    return [];
  },
});

test("registries come from hass without downloading the lists", async () => {
  const reads = [];
  const hass = {
    states,
    entities: { "sensor.plain": { entity_id: "sensor.plain", area_id: "living" } },
    devices: { d1: { id: "d1", area_id: "living" } },
    areas: { living: { area_id: "living", name: "Living" } },
    floors: { ground: { floor_id: "ground", name: "Ground" } },
  };
  const snapshot = await loadDashboardRegistrySnapshot(hass, { includeFloors: true, readStore: readStore(reads) });
  assert.deepEqual(reads, ["dwains_dashboard/configuration/get"]);
  assert.deepEqual(snapshot.areas.map((area) => area.area_id), ["living"]);
  assert.equal(snapshot.entitiesByAreaId.get("living")[0].entity_id, "sensor.plain");
  assert.equal(snapshot.devicesById.get("d1").area_id, "living");
  assert.equal(snapshot.floorsById.get("ground").name, "Ground");
});

test("without hass registries the lists are downloaded", async () => {
  const reads = [];
  await loadDashboardRegistrySnapshot({ states }, { includeFloors: true, readStore: readStore(reads) });
  assert.deepEqual(reads.sort(), [
    "config/area_registry/list",
    "config/device_registry/list",
    "config/entity_registry/list",
    "config/floor_registry/list",
    "dwains_dashboard/configuration/get",
  ]);
});
