"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { confirmBulkSwitch, entitiesToSwitch, switchesToRestore } = require("../src/bulk-switch");

const configuration = {
  entities: {
    "light.a": { hidden: true },
    "light.b": { hidden_in_area: true },
    "light.c": { disabled: true, hidden: true },
    "light.d": { hidden: false },
  },
};

test("a bulk switch changes only the cards where it is not on yet", () => {
  const ids = ["light.a", "light.b", "light.d", "light.e"];
  assert.deepEqual(entitiesToSwitch(ids, configuration, "hidden"), ["light.b", "light.d", "light.e"]);
  assert.deepEqual(entitiesToSwitch(ids, configuration, "disabled"), ids);
  assert.deepEqual(entitiesToSwitch(ids, undefined, "hidden"), ids);
});

test("the question names how many cards and where, and its answer decides", () => {
  const strings = {
    "entity.confirm_hide_all.one": "1 Karte in „{area}“ ausblenden?",
    "entity.confirm_hide_all.other": "{count} Karten in „{area}“ ausblenden?",
    "entity.confirm_disable_all.other": "{count} Karten in „{area}“ im Dashboard deaktivieren?",
  };
  const asked = [];
  const ask = (answer) => (message) => { asked.push(message); return answer; };
  const translate = (key) => strings[key];
  assert.equal(confirmBulkSwitch({ key: "hidden", count: 1, area: "Bad", translate, confirm: ask(true) }), true);
  assert.equal(confirmBulkSwitch({ key: "disabled", count: 25, area: "Wohnzimmer", translate, confirm: ask(false) }), false);
  assert.equal(confirmBulkSwitch({ key: "hidden", count: 3, area: "Flur", translate, confirm: ask(true) }), true);
  assert.deepEqual(asked, [
    "1 Karte in „Bad“ ausblenden?",
    "25 Karten in „Wohnzimmer“ im Dashboard deaktivieren?",
    "3 Karten in „Flur“ ausblenden?",
  ]);
  // Without a dialog it goes ahead.
  assert.equal(confirmBulkSwitch({ key: "hidden", count: 2, area: "x", translate, confirm: undefined }), true);
});

test("showing every card of a list again turns off only the switches that are on", () => {
  const ids = ["light.a", "light.b", "light.c"];
  assert.deepEqual(switchesToRestore(ids, configuration, ["hidden", "hidden_in_area"]), [
    { key: "hidden", entities: ["light.a", "light.c"] },
    { key: "hidden_in_area", entities: ["light.b"] },
  ]);
  assert.deepEqual(switchesToRestore(ids, configuration, ["disabled"]), [
    { key: "disabled", entities: ["light.c"] },
  ]);
  assert.deepEqual(switchesToRestore(["light.d"], configuration, ["hidden"]), []);
});
