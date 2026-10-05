"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { entityIdsIn, hassChangeIsRelevant, relevanceFilter } = require("../src/state-relevance");

const lamp = { state: "on" };
const other = { state: "1" };
const base = { language: "de", states: { "light.lamp": lamp, "sensor.other": other } };
const isRelevant = relevanceFilter({ entityIds: ["light.lamp"], domains: ["weather"] });

test("a change to a shown entity renders", () => {
  const next = { ...base, states: { ...base.states, "light.lamp": { state: "off" } } };
  assert.equal(hassChangeIsRelevant(base, next, isRelevant), true);
});

test("a change to any other entity does not render", () => {
  const next = { ...base, states: { ...base.states, "sensor.other": { state: "2" } } };
  assert.equal(hassChangeIsRelevant(base, next, isRelevant), false);
});

test("entities of an always-relevant domain render, also when added or removed", () => {
  const added = { ...base, states: { ...base.states, "weather.home": { state: "sunny" } } };
  assert.equal(hassChangeIsRelevant(base, added, isRelevant), true);
  assert.equal(hassChangeIsRelevant(added, base, isRelevant), true);
});

test("anything besides the states renders", () => {
  assert.equal(hassChangeIsRelevant(base, { ...base, language: "en" }, isRelevant), true);
  assert.equal(hassChangeIsRelevant(base, { ...base, themes: {} }, isRelevant), true);
});

test("without a previous hass or a filter it renders", () => {
  assert.equal(hassChangeIsRelevant(undefined, base, isRelevant), true);
  assert.equal(hassChangeIsRelevant(base, { ...base, states: {} }, undefined), true);
});

test("entity ids are found in the configuration", () => {
  const ids = entityIdsIn({ homepage_header: { weather_entity: "weather.home" }, areas: { kitchen: { graph_entity: "sensor.temp_kitchen", icon: "mdi:stove" } } });
  assert.deepEqual(ids.sort(), ["sensor.temp_kitchen", "weather.home"]);
});
