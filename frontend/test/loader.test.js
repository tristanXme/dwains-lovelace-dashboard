"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const source = fs.readFileSync(
  path.join(__dirname, "../src/standalone/dwains-dashboard-loader.js"),
  "utf8",
);
const loaderUrl = "http://ha.local/dwains_dashboard/js/dwains-dashboard-loader.js?version=3.11.0-abc";
const bundleUrl = "http://ha.local/dwains_dashboard/js/dwains-dashboard.js?version=3.11.0-abc";
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

// Runs the loader the way postbuild.mjs ships it, with a fake window.
function runLoader({ language, hassLanguage, fetch, languageFiles = { de: "lang/de.1234.json" } } = {}) {
  const imports = [];
  const preloads = [];
  const window = {
    location: { pathname: "/dwains-dashboard/home", origin: "http://ha.local" },
    localStorage: {
      removeItem() {},
      getItem: (key) => (key === "selectedLanguage" && language ? JSON.stringify(language) : null),
    },
    sessionStorage: { removeItem() {} },
    navigator: { language: "en-US" },
    document: {
      querySelector: (selector) => (selector === "home-assistant" && hassLanguage ? { hass: { language: hassLanguage } } : null),
      createElement: () => ({}),
      head: { appendChild: (link) => preloads.push(link) },
    },
    fetch,
    addEventListener() {},
  };
  const run = new Function(
    "window", "importModule", "metaUrl",
    source
      .replace("/*DD_LANGUAGE_FILES*/{}", JSON.stringify(languageFiles))
      .replaceAll("import.meta.url", "metaUrl")
      .replace("import(url)", "importModule(url)"),
  );
  run(window, (url) => { imports.push(url); return Promise.resolve(); }, loaderUrl);
  return { imports, preloads, state: window[Symbol.for("dwains-dashboard.runtime")] };
}

test("loader requests the bundle with the loader's own version", async () => {
  const { imports, preloads } = runLoader({ fetch: () => assert.fail("English needs no strings file") });
  await tick();
  assert.deepEqual(imports, [bundleUrl]);
  assert.deepEqual(preloads, []);
});

test("loader loads the strings before the bundle runs", async () => {
  const requested = [];
  let respond;
  const fetch = (url) => {
    requested.push(url);
    return new Promise((resolve) => { respond = resolve; });
  };
  const { imports, preloads, state } = runLoader({ language: "de-CH", fetch });
  assert.deepEqual(requested, ["http://ha.local/dwains_dashboard/js/lang/de.1234.json"]);
  assert.equal(preloads[0].rel, "modulepreload");
  assert.equal(preloads[0].href, bundleUrl);
  await tick();
  assert.deepEqual(imports, [], "the bundle waits for the strings");

  respond({ ok: true, json: async () => ({ global: { version: "Version" } }) });
  await tick();
  await tick();
  assert.deepEqual(imports, [bundleUrl]);
  assert.deepEqual(state.translations.de, { global: { version: "Version" } });
});

test("loader prefers the language Home Assistant already uses", async () => {
  const requested = [];
  const fetch = async (url) => {
    requested.push(url);
    return { ok: true, json: async () => ({}) };
  };
  runLoader({ language: "en", hassLanguage: "de", fetch });
  assert.deepEqual(requested, ["http://ha.local/dwains_dashboard/js/lang/de.1234.json"]);
});

test("loader still starts the bundle when the strings fail", async () => {
  const errors = [];
  const originalError = console.error;
  console.error = (...args) => errors.push(args);
  try {
    const { imports } = runLoader({ language: "de", fetch: async () => ({ ok: false, status: 404 }) });
    await tick();
    await tick();
    await tick();
    assert.deepEqual(imports, [bundleUrl]);
    assert.equal(errors.length, 1);
  } finally {
    console.error = originalError;
  }
});
