"use strict";

// The homepage groups the area tiles by floor in Home Assistant's own order
// of the floors (the order of Settings > Areas, which is the order the floor
// registry lists them in). Areas without a floor come last.

// [{ floorId, name, items }] in that order. `floors` are the floor registry
// entries in their order; floorIdOf(item) is the floor of an item. An item
// without a floor, or with a floor that no longer exists, is in the group
// without a floor (floorId null). Groups without items are left out.
function floorGroups(items, floors, floorIdOf, noFloorName) {
  const groups = new Map((floors || []).map((floor) => [
    floor.floor_id,
    { floorId: floor.floor_id, name: floor.name, items: [] },
  ]));
  const noFloor = { floorId: null, name: noFloorName, items: [] };
  for (const item of items) {
    (groups.get(floorIdOf(item)) || noFloor).items.push(item);
  }
  return [...groups.values(), noFloor].filter((group) => group.items.length);
}

// Home Assistant saves the order of all floors at once, while the homepage
// shows only the floors that have areas. A drag orders the shown floors
// among themselves; the other floors keep their places.
function mergeFloorOrder(floorIds, shownOrder) {
  const known = new Set(floorIds);
  const queue = [...new Set(shownOrder)].filter((id) => known.has(id));
  const shown = new Set(queue);
  return floorIds.map((id) => (shown.has(id) ? queue.shift() : id));
}

// The floor entries in the order a drag of the shown floors gives them.
function orderedFloors(floors, shownOrder) {
  const byId = new Map(floors.map((floor) => [floor.floor_id, floor]));
  return mergeFloorOrder(floors.map((floor) => floor.floor_id), shownOrder).map((id) => byId.get(id));
}

module.exports = { floorGroups, mergeFloorOrder, orderedFloors };
