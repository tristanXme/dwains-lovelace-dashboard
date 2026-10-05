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

// Opens the "⋮" menu inside the element `host` whose section contains
// `section` and clicks the menu item whose text matches `item`.
async function clickMenuItem(page, host, section, item) {
  const opened = await deep(page, (all, [host, section]) => {
    const root = all.find((el) => el.localName === host)?.shadowRoot;
    const dropdown = [...(root?.querySelectorAll("ha-dropdown") || [])].find((candidate) => {
      let parent = candidate;
      while (parent && !parent.querySelector?.("h2")) parent = parent.parentElement;
      return parent?.querySelector("h2")?.textContent.includes(section);
    });
    root?.querySelectorAll("ha-dropdown[data-e2e]").forEach((other) => other.removeAttribute("data-e2e"));
    dropdown?.setAttribute("data-e2e", "");
    dropdown?.querySelector('[slot="trigger"]').click();
    return Boolean(dropdown);
  }, [host, section]);
  assert.ok(opened, `menu of ${section} in ${host}`);
  await page.waitForTimeout(400);
  const clicked = await deep(page, (all, [host, section, item]) => {
    const root = all.find((el) => el.localName === host)?.shadowRoot;
    const entry = [...root.querySelectorAll("ha-dropdown[data-e2e] ha-dropdown-item")]
      .find((candidate) => new RegExp(item).test(candidate.textContent));
    entry?.click();
    return Boolean(entry);
  }, [host, section, item]);
  assert.ok(clicked, `menu item ${item}`);
}

