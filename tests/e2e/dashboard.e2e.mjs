// Browser tests against a real Home Assistant (see tests/e2e/prepare.py).
// Usage: node tests/e2e/dashboard.e2e.mjs <config dir>
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import assert from "node:assert/strict";

const configDir = process.argv[2];
const token = JSON.parse(readFileSync(join(configDir, "e2e-token.json"), "utf8"));
const BASE = token.hassUrl;
const executablePath = process.env.E2E_CHROMIUM || undefined;

// Collect every element, including those inside shadow roots.
const DEEP = `(() => { const all = []; const walk = (root) => root.querySelectorAll("*").forEach((el) => { all.push(el); if (el.shadowRoot) walk(el.shadowRoot); }); walk(document); return all; })()`;
const deep = (page, fn, arg) => page.evaluate(`((all, arg) => (${fn})(all, arg))(${DEEP}, ${JSON.stringify(arg ?? null)})`);

async function poll(check, what, timeout = 60000) {
  const end = Date.now() + timeout;
  let last;
  while (Date.now() < end) {
    last = await check();
    if (last) return last;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out waiting for ${what}`);
}

const results = [];
async function step(name, fn) {
  try {
    await fn();
    results.push(["ok", name]);
    console.log("ok   ", name);
  } catch (error) {
    results.push(["FAIL", name]);
    console.log("FAIL ", name, "\n     ", error.message);
  }
}

const browser = await chromium.launch({ executablePath });
for (const colorScheme of ["light", "dark"]) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: "de-DE", colorScheme });
  await context.addInitScript((tokens) => {
    localStorage.setItem("hassTokens", JSON.stringify({ ...tokens, expires: Date.now() + tokens.expires_in * 1000 }));
    localStorage.setItem("selectedLanguage", '"de"');
  }, token);
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && /dwains|homepage|area-graph/i.test(message.text())) errors.push(message.text());
  });
  await page.goto(BASE + "/dwains-dashboard/home");

  await step(`${colorScheme}: homepage renders the area tile with values`, async () => {
    const tile = await poll(() => deep(page, (all) => {
      const button = all.find((el) => el.classList?.contains("area-button") && el.textContent.includes("Wohnzimmer"));
      const text = button?.textContent.replace(/\s+/g, " ");
      return text?.includes("°C") && text;
    }), "area tile");
    assert.match(tile, /°C/);
    assert.match(tile, /48\s?%/);
  });

  await step(`${colorScheme}: area tile draws the configured graph`, async () => {
    await poll(() => deep(page, (all) => {
      const graph = all.find((el) => el.tagName === "DWAINS-AREA-GRAPH");
      return Boolean(graph?.shadowRoot?.querySelector("path.line")?.getAttribute("d"));
    }), "graph path");
  });

  await step(`${colorScheme}: favorites are shown`, async () => {
    await poll(() => deep(page, (all) => Boolean(all.find((el) => el.id === "favorites")?.querySelector('[data-entity="input_boolean.e2e_lamp"]'))), "favorite");
  });

  if (colorScheme === "light") {
    await step("graph click opens the sensor history", async () => {
      await deep(page, (all) => all.find((el) => el.classList?.contains("area-graph")).click());
      await poll(() => deep(page, (all) => all.some((el) => el.tagName === "HA-MORE-INFO-DIALOG" && el.shadowRoot?.textContent.includes("Temperatur"))), "more-info dialog");
      await page.keyboard.press("Escape");
      await page.waitForTimeout(800);
    });

    await step("area view opens with header values and entity cards", async () => {
      await deep(page, (all) => all.find((el) => el.classList?.contains("area-button") && el.textContent.includes("Wohnzimmer")).click());
      const header = await poll(() => deep(page, (all) => {
        const view = all.find((el) => el.classList?.contains("dd-area-view") && el.classList.contains("block"));
        return view && view.querySelector(".dd-area-view-title")?.textContent.replace(/\s+/g, " ");
      }), "area view");
      assert.match(header, /Wohnzimmer/);
      assert.match(header, /°C/);
    });

    await step("area edit dialog offers the graph settings", async () => {
      await page.goto(BASE + "/dwains-dashboard/home");
      await poll(() => deep(page, (all) => all.some((el) => el.classList?.contains("area-button") && el.textContent.includes("°C"))), "homepage");
      await deep(page, (all) => {
        const card = all.find((el) => "areaEditMode" in el && el.tagName.toLowerCase().includes("homepage-card"));
        card.areaEditMode = true;
        card.requestUpdate();
      });
      await page.waitForTimeout(800);
      await poll(() => deep(page, (all, areaId) => {
        const button = all.find((el) => el.tagName === "HA-BUTTON" && el.area_id === areaId);
        button?.click();
        return Boolean(button);
      }, token.areaId), "edit button");
      const picker = await poll(() => deep(page, (all) => {
        const card = all.find((el) => el.tagName.startsWith("DWAINS-EDIT-AREA-BUTTON-CARD"));
        return card?.shadowRoot?.querySelector("ha-entity-picker")?.value;
      }), "edit dialog");
      assert.equal(picker, "sensor.temperatur_wohnzimmer");
    });
  }

  await step(`${colorScheme}: no dashboard errors in the console`, async () => {
    assert.deepEqual(errors, []);
  });
  await context.close();
}
await browser.close();

const failed = results.filter(([status]) => status !== "ok");
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
