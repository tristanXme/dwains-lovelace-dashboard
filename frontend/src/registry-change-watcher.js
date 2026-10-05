"use strict";

// Home Assistant replaces hass.entities, hass.devices, hass.areas and
// hass.floors when the matching registry changes (an entity moved to another
// area, a device renamed, an area added). The page cards build their data
// from these, so they rebuild once the changes have settled.
const REGISTRY_KEYS = ["entities", "devices", "areas", "floors"];

class RegistryChangeWatcher {
  constructor(
    onChange,
    { delay = 1000, setTimer = (fn, ms) => setTimeout(fn, ms), clearTimer = (id) => clearTimeout(id) } = {},
  ) {
    this._onChange = onChange;
    this._delay = delay;
    this._setTimer = setTimer;
    this._clearTimer = clearTimer;
    this._registries = undefined;
    this._timer = undefined;
  }

  // Call with every new hass; the first call only records the registries.
  update(hass) {
    const registries = REGISTRY_KEYS.map((key) => hass?.[key]);
    const previous = this._registries;
    this._registries = registries;
    if (!previous || registries.every((registry, index) => registry === previous[index])) return;
    if (this._timer !== undefined) this._clearTimer(this._timer);
    this._timer = this._setTimer(() => {
      this._timer = undefined;
      this._onChange();
    }, this._delay);
  }

  // Forget the registries, e.g. when the card is removed or reloads anyway.
  reset() {
    if (this._timer !== undefined) this._clearTimer(this._timer);
    this._timer = undefined;
    this._registries = undefined;
  }
}

module.exports = { RegistryChangeWatcher };
