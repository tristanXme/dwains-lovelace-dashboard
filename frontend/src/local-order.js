"use strict";

// Gives the items in `order` (ids as Sortable reports them) the positions
// the backend stores for that order (1, 2, …), so the page shows a dragged
// order right away. Items not in `order` keep theirs.
function applyLocalOrder(items, idOf, order, sortKey) {
  const positions = new Map(order.map((id, index) => [String(id), index + 1]));
  let changed = false;
  for (const item of items || []) {
    const position = positions.get(String(idOf(item)));
    if (position !== undefined && item[sortKey] !== position) {
      item[sortKey] = position;
      changed = true;
    }
  }
  return changed;
}

module.exports = { applyLocalOrder };
