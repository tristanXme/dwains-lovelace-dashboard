// Browser tests against a real Home Assistant (see tests/e2e/prepare.py).
// Usage: node tests/e2e/dashboard.e2e.mjs <config dir>
// For a failed step a screenshot, the Playwright trace and the browser
// console end up in <config dir>/artifacts (or $E2E_ARTIFACTS).
import { chromium } from "playwright";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import assert from "node:assert/strict";

const configDir = process.argv[2];
const token = JSON.parse(readFileSync(join(configDir, "e2e-token.json"), "utf8"));
const BASE = token.hassUrl;
const executablePath = process.env.E2E_CHROMIUM || undefined;
const artifacts = process.env.E2E_ARTIFACTS || join(configDir, "artifacts");
mkdirSync(artifacts, { recursive: true });

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
// The page of the color scheme being tested, for screenshots of failures.
const current = { page: undefined, scheme: "", failed: false };
async function step(name, fn) {
  try {
    await fn();
    results.push(["ok", name]);
    console.log("ok   ", name);
  } catch (error) {
    results.push(["FAIL", name]);
    current.failed = true;
    console.log("FAIL ", name, "\n     ", error.message);
    const file = `${String(results.length).padStart(2, "0")}-${name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.png`;
    await current.page?.screenshot({ path: join(artifacts, file), fullPage: true }).catch((screenshotError) => {
      console.log("      (no screenshot:", screenshotError.message, ")");
    });
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
  await context.tracing.start({ screenshots: true, snapshots: true, sources: false });
  const page = await context.newPage();
  Object.assign(current, { page, scheme: colorScheme, failed: false });
  const consoleLog = [];
  page.on("console", (message) => consoleLog.push(`${new Date().toISOString()} ${message.type()}: ${message.text()}`));
  page.on("pageerror", (error) => consoleLog.push(`${new Date().toISOString()} pageerror: ${error.stack || error.message}`));
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
    await step("area badges take the pointer, so their tooltip shows", async () => {
      // The window sensor of the test area is open: one badge.
      const hit = await poll(() => page.evaluate(() => {
        const find = (root) => {
          for (const el of root.querySelectorAll("*")) {
            if (el.classList?.contains("info-badge") && el.offsetParent && el.title) return el;
            const found = el.shadowRoot && find(el.shadowRoot);
            if (found) return found;
          }
          return undefined;
        };
        const badge = find(document);
        if (!badge) return undefined;
        const rect = badge.getBoundingClientRect();
        const [x, y] = [rect.x + rect.width / 2, rect.y + rect.height / 2];
        // The element the pointer lands on, through the shadow roots.
        let element = document.elementFromPoint(x, y);
        while (element?.shadowRoot) {
          const inner = element.shadowRoot.elementFromPoint(x, y);
          if (!inner || inner === element) break;
          element = inner;
        }
        for (let node = element; node; node = node.parentElement || node.getRootNode()?.host) {
          if (node === badge) return badge.title;
        }
        // Not yet: Home Assistant's launch screen fades out over the page
        // for a moment after loading. Wait, and say what is on top.
        window.__ddPointerTarget = `${element?.localName}.${element?.className}`;
        return undefined;
      }), "area badge").catch(async (error) => {
        throw new Error(`${error.message}; pointer lands on ${await page.evaluate(() => window.__ddPointerTarget)}`);
      });
      assert.match(hit, /Fenster offen/);
    });

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

    await step("hiding an entity rebuilds only what changed", async () => {
      const ws = (message) => page.evaluate((message) => document.querySelector("home-assistant").hass.callWS(message), message);
      const hideInArea = (value) => ws({ type: "dwains_dashboard/edit_entity_bool_value", entityId: "sensor.luftfeuchte_wohnzimmer", key: "hidden_in_area", value });
      const cards = () => deep(page, (all) => all
        .filter((el) => el.dataset?.entity && el.closest?.(".dd-area-view"))
        .map((cell) => {
          const card = cell.querySelector("dd-lazy-card")?.firstElementChild;
          return { entity: cell.dataset.entity, mark: card?.__ddMark, rendered: Boolean(card?.shadowRoot?.childElementCount || card?.childElementCount) };
        }));
      await poll(async () => (await cards()).length >= 3 && (await cards()).every((card) => card.rendered), "area view cards");
      // Mark the card elements to see which ones survive the change.
      await deep(page, (all) => all
        .filter((el) => el.dataset?.entity && el.closest?.(".dd-area-view"))
        .forEach((cell) => { const card = cell.querySelector("dd-lazy-card")?.firstElementChild; if (card) card.__ddMark = cell.dataset.entity; }));
      await hideInArea(true);
      try {
        const after = await poll(async () => {
          const list = await cards();
          return !list.some((card) => card.entity === "sensor.luftfeuchte_wohnzimmer") && list;
        }, "card hidden");
        assert.ok(after.length >= 2, JSON.stringify(after));
        for (const card of after) {
          assert.equal(card.mark, card.entity, `${card.entity} was created again`);
          assert.ok(card.rendered, `${card.entity} still renders`);
        }
      } finally {
        await hideInArea(false);
      }
      await poll(async () => (await cards()).some((card) => card.entity === "sensor.luftfeuchte_wohnzimmer" && card.rendered), "card back");
    });

    await step("a card with a larger row span leaves no gap below it (masonry)", async () => {
      const setRowSpan = (span) => page.evaluate((span) => document.querySelector("home-assistant").hass.callWS({
        type: "dwains_dashboard/edit_entity", entity: "input_boolean.e2e_lamp",
        rowSpan: span, rowSpanLg: span, rowSpanXl: span,
      }), span);
      await setRowSpan("2");
      try {
        await page.goto(BASE + "/dwains-dashboard/home");
        await poll(() => deep(page, (all) => {
          const button = all.find((el) => el.classList?.contains("area-button") && el.textContent.includes("Wohnzimmer"));
          button?.click();
          return Boolean(button);
        }), "area button");
        // The rows reserved for the cell: the card plus the 16px gap,
        // rounded up to 8px rows.
        const sizes = await poll(() => deep(page, (all) => {
          const cell = all.find((el) => el.dataset?.entity === "input_boolean.e2e_lamp" && el.closest(".dd-masonry"));
          const card = cell?.firstElementChild?.getBoundingClientRect().height;
          const rows = Number(/span (\d+)/.exec(cell?.style.gridRow || "")?.[1]);
          return card > 0 && rows > 0 && { reserved: rows * 8, card };
        }), "lamp card in the area view");
        assert.ok(sizes.reserved - sizes.card < 16 + 8, JSON.stringify(sizes));
      } finally {
        await setRowSpan("1");
      }
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

    await step("dragging device types saves the order, a failed save puts it back", async () => {
      // Sortable calls onStart/onEnd around a drag; calling them around
      // sort() is the same without moving the mouse.
      const drag = (order) => deep(page, async (all, order) => {
        const sortable = all.find((el) => el.localName === "devices-card")._sortable[0];
        sortable.options.onStart.call(sortable);
        sortable.sort(order);
        await sortable.options.onEnd.call(sortable);
        return sortable.toArray();
      }, order);
      const shown = () => deep(page, (all) => [...(all.find((el) => el.localName === "devices-card")?.shadowRoot?.querySelectorAll(".device-button") || [])].map((button) => button.dataset.device));
      const before = await shown();
      assert.ok(before.length > 1, before.join(","));
      const reversed = [...before].reverse();
      assert.deepEqual(await drag(reversed), reversed);
      await page.reload();
      await poll(async () => JSON.stringify(await shown()) === JSON.stringify(reversed), "saved device order after reload");

      // The save fails: the toast tells so and the order goes back.
      await clickMenuItem(page, "devices-card", "", "Bearbeitungsmodus");
      await poll(() => deep(page, (all) => all.find((el) => el.localName === "devices-card")._sortable?.length === 1), "drag sorting");
      await page.evaluate(() => {
        const ha = document.querySelector("home-assistant");
        window.__ddToasts = [];
        ha.addEventListener("hass-notification", (event) => window.__ddToasts.push(event.detail.message));
        const connection = ha.hass.connection;
        const send = connection.sendMessagePromise.bind(connection);
        connection.sendMessagePromise = (message) => (message.type === "dwains_dashboard/sort_device_button"
          ? Promise.reject({ code: "e2e", message: "simulated failure" })
          : send(message));
        window.__ddRestoreSend = () => { connection.sendMessagePromise = send; };
      });
      assert.deepEqual(await drag(before), reversed);
      assert.deepEqual(await shown(), reversed);
      const toasts = await page.evaluate(() => window.__ddToasts);
      assert.ok(toasts.some((text) => text.includes("simulated failure")), toasts.join(" | "));
      await page.evaluate(() => window.__ddRestoreSend());
      // Expected: the failed save is logged.
      await page.waitForTimeout(300);
      for (let index = errors.length - 1; index >= 0; index -= 1) {
        if (/saving failed/.test(errors[index])) errors.splice(index, 1);
      }

      assert.deepEqual(await drag(before), before);
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
      const setState = (entityId, state) => page.evaluate(([entityId, state]) => document.querySelector("home-assistant").hass.callApi("POST", `states/${entityId}`, { state }), [entityId, state]);
      // Create the unrelated entity before counting, and keep clear of a
      // full minute: the living room temperature (a template on now().minute)
      // changes then and rightly re-renders the homepage.
      await setState("sensor.e2e_not_on_the_dashboard", "0");
      const seconds = new Date().getSeconds();
      if (seconds > 45) await page.waitForTimeout((62 - seconds) * 1000);
      await page.waitForTimeout(1500);
      await deep(page, (all) => {
        const card = all.find((el) => el.localName === "homepage-card");
        window.__ddRenders = 0;
        const updated = card.updated.bind(card);
        card.updated = (...args) => { window.__ddRenders += 1; return updated(...args); };
      });
      for (const value of ["1", "2", "3"]) {
        await setState("sensor.e2e_not_on_the_dashboard", value);
        await page.waitForTimeout(400);
      }
      assert.equal(await page.evaluate(() => window.__ddRenders), 0, "re-rendered for an entity it does not show");
      await page.evaluate(() => document.querySelector("home-assistant").hass.callService("input_boolean", "toggle", { entity_id: "input_boolean.e2e_lamp" }));
      await poll(() => page.evaluate(() => window.__ddRenders > 0), "render after the lamp changed", 5000);
      await page.evaluate(() => document.querySelector("home-assistant").hass.callService("input_boolean", "toggle", { entity_id: "input_boolean.e2e_lamp" }));
    });

    await step("empty pages show why they are empty", async () => {
      const ws = (message) => page.evaluate((message) => document.querySelector("home-assistant").hass.callWS(message), message);
      const emptyReason = (host) => deep(page, (all, host) => all.find((el) => el.localName === host)?.shadowRoot?.querySelector(".dd-empty-state")?.dataset.reason, host);
      // Areas without entities are shown too, so disable every area. The
      // living room keeps its icon and graph settings.
      const areas = await ws({ type: "config/area_registry/list" });
      const setDisabled = (disableArea) => Promise.all(areas.map((area) => ws({
        type: "dwains_dashboard/edit_area_button",
        areaId: area.area_id,
        disableArea,
        ...(area.area_id === token.areaId ? { icon: "mdi:sofa", graphEntity: "sensor.temperatur_wohnzimmer", graphHours: 24 } : {}),
      })));
      await setDisabled(true);
      try {
        await page.goto(BASE + "/dwains-dashboard/home");
        assert.equal(await poll(() => emptyReason("homepage-card"), "homepage empty state"), "all_areas_disabled");
      } finally {
        await setDisabled(false);
      }

      const domains = ["sensor", "binary_sensor", "person", "input_boolean"];
      const hide = (value) => Promise.all(domains.map((device) => ws({ type: "dwains_dashboard/edit_device_bool_value", device, key: "hidden", value })));
      await hide(true);
      try {
        await page.goto(BASE + "/dwains-dashboard/devices");
        assert.equal(await poll(() => emptyReason("devices-card"), "devices empty state"), "all_domains_hidden");
      } finally {
        await hide(false);
      }
      await page.goto(BASE + "/dwains-dashboard/home");
      await poll(() => deep(page, (all) => all.some((el) => el.classList?.contains("area-button") && el.textContent.includes("Wohnzimmer"))), "living room back");
    });

    await step("more pages: the create dialog opens", async () => {
      await page.goto(BASE + "/dwains-dashboard/more_page");
      await poll(() => deep(page, (all) => all.find((el) => el.localName === "more-pages-card")?.shadowRoot?.querySelector("ha-dropdown")), "more pages");
      await clickMenuItem(page, "more-pages-card", "", ".");
      await poll(() => deep(page, (all) => all.some((el) => el.tagName.startsWith("DWAINS-EDIT-MORE-PAGE-CARD") && el.shadowRoot?.childElementCount)), "create dialog");
      await page.keyboard.press("Escape");
      await page.waitForTimeout(500);
    });

    // The integration's options (Settings → Devices & services → Dwains
    // Dashboard → Configure), used through Home Assistant's own dialog.
    const flow = page.locator("dialog-data-entry-flow");
    const flowText = () => page.evaluate(() => {
      const parts = [];
      const walk = (root) => root.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) parts.push(node.textContent);
        if (node.shadowRoot) walk(node.shadowRoot);
        walk(node);
      });
      const dialog = document.querySelector("home-assistant").shadowRoot.querySelector("dialog-data-entry-flow");
      if (dialog?.shadowRoot) walk(dialog.shadowRoot);
      return parts.join(" ").replace(/\s+/g, " ").trim();
    });
    const openOptions = async (choice) => {
      await page.goto(BASE + "/config/integrations/integration/dwains_dashboard");
      // The icon inside the button takes the pointer; click the button itself.
      await page.getByRole("button", { name: "Konfigurieren" }).first().evaluate((button) => button.click());
      await flow.locator("step-flow-menu").waitFor();
      const menu = await poll(async () => {
        const text = await flowText();
        return /verwaiste Dashboard-Einstellungen: \d+/.test(text) && text;
      }, "options menu");
      await flow.getByText(choice, { exact: true }).click();
      return menu;
    };
    const ws = (message) => page.evaluate((message) => document.querySelector("home-assistant").hass.callWS(message), message);
    let exported;

    await step("settings: the export downloads an archive from the options dialog", async () => {
      await openOptions("Einstellungen exportieren");
      await flow.locator("step-flow-abort").waitFor();
      assert.match(await flowText(), /\d+ Dateien exportiert/);
      const href = await flow.locator("step-flow-abort a").first().getAttribute("href");
      assert.match(href, /^\/api\/dwains_dashboard\/export\/dwains-dashboard-.*\.zip\?authSig=/);
      const response = await page.request.get(new URL(href, BASE).toString());
      assert.equal(response.status(), 200);
      assert.equal(response.headers()["content-type"], "application/zip");
      exported = await response.body();
      assert.ok(exported.includes("dwains-dashboard-export.json"), "manifest in the archive");
      assert.ok(exported.includes("configs/areas.yaml"), "area settings in the archive");
      // Without the signature the file is not served.
      assert.equal((await page.request.get(new URL(href.split("?")[0], BASE).toString())).status(), 401);
    });

    await step("settings: importing that archive puts the exported settings back", async () => {
      assert.ok(exported, "archive of the export step");
      // A change after the export, which the import has to undo.
      await ws({ type: "dwains_dashboard/edit_more_page", name: "Nach dem Export", card_data: '{"type":"markdown"}' });
      await openOptions("Einstellungen importieren");
      await flow.locator("step-flow-form").waitFor();
      await flow.locator("input[type=file]").setInputFiles({ name: "export.zip", mimeType: "application/zip", buffer: exported });
      // Without the confirmation nothing happens; the uploaded file stays.
      // The name shows while the upload still runs; wait for its file id.
      await poll(() => page.evaluate(() => {
        const find = (root) => {
          for (const el of root.querySelectorAll("*")) {
            if (el.localName === "ha-selector-file") return el;
            const found = el.shadowRoot && find(el.shadowRoot);
            if (found) return found;
          }
          return undefined;
        };
        return /^[0-9a-f]{32}$/.test(find(document)?.value || "");
      }), "uploaded file");
      await flow.getByRole("button", { name: "OK" }).click();
      await poll(async () => (await flowText()).includes("Schalter"), "confirmation required");
      assert.ok(!(await flowText()).includes("Pflichtfelder"), "file kept");
      await flow.locator("ha-switch").click();
      await flow.getByRole("button", { name: "OK" }).click();
      await flow.locator("step-flow-abort").waitFor();
      assert.match(await flowText(), /\d+ Dateien importiert.*backups\/import-/);
      const pages = (await ws({ type: "dwains_dashboard/more_pages/get" })).more_pages;
      assert.ok(!("nach_dem_export" in pages), Object.keys(pages).join(","));
      await page.goto(BASE + "/dwains-dashboard/home");
      await poll(() => deep(page, (all) => all.some((el) => el.classList?.contains("area-button") && el.textContent.includes("Wohnzimmer"))), "homepage after the import");
    });

    await step("settings: the cleanup removes an orphaned entry after confirmation", async () => {
      await ws({ type: "dwains_dashboard/edit_entity", entity: "light.e2e_gone", hideEntity: true });
      const menu = await openOptions("Verwaiste Einstellungen aufräumen");
      assert.ok(Number(/Dashboard-Einstellungen: (\d+)/.exec(menu)[1]) >= 1, menu);
      await flow.locator("step-flow-form").waitFor();
      await poll(async () => (await flowText()).includes("light.e2e_gone"), "orphan listed");
      await flow.locator("ha-switch").click();
      await flow.getByRole("button", { name: "OK" }).click();
      await flow.locator("step-flow-abort").waitFor();
      assert.match(await flowText(), /\d+ Einträge entfernt.*backups\/cleanup-/);
      const configuration = await ws({ type: "dwains_dashboard/configuration/get" });
      assert.ok(!("light.e2e_gone" in (configuration.entities || {})), "orphan removed");
    });

    await step("a page whose parts cannot be loaded after an update asks for a reload", async () => {
      // A tab that still runs the previous bundle: its editor file is gone.
      const stale = await context.newPage();
      await stale.route(/\/dwains_dashboard\/js\/chunks\/editors\./, (route) => route.fulfill({ status: 404, body: "" }));
      try {
        await stale.goto(BASE + "/dwains-dashboard/home");
        await poll(() => deep(stale, (all) => all.some((el) => el.classList?.contains("area-button") && el.textContent.includes("°C"))), "homepage");
        await clickMenuItem(stale, "homepage-card", "Bereiche", "Bearbeitungsmodus");
        await poll(() => deep(stale, (all, areaId) => {
          const button = all.find((el) => el.tagName === "HA-BUTTON" && el.area_id === areaId);
          button?.click();
          return Boolean(button);
        }, token.areaId), "edit button");
        const toast = await poll(() => deep(stale, (all) => {
          const toast = all.find((el) => el.localName === "ha-toast");
          return toast && /aktualisiert/.test(toast.labelText || toast.textContent) && (toast.labelText || toast.textContent);
        }), "reload hint");
        assert.match(toast, /Lade die Seite neu/);
      } finally {
        await stale.close();
        // Expected: the missing editor file is logged.
        await page.waitForTimeout(300);
        for (let index = errors.length - 1; index >= 0; index -= 1) {
          if (/failed to load the editors|editors\.[0-9a-f]+\.js|ChunkLoadError|Loading chunk/i.test(errors[index])) errors.splice(index, 1);
        }
      }
    });
  }

  await step(`${colorScheme}: no dashboard errors in the console`, async () => {
    assert.deepEqual(errors, []);
  });
  writeFileSync(join(artifacts, `${colorScheme}-console.log`), consoleLog.join("\n") + "\n");
  // The trace is large; keep it only when a step of this scheme failed.
  await context.tracing.stop(current.failed ? { path: join(artifacts, `${colorScheme}-trace.zip`) } : {});
  await context.close();
}
await browser.close();

const failed = results.filter(([status]) => status !== "ok");
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
