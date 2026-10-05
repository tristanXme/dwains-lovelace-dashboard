"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { DisconnectGrace } = require("../src/disconnect-grace");

function grace() {
  const timers = [];
  const instance = new DisconnectGrace({
    setTimer: (fn) => { timers.push(fn); return timers.length; },
    clearTimer: (id) => { timers[id - 1] = undefined; },
  });
  return { instance, fire: () => timers.splice(0).forEach((fn) => fn?.()) };
}

test("a card that comes back keeps its state", () => {
  const { instance, fire } = grace();
  const element = { isConnected: false };
  let teardowns = 0;
  instance.schedule(element, () => { teardowns += 1; });
  element.isConnected = true;
  assert.equal(instance.cancel(), true);
  fire();
  assert.equal(teardowns, 0);
});

test("a card that stays away is torn down once", () => {
  const { instance, fire } = grace();
  let teardowns = 0;
  instance.schedule({ isConnected: false }, () => { teardowns += 1; });
  fire();
  assert.equal(teardowns, 1);
  assert.equal(instance.cancel(), false, "nothing pending, a later connect sets up again");
});
