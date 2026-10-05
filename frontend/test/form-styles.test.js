"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

// form-styles.js is an ES module; evaluate its exports.
const source = fs.readFileSync(path.join(__dirname, "../src/styles/form-styles.js"), "utf8")
  .replace(/export\s+const\s+(\w+)/g, "exports.$1")
  .replace(/export\s+function\s+(\w+)/g, "exports.$1 = function $1");
const exportsObject = {};
new Function("exports", "Event", source)(exportsObject, class { constructor(type, init) { Object.assign(this, { type, ...init }); } });
const { toggleCheckRow } = exportsObject;

function row({ disabled = false } = {}) {
  const events = [];
  const control = { checked: false, disabled, dispatchEvent: (event) => events.push(event) };
  return { control, events, label: { querySelector: () => control } };
}

test("clicking the text toggles the control and reports the change", () => {
  const { control, events, label } = row();
  let prevented = false;
  toggleCheckRow({ currentTarget: label, composedPath: () => [label], preventDefault: () => { prevented = true; } });
  assert.equal(control.checked, true);
  assert.equal(events.length, 1);
  assert.equal(events[0].type, "change");
  assert.ok(events[0].bubbles && events[0].composed);
  assert.ok(prevented, "the label's own forwarding is suppressed");
});

test("a click on the control itself is left to the control", () => {
  const { control, events, label } = row();
  toggleCheckRow({ currentTarget: label, composedPath: () => [control, label], preventDefault: () => assert.fail() });
  assert.equal(control.checked, false);
  assert.equal(events.length, 0);
});

test("a disabled control does not change", () => {
  const { control, events, label } = row({ disabled: true });
  toggleCheckRow({ currentTarget: label, composedPath: () => [label], preventDefault() {} });
  assert.equal(control.checked, false);
  assert.equal(events.length, 0);
});
