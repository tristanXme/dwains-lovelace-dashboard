"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { PopupHistoryController } = require("../src/popup-history-controller");

// A history with entries and a position, like the browser's. With `later`
// it goes back only when `traverse()` is called, as the browser does after
// the current task.
function fakeWindow({ later = false } = {}) {
  const listeners = {};
  const history = {
    entries: [{ state: { page: true } }],
    index: 0,
    pending: [],
    leftPage: false,
    get state() { return this.entries[this.index].state; },
    get length() { return this.entries.length; },
    replaceState(state) { this.entries[this.index] = { state }; },
    pushState(state) {
      this.entries = this.entries.slice(0, this.index + 1);
      this.entries.push({ state });
      this.index += 1;
    },
    go(delta) {
      this.pending.push(delta);
      if (!later) this.traverse();
    },
    traverse() {
      for (const delta of this.pending.splice(0)) {
        if (this.index + delta < 0) {
          this.leftPage = true;
          continue;
        }
        this.index += delta;
        listeners.popstate?.({ state: this.state });
      }
    },
  };
  return {
    history,
    addEventListener(type, handler) { listeners[type] = handler; },
    removeEventListener(type) { delete listeners[type]; },
  };
}

test("closing a popup leaves its history entry, so Back leaves the page", () => {
  const window = fakeWindow();
  const controller = new PopupHistoryController({ windowObject: window });
  let open = false;
  const popup = { closeDialog() { open = false; controller.markClosed(); } };
  controller.connect(popup, () => { open = true; });

  controller.recordOpen({ title: "Light" });
  open = true;
  assert.equal(window.history.index, 1);
  popup.closeDialog();
  assert.equal(open, false);
  assert.equal(window.history.index, 0, "back on the page's entry");
});

test("a popup opened from a popup: closing leaves both entries", () => {
  const window = fakeWindow();
  const controller = new PopupHistoryController({ windowObject: window });
  const popup = { closeDialog() { controller.markClosed(); } };
  controller.connect(popup, () => {});
  controller.recordOpen({ title: "Windows" });
  controller.recordOpen({ title: "Window kitchen" });
  assert.equal(window.history.index, 2);
  popup.closeDialog();
  assert.equal(window.history.index, 0);
});

test("closed twice before the browser went back, it goes back once", () => {
  // Save clicked twice, or the dialog reporting its close after its
  // animation: going back twice would leave the page.
  const window = fakeWindow({ later: true });
  const controller = new PopupHistoryController({ windowObject: window });
  const popup = { closeDialog() { controller.markClosed(); } };
  controller.connect(popup, () => {});
  controller.recordOpen({ title: "Living room" });
  popup.closeDialog();
  popup.closeDialog();
  window.history.traverse();
  assert.equal(window.history.leftPage, false);
  assert.equal(window.history.index, 0, "back on the page's entry");
  assert.equal(window.history.state.cardToolsPopup, false);
});

test("closed through Back, nothing more is left", () => {
  const window = fakeWindow();
  const controller = new PopupHistoryController({ windowObject: window });
  const popup = { closeDialog() { controller.markClosed(); } };
  controller.connect(popup, () => {});
  controller.recordOpen({ title: "Light" });
  window.history.go(-1);
  assert.equal(window.history.index, 0);
});
