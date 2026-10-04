"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { WebSocketReadStore } = require("../src/websocket-read-store");
const { READ_MESSAGES } = require("../src/websocket-read-messages");

function fakeHass() {
  const calls = [];
  const hass = {
    connection: {},
    entities: {},
    devices: {},
    callWS: async (message) => {
      calls.push(message.type);
      return [`${message.type}#${calls.length}`];
    },
  };
  return { hass, calls };
}

test("registry reads are reused while hass registry objects are unchanged", async () => {
  let now = 0;
  const store = new WebSocketReadStore({ ttl: 3000, now: () => now });
  const { hass, calls } = fakeHass();

  const first = await store.read(hass, READ_MESSAGES.entities);
  now += 60_000;
  assert.deepEqual(await store.read(hass, READ_MESSAGES.entities), first);
  assert.equal(calls.length, 1);

  // The HA frontend swaps hass.entities after an entity registry update.
  hass.entities = {};
  assert.notDeepEqual(await store.read(hass, READ_MESSAGES.entities), first);
  assert.equal(calls.length, 2);
});

test("non-registry reads still expire after the ttl", async () => {
  let now = 0;
  const store = new WebSocketReadStore({ ttl: 3000, now: () => now });
  const { hass, calls } = fakeHass();
  await store.read(hass, READ_MESSAGES.configuration);
  now += 4000;
  await store.read(hass, READ_MESSAGES.configuration);
  assert.equal(calls.length, 2);
});

test("event invalidated configuration is kept until invalidated", async () => {
  let now = 0;
  const store = new WebSocketReadStore({ ttl: 3000, now: () => now });
  const { hass, calls } = fakeHass();
  store.markEventInvalidation(hass, true);

  await store.read(hass, READ_MESSAGES.configuration);
  now += 60_000;
  await store.read(hass, READ_MESSAGES.configuration);
  assert.equal(calls.length, 1);

  store.invalidate(hass, READ_MESSAGES.configuration);
  await store.read(hass, READ_MESSAGES.configuration);
  assert.equal(calls.length, 2);

  store.markEventInvalidation(hass, false);
  now += 60_000;
  await store.read(hass, READ_MESSAGES.configuration);
  assert.equal(calls.length, 3);
});

test("a full invalidation also drops cached registries", async () => {
  const store = new WebSocketReadStore();
  const { hass, calls } = fakeHass();
  await store.read(hass, READ_MESSAGES.devices);
  store.invalidate(hass);
  await store.read(hass, READ_MESSAGES.devices);
  assert.equal(calls.length, 2);
});
