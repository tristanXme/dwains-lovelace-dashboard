"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const source = fs.readFileSync(
  path.join(__dirname, "../src/standalone/dwains-dashboard-loader.js"),
  "utf8",
);

test("loader requests the bundle with the loader's own version", async () => {
  const imports = [];
  const listeners = {};
  const window = {
    location: { pathname: "/dwains-dashboard/home", origin: "http://ha.local" },
    localStorage: { removeItem() {} },
    sessionStorage: { removeItem() {} },
    addEventListener: (type, fn) => { listeners[type] = fn; },
  };
  const loaderUrl = "http://ha.local/dwains_dashboard/js/dwains-dashboard-loader.js?version=3.11.0-abc";
  const run = new Function(
    "window", "importModule", "metaUrl",
    source
      .replaceAll("import.meta.url", "metaUrl")
      .replace("import(bundleUrl())", "importModule(bundleUrl())"),
  );
  run(window, (url) => { imports.push(url); return Promise.resolve(); }, loaderUrl);
  assert.deepEqual(imports, [
    "http://ha.local/dwains_dashboard/js/dwains-dashboard.js?version=3.11.0-abc",
  ]);
});
