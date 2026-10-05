"use strict";

/**
 * Loads the series for the area graphs. Requests of all tiles that render in
 * the same moment are combined into one websocket call per period, results
 * are cached for a few minutes and shared between tiles.
 *
 * Cache and batches belong to one Home Assistant connection (a new login or
 * user gets its own, the old one goes with its connection) and hold at most
 * MAX_CACHE_ENTRIES series, the least recently used are dropped first.
 */

const { historyToPoints, statisticsToPoints, usesStatistics } = require("./area-graph");

const CACHE_TTL_MS = 5 * 60 * 1000;
const BATCH_DELAY_MS = 30;
const MAX_CACHE_ENTRIES = 200;

function createAreaGraphLoader({
  now = () => Date.now(),
  schedule = (fn) => setTimeout(fn, BATCH_DELAY_MS),
  maxEntries = MAX_CACHE_ENTRIES,
} = {}) {
  const connections = new WeakMap();

  function stateFor(hass) {
    // hass is replaced on every state change, its connection is not.
    const owner = hass?.connection ?? hass;
    let state = connections.get(owner);
    if (!state) {
      state = { cache: new Map(), batches: new Map() };
      connections.set(owner, state);
    }
    return state;
  }

  const fresh = (entry) => now() - entry.fetchedAt < CACHE_TTL_MS;

  function remember(cache, key, entry) {
    // Map order is the use order: re-inserting moves a key to the end.
    cache.delete(key);
    cache.set(key, entry);
    if (cache.size <= maxEntries) return;
    for (const [oldKey, oldEntry] of cache) {
      if (!fresh(oldEntry)) cache.delete(oldKey);
    }
    for (const oldKey of cache.keys()) {
      if (cache.size <= maxEntries) break;
      cache.delete(oldKey);
    }
  }

  async function fetchHistory(hass, entityIds, hours) {
    const result = await hass.callWS({
      type: "history/history_during_period",
      start_time: new Date(now() - hours * 3600 * 1000).toISOString(),
      entity_ids: entityIds,
      minimal_response: true,
      no_attributes: true,
      significant_changes_only: false,
    });
    return Object.fromEntries(entityIds.map((id) => [id, historyToPoints(result?.[id])]));
  }

  async function fetchStatistics(hass, entityIds, hours) {
    const result = await hass.callWS({
      type: "recorder/statistics_during_period",
      start_time: new Date(now() - hours * 3600 * 1000).toISOString(),
      statistic_ids: entityIds,
      period: "hour",
      types: ["mean"],
    });
    const points = Object.fromEntries(entityIds.map((id) => [id, statisticsToPoints(result?.[id])]));
    // Sensors without a state_class have no statistics: use their history.
    const missing = entityIds.filter((id) => points[id].length < 2);
    if (missing.length) Object.assign(points, await fetchHistory(hass, missing, hours));
    return points;
  }

  function flush(hass, hours) {
    const { cache, batches } = stateFor(hass);
    const batch = batches.get(hours);
    batches.delete(hours);
    const entityIds = [...batch.keys()];
    const request = usesStatistics(hours)
      ? fetchStatistics(hass, entityIds, hours)
      : fetchHistory(hass, entityIds, hours);
    request.then(
      (points) => batch.forEach(({ resolve }, id) => resolve(points[id] || [])),
      (error) => batch.forEach(({ reject, promise }, id) => {
        const key = `${id}|${hours}`;
        // Only this request's entry; a newer forced load may have replaced it.
        if (cache.get(key)?.promise === promise) cache.delete(key);
        reject(error);
      }),
    );
  }

  function load(hass, entityId, hours, { force = false } = {}) {
    const { cache, batches } = stateFor(hass);
    const key = `${entityId}|${hours}`;
    const cached = cache.get(key);
    if (!force && cached && fresh(cached)) {
      remember(cache, key, cached);
      return cached.promise;
    }
    let batch = batches.get(hours);
    if (!batch) {
      batch = new Map();
      batches.set(hours, batch);
      schedule(() => flush(hass, hours));
    }
    let entry = batch.get(entityId);
    if (!entry) {
      entry = {};
      entry.promise = new Promise((resolve, reject) => Object.assign(entry, { resolve, reject }));
      batch.set(entityId, entry);
    }
    remember(cache, key, { promise: entry.promise, fetchedAt: now() });
    return entry.promise;
  }

  return { load, cacheSize: (hass) => stateFor(hass).cache.size };
}

module.exports = { createAreaGraphLoader };
