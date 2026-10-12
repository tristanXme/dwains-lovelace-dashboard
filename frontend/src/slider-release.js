"use strict";

// Home Assistant's circular slider (thermostat and humidifier cards) sets up
// gesture listeners on window when it is connected, but does not remove them
// when it leaves the page (2026.5 to 2026.10). They keep the slider and all
// around it in memory: every visit of the dashboard stayed there. The
// slider's own _destroyListeners() removes them; connected again, the slider
// sets them up anew.
const SLIDER = "ha-control-circular-slider";
const RELEASE_DELAY_MS = 1000;

function releaseSliders(node, reportError = (message, error) => console.error(message, error)) {
  if (!node) return;
  if (node.localName === SLIDER && typeof node._destroyListeners === "function") {
    try {
      node._destroyListeners();
    } catch (error) {
      reportError("Failed to release a slider", error);
    }
  }
  if (node.shadowRoot) releaseSliders(node.shadowRoot, reportError);
  for (const child of node.children || []) releaseSliders(child, reportError);
}

// For an element taken out of the page: release the sliders in it once it
// has stayed out for a moment. Home Assistant moves cards while it builds a
// view, and cards are reused when the page is built again.
function releaseSlidersWhenGone(element, {
  delay = RELEASE_DELAY_MS,
  setTimer = (callback, ms) => setTimeout(callback, ms),
} = {}) {
  if (!element) return;
  setTimer(() => {
    if (!element.isConnected) releaseSliders(element);
  }, delay);
}

module.exports = { releaseSliders, releaseSlidersWhenGone };
