"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { reportLoadFailure, setLoadFailureHandler } = require("../src/load-failure");
const { loadSortable } = require("../src/lazy-modules");

test("a part that cannot be loaded is reported", async () => {
  const reported = [];
  setLoadFailureHandler((error) => reported.push(error));
  reportLoadFailure(new Error("chunk missing"));
  assert.equal(reported[0].message, "chunk missing");
  setLoadFailureHandler(() => { throw new Error("handler broken"); });
  const originalError = console.error;
  console.error = () => {};
  try {
    assert.doesNotThrow(() => reportLoadFailure(new Error("x")));
  } finally {
    console.error = originalError;
    setLoadFailureHandler(() => {});
  }
  assert.equal(typeof loadSortable, "function");
});
