"use strict";

// Home Assistant moves cards while it builds a view: the card is removed and
// inserted again a few milliseconds later. Tearing a page card down on every
// removal reloads all its data and recreates every card inside it, so the
// teardown waits a moment and is dropped when the card comes back.
class DisconnectGrace {
  constructor({
    delay = 1000,
    setTimer = (callback, ms) => setTimeout(callback, ms),
    clearTimer = (timer) => clearTimeout(timer),
  } = {}) {
    this._delay = delay;
    this._setTimer = setTimer;
    this._clearTimer = clearTimer;
    this._timer = undefined;
  }

  // From disconnectedCallback: tear down unless the element is back by then.
  schedule(element, teardown) {
    this.cancel();
    this._timer = this._setTimer(() => {
      this._timer = undefined;
      if (!element.isConnected) teardown();
    }, this._delay);
  }

  // From connectedCallback: true when the element came back before its
  // teardown, i.e. it is still set up.
  cancel() {
    if (this._timer === undefined) return false;
    this._clearTimer(this._timer);
    this._timer = undefined;
    return true;
  }
}

module.exports = { DisconnectGrace };
