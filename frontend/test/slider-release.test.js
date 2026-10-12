"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { releaseSliders, releaseSlidersWhenGone } = require("../src/slider-release");

// A circular slider with Home Assistant's private teardown.
function slider() {
  return {
    localName: "ha-control-circular-slider",
    released: 0,
    _destroyListeners() { this.released += 1; },
  };
}

const element = (localName, { children = [], shadow = [] } = {}) => ({
  localName,
  children,
  shadowRoot: shadow.length ? { children: shadow } : null,
  isConnected: false,
});

test("sliders in children and in nested shadow roots are released", () => {
  const inShadow = slider();
  const deeper = slider();
  const child = slider();
  const card = element("hui-thermostat-card", {
    shadow: [element("ha-card", { children: [element("ha-state-control-climate-temperature", { shadow: [inShadow] })] })],
    children: [element("div", { children: [child, element("span", { shadow: [deeper] })] })],
  });
  releaseSliders(card);
  assert.deepEqual([inShadow.released, child.released, deeper.released], [1, 1, 1]);
});

test("a slider without the private teardown is left alone", () => {
  const renamed = { localName: "ha-control-circular-slider" };
  assert.doesNotThrow(() => releaseSliders(element("div", { children: [renamed] })));
});

test("a failing teardown is reported and the others are still released", () => {
  const broken = { localName: "ha-control-circular-slider", _destroyListeners() { throw new Error("gone"); } };
  const working = slider();
  const errors = [];
  releaseSliders(element("div", { children: [broken, working] }), (message) => errors.push(message));
  assert.equal(working.released, 1);
  assert.equal(errors.length, 1);
});

test("an element that comes back keeps its sliders, one that stays away releases them", () => {
  const timers = [];
  const setTimer = (callback, ms) => timers.push([callback, ms]);
  const back = slider();
  const gone = slider();
  const backCard = element("div", { children: [back] });
  const goneCard = element("div", { children: [gone] });
  releaseSlidersWhenGone(backCard, { setTimer });
  releaseSlidersWhenGone(goneCard, { setTimer });
  assert.equal(timers[0][1], 1000);
  backCard.isConnected = true;
  for (const [callback] of timers) callback();
  assert.equal(back.released, 0);
  assert.equal(gone.released, 1);
});
