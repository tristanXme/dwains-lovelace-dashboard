// Builds custom_components/dwains_dashboard/js/dwains-dashboard.js from
// frontend/src. Run `npm ci && npm run build`; scripts/postbuild.mjs then
// copies the standalone modules, writes .gz siblings and stamps the asset
// revision into const.py.
const path = require("path");
const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");
const { version } = require("./custom_components/dwains_dashboard/manifest.json");

// Every module registers its custom elements as a side effect, so all of
// them are entry points. The order matches the 3.10.1 bundle: runtime fixes
// first, the layout before the cards that render inside it. The editors
// (frontend/src/editors.js) and Sortable are split off and loaded on first
// use, see frontend/src/lazy-modules.js. Strings for languages other than
// English are separate files written by scripts/postbuild.mjs.
const ENTRIES = [
    "./frontend/src/dwains-runtime-fixes.js",
    "./frontend/src/dwains-blueprint-card.js",
    "./frontend/src/dwains-more-pages-card.js",
    "./frontend/src/dwains-dashboard-layout.js",
    "./frontend/src/dwains-heading-card.js",
    "./frontend/src/dwains-more-page-card.js",
    "./frontend/src/dwains-house-information-more-info-card.js",
    "./frontend/src/dwains-navigation-card.js",
    "./frontend/src/dwains-homepage-card.js",
    "./frontend/src/dwains-house-information-card.js",
    "./frontend/src/dropdown-controller.js",
    "./frontend/src/dwains-dashboard.js",
    "./frontend/src/dwains-flexbox-card.js",
    "./frontend/src/dwains-devicespage-card.js",
    "./frontend/src/dwains-notification-card.js",
];

module.exports = (_env, argv) => ({
  mode: argv.mode || "production",
  entry: ENTRIES,
  output: {
    path: path.resolve(__dirname, "custom_components/dwains_dashboard/js"),
    filename: "dwains-dashboard.js",
    // Lazy chunks carry a content hash, so their URLs never serve stale code.
    chunkFilename: "chunks/[name].[contenthash:8].js",
    // The bundle is loaded with import(), where webpack cannot work out its
    // own location; the integration serves this folder at a fixed path.
    publicPath: "/dwains_dashboard/js/",
    // Remove chunks of earlier builds; everything else is written by the
    // build or postbuild.
    clean: { keep: (asset) => !asset.startsWith("chunks/") },
  },
  // Maps are written for local debugging only (git-ignored, never shipped).
  devtool: argv.mode === "development" ? "eval-source-map" : "hidden-source-map",
  performance: { hints: false },
  optimization: {
    minimizer: [
      new TerserPlugin({
        // Same license extraction as webpack's default minimizer.
        extractComments: true,
        terserOptions: {
          // Drop debug output (raw WebSocket responses incl. card configs);
          // console.info/warn/error stay for diagnostics.
          compress: { pure_funcs: ["console.log"] },
        },
      }),
    ],
  },
  plugins: [
    new webpack.DefinePlugin({ __DD_VERSION__: JSON.stringify(version) }),
  ],
});
