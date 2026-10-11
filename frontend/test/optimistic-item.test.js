"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { hideItemWhileSaving, hideWhileSaving, showSettledItems } = require("../src/optimistic-item");

const element = () => ({ style: { display: "" }, dataset: {} });
const root = (elements) => ({ querySelectorAll: (selector) => (selector === "[data-dd-item]" ? elements : []) });

test("the item is hidden at once and stays hidden after a save until the rebuild", async () => {
  const item = element();
  const target = { closest: (selector) => (selector === "[data-dd-item]" ? item : null) };
  let seenWhileSaving;
  await hideItemWhileSaving(target, () => {
    seenWhileSaving = item.style.display;
    showSettledItems(root([item]));
  });
  assert.equal(seenWhileSaving, "none");
  assert.equal(item.style.display, "none", "a rebuild during the save leaves it hidden");
});

test("after the save, a rebuild shows an item that is still listed", async () => {
  const item = element();
  await hideWhileSaving([item], async () => {});
  assert.equal(item.style.display, "none");
  showSettledItems(root([item]));
  assert.equal(item.style.display, "");
});

test("a failed save shows the items again and passes the error on", async () => {
  const items = [element(), element()];
  await assert.rejects(hideWhileSaving(items, async () => { throw new Error("offline"); }), /offline/);
  assert.deepEqual(items.map((item) => item.style.display), ["", ""]);
});
