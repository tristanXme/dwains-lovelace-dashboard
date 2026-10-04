"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const {
  normalizeGraphHours,
  historyToPoints,
  bucketPoints,
  graphPaths,
} = require("../src/area-graph");

test("graph hours fall back to 24 for unknown values", () => {
  assert.equal(normalizeGraphHours(6), 6);
  assert.equal(normalizeGraphHours("168"), 168);
  assert.equal(normalizeGraphHours(5), 24);
  assert.equal(normalizeGraphHours(undefined), 24);
});

test("history accepts compressed and full states and skips text states", () => {
  const points = historyToPoints([
    { s: "21.5", lu: 200 },
    { s: "unavailable", lu: 150 },
    { state: "20", last_updated: new Date(100 * 1000).toISOString() },
    { s: "", lu: 300 },
  ]);
  assert.deepEqual(points, [
    { time: 100 * 1000, value: 20 },
    { time: 200 * 1000, value: 21.5 },
  ]);
  assert.deepEqual(historyToPoints(undefined), []);
});

test("buckets average values and carry the last value forward", () => {
  const points = [
    { time: 0, value: 10 },
    { time: 10, value: 20 },
    { time: 15, value: 30 },
  ];
  const values = bucketPoints(points, { start: 5, end: 25, buckets: 4 });
  // 0 is before the window and seeds the first bucket; 10 lands in bucket 1,
  // 15 in bucket 2, the last bucket keeps 30.
  assert.deepEqual(values, [10, 20, 30, 30]);
  assert.deepEqual(bucketPoints([], { start: 0, end: 10 }), []);
});

test("buckets before the first known value use that value", () => {
  const values = bucketPoints([{ time: 30, value: 5 }], { start: 0, end: 40, buckets: 4 });
  assert.deepEqual(values, [5, 5, 5, 5]);
});

test("graph paths span the box and handle flat lines", () => {
  const paths = graphPaths([1, 3, 2], 300, 48);
  assert.match(paths.line, /^M0,/);
  assert.match(paths.line, /300,\d/);
  assert.ok(paths.area.endsWith("L300,48 L0,48 Z"));
  assert.equal(paths.min, 1);
  assert.equal(paths.max, 3);
  assert.ok(graphPaths([2, 2], 300, 48));
  assert.equal(graphPaths([2], 300, 48), null);
});
