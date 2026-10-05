"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { installBlueprint } = require("../src/blueprint-install");

const BLUEPRINT = "blueprint:\n  name: Test\ncard:\n  type: markdown\n";
const translate = (key) => `<${key}>`;

function setup(callWS) {
  const calls = [];
  const messages = [];
  const installed = [];
  const hass = {
    localize: (key) => `<${key}>`,
    callWS: async (message) => {
      calls.push(message);
      return callWS(message);
    },
  };
  const run = (yamlCode) => installBlueprint({
    hass,
    yamlCode,
    translate,
    notify: (message) => messages.push(message),
    onInstalled: (file) => installed.push(file),
  });
  return { calls, messages, installed, run };
}

test("valid YAML is sent unchanged and refreshes the list", async () => {
  const { calls, messages, installed, run } = setup(() => ({ succesfull: "test.yaml" }));
  assert.equal(await run(BLUEPRINT), true);
  assert.deepEqual(calls, [{ type: "dwains_dashboard/install_blueprint", yamlCode: BLUEPRINT }]);
  assert.deepEqual(messages, ["<ui.common.successfully_saved>"]);
  assert.deepEqual(installed, ["test.yaml"]);
});

test("empty input stops after the message", async () => {
  for (const empty of [undefined, "", "  \n "]) {
    const { calls, messages, run } = setup(() => assert.fail("no request expected"));
    assert.equal(await run(empty), false);
    assert.deepEqual(calls, []);
    assert.deepEqual(messages, ["<blueprint.yaml_required>"]);
  }
});

test("invalid YAML shows the backend's reason, translated", async () => {
  const { messages, installed, run } = setup(() => {
    throw { code: "invalid_format", message: "Blueprint is not valid YAML: mapping values are not allowed here" };
  });
  assert.equal(await run("a: [unclosed"), false);
  assert.deepEqual(messages, ["<blueprint.install_failed>: <blueprint.error_invalid_yaml>: mapping values are not allowed here"]);
  assert.deepEqual(installed, []);
});

test("a wrong top-level structure shows the backend's reason", async () => {
  const { messages, run } = setup(() => {
    throw { code: "invalid_format", message: "Blueprint must be a YAML mapping" };
  });
  assert.equal(await run("- a list"), false);
  assert.deepEqual(messages, ["<blueprint.install_failed>: <blueprint.error_not_mapping>"]);
});

test("a blueprint without card is reported", async () => {
  const { messages, installed, run } = setup(() => ({ error: "Blueprint has no card" }));
  assert.equal(await run("blueprint:\n  name: Test\n"), false);
  assert.deepEqual(messages, ["<blueprint.install_failed>: <blueprint.error_no_card>"]);
  assert.deepEqual(installed, []);
});

test("a failing refresh does not turn a successful install into an error", async () => {
  const errors = [];
  const originalError = console.error;
  console.error = (...args) => errors.push(args);
  try {
    const result = await installBlueprint({
      hass: { localize: () => "saved", callWS: async () => ({ succesfull: "test.yaml" }) },
      yamlCode: BLUEPRINT,
      translate,
      notify: () => {},
      onInstalled: () => { throw new Error("refresh failed"); },
    });
    assert.equal(result, true);
    assert.equal(errors.length, 1);
  } finally {
    console.error = originalError;
  }
});

test("the install finishes only after the list is reloaded", async () => {
  let reloaded = false;
  const result = await installBlueprint({
    hass: { localize: (key) => key, callWS: async () => ({ succesfull: "test.yaml" }) },
    yamlCode: BLUEPRINT,
    translate,
    notify: () => {},
    onInstalled: () => new Promise((resolve) => setTimeout(() => { reloaded = true; resolve(); }, 5)),
  });
  assert.equal(result, true);
  assert.equal(reloaded, true);
});

test("an unknown reason is shown as it is", async () => {
  const { messages, run } = setup(() => {
    throw { code: "unauthorized", message: "Unauthorized" };
  });
  assert.equal(await run(BLUEPRINT), false);
  assert.deepEqual(messages, ["<blueprint.install_failed>: Unauthorized"]);
});
