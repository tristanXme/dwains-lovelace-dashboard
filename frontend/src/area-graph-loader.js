"use strict";

/**
 * Loads the series for the area graphs. Requests of all tiles that render in
 * the same moment are combined into one websocket call per period, results
 * are cached for a few minutes and shared between tiles.
 */

const { historyToPoints, statisticsToPoints, usesStatistics } = require("./area-graph");

const CACHE_TTL_MS = 5 * 60 * 1000;
const BATCH_DELAY_MS = 30;

function createAreaGraphLoader({ now = () => Date.now(), schedule = (fn) => setTimeout(fn, BATCH_DELAY_MS) } = {}) {
  const cache = new Map();
  const batches = new Map();

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
    const batch = batches.get(hours);
    batches.delete(hours);
    const entityIds = [...batch.keys()];
    const request = usesStatistics(hours)
      ? fetchStatistics(hass, entityIds, hours)
      : fetchHistory(hass, entityIds, hours);
    request.then(
      (points) => batch.forEach(({ resolve }, id) => resolve(points[id] || [])),
      (error) => batch.forEach(({ reject }, id) => {
        cache.delete(`${id}|${hours}`);
        reject(error);
      }),
    );
  }

  function load(hass, entityId, hours, { force = false } = {}) {
    const key = `${entityId}|${hours}`;
    const cached = cache.get(key);
    if (!force && cached && now() - cached.fetchedAt < CACHE_TTL_MS) return cached.promise;
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
    cache.set(key, { promise: entry.promise, fetchedAt: now() });
    return entry.promise;
  }

  return { load };
}

module.exports = { createAreaGraphLoader };
