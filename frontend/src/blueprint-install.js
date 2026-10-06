"use strict";

// Installs a blueprint from the YAML pasted into one of the edit dialogs.
// The text goes to the backend unchanged; it parses and validates it
// (blueprint_commands.py).

const { errorText } = require("./save-error");

// The backend's reasons (blueprint_commands.py) in the user's language; the
// detail after a colon (the YAML parser's message) stays as it is.
const BLUEPRINT_ERRORS = [
  ["Blueprint is not valid YAML", "blueprint.error_invalid_yaml"],
  ["Blueprint must be a YAML mapping", "blueprint.error_not_mapping"],
  ["Blueprint has invalid data", "blueprint.error_no_blueprint_section"],
  ["Blueprint has no card", "blueprint.error_no_card"],
  ["Blueprint has no usable name", "blueprint.error_no_name"],
];

function reasonText(error, translate) {
  const text = errorText(error);
  const known = BLUEPRINT_ERRORS.find(([message]) => text.startsWith(message));
  if (!known) return text;
  const detail = text.slice(known[0].length).replace(/^:\s*/, "");
  return detail ? `${translate(known[1])}: ${detail}` : translate(known[1]);
}

async function installBlueprint({
  hass,
  yamlCode,
  translate,
  notify = (message) => window.alert(message),
  onInstalled = () => {},
}) {
  if (typeof yamlCode !== "string" || !yamlCode.trim()) {
    notify(translate("blueprint.yaml_required"));
    return false;
  }

  let response;
  try {
    response = await hass.callWS({ type: "dwains_dashboard/install_blueprint", yamlCode });
  } catch (error) {
    notify(`${translate("blueprint.install_failed")}: ${reasonText(error, translate)}`);
    return false;
  }
  // The command answers a blueprint without card or blueprint section with
  // a result carrying `error` instead of failing.
  if (!response?.succesfull) {
    notify(`${translate("blueprint.install_failed")}: ${reasonText(response?.error ?? "unknown error", translate)}`);
    return false;
  }

  notify(hass.localize("ui.common.successfully_saved"));
  try {
    await onInstalled(response.succesfull);
  } catch (error) {
    console.error("Dwains Dashboard: failed to refresh after installing a blueprint", error);
  }
  return true;
}

module.exports = { installBlueprint };
