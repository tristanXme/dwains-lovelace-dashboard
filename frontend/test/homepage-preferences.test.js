"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { areaSensorEntities, areaBinarySensorEntities } = require("../src/homepage-preferences");

test("sensors below the area name come from the area, old global lists still count", () => {
  const configuration = {
    homepage_header: { area_sensor_entities: ["sensor.old"] },
    areas: {
      living: { sensor_entities: ["sensor.temp", "sensor.old"], binary_sensor_entities: "binary_sensor.window" },
    },
  };
  assert.deepEqual(areaSensorEntities(configuration, "living"), ["sensor.temp", "sensor.old"]);
  assert.deepEqual(areaBinarySensorEntities(configuration, "living"), ["binary_sensor.window"]);
  assert.deepEqual(areaSensorEntities(configuration, "kitchen"), ["sensor.old"]);
  assert.deepEqual(areaBinarySensorEntities({}, "living"), []);
});
