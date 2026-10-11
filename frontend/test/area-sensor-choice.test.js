"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { areaSensorChoices, chooseExtraSensors, chooseTypeSensor } = require("../src/area-sensor-choice");

const classes = {
  "sensor.temp_window": "temperature",
  "sensor.temp_door": "temperature",
  "sensor.humidity": "humidity",
  "sensor.rain": undefined,
  "sensor.wind": "wind_speed",
  "sensor.temp_moved": "temperature",
};
const deviceClassOf = (entityId) => classes[entityId];
const deviceClasses = ["temperature", "humidity", "carbon_dioxide"];
const areaSensorIds = ["sensor.temp_window", "sensor.temp_door", "sensor.humidity", "sensor.rain", "sensor.wind"];

test("types with sensors in the area, average when none is chosen", () => {
  const { types, extras, extraCandidates } = areaSensorChoices({ deviceClasses, areaSensorIds, chosenIds: [], deviceClassOf });
  assert.deepEqual(types, [
    { deviceClass: "temperature", sensors: ["sensor.temp_window", "sensor.temp_door"], chosen: undefined },
    { deviceClass: "humidity", sensors: ["sensor.humidity"], chosen: undefined },
  ]);
  assert.deepEqual(extras, []);
  assert.deepEqual(extraCandidates, ["sensor.rain", "sensor.wind"]);
});

test("chosen sensors land in their type or as extra values", () => {
  const chosenIds = ["sensor.temp_door", "sensor.rain", "sensor.temp_moved"];
  const { types, extras } = areaSensorChoices({ deviceClasses, areaSensorIds, chosenIds, deviceClassOf });
  assert.equal(types[0].chosen, "sensor.temp_door");
  // A chosen sensor that moved to another area can still be picked.
  assert.ok(types[0].sensors.includes("sensor.temp_moved"));
  assert.deepEqual(extras, ["sensor.rain"]);
});

test("choosing per type replaces that type only", () => {
  const chosenIds = ["sensor.temp_door", "sensor.rain"];
  assert.deepEqual(chooseTypeSensor(chosenIds, "temperature", "sensor.temp_window", deviceClassOf), ["sensor.rain", "sensor.temp_window"]);
  assert.deepEqual(chooseTypeSensor(chosenIds, "temperature", undefined, deviceClassOf), ["sensor.rain"]);
  assert.deepEqual(chooseTypeSensor(chosenIds, "humidity", "sensor.humidity", deviceClassOf), ["sensor.temp_door", "sensor.rain", "sensor.humidity"]);
});

test("extra values replace the extras only", () => {
  const chosenIds = ["sensor.temp_door", "sensor.rain"];
  assert.deepEqual(chooseExtraSensors(chosenIds, ["sensor.wind"], deviceClasses, deviceClassOf), ["sensor.temp_door", "sensor.wind"]);
  assert.deepEqual(chooseExtraSensors(chosenIds, [], deviceClasses, deviceClassOf), ["sensor.temp_door"]);
});
