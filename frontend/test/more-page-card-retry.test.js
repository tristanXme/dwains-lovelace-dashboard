"use strict";
// dwains-more-page-card.js imports lit and cannot be loaded under node:test, so
// this guards the retry reset at the source level: the catch in _startIfReady
// must clear _startedHass (as the homepage and more-pages cards do), otherwise
// the same-connection guard blocks every retry after a transient failure.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("more-page card resets _startedHass in the _startIfReady catch", () => {
  const src = fs.readFileSync(path.join(__dirname, "../src/dwains-more-page-card.js"), "utf8");
  const start = src.indexOf("async _startIfReady");
  const catchAt = src.indexOf("catch (error) {", start);
  assert.ok(catchAt > start);
  const body = src.slice(catchAt, src.indexOf("}\n    }", catchAt));
  assert.match(body, /_startedHass = undefined/);
  assert.ok(body.indexOf("_startedHass = undefined") < body.indexOf("_cardError = error"));
});
