"use strict";

// Installs a blueprint from the YAML pasted into one of the edit dialogs.
// The text goes to the backend unchanged; it parses and validates it
// (blueprint_commands.py).

function errorText(error) {
  if (typeof error === "string") return error;
  return error?.message || error?.code || String(error);
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
    notify(`${translate("blueprint.install_failed")}: ${errorText(error)}`);
    return false;
  }
  // The command answers a blueprint without card or blueprint section with
  // a result carrying `error` instead of failing.
  if (!response?.succesfull) {
    notify(`${translate("blueprint.install_failed")}: ${errorText(response?.error ?? "unknown error")}`);
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
