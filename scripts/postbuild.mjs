// Post-build steps that must run after every production build.
import { createHash } from "node:crypto";
import { copyFileSync, readFileSync, writeFileSync } from "node:fs";
import { gzipSync, constants } from "node:zlib";

const out = "custom_components/dwains_dashboard/js";
const standalone = "frontend/src/standalone";

// Small modules registered globally by the integration; not bundled.
copyFileSync(`${standalone}/dwains-dashboard-layout-preload.js`, `${out}/dwains-dashboard-layout.js`);
copyFileSync(`${standalone}/dwains-dashboard-loader.js`, `${out}/dwains-dashboard-loader.js`);

// Home Assistant's static file handler serves a `.gz` sibling automatically
// when the browser accepts gzip (584 KB -> ~120 KB for the main bundle).
for (const file of ["dwains-dashboard.js", "dwains-dashboard-layout.js", "dwains-dashboard-loader.js"]) {
  const source = readFileSync(`${out}/${file}`);
  // mtime 0 keeps the archive byte-identical between builds.
  writeFileSync(`${out}/${file}.gz`, gzipSync(source, { level: constants.Z_BEST_COMPRESSION }));
}

// The module URL carries a digest of the bundle so browsers never run a stale
// cached copy after an update.
const digest = createHash("sha256").update(readFileSync(`${out}/dwains-dashboard.js`)).digest("hex").slice(0, 8);
const constPath = "custom_components/dwains_dashboard/const.py";
const constPy = readFileSync(constPath, "utf8");
const updated = constPy.replace(/FRONTEND_ASSET_REVISION = "[0-9a-f]+"/, `FRONTEND_ASSET_REVISION = "${digest}"`);
if (updated === constPy && !constPy.includes(`"${digest}"`)) {
  throw new Error("FRONTEND_ASSET_REVISION not found in const.py");
}
writeFileSync(constPath, updated);
console.log(`dwains-dashboard.js revision ${digest}`);
