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

const { stringsWhileLoading } = require("../src/language-loader");

test("while a new language loads, the one shown before stays", async () => {
  let deliver;
  const window = fakeWindow(() => new Promise((resolve) => { deliver = resolve; }));
  window[Symbol.for("dwains-dashboard.runtime")].languageFiles.fr = "/lang/fr.json";
  window[Symbol.for("dwains-dashboard.runtime")].translations = { de: { area: { title: "Bereich" } } };
  const options = { windowObject: window, onLoaded: () => {}, reportError: () => {} };

  assert.equal(stringsWhileLoading(["de"], window), undefined, "German is there");
  const request = requestLanguage("fr", options);
  assert.deepEqual(stringsWhileLoading(["fr"], window), { area: { title: "Bereich" } });

  deliver({ ok: true, json: async () => ({ area: { title: "Zone" } }) });
  await request;
  assert.equal(stringsWhileLoading(["fr"], window), undefined, "French is there");
});

test("a language without strings falls back to English, not to the previous one", async () => {
  const window = fakeWindow(async () => ({ ok: false, status: 404 }));
  window[Symbol.for("dwains-dashboard.runtime")].translations = { de: { area: { title: "Bereich" } } };
  const options = { windowObject: window, onLoaded: () => {}, reportError: () => {} };
  assert.equal(stringsWhileLoading(["de"], window), undefined);
  // No file at all (e.g. Japanese): English right away.
  assert.equal(stringsWhileLoading(["ja"], window), undefined);
  // A file that fails to load: English once the failure is known.
  window[Symbol.for("dwains-dashboard.runtime")].translations = { de: { area: { title: "Bereich" } } };
  stringsWhileLoading(["de"], window);
  window[Symbol.for("dwains-dashboard.runtime")].languageFiles.fr = "/lang/fr.json";
  await requestLanguage("fr", options);
  assert.equal(stringsWhileLoading(["fr"], window), undefined);
});
