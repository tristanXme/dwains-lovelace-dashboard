"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const { errorText, reportSaveError } = require("../src/save-error");

const translate = (key) => (key === "global.save_failed" ? "Saving failed" : key);

test("a failed save is shown as a Home Assistant toast", () => {
  const events = [];
  const target = { dispatchEvent: (event) => events.push(event) };
  const originalError = console.error;
  console.error = () => {};
  try {
    reportSaveError({ code: "invalid_format", message: "Card must be a mapping" }, { translate, target });
  } finally {
    console.error = originalError;
  }
  assert.equal(events.length, 1);
  assert.equal(events[0].type, "hass-notification");
  assert.equal(events[0].bubbles, true);
  assert.equal(events[0].composed, true);
  assert.deepEqual(events[0].detail, { message: "Saving failed: Card must be a mapping" });
});

test("error texts", () => {
  assert.equal(errorText("plain"), "plain");
  assert.equal(errorText({ code: "unauthorized" }), "unauthorized");
  assert.equal(errorText(new Error("offline")), "offline");
});

test("an outdated page asks once for a reload", () => {
  const { reportOutdatedPage } = require("../src/save-error");
  const events = [];
  let reloads = 0;
  const target = { dispatchEvent: (event) => events.push(event) };
  const options = { translate: (key) => `<${key}>`, refreshText: "Refresh", target, reload: () => { reloads += 1; } };
  assert.equal(reportOutdatedPage(options), true);
  assert.equal(reportOutdatedPage(options), false, "only once per page");
  assert.equal(events.length, 1);
  assert.equal(events[0].type, "hass-notification");
  assert.equal(events[0].detail.message, "<global.reload_after_update>");
  assert.equal(events[0].detail.action.text, "Refresh");
  events[0].detail.action.action();
  assert.equal(reloads, 1);
});
