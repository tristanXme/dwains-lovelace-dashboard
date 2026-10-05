"use strict";

// Home Assistant hands every card a new hass object for each state change
// anywhere in the house, and on a state change it replaces only hass.states.
// A card that knows which entities it shows can skip rendering for changes
// to all other entities. Any other change (language, theme, registries, ...)
// still renders.

const ENTITY_ID = /\b[a-z_][a-z0-9_]*\.[a-z0-9_]+\b/g;

// Entity ids mentioned anywhere in a value, e.g. the dashboard configuration
// (graph, weather and alarm entities, custom cards).
function entityIdsIn(value) {
  return JSON.stringify(value ?? null).match(ENTITY_ID) || [];
}

// entityIds: shown entities; domains: domains whose entities always count.
function relevanceFilter({ entityIds = [], domains = [] } = {}) {
  const ids = new Set(entityIds);
  const domainSet = new Set(domains);
  return (entityId) => ids.has(entityId) || domainSet.has(entityId.slice(0, entityId.indexOf(".")));
}

function hassChangeIsRelevant(previous, next, isRelevantEntity) {
  if (!previous || !next || typeof isRelevantEntity !== "function") return true;
  const keys = Object.keys(next);
  if (keys.length !== Object.keys(previous).length) return true;
  for (const key of keys) {
    if (key !== "states" && previous[key] !== next[key]) return true;
  }
  const before = previous.states;
  const after = next.states;
  if (before === after) return false;
  if (!before || !after) return true;
  for (const entityId in after) {
    if (after[entityId] !== before[entityId] && isRelevantEntity(entityId)) return true;
  }
  for (const entityId in before) {
    if (!(entityId in after) && isRelevantEntity(entityId)) return true;
  }
  return false;
}

module.exports = { entityIdsIn, hassChangeIsRelevant, relevanceFilter };
