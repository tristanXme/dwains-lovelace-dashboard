"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { isEditorTag } = require("../src/lazy-modules");

const src = path.join(__dirname, "../src");
const config = require("../../webpack.config.js")({}, { mode: "production" });

// Local files a module imports or requires statically (import() is lazy).
function staticImports(file) {
  const source = fs.readFileSync(file, "utf8");
  const specifiers = [
    ...source.matchAll(/^\s*import\s+(?:[^"';]*?\s+from\s+)?["'](\.{1,2}\/[^"']+)["']/gm),
    ...source.matchAll(/require\(\s*["'](\.{1,2}\/[^"']+)["']\s*\)/g),
  ].map((match) => match[1]);
  return specifiers
    .map((specifier) => path.resolve(path.dirname(file), specifier))
    .map((resolved) => (fs.existsSync(resolved) ? resolved : `${resolved}.js`))
    .filter((resolved) => resolved.endsWith(".js") && fs.existsSync(resolved));
}

function reachable(files) {
  const seen = new Set();
  const queue = [...files];
  while (queue.length) {
    const file = queue.pop();
    if (seen.has(file)) continue;
    seen.add(file);
    queue.push(...staticImports(file));
  }
  return seen;
}

const entries = reachable(config.entry.map((entry) => path.resolve(__dirname, "../..", entry)));
const editors = new Set([...reachable([path.join(src, "editors.js")])].filter((file) => !entries.has(file)));

// Files that define custom elements, and the tags they define.
const definitions = fs.readdirSync(src, { recursive: true })
  .filter((file) => file.endsWith(".js") && !file.startsWith("standalone"))
  .map((file) => [path.join(src, file), [...fs.readFileSync(path.join(src, file), "utf8").matchAll(/defineDwainsElement\(\s*["']([\w-]+)["']/g)].map((m) => m[1])])
  .filter(([, tags]) => tags.length);

test("every custom element is in the bundle or in the editors file", () => {
  for (const [file, tags] of definitions) {
    assert.ok(entries.has(file) || editors.has(file), `${path.basename(file)} (${tags.join(", ")}) is not loaded`);
  }
});

test("editor elements are loaded on demand when a popup asks for them", () => {
  for (const [file, tags] of definitions) {
    if (!editors.has(file)) continue;
    for (const tag of tags) assert.ok(isEditorTag(tag), `${tag} would be created before its file loads`);
  }
});

test("the editors stay out of the main bundle", () => {
  for (const file of ["dwains-card-editor.js", "dwains-edit-area-button-card.js", "dwains-create-custom-card-card.js"]) {
    assert.ok(!entries.has(path.join(src, file)), file);
    assert.ok(editors.has(path.join(src, file)), file);
  }
});
