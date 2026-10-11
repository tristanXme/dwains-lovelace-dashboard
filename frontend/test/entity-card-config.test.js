"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { entityCardConfig } = require("../src/entity-card-config");

const ONES = { rowSpan: "1", colSpan: "1", rowSpanLg: "1", colSpanLg: "1", rowSpanXl: "1", colSpanXl: "1" };
const configuration = (extra = {}) => ({ entities: {}, entity_cards: {}, devices_card: {}, homepage_header: {}, ...extra });
const withUnit = { attributes: { unit_of_measurement: "°C" } };

test("a tile with the name, for types without an own card", () => {
  assert.deepEqual(
    entityCardConfig({ entityId: "switch.fan", domain: "switch", friendlyName: "Fan", configuration: configuration() }),
    { config: { entity: "switch.fan", type: "tile", name: "Fan" }, spans: ONES },
  );
  assert.deepEqual(
    entityCardConfig({ entityId: "switch.fan", domain: "switch", friendlyName: "", configuration: configuration() }).config,
    { entity: "switch.fan", type: "tile" },
  );
});

test("Home Assistant's card per device type; a camera takes 2 by 2 and shows no name", () => {
  const card = (domain) => entityCardConfig({ entityId: `${domain}.x`, domain, friendlyName: "X", configuration: configuration() });
  assert.deepEqual(card("light").config, { entity: "light.x", type: "tile", name: "X", features: [{ type: "light-brightness" }] });
  assert.deepEqual(card("cover").config, { entity: "cover.x", type: "tile", name: "X", features: [{ type: "cover-open-close" }, { type: "cover-position" }] });
  assert.equal(card("climate").config.type, "thermostat");
  assert.deepEqual(card("climate").config.features.map((feature) => feature.type), ["climate-fan-modes", "climate-hvac-modes"]);
  assert.deepEqual(card("camera"), {
    config: { entity: "camera.x", type: "picture-entity", camera_view: "auto" },
    spans: { rowSpan: "2", colSpan: "2", rowSpanLg: "2", colSpanLg: "2", rowSpanXl: "2", colSpanXl: "2" },
  });
});

test("sensors with a unit get a graph, unless the option turns graphs off", () => {
  const sensor = (extra, stateObj = withUnit) => entityCardConfig({
    entityId: "sensor.t", domain: "sensor", friendlyName: "T", configuration: configuration(extra), stateObj,
  }).config;
  assert.deepEqual(sensor(), { graph: "line", type: "sensor", hours_to_show: 24, detail: 1, entity: "sensor.t", name: "T" });
  assert.deepEqual(sensor({ homepage_header: { disable_sensor_graph: true } }), { entity: "sensor.t", type: "tile", name: "T" });
  assert.deepEqual(sensor({}, { attributes: {} }), { entity: "sensor.t", type: "tile", name: "T" });
});

test("the entity's own card wins when switched on, then the device type's card", () => {
  const own = { type: "markdown", content: "own" };
  const typeCard = { type: "markdown", content: "type" };
  const extra = { entity_cards: { "light.x": own }, devices_card: { light: typeCard } };
  const card = (settings) => entityCardConfig({
    entityId: "light.x", domain: "light", friendlyName: "X", configuration: configuration({ ...extra, entities: { "light.x": settings } }),
  }).config;
  assert.deepEqual(card({ custom_card: true }), { input_name: "X", input_entity: "light.x", ...own });
  // Switched off, the own card stays stored but the device type's card shows.
  assert.deepEqual(card({ custom_card: false }), { input_name: "X", input_entity: "light.x", ...typeCard });
});

test("spans set for the entity win over the default", () => {
  const { spans } = entityCardConfig({
    entityId: "camera.x", domain: "camera", friendlyName: "X",
    configuration: configuration({ entities: { "camera.x": { row_span: "1", col_span_xl: "4" } } }),
  });
  assert.deepEqual(spans, { rowSpan: "1", colSpan: "2", rowSpanLg: "2", colSpanLg: "2", rowSpanXl: "2", colSpanXl: "4" });
});
