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

const { statisticsToPoints, usesStatistics } = require("../src/area-graph");
const { createAreaGraphLoader } = require("../src/area-graph-loader");

test("statistics rows become points (ms and ISO start)", () => {
  assert.deepEqual(statisticsToPoints([
    { start: 2000, mean: 21.5 },
    { start: new Date(1000).toISOString(), mean: 20 },
    { start: 3000, mean: null },
  ]), [{ time: 1000, value: 20 }, { time: 2000, value: 21.5 }]);
  assert.equal(usesStatistics(24), false);
  assert.equal(usesStatistics(48), true);
});

function fakeHass(responses) {
  const calls = [];
  return {
    calls,
    callWS: async (message) => {
      calls.push(message);
      return responses[message.type](message);
    },
  };
}

test("tiles that load together share one history request and the cache", async () => {
  const flushes = [];
  const loader = createAreaGraphLoader({ now: () => 10_000_000, schedule: (fn) => flushes.push(fn) });
  const hass = fakeHass({
    "history/history_during_period": (m) => Object.fromEntries(m.entity_ids.map((id, i) => [id, [{ s: String(i), lu: 1 }, { s: String(i + 1), lu: 2 }]])),
  });
  const a = loader.load(hass, "sensor.a", 24);
  const b = loader.load(hass, "sensor.b", 24);
  assert.equal(flushes.length, 1);
  flushes[0]();
  assert.equal((await a).length, 2);
  assert.equal((await b)[1].value, 2);
  assert.equal(hass.calls.length, 1);
  assert.deepEqual(hass.calls[0].entity_ids, ["sensor.a", "sensor.b"]);
  await loader.load(hass, "sensor.a", 24);
  assert.equal(hass.calls.length, 1, "served from cache");
});

test("long periods use statistics and fall back to history without them", async () => {
  const flushes = [];
  const loader = createAreaGraphLoader({ now: () => 10_000_000, schedule: (fn) => flushes.push(fn) });
  const hass = fakeHass({
    "recorder/statistics_during_period": () => ({ "sensor.stat": [{ start: 1, mean: 1 }, { start: 2, mean: 2 }] }),
    "history/history_during_period": () => ({ "sensor.raw": [{ s: "5", lu: 1 }, { s: "6", lu: 2 }] }),
  });
  const stat = loader.load(hass, "sensor.stat", 168);
  const raw = loader.load(hass, "sensor.raw", 168);
  flushes[0]();
  assert.deepEqual((await stat).map((p) => p.value), [1, 2]);
  assert.deepEqual((await raw).map((p) => p.value), [5, 6]);
  assert.deepEqual(hass.calls.map((c) => c.type), ["recorder/statistics_during_period", "history/history_during_period"]);
  assert.deepEqual(hass.calls[1].entity_ids, ["sensor.raw"]);
});

test("a failed request is not cached", async () => {
  const flushes = [];
  const loader = createAreaGraphLoader({ now: () => 10_000_000, schedule: (fn) => flushes.push(fn) });
  let fail = true;
  const hass = fakeHass({
    "history/history_during_period": () => {
      if (fail) throw new Error("offline");
      return { "sensor.a": [{ s: "1", lu: 1 }, { s: "2", lu: 2 }] };
    },
  });
  const first = loader.load(hass, "sensor.a", 6);
  flushes[0]();
  await assert.rejects(first);
  fail = false;
  const second = loader.load(hass, "sensor.a", 6);
  flushes[1]();
  assert.equal((await second).length, 2);
});

function historyHass() {
  return fakeHass({
    "history/history_during_period": (m) => Object.fromEntries(m.entity_ids.map((id) => [id, [{ s: "1", lu: 1 }, { s: "2", lu: 2 }]])),
  });
}

test("each connection has its own cache", async () => {
  const flushes = [];
  const loader = createAreaGraphLoader({ now: () => 10_000_000, schedule: (fn) => flushes.push(fn) });
  const connection = {};
  const first = { ...historyHass(), connection };
  const load = loader.load(first, "sensor.a", 6);
  flushes.shift()();
  await load;
  // A new hass object of the same connection uses the cache.
  const sameConnection = { ...historyHass(), connection };
  await loader.load(sameConnection, "sensor.a", 6);
  assert.equal(sameConnection.calls.length, 0);
  // Another connection (other user, new login) loads its own data.
  const other = { ...historyHass(), connection: {} };
  const otherLoad = loader.load(other, "sensor.a", 6);
  flushes.shift()();
  await otherLoad;
  assert.equal(other.calls.length, 1);
});

test("the cache keeps only the most recently used series", async () => {
  let time = 10_000_000;
  const flushes = [];
  const loader = createAreaGraphLoader({ now: () => time, schedule: (fn) => flushes.push(fn), maxEntries: 3 });
  const hass = historyHass();
  const loadAll = async (ids) => {
    const loads = ids.map((id) => loader.load(hass, id, 6));
    while (flushes.length) flushes.shift()();
    await Promise.all(loads);
  };
  await loadAll(["sensor.a", "sensor.b", "sensor.c"]);
  await loadAll(["sensor.a"]); // a is used again, b is now the oldest
  await loadAll(["sensor.d"]);
  assert.equal(loader.cacheSize(hass), 3);
  assert.equal(hass.calls.length, 2);
  await loadAll(["sensor.a", "sensor.c", "sensor.d"]);
  assert.equal(hass.calls.length, 2, "a, c and d are still cached");
  await loadAll(["sensor.b"]);
  assert.equal(hass.calls.length, 3, "b was dropped");

  // Expired series go first, before any still fresh one.
  time += 6 * 60 * 1000;
  await loadAll(["sensor.e"]);
  assert.equal(loader.cacheSize(hass), 1);
});
