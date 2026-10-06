"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { groupEntityStatesByDomain, isLockSensorOfLock } = require("../src/entity-aggregation");

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

test("a lock sensor on a device with a lock entity is the lock again", () => {
  assert.equal(isLockSensorOfLock(states["binary_sensor.front_door_lock"], registry), true);
});

test("lock sensors of other devices and other sensors of the lock count", () => {
  assert.equal(isLockSensorOfLock(states["binary_sensor.window_lock"], registry), false);
  assert.equal(isLockSensorOfLock(states["binary_sensor.front_door_contact"], registry), false);
  assert.equal(isLockSensorOfLock(states["lock.front_door"], registry), false);
  assert.equal(isLockSensorOfLock(states["binary_sensor.front_door_lock"], undefined), false);
  assert.equal(isLockSensorOfLock(undefined, registry), false);
});

test("a changed registry is read again", () => {
  const withoutLock = { ...registry };
  delete withoutLock["lock.front_door"];
  assert.equal(isLockSensorOfLock(states["binary_sensor.front_door_lock"], registry), true);
  assert.equal(isLockSensorOfLock(states["binary_sensor.front_door_lock"], withoutLock), false);
});

test("area grouping leaves out lock sensors of locks", () => {
  const grouped = groupEntityStatesByDomain(Object.keys(states), {
    states,
    domainGroups: { toggle: [], sensor: [], alert: ["binary_sensor"], cover: [], climate: [], other: ["lock"] },
    deviceClasses: { binary_sensor: ["lock", "door"] },
    sensorDeviceClasses: [],
    registryEntities: registry,
  });
  assert.deepEqual(grouped.lock.map((entity) => entity.entity_id), ["lock.front_door"]);
  assert.deepEqual(
    grouped.binary_sensor.map((entity) => entity.entity_id),
    ["binary_sensor.window_lock", "binary_sensor.front_door_contact"],
  );
});
