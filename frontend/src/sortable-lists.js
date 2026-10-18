"use strict";

const { loadSortable } = require("./lazy-modules");
const { savingSortableOptions } = require("./sortable-save");

// Makes the lists of an edit mode drag-sortable, the same way everywhere:
// a drag saves the order (see sortable-save.js) and applyOrder(order) shows
// it, as the lists are rendered with lit's keyed repeat. Sortable is loaded
// on first use, so isActive() tells whether the edit mode is still on once
// it has arrived; then replace(sortables) takes the new instances in place
// of the old ones. Items are dragged by their `handle`.
async function attachSortableLists({
  isActive,
  lists,
  dataIdAttr,
  save,
  onError,
  applyOrder,
  replace,
  handle = ".sortable-move",
}) {
  let Sortable;
  try {
    Sortable = await loadSortable();
  } catch (error) {
    console.error("Dwains Dashboard: failed to load drag and drop (reload the page after an update)", error);
    return;
  }
  if (!isActive()) return;
  replace([]);
  replace([...lists()].map((element) => new Sortable(element, {
    forceFallback: true,
    animation: 150,
    dataIdAttr,
    handle,
    ...savingSortableOptions(save, onError, { applyOrder }),
  })));
}

module.exports = { attachSortableLists };
