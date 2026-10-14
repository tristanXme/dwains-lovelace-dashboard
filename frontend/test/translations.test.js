"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

// The dashboard's own strings: every language has every English string, with
// the same {placeholders}. A missing one shows in English.
const dir = path.join(__dirname, "..", "src", "translations");
const read = (file) => JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));

function strings(node, prefix = "", out = {}) {
  for (const [key, value] of Object.entries(node)) {
    const name = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object") strings(value, name, out);
    else out[name] = String(value);
  }
  return out;
}

const placeholders = (text) => (text.match(/\{\w+\}/g) || []).sort();
const english = strings(read("en.json"));

for (const file of fs.readdirSync(dir).filter((name) => name.endsWith(".json") && name !== "en.json")) {
  test(`${file} has every English string with the same placeholders`, () => {
    const translated = strings(read(file));
    assert.deepEqual(Object.keys(translated).filter((key) => !(key in english)), [], "strings English does not have");
    assert.deepEqual(Object.keys(english).filter((key) => !(key in translated)), [], "missing strings");
    for (const [key, text] of Object.entries(translated)) {
      assert.deepEqual(placeholders(text), placeholders(english[key]), key);
    }
  });
}
