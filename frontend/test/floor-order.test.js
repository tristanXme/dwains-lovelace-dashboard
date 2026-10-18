"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { floorGroups, mergeFloorOrder, orderedFloors } = require("../src/floor-order");

const floors = [
  { floor_id: "og", name: "OG" },
  { floor_id: "eg", name: "EG" },
  { floor_id: "attic", name: "Attic" },
  { floor_id: "keller", name: "Keller" },
];

test("floor groups follow the registry order, areas without a floor last", () => {
  const items = [
    { id: "garden", floor: null },
    { id: "kitchen", floor: "eg" },
    { id: "cellar", floor: "keller" },
    { id: "bath", floor: "og" },
    { id: "hall", floor: "eg" },
    { id: "old", floor: "deleted_floor" },
  ];
  const groups = floorGroups(items, floors, (item) => item.floor, "No floor");
  assert.deepEqual(groups.map((group) => [group.floorId, group.name]), [
    ["og", "OG"], ["eg", "EG"], ["keller", "Keller"], [null, "No floor"],
  ], "the attic has no areas and is left out");
  assert.deepEqual(groups[1].items.map((item) => item.id), ["kitchen", "hall"], "areas keep their order");
  assert.deepEqual(groups[3].items.map((item) => item.id), ["garden", "old"]);
});

test("floor groups without floors", () => {
  assert.deepEqual(floorGroups([{ floor: null }], undefined, (item) => item.floor, "No floor").map((group) => group.floorId), [null]);
  assert.deepEqual(floorGroups([], floors, (item) => item.floor, "No floor"), []);
});

test("a drag orders the shown floors, the others keep their places", () => {
  const ids = floors.map((floor) => floor.floor_id);
  assert.deepEqual(mergeFloorOrder(ids, ["keller", "eg", "og"]), ["keller", "eg", "attic", "og"]);
  assert.deepEqual(mergeFloorOrder(ids, ["eg", "og"]), ["eg", "og", "attic", "keller"]);
  assert.deepEqual(mergeFloorOrder(ids, []), ids);
});

test("every floor is saved exactly once", () => {
  const ids = floors.map((floor) => floor.floor_id);
  // A floor deleted meanwhile, or one listed twice, does not end up in it.
  const merged = mergeFloorOrder(ids, ["gone", "keller", "keller", "og"]);
  assert.deepEqual(merged, ["keller", "eg", "attic", "og"]);
  assert.deepEqual([...merged].sort(), [...ids].sort());
});

test("ordered floors are the entries in the dragged order", () => {
  assert.deepEqual(orderedFloors(floors, ["eg", "og"]).map((floor) => floor.name), ["EG", "OG", "Attic", "Keller"]);
});
