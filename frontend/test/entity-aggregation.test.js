"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { groupEntityStatesByDomain, isLockSensorOfLock, lockDeviceIds } = require("../src/entity-aggregation");

const registry = {
  "lock.front_door": { entity_id: "lock.front_door", device_id: "nuki" },
  "binary_sensor.front_door_lock": { entity_id: "binary_sensor.front_door_lock", device_id: "nuki" },
  "binary_sensor.window_lock": { entity_id: "binary_sensor.window_lock", device_id: "window" },
  "binary_sensor.front_door_contact": { entity_id: "binary_sensor.front_door_contact", device_id: "nuki" },
};
const state = (entityId, deviceClass, value = "on") => ({
  entity_id: entityId,
  state: value,
  attributes: deviceClass ? { device_class: deviceClass } : {},
});
const states = {
  "lock.front_door": state("lock.front_door", undefined, "unlocked"),
  "binary_sensor.front_door_lock": state("binary_sensor.front_door_lock", "lock"),
  "binary_sensor.window_lock": state("binary_sensor.window_lock", "lock"),
  "binary_sensor.front_door_contact": state("binary_sensor.front_door_contact", "door"),
};
const unavailableStates = ["unavailable", "unknown"];
const lockDevices = lockDeviceIds([states["lock.front_door"]], registry, unavailableStates);

test("a lock sensor on the device of a counted lock is the lock again", () => {
  assert.equal(isLockSensorOfLock(states["binary_sensor.front_door_lock"], registry, lockDevices), true);
});

test("lock sensors of other devices and other sensors of the lock count", () => {
  assert.equal(isLockSensorOfLock(states["binary_sensor.window_lock"], registry, lockDevices), false);
  assert.equal(isLockSensorOfLock(states["binary_sensor.front_door_contact"], registry, lockDevices), false);
  assert.equal(isLockSensorOfLock(states["lock.front_door"], registry, lockDevices), false);
  assert.equal(isLockSensorOfLock(states["binary_sensor.front_door_lock"], undefined, lockDevices), false);
  assert.equal(isLockSensorOfLock(undefined, registry, lockDevices), false);
});

test("a lock that is not counted leaves its sensor counted", () => {
  const sensor = states["binary_sensor.front_door_lock"];
  assert.equal(isLockSensorOfLock(sensor, registry, lockDeviceIds([], registry)), false);
  const unavailable = lockDeviceIds([state("lock.front_door", undefined, "unavailable")], registry, unavailableStates);
  assert.equal(isLockSensorOfLock(sensor, registry, unavailable), false);
});

const group = (entityIds, excludedEntities = {}) => groupEntityStatesByDomain(entityIds, {
  states,
  excludedEntities,
  domainGroups: { toggle: [], sensor: [], alert: ["binary_sensor"], cover: [], climate: [], other: ["lock"] },
  deviceClasses: { binary_sensor: ["lock", "door"] },
  sensorDeviceClasses: [],
  registryEntities: registry,
  unavailableStates,
});
const ids = (entities) => entities.map((entity) => entity.entity_id);

test("area grouping leaves out lock sensors of counted locks", () => {
  const grouped = group(Object.keys(states));
  assert.deepEqual(ids(grouped.lock), ["lock.front_door"]);
  assert.deepEqual(ids(grouped.binary_sensor), ["binary_sensor.window_lock", "binary_sensor.front_door_contact"]);
});

test("area grouping keeps the lock sensor when the lock is left out", () => {
  const expected = ["binary_sensor.front_door_lock", "binary_sensor.window_lock", "binary_sensor.front_door_contact"];
  assert.deepEqual(ids(group(Object.keys(states), { "lock.front_door": { excluded: true } }).binary_sensor), expected);
  assert.deepEqual(ids(group(Object.keys(states), { "lock.front_door": { hidden_in_area: true } }).binary_sensor), expected);
  assert.deepEqual(ids(group(expected).binary_sensor), expected);
});
