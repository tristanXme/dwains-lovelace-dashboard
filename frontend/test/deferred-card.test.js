"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { CardReuse, attachDeferredCard, cardReuseKey } = require("../src/deferred-card");

const build = async (reuse, configs, created) => {
  reuse.startBuild();
  const items = configs.map(([slot, config]) => attachDeferredCard({}, async () => {
    const card = { config };
    created.push(card);
    return card;
  }, { reuse, key: cardReuseKey(slot, config) }));
  await Promise.all(items.map((item) => item.cardFactory()));
  return items;
};

test("a rebuild keeps the cards whose configuration stayed the same", async () => {
  const reuse = new CardReuse();
  const created = [];
  const lamp = { type: "tile", entity: "light.lamp" };
  const fan = { type: "tile", entity: "fan.fan" };
  const first = await build(reuse, [["area:a", lamp], ["area:a", fan]], created);
  assert.equal(created.length, 2);

  // The fan card changed, the lamp card did not.
  const fanGraph = { ...fan, features: [{ type: "fan-speed" }] };
  const second = await build(reuse, [["area:a", { ...lamp }], ["area:a", fanGraph]], created);
  assert.equal(created.length, 3, "only the changed card is created");
  assert.equal(second[0].card, first[0].card);
  assert.notEqual(second[1].card, first[1].card);
});

test("one card is never shown in two places", async () => {
  const reuse = new CardReuse();
  const created = [];
  const lamp = { type: "tile", entity: "light.lamp" };
  await build(reuse, [["favorite", lamp], ["area:a", lamp]], created);
  const second = await build(reuse, [["favorite", lamp], ["area:a", lamp], ["area:a", lamp]], created);
  assert.equal(new Set(second.map((item) => item.card)).size, 3);
  assert.equal(created.length, 3, "the third item needed a card of its own");
});

test("cards that are no longer shown are let go", async () => {
  const reuse = new CardReuse();
  const created = [];
  const lamp = { type: "tile", entity: "light.lamp" };
  await build(reuse, [["area:a", lamp]], created);
  await build(reuse, [], created);
  await build(reuse, [["area:a", lamp]], created);
  assert.equal(created.length, 2);
});

test("a card still being created when the next build starts is not reused", async () => {
  const reuse = new CardReuse();
  const lamp = { type: "tile", entity: "light.lamp" };
  const key = cardReuseKey("area:a", lamp);
  // Build 1: the card is requested, its creation still runs.
  reuse.startBuild();
  let finishStale;
  const stale = attachDeferredCard({}, () => new Promise((resolve) => { finishStale = resolve; }), { reuse, key });
  const stalePending = stale.cardFactory();
  // Build 2 shows its own card for the lamp, created a little later.
  reuse.startBuild();
  let finishShown;
  const shown = attachDeferredCard({}, () => new Promise((resolve) => { finishShown = resolve; }), { reuse, key });
  const shownPending = shown.cardFactory();
  // Card factories start on the next microtask.
  await Promise.resolve();
  // The stale creation finishes first.
  finishStale({ name: "stale" });
  await stalePending;
  finishShown({ name: "shown" });
  await shownPending;
  // Build 3 keeps the card build 2 shows.
  reuse.startBuild();
  const third = attachDeferredCard({}, () => assert.fail("no new card expected"), { reuse, key });
  assert.equal(third.card.name, "shown");
});
