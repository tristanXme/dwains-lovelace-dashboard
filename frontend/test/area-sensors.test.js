"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { collectAreaSensorValues } = require("../src/area-sensors");

const states = {
  "sensor.living_temp": { entity_id: "sensor.living_temp", state: "21.46", attributes: { device_class: "temperature", unit_of_measurement: "°C" } },
  "sensor.living_co2": { entity_id: "sensor.living_co2", state: "617", attributes: { device_class: "carbon_dioxide", unit_of_measurement: "ppm" } },
  "sensor.rain": { entity_id: "sensor.rain", state: "Dry", attributes: {} },
  "sensor.kitchen_temp": { entity_id: "sensor.kitchen_temp", state: "19", attributes: { device_class: "temperature", unit_of_measurement: "°C" } },
  "sensor.offline": { entity_id: "sensor.offline", state: "unavailable", attributes: { device_class: "humidity", unit_of_measurement: "%" } },
  "binary_sensor.door": { entity_id: "binary_sensor.door", state: "on", attributes: {} },
};
const area = { "sensor.living_temp": "living", "sensor.living_co2": "living", "sensor.rain": "living", "sensor.kitchen_temp": "kitchen", "sensor.offline": "living", "binary_sensor.door": "living" };
const base = {
  areaId: "living",
  states,
  unavailableStates: ["unavailable", "unknown"],
  belongsToArea: (entityId, areaId) => area[entityId] === areaId,
  displayName: (entityId) => ({ "sensor.rain": "Regen" })[entityId] || entityId,
};

test("without explicit sensors only averages are shown", () => {
  const values = collectAreaSensorValues({
    ...base,
    deviceClasses: ["temperature", "humidity"],
    average: (deviceClass) => ({ temperature: "22°C" })[deviceClass],
    explicitEntityIds: [],
  });
  assert.deepEqual(values, ["22°C"]);
});

test("an explicit sensor replaces the average of its device class", () => {
  const values = collectAreaSensorValues({
    ...base,
    deviceClasses: ["temperature", "humidity"],
    average: (deviceClass) => ({ temperature: "22°C", humidity: "48%" })[deviceClass],
    explicitEntityIds: ["sensor.living_temp"],
  });
  assert.deepEqual(values, ["21.5\u00a0°C", "48%"]);
});

test("explicit sensors of other classes and text sensors are appended", () => {
  const values = collectAreaSensorValues({
    ...base,
    deviceClasses: ["temperature"],
    average: () => "22°C",
    explicitEntityIds: ["sensor.rain", "sensor.living_co2"],
  });
  assert.deepEqual(values, ["22°C", "Regen: Dry", "617\u00a0ppm"]);
});

test("sensors of other areas, unavailable sensors and other domains are skipped", () => {
  const values = collectAreaSensorValues({
    ...base,
    deviceClasses: [],
    average: () => undefined,
    explicitEntityIds: ["sensor.kitchen_temp", "sensor.offline", "binary_sensor.door", "sensor.missing"],
  });
  assert.deepEqual(values, []);
});
