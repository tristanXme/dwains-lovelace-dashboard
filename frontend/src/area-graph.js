"use strict";

/**
 * Helpers for the small history graph at the bottom of an area tile.
 * Kept free of Lit/HA so they can be unit tested with node --test.
 */

const AREA_GRAPH_HOURS = Object.freeze([6, 12, 24, 48, 168]);
const DEFAULT_AREA_GRAPH_HOURS = 24;

function normalizeGraphHours(value) {
  const hours = Number(value);
  return AREA_GRAPH_HOURS.includes(hours) ? hours : DEFAULT_AREA_GRAPH_HOURS;
}

/**
 * Turn a `history/history_during_period` result for one entity into sorted
 * numeric points. Accepts the compressed format ({s, lu}) and the full
 * format ({state, last_updated}); non-numeric states are skipped.
 */
function historyToPoints(entries) {
  const points = [];
  for (const entry of entries || []) {
    const raw = entry.s ?? entry.state;
    const value = Number(raw);
    if (raw === "" || raw === null || raw === undefined || !Number.isFinite(value)) continue;
    let time = entry.lu ?? entry.lc;
    if (time !== undefined) {
      time = Number(time) * 1000;
    } else {
      time = Date.parse(entry.last_updated ?? entry.last_changed);
    }
    if (!Number.isFinite(time)) continue;
    points.push({ time, value });
  }
  points.sort((a, b) => a.time - b.time);
  return points;
}

/**
 * Average points into a fixed number of time buckets so a busy sensor does
 * not produce thousands of path segments. Empty buckets carry the previous
 * value forward, which matches how HA draws step histories.
 */
function bucketPoints(points, { start, end, buckets = 48 }) {
  if (!points.length || end <= start) return [];
  const size = (end - start) / buckets;
  const sums = new Array(buckets).fill(0);
  const counts = new Array(buckets).fill(0);
  let before;
  for (const point of points) {
    if (point.time < start) {
      before = point.value;
      continue;
    }
    const index = Math.min(buckets - 1, Math.floor((point.time - start) / size));
    sums[index] += point.value;
    counts[index] += 1;
  }
  const values = [];
  let last = before;
  for (let index = 0; index < buckets; index++) {
    if (counts[index]) last = sums[index] / counts[index];
    values.push(last);
  }
  const firstKnown = values.findIndex((value) => value !== undefined);
  if (firstKnown === -1) return [];
  return values.map((value) => (value === undefined ? values[firstKnown] : value));
}

/** Smooth SVG path (line and closed area) for values in a width x height box. */
function graphPaths(values, width, height, { padTop = 4, padBottom = 2 } = {}) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const x = (index) => (index / (values.length - 1)) * width;
  const y = (value) => padTop + (1 - (value - min) / span) * (height - padTop - padBottom);
  const round = (number) => Math.round(number * 10) / 10;
  let line = `M${round(x(0))},${round(y(values[0]))}`;
  for (let index = 1; index < values.length; index++) {
    const cx = round((x(index - 1) + x(index)) / 2);
    line += ` C${cx},${round(y(values[index - 1]))} ${cx},${round(y(values[index]))} ${round(x(index))},${round(y(values[index]))}`;
  }
  return { line, area: `${line} L${width},${height} L0,${height} Z`, min, max };
}

module.exports = {
  AREA_GRAPH_HOURS,
  DEFAULT_AREA_GRAPH_HOURS,
  normalizeGraphHours,
  historyToPoints,
  bucketPoints,
  graphPaths,
};
