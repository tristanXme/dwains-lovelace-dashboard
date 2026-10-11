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

test("saves run one after the other; an older failure does not undo a newer drag", async () => {
  const calls = [];
  const errors = [];
  let failFirst;
  const options = savingSortableOptions(
    (order) => {
      calls.push(order);
      if (calls.length === 1) return new Promise((resolve, reject) => { failFirst = reject; });
      return Promise.resolve();
    },
    (error) => errors.push(error.message),
  );
  const sortable = fakeSortable(["a", "b", "c"]);
  options.onStart.call(sortable);
  sortable.items = ["b", "a", "c"];
  options.onEnd.call(sortable);
  options.onStart.call(sortable);
  sortable.items = ["c", "b", "a"];
  const second = options.onEnd.call(sortable);
  await Promise.resolve();
  assert.equal(calls.length, 1, "the second save waits for the first");
  failFirst(new Error("offline"));
  await second;
  assert.deepEqual(calls, [["b", "a", "c"], ["c", "b", "a"]]);
  assert.deepEqual(errors, []);
  assert.deepEqual(sortable.toArray(), ["c", "b", "a"]);
});

test("a failed newest drag goes back to the last saved order", async () => {
  let fail = false;
  const errors = [];
  const options = savingSortableOptions(
    async () => { if (fail) throw new Error("offline"); },
    (error) => errors.push(error.message),
  );
  const sortable = fakeSortable(["a", "b", "c"]);
  options.onStart.call(sortable);
  sortable.items = ["b", "a", "c"];
  await options.onEnd.call(sortable);
  fail = true;
  options.onStart.call(sortable);
  sortable.items = ["c", "b", "a"];
  await options.onEnd.call(sortable);
  assert.deepEqual(errors, ["offline"]);
  assert.deepEqual(sortable.toArray(), ["b", "a", "c"]);
});

// A list element with ids, enough for the DOM moves of the applyOrder mode.
function fakeList(ids) {
  const parent = {
    children: [],
    insertBefore(node, next) {
      this.children = this.children.filter((child) => child !== node);
      const index = next ? this.children.indexOf(next) : this.children.length;
      this.children.splice(index, 0, node);
      node.parentNode = this;
    },
  };
  for (const id of ids) parent.insertBefore({ id }, null);
  for (const node of parent.children) {
    Object.defineProperty(node, "nextSibling", {
      get() { return parent.children[parent.children.indexOf(node) + 1] || null; },
    });
  }
  return {
    parent,
    toArray() { return parent.children.map((child) => child.id); },
    node(id) { return parent.children.find((child) => child.id === id); },
  };
}

test("with applyOrder the drag is undone in the DOM and the page shows the order", async () => {
  const shown = [];
  const saved = [];
  const options = savingSortableOptions(async (order) => saved.push(order), () => assert.fail("no error"), {
    applyOrder: (order) => shown.push(order),
  });
  const list = fakeList(["a", "b", "c"]);
  options.onStart.call(list, { item: list.node("a") });
  list.parent.insertBefore(list.node("a"), null);
  await options.onEnd.call(list);
  assert.deepEqual(list.toArray(), ["a", "b", "c"], "the DOM is as lit rendered it");
  assert.deepEqual(shown, [["b", "c", "a"]]);
  assert.deepEqual(saved, [["b", "c", "a"]]);
});

test("with applyOrder a failed save shows the saved order again", async () => {
  const shown = [];
  const options = savingSortableOptions(async () => { throw new Error("offline"); }, () => {}, {
    applyOrder: (order) => shown.push(order),
  });
  const list = fakeList(["a", "b"]);
  options.onStart.call(list, { item: list.node("b") });
  list.parent.insertBefore(list.node("b"), list.node("a"));
  await options.onEnd.call(list);
  assert.deepEqual(shown, [["b", "a"], ["a", "b"]]);
  assert.deepEqual(list.toArray(), ["a", "b"]);
});
