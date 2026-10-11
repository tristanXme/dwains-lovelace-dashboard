"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { confirmDelete } = require("../src/confirm-delete");

const strings = {
  "global.confirm_delete": "Really delete?",
  "global.confirm_delete_named": "Delete “{name}”?",
};
const translate = (key) => strings[key];

test("asks with the name and follows the answer", () => {
  const asked = [];
  assert.equal(confirmDelete("Garden", { translate, confirm: (text) => { asked.push(text); return false; } }), false);
  assert.equal(confirmDelete(undefined, { translate, confirm: (text) => { asked.push(text); return true; } }), true);
  assert.deepEqual(asked, ["Delete “Garden”?", "Really delete?"]);
});

test("without a confirm dialog the action goes ahead", () => {
  assert.equal(confirmDelete("Garden", { translate, confirm: undefined }), true);
});
