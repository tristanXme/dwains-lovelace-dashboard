"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { applyCardModStyles } = require("../src/card-mod-apply");

function registry(def) {
  const calls = { whenDefined: 0 };
  return { calls, get: (n) => (n === "card-mod" ? def : undefined), whenDefined() { calls.whenDefined++; return new Promise(() => {}); } };
}

test("does nothing and registers no whenDefined continuation without card-mod", () => {
  const reg = registry(undefined);
  assert.equal(applyCardModStyles({}, {}, {}, {}, reg), false);
  assert.equal(reg.calls.whenDefined, 0);
});

test("applies styles with the short arity", () => {
  const seen = [];
  const cardMod = { applyToElement(a, b, c) { seen.push([a, b, c]); } };
  const el = {};
  assert.equal(applyCardModStyles(el, "s", "c", { cardMod }, registry(undefined)), true);
  assert.deepEqual(seen[0], [el, "s", { config: "c", tag: "more-info" }]);
});

test("applies styles with the long arity from the registry", () => {
  const seen = [];
  const def = { applyToElement(a, b, c, d, e, f) { seen.push([a, b, c, d, e, f]); } };
  const el = {};
  assert.equal(applyCardModStyles(el, "s", "c", {}, registry(def)), true);
  assert.deepEqual(seen[0], [el, "more-info", "s", { config: "c" }, [], false]);
});

test("ignores a missing element", () => {
  assert.equal(applyCardModStyles(null, "s", "c", { cardMod: { applyToElement() { throw new Error("x"); } } }, registry(undefined)), false);
});
