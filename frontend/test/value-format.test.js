"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { formatValueWithUnit } = require("../src/value-format");

test("values use the locale decimal mark and a space before the unit", () => {
  assert.equal(formatValueWithUnit(24.06, "°C", "de"), "24,1\u00a0°C");
  assert.equal(formatValueWithUnit(24.06, "°C", "en"), "24.1\u00a0°C");
  assert.equal(formatValueWithUnit(617, "ppm", "de-DE"), "617\u00a0ppm");
});

test("percent spacing follows the language like Home Assistant", () => {
  assert.equal(formatValueWithUnit(48, "%", "de"), "48\u00a0%");
  assert.equal(formatValueWithUnit(48, "%", "en"), "48%");
});

test("missing unit or unknown locale still formats", () => {
  assert.equal(formatValueWithUnit(3.25, "", "de"), "3,3");
  assert.equal(formatValueWithUnit(3.25, "W", "xx-invalid-locale-$"), "3.3\u00a0W");
});
