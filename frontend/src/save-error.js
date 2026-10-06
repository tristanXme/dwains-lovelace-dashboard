"use strict";

// A change the backend refused or could not save. It is shown as Home
// Assistant's toast (the hass-notification event its main element listens
// to), not only logged, so a failed change does not look saved. The toast
// goes to the main element directly: popups may be closed by the time the
// answer arrives.

function errorText(error) {
  if (typeof error === "string") return error;
  return error?.message || error?.code || String(error);
}

function reportSaveError(error, { translate, target = globalThis.document?.querySelector("home-assistant") }) {
  console.error("Dwains Dashboard: saving failed", error);
  const message = `${translate("global.save_failed")}: ${errorText(error)}`;
  if (!target) return message;
  const event = new Event("hass-notification", { bubbles: true, composed: true });
  event.detail = { message };
  target.dispatchEvent(event);
  return message;
}

let reloadHintShown = false;

// Once per page: the dashboard was updated while this page kept running the
// old version, so parts of it cannot be loaded until the page is reloaded.
function reportOutdatedPage({
  translate,
  refreshText = translate("global.reload"),
  target = globalThis.document?.querySelector("home-assistant"),
  reload = () => globalThis.location.reload(),
}) {
  if (reloadHintShown || !target) return false;
  reloadHintShown = true;
  const event = new Event("hass-notification", { bubbles: true, composed: true });
  event.detail = {
    message: translate("global.reload_after_update"),
    action: { text: refreshText, action: reload },
    duration: 60000,
    dismissable: true,
  };
  target.dispatchEvent(event);
  return true;
}

module.exports = { errorText, reportOutdatedPage, reportSaveError };
