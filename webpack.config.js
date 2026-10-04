// Builds custom_components/dwains_dashboard/js/dwains-dashboard.js from
// frontend/src. Run `npm ci && npm run build`; scripts/postbuild.mjs then
// copies the standalone modules, writes .gz siblings and stamps the asset
// revision into const.py.
const path = require("path");

// Every module registers its custom elements as a side effect, so all of
// them are entry points. The order matches the 3.10.1 bundle: runtime fixes
// first, the layout before the cards that render inside it.
const ENTRIES = [
    "./frontend/src/dwains-runtime-fixes.js",
    "./frontend/src/dwains-blueprint-card.js",
    "./frontend/src/dwains-more-pages-card.js",
    "./frontend/src/dwains-dashboard-layout.js",
    "./frontend/src/dwains-create-custom-card-card.js",
    "./frontend/src/dwains-heading-card.js",
    "./frontend/src/dwains-more-page-card.js",
    "./frontend/src/dwains-house-information-more-info-card.js",
    "./frontend/src/dwains-edit-entity-popup-card.js",
    "./frontend/src/dwains-navigation-card.js",
    "./frontend/src/dwains-homepage-card.js",
    "./frontend/src/dwains-house-information-card.js",
    "./frontend/src/dropdown-controller.js",
    "./frontend/src/dwains-dashboard.js",
    "./frontend/src/dwains-edit-more-page-card.js",
    "./frontend/src/dwains-flexbox-card.js",
    "./frontend/src/dwains-card-editor.js",
    "./frontend/src/dwains-devicespage-card.js",
    "./frontend/src/dwains-edit-device-popup-card.js",
    "./frontend/src/dwains-edit-entity-card-card.js",
    "./frontend/src/dwains-edit-entity-card.js",
    "./frontend/src/dwains-edit-device-button-card.js",
    "./frontend/src/dwains-edit-device-card-card.js",
    "./frontend/src/dwains-edit-area-button-card.js",
    "./frontend/src/dwains-notification-card.js",
];

module.exports = (_env, argv) => ({
  mode: argv.mode || "production",
  entry: ENTRIES,
  output: {
    path: path.resolve(__dirname, "custom_components/dwains_dashboard/js"),
    filename: "dwains-dashboard.js",
    clean: false,
  },
  // Maps are written for local debugging only (git-ignored, never shipped).
  devtool: argv.mode === "development" ? "eval-source-map" : "hidden-source-map",
  performance: { hints: false },
});