const browser = await chromium.launch({ executablePath });
for (const colorScheme of ["light", "dark"]) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: "de-DE", colorScheme });
  await context.addInitScript((tokens) => {
    localStorage.setItem("hassTokens", JSON.stringify({ ...tokens, expires: Date.now() + tokens.expires_in * 1000 }));
    localStorage.setItem("selectedLanguage", '"de"');
    // The homepage text as first rendered, before any later re-render.
    const watch = setInterval(() => {
      const find = (root) => {
        for (const el of root.querySelectorAll("*")) {
          if (el.localName === "homepage-card" && el.shadowRoot?.textContent.trim().length > 50) return el;
          const found = el.shadowRoot && find(el.shadowRoot);
          if (found) return found;
        }
        return undefined;
      };
      const card = find(document);
      if (card) {
        window.__ddFirstRender = card.shadowRoot.textContent.replace(/\s+/g, " ");
        clearInterval(watch);
      }
    }, 5);
  }, token);
  const page = await context.newPage();
  const registryLists = [];
  page.on("websocket", (socket) => socket.on("framesent", (frame) => {
    const type = /"type":"(config\/[a-z_]+_registry\/list)"/.exec(String(frame.payload))?.[1];
    if (type) registryLists.push(type);
  }));
  const requests = [];
  page.on("request", (request) => {
    const path = new URL(request.url()).pathname;
    if (path.startsWith("/dwains_dashboard/js/")) requests.push(path);
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    // Subscriptions dropped while events were on the way: cards being torn
    // down and set up again.
    if (/unknown subscription/.test(message.text())) errors.push(message.text());
    if (message.type() === "error" && /dwains|homepage|devices|more-page|area-graph/i.test(message.text())) errors.push(message.text());
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

    await step("the strings load before the first render", async () => {
      assert.ok(requests.some((path) => /^\/dwains_dashboard\/js\/lang\/de\.[0-9a-f]+\.json$/.test(path)), "German strings requested");
      assert.ok(!requests.some((path) => path.includes("/lang/") && !path.includes("/lang/de.")), "only German requested");
      const first = await page.evaluate(() => window.__ddFirstRender);
      assert.match(first, /Bereiche/);
      assert.doesNotMatch(first, /\bAreas\b|Favorites|Good (morning|afternoon|evening)/);
    });

    await step("the areas menu switches edit mode and drag sorting on", async () => {
      await page.goto(BASE + "/dwains-dashboard/home");
      await poll(() => deep(page, (all) => all.some((el) => el.classList?.contains("area-button") && el.textContent.includes("°C"))), "homepage");
      assert.ok(!requests.some((path) => path.includes("/chunks/")), "no edit code before edit mode");
      await clickMenuItem(page, "homepage-card", "Bereiche", "Bearbeitungsmodus");
      await poll(() => deep(page, (all) => {
        const card = all.find((el) => el.localName === "homepage-card");
        return card.areaEditMode === true && card._sortable?.length > 0;
      }), "area edit mode with drag sorting");
      assert.ok(requests.some((path) => /\/chunks\/sortable\.[0-9a-f]+\.js$/.test(path)), "Sortable loaded");
    });

    const openAreaDialog = async () => {
      await poll(() => deep(page, (all, areaId) => {
        const button = all.find((el) => el.tagName === "HA-BUTTON" && el.area_id === areaId);
        button?.click();
        return Boolean(button);
      }, token.areaId), "edit button");
      return poll(() => deep(page, (all) => {
        const card = all.find((el) => el.tagName.startsWith("DWAINS-EDIT-AREA-BUTTON-CARD"));
        return card?.shadowRoot?.querySelector("ha-entity-picker") && card;
      }), "edit dialog");
    };
    const areaDialog = (fn) => deep(page, (all, src) => {
      const card = all.find((el) => el.tagName.startsWith("DWAINS-EDIT-AREA-BUTTON-CARD"));
      return new Function("card", src)(card);
    }, fn);

    await step("the area dialog shows the graph settings", async () => {
      await openAreaDialog();
      assert.ok(requests.some((path) => /\/chunks\/editors\.[0-9a-f]+\.js$/.test(path)), "editors loaded");
      assert.equal(await areaDialog("return card.shadowRoot.querySelector('ha-entity-picker').value"), "sensor.temperatur_wohnzimmer");
    });

    await step("a dialog checkbox toggles with its text and the change is saved", async () => {
      const label = "[...card.shadowRoot.querySelectorAll('label.dd-check')].find((row) => row.textContent.includes('Icon ausblenden'))";
      assert.equal(await areaDialog("return card.hideIcon"), false);
      await areaDialog(`${label}.querySelector('span').click()`);
      assert.equal(await areaDialog("return card.hideIcon"), true);
      assert.equal(await areaDialog(`return ${label}.querySelector('ha-checkbox').checked`), true);
      await areaDialog("card.shadowRoot.querySelector('ha-button[slot=primaryAction]').click()");
      await poll(() => deep(page, (all) => !all.some((el) => el.tagName.startsWith("DWAINS-EDIT-AREA-BUTTON-CARD") && el.isConnected && el.offsetParent)), "dialog closed");
      await page.waitForTimeout(1500);
      await openAreaDialog();
      await poll(() => areaDialog("return card.hideIcon === true"), "saved setting");
      // Restore it for the remaining tests.
      await areaDialog(`${label}.querySelector('ha-checkbox').click()`);
      assert.equal(await areaDialog("return card.hideIcon"), false);
      await areaDialog("card.shadowRoot.querySelector('ha-button[slot=primaryAction]').click()");
      await page.waitForTimeout(1500);
    });

    await step("the devices page lists the device types and opens one", async () => {
      await page.goto(BASE + "/dwains-dashboard/devices");
      const types = await poll(() => deep(page, (all) => {
        const card = all.find((el) => el.localName === "devices-card");
        const buttons = [...(card?.shadowRoot?.querySelectorAll(".device-button") || [])];
        return buttons.length && buttons.map((button) => button.dataset.device);
      }), "device buttons");
      assert.ok(types.includes("sensor"), types.join(","));
      await deep(page, (all) => all.find((el) => el.localName === "devices-card").shadowRoot.querySelector('.device-button[data-device="sensor"]').click());
      await poll(() => deep(page, (all) => {
        const card = all.find((el) => el.localName === "devices-card");
        return card.selectedDevice === "sensor"
          && all.some((el) => /^hui-.*-card$/.test(el.localName) && el.shadowRoot?.textContent.includes("Temperatur"));
      }), "sensor page");
    });

    await step("the devices menu switches edit mode on", async () => {
      await page.goto(BASE + "/dwains-dashboard/devices");
      await poll(() => deep(page, (all) => all.find((el) => el.localName === "devices-card")?.shadowRoot?.querySelector(".device-button")), "devices page");
      await clickMenuItem(page, "devices-card", "", "Bearbeitungsmodus");
      await poll(() => deep(page, (all) => {
        const card = all.find((el) => el.localName === "devices-card");
        return card.deviceEditMode === true && card._sortable?.length === 1;
      }), "device edit mode with drag sorting");
    });

    await step("registries are read from Home Assistant, changes show up live", async () => {
      // HA requests the device, area and floor lists itself to fill hass;
      // the full entity list is what the dashboard used to download.
      assert.ok(!registryLists.includes("config/entity_registry/list"), registryLists.join(", "));
      await page.goto(BASE + "/dwains-dashboard/home");
      await poll(() => deep(page, (all) => all.some((el) => el.classList?.contains("area-button") && el.textContent.includes("°C"))), "homepage");
      const ws = (message) => page.evaluate((message) => document.querySelector("home-assistant").hass.callWS(message), message);
      const moveLamp = (areaId) => ws({ type: "config/entity_registry/update", entity_id: "input_boolean.e2e_lamp", area_id: areaId });
      // Areas without entities are not shown, so move one into the new area.
      const area = await ws({ type: "config/area_registry/create", name: "E2E Werkstatt" });
      try {
        await moveLamp(area.area_id);
        await poll(() => deep(page, (all) => all.some((el) => el.classList?.contains("area-button") && el.textContent.includes("E2E Werkstatt"))), "new area on the homepage", 15000);
      } finally {
        await moveLamp(token.areaId);
        await ws({ type: "config/area_registry/delete", area_id: area.area_id });
      }
      await poll(() => deep(page, (all) => !all.some((el) => el.classList?.contains("area-button") && el.textContent.includes("E2E Werkstatt"))), "removed area gone", 15000);
    });

    await step("only changes to shown entities re-render the homepage", async () => {
      await page.goto(BASE + "/dwains-dashboard/home");
      await poll(() => deep(page, (all) => all.some((el) => el.classList?.contains("area-button") && el.textContent.includes("°C"))), "homepage");
      await page.waitForTimeout(1500);
      await deep(page, (all) => {
        const card = all.find((el) => el.localName === "homepage-card");
        window.__ddRenders = 0;
        const updated = card.updated.bind(card);
        card.updated = (...args) => { window.__ddRenders += 1; return updated(...args); };
      });
      const setState = (entityId, state) => page.evaluate(([entityId, state]) => document.querySelector("home-assistant").hass.callApi("POST", `states/${entityId}`, { state }), [entityId, state]);
      for (const value of ["1", "2", "3"]) {
        await setState("sensor.e2e_not_on_the_dashboard", value);
        await page.waitForTimeout(400);
      }
      assert.equal(await page.evaluate(() => window.__ddRenders), 0, "re-rendered for an entity it does not show");
      await page.evaluate(() => document.querySelector("home-assistant").hass.callService("input_boolean", "toggle", { entity_id: "input_boolean.e2e_lamp" }));
      await poll(() => page.evaluate(() => window.__ddRenders > 0), "render after the lamp changed", 5000);
      await page.evaluate(() => document.querySelector("home-assistant").hass.callService("input_boolean", "toggle", { entity_id: "input_boolean.e2e_lamp" }));
    });

    await step("more pages: the create dialog opens", async () => {
      await page.goto(BASE + "/dwains-dashboard/more_page");
      await poll(() => deep(page, (all) => all.find((el) => el.localName === "more-pages-card")?.shadowRoot?.querySelector("ha-dropdown")), "more pages");
      await clickMenuItem(page, "more-pages-card", "", ".");
      await poll(() => deep(page, (all) => all.some((el) => el.tagName.startsWith("DWAINS-EDIT-MORE-PAGE-CARD") && el.shadowRoot?.childElementCount)), "create dialog");
      await page.keyboard.press("Escape");
      await page.waitForTimeout(500);
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
