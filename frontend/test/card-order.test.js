"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { sortedByKey, groupedByDomain } = require("../src/card-order");
const { applyLocalOrder } = require("../src/local-order");

const card = (entity, domain, sort_order) => ({ entity, domain, sort_order, grouped_sort_order: sort_order });
const ids = (list) => list.map((item) => item.entity);

test("sorts ascending by the key, then the tie key, keeping equal items in order", () => {
  const cards = [card("b", "light", 2), card("a", "switch", 1), card("d", "light", 1), card("c", "light", 1), card("e", "light", 1)];
  assert.deepEqual(ids(sortedByKey(cards, "sort_order", "domain")), ["d", "c", "e", "a", "b"]);
  assert.deepEqual(ids(sortedByKey(cards, "sort_order")), ["a", "d", "c", "e", "b"]);
});

test("does not change the list it is given", () => {
  const cards = [card("b", "x", 2), card("a", "x", 1)];
  sortedByKey(cards, "sort_order");
  assert.deepEqual(ids(cards), ["b", "a"]);
});

test("compares like the old comparator (no locale or numeric coercion for numbers)", () => {
  const cards = [card("a", "x", 10), card("b", "x", 9), card("c", "x", 99)];
  assert.deepEqual(ids(sortedByKey(cards, "sort_order")), ["b", "a", "c"]);
});

test("returns the same array while nothing changed", () => {
  const cards = [card("b", "x", 2), card("a", "x", 1)];
  const first = sortedByKey(cards, "sort_order");
  assert.equal(sortedByKey(cards, "sort_order"), first);
  assert.notEqual(sortedByKey(cards, "grouped_sort_order", "domain"), first, "other key, other entry");
});

test("a dragged order (applyLocalOrder) shows up", () => {
  const cards = [card("a", "x", 1), card("b", "x", 2), card("c", "x", 3)];
  const first = sortedByKey(cards, "sort_order");
  applyLocalOrder(cards, (item) => item.entity, ["c", "a", "b"], "sort_order");
  const second = sortedByKey(cards, "sort_order");
  assert.notEqual(second, first);
  assert.deepEqual(ids(second), ["c", "a", "b"]);
});

test("a rebuilt or reassigned list is sorted afresh", () => {
  const cards = [card("a", "x", 1)];
  const first = sortedByKey(cards, "sort_order");
  cards.push(card("b", "x", 0));
  assert.deepEqual(ids(sortedByKey(cards, "sort_order")), ["b", "a"]);
  cards[0] = card("z", "x", 5);
  assert.deepEqual(ids(sortedByKey(cards, "sort_order")), ["b", "z"]);
  assert.deepEqual(ids(first), ["a"]);
  assert.deepEqual(ids(sortedByKey([card("q", "x", 1)], "sort_order")), ["q"]);
});

test("groups by domain in the order of the device settings, 99 when unset", () => {
  const sorted = sortedByKey([card("a", "light", 1), card("b", "switch", 2), card("c", "light", 3), card("d", "fan", 4)], "sort_order");
  const devices = { switch: { sort_order: 1 }, light: { sort_order: 5 } };
  const { group, keys } = groupedByDomain(sorted, devices);
  assert.deepEqual(keys, ["switch", "light", "fan"]);
  assert.deepEqual(ids(group.light), ["a", "c"]);
  assert.equal(groupedByDomain(sorted, devices), groupedByDomain(sorted, devices), "remembered");
  assert.deepEqual(groupedByDomain(sorted, devices).keys, ["switch", "light", "fan"]);
});

test("a changed device order regroups", () => {
  const sorted = sortedByKey([card("a", "light", 1), card("b", "switch", 2)], "sort_order");
  const devices = { switch: { sort_order: 1 }, light: { sort_order: 5 } };
  assert.deepEqual(groupedByDomain(sorted, devices).keys, ["switch", "light"]);
  devices.light.sort_order = 0;
  devices.light.sort_order = 2;
  devices.switch.sort_order = 3;
  assert.deepEqual(groupedByDomain(sorted, devices).keys, ["light", "switch"]);
  assert.deepEqual(groupedByDomain(sorted, undefined).keys, ["light", "switch"]);
});
