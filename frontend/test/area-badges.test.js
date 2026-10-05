"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { summaryTranslationKey } = require("../src/area-binary-sensors");

// variables.js is an ES module; evaluate its plain data.
function loadModule(file) {
  const source = fs.readFileSync(path.join(__dirname, "../src", file), "utf8")
    .replace(/export\s+default\s+/, "module.exports = ")
    .replace(/export\s+const\s+(\w+)/g, "exports.$1");
  const module = { exports: {} };
  new Function("module", "exports", source)(module, module.exports);
  return module.exports;
}

const variables = loadModule("variables.js");
const translationsDir = path.join(__dirname, "../src/translations");
const translations = Object.fromEntries(
  fs.readdirSync(translationsDir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => [file.slice(0, -5), JSON.parse(fs.readFileSync(path.join(translationsDir, file), "utf8"))]),
);
const get = (object, key) => key.split(".").reduce((value, part) => value?.[part], object);

test("every badge on an area tile has an icon", () => {
  for (const deviceClass of variables.DEVICE_CLASSES.binary_sensor) {
    assert.ok(variables.DOMAIN_STATE_ICONS.binary_sensor[deviceClass], deviceClass);
  }
  for (const domain of variables.OTHER_DOMAINS) {
    assert.ok(variables.DOMAIN_STATE_ICONS[domain]?.on, domain);
  }
  assert.equal(variables.DOMAIN_STATE_ICONS.binary_sensor.running, "mdi:play");
});

test("badge labels and tooltips exist in every language", () => {
  const types = [...variables.DEVICE_CLASSES.binary_sensor, ...variables.OTHER_DOMAINS];
  for (const [language, strings] of Object.entries(translations)) {
    for (const type of types) {
      assert.ok(get(strings, `device.${type}`), `${language}: device.${type}`);
      for (const count of [0, 1, 2]) {
        const key = summaryTranslationKey(type, count);
        assert.ok(get(strings, key), `${language}: ${key}`);
      }
    }
    for (const key of ["device.open", "device.on", "device.detected"]) {
      assert.ok(get(strings, key), `${language}: ${key}`);
    }
  }
});

test("new sensor types have their own summaries", () => {
  assert.equal(summaryTranslationKey("opening", 3), "area_binary_sensor.summary.opening.many");
  assert.equal(summaryTranslationKey("gas", 1), "area_binary_sensor.summary.gas.one");
  assert.equal(summaryTranslationKey("valve", 2), "area_binary_sensor.summary.valve.many");
  assert.equal(summaryTranslationKey("vacuum", 1), "area_binary_sensor.summary.fallback.one");
});
