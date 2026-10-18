"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { loadViewBeforeOpening } = require("../src/more-page-views");

const root = (paths) => ({ lovelace: { config: { views: paths.map((path) => ({ path })) } } });

test("a path among the loaded views opens without loading them again", async () => {
  const refreshed = [];
  const options = { resolveRoot: () => root(["home", "devices", "more_page_garden", "more_page"]), refresh: (args) => refreshed.push(args) };
  assert.equal(await loadViewBeforeOpening("/dwains-dashboard/more_page_garden", options), false);
  assert.equal(await loadViewBeforeOpening("/dwains-dashboard/devices#light", options), false);
  assert.equal(await loadViewBeforeOpening("/dwains-dashboard/home?edit=1", options), false);
  assert.deepEqual(refreshed, []);
});

test("a page added in another browser loads the views first", async () => {
  const refreshed = [];
  const options = { resolveRoot: () => root(["home", "more_page"]), refresh: async (args) => { refreshed.push(args); } };
  assert.equal(await loadViewBeforeOpening("/dwains-dashboard/more_page_new#top", options), true);
  assert.deepEqual(refreshed, [{}]);
});

test("without a dashboard shown, or when loading fails, the path opens as before", async () => {
  const errors = [];
  assert.equal(await loadViewBeforeOpening("/dwains-dashboard/more_page_new", { resolveRoot: () => null, refresh: () => assert.fail() }), false);
  assert.equal(await loadViewBeforeOpening("/dwains-dashboard", { resolveRoot: () => root(["home"]), refresh: () => assert.fail() }), false);
  assert.equal(await loadViewBeforeOpening("/dwains-dashboard/more_page_new", {
    resolveRoot: () => root(["home"]),
    refresh: async () => { throw new Error("timeout"); },
    reportError: (message) => errors.push(message),
  }), false);
  assert.deepEqual(errors, ["Dwains Dashboard: the view more_page_new could not be loaded"]);
});
