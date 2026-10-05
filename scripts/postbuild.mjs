// Post-build steps that must run after every production build.
import { createHash } from "node:crypto";
import { copyFileSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { gzipSync, constants } from "node:zlib";

const out = "custom_components/dwains_dashboard/js";
const standalone = "frontend/src/standalone";
const translations = "frontend/src/translations";

const shortHash = (content) => createHash("sha256").update(content).digest("hex").slice(0, 8);

// Strings for every language but English (which is bundled), one file each.
// The content hash in the name keeps cached copies from going stale.
rmSync(`${out}/lang`, { recursive: true, force: true });
mkdirSync(`${out}/lang`);
const languageFiles = {};
for (const file of readdirSync(translations).filter((name) => name.endsWith(".json")).sort()) {
  const code = file.slice(0, -".json".length);
  if (code === "en") continue;
  const strings = JSON.stringify(JSON.parse(readFileSync(`${translations}/${file}`, "utf8")));
  const name = `lang/${code}.${shortHash(strings)}.json`;
  writeFileSync(`${out}/${name}`, strings);
  languageFiles[code] = name;
}

// Small modules registered globally by the integration; not bundled. The
// loader learns the language file names here.
copyFileSync(`${standalone}/dwains-dashboard-layout-preload.js`, `${out}/dwains-dashboard-layout.js`);
const loader = readFileSync(`${standalone}/dwains-dashboard-loader.js`, "utf8");
const placeholder = "/*DD_LANGUAGE_FILES*/{}";
if (!loader.includes(placeholder)) throw new Error(`${placeholder} not found in the loader`);
writeFileSync(`${out}/dwains-dashboard-loader.js`, loader.replace(placeholder, JSON.stringify(languageFiles)));

const served = [
  "dwains-dashboard.js",
  "dwains-dashboard-layout.js",
  "dwains-dashboard-loader.js",
  ...readdirSync(`${out}/chunks`).filter((name) => name.endsWith(".js")).sort().map((name) => `chunks/${name}`),
  ...Object.values(languageFiles),
];

// Home Assistant's static file handler serves a `.gz` sibling automatically
// when the browser accepts gzip.
for (const file of served) {
  const source = readFileSync(`${out}/${file}`);
  // mtime 0 keeps the archive byte-identical between builds.
  writeFileSync(`${out}/${file}.gz`, gzipSync(source, { level: constants.Z_BEST_COMPRESSION }));
}

// The module URLs carry a digest of everything served, so browsers never run
// a stale cached copy after an update.
const digest = createHash("sha256");
for (const file of served) digest.update(file).update(readFileSync(`${out}/${file}`));
const revision = digest.digest("hex").slice(0, 8);
const constPath = "custom_components/dwains_dashboard/const.py";
const constPy = readFileSync(constPath, "utf8");
const updated = constPy.replace(/FRONTEND_ASSET_REVISION = "[0-9a-f]+"/, `FRONTEND_ASSET_REVISION = "${revision}"`);
if (updated === constPy && !constPy.includes(`"${revision}"`)) {
  throw new Error("FRONTEND_ASSET_REVISION not found in const.py");
}
writeFileSync(constPath, updated);
console.log(`frontend revision ${revision}`);
