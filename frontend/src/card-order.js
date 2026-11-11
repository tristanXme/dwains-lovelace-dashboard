"use strict";

// Sorted views of card lists, kept between renders. Rendering must not sort
// (or otherwise change) the shared lists, and sorting on every state change
// is wasted work, so a sorted copy is remembered per list and only rebuilt
// when the list itself, its items or the sort values of its items change
// (a loaded list, a dragged order shown by applyLocalOrder, a registry
// change). Checking that costs one pass; sorting costs n log n.

const compareValues = (a, b) => (a == b ? 0 : a > b ? 1 : -1);

// Stable ordering by item[sortKey], then (optionally) item[tieKey]; items
// equal in both keep their order in `items`.
function sortedCopy(items, sortKey, tieKey) {
  return [...items].sort((x, y) => {
    const byKey = compareValues(x[sortKey], y[sortKey]);
    return byKey !== 0 || !tieKey ? byKey : compareValues(x[tieKey], y[tieKey]);
  });
}

const cache = new WeakMap(); // items -> Map("sortKey|tieKey" -> entry)

function isFresh(entry, items, sortKey, tieKey) {
  const { source, values, ties } = entry;
  if (source.length !== items.length) return false;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (source[i] !== item || values[i] !== item[sortKey]) return false;
    if (tieKey && ties[i] !== item[tieKey]) return false;
  }
  return true;
}

// The items ordered by sortKey (then tieKey). The same array is returned
// while nothing it depends on changed, so callers can key further caches on
// it; it must not be modified by the caller.
function sortedByKey(items, sortKey, tieKey) {
  let perList = cache.get(items);
  if (!perList) cache.set(items, (perList = new Map()));
  const id = `${sortKey}|${tieKey || ""}`;
  const entry = perList.get(id);
  if (entry && isFresh(entry, items, sortKey, tieKey)) return entry.result;
  const next = {
    source: [...items],
    values: items.map((item) => item[sortKey]),
    ties: tieKey ? items.map((item) => item[tieKey]) : [],
    result: sortedCopy(items, sortKey, tieKey),
  };
  perList.set(id, next);
  return next.result;
}

const groups = new WeakMap(); // sorted cards -> { devices, signature, result }

// Cards (already ordered) grouped by domain, with the domain keys ordered by
// devices[domain].sort_order (99 when unset). Remembered per sorted list and
// per sort orders of the devices, so it is rebuilt only when either changes.
// (sortedCards must come from sortedByKey, whose array stays the same while
// its contents do.)
function groupedByDomain(sortedCards, devices) {
  const config = devices || {};
  const orderOf = (domain) => (config[domain] && config[domain].sort_order ? config[domain].sort_order : 99);
  const signatureOf = (domains) => domains.map((domain) => `${domain}=${orderOf(domain)}`).join("|");
  const kept = groups.get(sortedCards);
  if (kept && kept.signature === signatureOf(kept.domains)) return kept.result;
  const byDomain = new Map();
  for (const card of sortedCards) {
    const list = byDomain.get(card.domain);
    if (list) list.push(card);
    else byDomain.set(card.domain, [card]);
  }
  const domains = [...byDomain.keys()];
  const result = {
    group: Object.fromEntries(byDomain),
    keys: [...domains].sort((x, y) => compareValues(orderOf(x), orderOf(y))),
  };
  groups.set(sortedCards, { domains, signature: signatureOf(domains), result });
  return result;
}

module.exports = { sortedByKey, groupedByDomain };
