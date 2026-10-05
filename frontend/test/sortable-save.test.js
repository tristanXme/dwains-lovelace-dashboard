"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const { savingSortableOptions } = require("../src/sortable-save");

function fakeSortable(items) {
  return {
    items: [...items],
    toArray() { return [...this.items]; },
    sort(order) { this.items = [...order]; },
  };
}

test("a dragged order is saved", async () => {
  const saved = [];
  const options = savingSortableOptions(async (order) => saved.push(order), () => assert.fail("no error"));
  const sortable = fakeSortable(["a", "b", "c"]);
  options.onStart.call(sortable);
  sortable.items = ["c", "a", "b"];
  await options.onEnd.call(sortable);
  assert.deepEqual(saved, [["c", "a", "b"]]);
  assert.deepEqual(sortable.toArray(), ["c", "a", "b"]);
});

test("a failed save shows the error and puts the items back", async () => {
  const errors = [];
  const options = savingSortableOptions(
    async () => { throw new Error("offline"); },
    (error) => errors.push(error.message),
  );
  const sortable = fakeSortable(["a", "b", "c"]);
  options.onStart.call(sortable);
  sortable.items = ["b", "c", "a"];
  await options.onEnd.call(sortable);
  assert.deepEqual(errors, ["offline"]);
  assert.deepEqual(sortable.toArray(), ["a", "b", "c"]);
});

test("a save that throws right away is handled the same way", async () => {
  const errors = [];
  const options = savingSortableOptions(() => { throw new Error("bad"); }, (error) => errors.push(error.message));
  const sortable = fakeSortable(["a", "b"]);
  options.onStart.call(sortable);
  sortable.items = ["b", "a"];
  await options.onEnd.call(sortable);
  assert.deepEqual(errors, ["bad"]);
  assert.deepEqual(sortable.toArray(), ["a", "b"]);
});
