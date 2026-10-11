"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { hideItemWhileSaving, hideWhileSaving } = require("../src/optimistic-item");

const element = () => ({ style: { display: "" } });

test("the item is hidden at once and stays hidden after a save", async () => {
  const item = element();
  const target = { closest: (selector) => (selector === "[data-dd-item]" ? item : null) };
  let seenWhileSaving;
  await hideItemWhileSaving(target, () => { seenWhileSaving = item.style.display; });
  assert.equal(seenWhileSaving, "none");
  assert.equal(item.style.display, "none");
});

test("a failed save shows the items again and passes the error on", async () => {
  const items = [element(), element()];
  await assert.rejects(hideWhileSaving(items, async () => { throw new Error("offline"); }), /offline/);
  assert.deepEqual(items.map((item) => item.style.display), ["", ""]);
});
