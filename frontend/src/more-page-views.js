"use strict";

const { hasView, refreshLovelaceConfig } = require("./lovelace-config-refresh");
const { findLovelaceRoot } = require("./lovelace-dom");

// Every more page is a view of the dashboard (views/04.more_page_view.yaml),
// and a browser loads the views once. A page added in another browser is not
// among them, and Home Assistant shows the first view for a path it does not
// know: a link to the new page led to the homepage. Before such a path is
// opened, the views are loaded again.
//
// Loading them again whenever pages change elsewhere would not do: Home
// Assistant keeps the position of the view shown, not its path, so a view
// added before it would show another view in its place.
async function loadViewBeforeOpening(path, {
  resolveRoot = findLovelaceRoot,
  refresh = refreshLovelaceConfig,
  reportError = (message, error) => console.error(message, error),
} = {}) {
  // "/dwains-dashboard/more_page_garden#x" -> "more_page_garden"
  const viewPath = String(path || "").split(/[?#]/)[0].split("/").filter(Boolean)[1];
  const lovelace = resolveRoot()?.lovelace;
  if (!viewPath || !lovelace?.config?.views || hasView(lovelace, viewPath)) return false;
  try {
    // Waits for the new views only: a page left out of them (its files
    // cannot be read) would otherwise keep the click waiting.
    await refresh({});
    return true;
  } catch (error) {
    reportError(`Dwains Dashboard: the view ${viewPath} could not be loaded`, error);
    return false;
  }
}

module.exports = { loadViewBeforeOpening };
