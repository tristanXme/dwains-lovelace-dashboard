"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
  devicesEmptyReason,
  emptyStateTexts,
  homepageEmptyReason,
  initialSelection,
} = require("../src/empty-state");

const living = { area_id: "living" };
const kitchen = { area_id: "kitchen" };

test("the first entry is selected only when there is one", () => {
  assert.equal(initialSelection("", ["living", "kitchen"]), "living");
  assert.equal(initialSelection("kitchen", ["living", "kitchen"]), "kitchen");
  assert.equal(initialSelection("", []), "");
  assert.equal(initialSelection(undefined, []), "");
});

test("homepage: no areas at all", () => {
  assert.equal(homepageEmptyReason({ areas: [], disabledAreas: [], data: [] }), "no_areas");
  assert.equal(homepageEmptyReason({ areas: undefined, data: [] }), "no_areas");
});

test("homepage: every area disabled", () => {
  assert.equal(
    homepageEmptyReason({ areas: [living, kitchen], disabledAreas: [living, kitchen], data: [] }),
    "all_areas_disabled",
  );
});

test("homepage: areas without suitable entities", () => {
  assert.equal(homepageEmptyReason({ areas: [living, kitchen], disabledAreas: [living], data: [] }), "no_entities");
  assert.equal(homepageEmptyReason({ areas: [living], disabledAreas: [], data: [] }), "no_entities");
});

test("homepage with areas to show has no empty state", () => {
  assert.equal(homepageEmptyReason({ areas: [living], disabledAreas: [], data: [{ area: living }] }), undefined);
});

test("devices: every device type hidden", () => {
  assert.equal(devicesEmptyReason({ data: [], disabledDevices: ["light", "sensor"] }), "all_domains_hidden");
});

test("devices: no suitable entities", () => {
  assert.equal(devicesEmptyReason({ data: [], disabledDevices: [] }), "no_entities");
  assert.equal(devicesEmptyReason({ data: {}, disabledDevices: undefined }), "no_entities");
});

test("devices with types to show has no empty state", () => {
  assert.equal(devicesEmptyReason({ data: [{ domain: "light" }], disabledDevices: ["sensor"] }), undefined);
});

test("every empty state has its texts in every language", () => {
  const dir = path.join(__dirname, "../src/translations");
  const get = (object, key) => key.split(".").reduce((value, part) => value?.[part], object);
  const cases = [
    ["homepage", "no_areas"], ["homepage", "all_areas_disabled"], ["homepage", "no_entities"],
    ["devices", "all_domains_hidden"], ["devices", "no_entities"],
  ];
  for (const file of fs.readdirSync(dir).filter((name) => name.endsWith(".json"))) {
    const strings = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
    for (const [page, reason] of cases) {
      const texts = emptyStateTexts(page, reason);
      assert.ok(texts, `${page}/${reason}`);
      assert.ok(get(strings, texts.title), `${file}: ${texts.title}`);
      assert.ok(get(strings, texts.hint), `${file}: ${texts.hint}`);
    }
    assert.ok(get(strings, "blueprint.install_failed"), `${file}: blueprint.install_failed`);
  }
  assert.equal(emptyStateTexts("homepage", undefined), undefined);
});
