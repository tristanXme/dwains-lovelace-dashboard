"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { loadedLanguage, requestLanguage, rerenderDwainsElements } = require("../src/language-loader");

const fakeWindow = (fetch) => {
  const window = { fetch };
  window[Symbol.for("dwains-dashboard.runtime")] = { languageFiles: { de: "/lang/de.json" } };
  return window;
};

test("a language is fetched once and re-renders the dashboard", async () => {
  let fetches = 0;
  let rendered = 0;
  const window = fakeWindow(async () => {
    fetches += 1;
    return { ok: true, json: async () => ({ area: { title: "Bereich" } }) };
  });
  const options = { windowObject: window, onLoaded: () => { rendered += 1; } };
  const first = requestLanguage("de", options);
  const second = requestLanguage("de", options);
  assert.equal(first, second);
  assert.deepEqual(await first, { area: { title: "Bereich" } });
  assert.deepEqual(loadedLanguage("de", window), { area: { title: "Bereich" } });
  assert.equal(fetches, 1);
  assert.equal(rendered, 1);
});

test("a failed language is not retried on every render", async () => {
  let fetches = 0;
  const window = fakeWindow(async () => {
    fetches += 1;
    return { ok: false, status: 404 };
  });
  const options = { windowObject: window, onLoaded: () => assert.fail(), reportError: () => {} };
  assert.equal(await requestLanguage("de", options), undefined);
  assert.equal(await requestLanguage("de", options), undefined);
  assert.equal(fetches, 1);
});

test("languages without a file are not fetched", async () => {
  const window = fakeWindow(() => assert.fail("no request expected"));
  assert.equal(await requestLanguage("xx", { windowObject: window }), undefined);
});

test("re-rendering reaches Dwains elements inside shadow roots", () => {
  const updated = [];
  const element = (localName, children = [], shadow) => ({
    localName,
    requestUpdate: () => updated.push(localName),
    shadowRoot: shadow && { querySelectorAll: () => shadow },
    children,
  });
  const inner = element("dwains-area-graph");
  const card = element("homepage-card", [], [inner, element("ha-icon")]);
  const root = { querySelectorAll: () => [element("hui-view"), card] };
  rerenderDwainsElements(root);
  assert.deepEqual(updated, ["homepage-card", "dwains-area-graph"]);
});
