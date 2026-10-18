"use strict";

// The area view's bulk switches ("Alle Karten ausblenden", "Alle im Dashboard
// deaktivieren") and the buttons of its lists that switch every card back.

// The entities a bulk switch changes: those where it is not on yet.
function entitiesToSwitch(entityIds, configuration, key) {
  return entityIds.filter((entityId) => !configuration?.entities?.[entityId]?.[key]);
}

// Switching many cards at once is undone card by card or with the list's
// button, so ask first, naming how many and where. Without a confirm dialog
// (no browser window) it goes ahead.
function confirmBulkSwitch({ key, count, area, translate, confirm = globalThis.confirm }) {
  const message = translate(`entity.confirm_${key === "disabled" ? "disable" : "hide"}_all.${count === 1 ? "one" : "other"}`)
    .replace("{count}", String(count))
    .replace("{area}", area);
  if (typeof confirm !== "function") return true;
  return Boolean(confirm(message));
}

// The switches to turn off so every card of a list shows again, each with the
// entities it is on for. The list of hidden cards also holds cards taken out
// of the area.
function switchesToRestore(entityIds, configuration, keys) {
  return keys
    .map((key) => ({
      key,
      entities: entityIds.filter((entityId) => Boolean(configuration?.entities?.[entityId]?.[key])),
    }))
    .filter(({ entities }) => entities.length > 0);
}

module.exports = { confirmBulkSwitch, entitiesToSwitch, switchesToRestore };
