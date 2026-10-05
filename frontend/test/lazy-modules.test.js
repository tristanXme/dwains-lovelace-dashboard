"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { isEditorTag } = require("../src/lazy-modules");

test("editor tags are recognised", () => {
  for (const tag of ["dwains-edit-area-button-card", "dwains-create-custom-card-card", "dwains-card-picker"]) {
    assert.ok(isEditorTag(tag), tag);
  }
  for (const tag of ["dwains-blueprint-card", "homepage-card", "dwains-area-graph", undefined]) {
    assert.ok(!isEditorTag(tag), String(tag));
  }
});
