"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { applyLocalOrder } = require("../src/local-order");

test("items in the order get the positions the backend stores", () => {
  const items = [{ id: "a", sort_order: 1 }, { id: "b", sort_order: 2 }, { id: "c", sort_order: 99 }];
  assert.equal(applyLocalOrder(items, (item) => item.id, ["b", "a"], "sort_order"), true);
  assert.deepEqual(items.map((item) => item.sort_order), [2, 1, 99]);
  assert.equal(applyLocalOrder(items, (item) => item.id, ["b", "a"], "sort_order"), false, "nothing changed");
});
