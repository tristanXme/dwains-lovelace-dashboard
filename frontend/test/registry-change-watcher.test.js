"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { RegistryChangeWatcher } = require("../src/registry-change-watcher");

function watcher() {
  const timers = [];
  let changes = 0;
  const instance = new RegistryChangeWatcher(() => { changes += 1; }, {
    setTimer: (fn) => { timers.push(fn); return timers.length; },
    clearTimer: (id) => { timers[id - 1] = undefined; },
  });
  const fire = () => timers.splice(0).forEach((fn) => fn?.());
  return { instance, fire, changes: () => changes };
}

const registries = () => ({ entities: {}, devices: {}, areas: {}, floors: {} });

test("state updates with the same registries do not rebuild", () => {
  const { instance, fire, changes } = watcher();
  const hass = registries();
  instance.update(hass);
  instance.update({ ...hass, states: {} });
  fire();
  assert.equal(changes(), 0);
});

test("a changed registry rebuilds once after the changes settle", () => {
  const { instance, fire, changes } = watcher();
  const hass = registries();
  instance.update(hass);
  instance.update({ ...hass, entities: {} });
  instance.update({ ...hass, areas: {} });
  fire();
  assert.equal(changes(), 1);
});

test("reset drops a pending rebuild", () => {
  const { instance, fire, changes } = watcher();
  const hass = registries();
  instance.update(hass);
  instance.update({ ...hass, devices: {} });
  instance.reset();
  fire();
  assert.equal(changes(), 0);
});
