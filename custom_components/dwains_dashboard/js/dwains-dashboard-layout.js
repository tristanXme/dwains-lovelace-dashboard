// Tiny preload script for Dwains Dashboard, registered on every page.
//
// It defines ONLY the `dwains-dashboard-layout` VIEW LAYOUT element, a
// standalone custom element with no dependencies. The bundle with the cards
// loads only on the dashboard's routes; with the layout defined early, Home
// Assistant renders the view at once, its header hidden, and the cards
// follow when the bundle has loaded (Home Assistant rebuilds cards defined
// late).
(function () {
  "use strict";
  if (!window.customElements) return;

  var reportedErrors = Object.create(null);
  function reportPreloadError(context, error) {
    if (reportedErrors[context]) return;
    reportedErrors[context] = true;
    console.warn("[dwains-preload] " + context, error);
  }

  // Evaluated once the registry is final, so the class extends the
  // HTMLElement that goes with it.
  const layoutClass = () => class DwainsDashboardLayout extends HTMLElement {
    constructor() {
      super();
      const sr = this.attachShadow({ mode: "open" });
      const style = document.createElement("style");
      // Written by scripts/postbuild.mjs from styles/dashboard-layout.css.
      style.textContent = ":host{display: block;--dd-mobile-navigation-height: 2.75rem;--dd-mobile-navigation-content-gap: 0.5rem;margin-top: calc(-1 * var(--dd-lovelace-header-offset, 0px));padding-top: env(safe-area-inset-top, 0px);}:host::before{content: \"\";position: fixed;top: 0;left: 0;right: 0;height: env(safe-area-inset-top, 0px);background: var(--primary-background-color);z-index: 31;pointer-events: none;}#dwains_dashboard{margin: 0 auto;font-family: \"Open Sans\", sans-serif;padding-top: 10px;padding-bottom: 50px;padding-left: env(safe-area-inset-left, 0px);padding-right: env(safe-area-inset-right, 0px);}#dwains_navigation{position: sticky;top: env(safe-area-inset-top, 0px);z-index: 8;}:host([mobile-navigation]) #dwains_dashboard{padding-top: 1px;padding-bottom: calc( var(--dd-mobile-navigation-height) + var(--dd-mobile-navigation-content-gap) + env(safe-area-inset-bottom) );}:host([mobile-navigation]) #dwains_navigation{position: fixed;left: 0;right: 0;top: auto;bottom: 0;z-index: 30;}";
      sr.appendChild(style);
      this._navigationHost = document.createElement("div");
      this._navigationHost.id = "dwains_navigation";
      sr.appendChild(this._navigationHost);
      this._wrap = document.createElement("div");
      this._wrap.id = "dwains_dashboard";
      sr.appendChild(this._wrap);
      this._runtimeReady = this._ensureNavigation.bind(this);
      this._headerChanged = this._syncHeader.bind(this);
      this._headerRetries = 0;
    }
    connectedCallback() {
      window.addEventListener("dwains-dashboard-runtime-ready", this._runtimeReady);
      this._ensureNavigation();
      this._syncHeader();
    }
    disconnectedCallback() {
      window.removeEventListener("dwains-dashboard-runtime-ready", this._runtimeReady);
      clearTimeout(this._headerTimer);
      if (this._headerObserver) this._headerObserver.disconnect();
      this._headerObserver = undefined;
      this._observedLovelaceRoot = undefined;
      if (this._hiddenHeader && this._hiddenHeader.style.display === "none") {
        this._hiddenHeader.style.display = this._previousHeaderDisplay ?? "";
      }
      this._hiddenHeader = undefined;
    }
    _findLovelaceRoot() {
      var current = this;
      for (var i = 0; i < 40 && current; i++) {
        if (current.localName === "hui-root") return current;
        var root = current.getRootNode && current.getRootNode();
        current = current.parentNode || (root && root.host) || null;
      }
      return null;
    }
    _syncHeader() {
      var lovelaceRoot = this._findLovelaceRoot();
      if (lovelaceRoot && lovelaceRoot.shadowRoot &&
          lovelaceRoot !== this._observedLovelaceRoot && window.MutationObserver) {
        if (this._headerObserver) this._headerObserver.disconnect();
        this._headerObserver = new window.MutationObserver(this._headerChanged);
        this._headerObserver.observe(lovelaceRoot.shadowRoot, { childList: true, subtree: true });
        this._observedLovelaceRoot = lovelaceRoot;
      }
      var header = lovelaceRoot && lovelaceRoot.shadowRoot && lovelaceRoot.shadowRoot.querySelector(".header");
      if (header) {
        if (header !== this._hiddenHeader) {
          this._hiddenHeader = header;
          this._previousHeaderDisplay = header.style.display;
        }
        var headerRect = header.getBoundingClientRect && header.getBoundingClientRect();
        var headerHeight = headerRect && headerRect.height || header.offsetHeight || 0;
        if (headerHeight > 0) {
          this.style.setProperty("--dd-lovelace-header-offset", headerHeight + "px");
        }
        header.style.display = "none";
        this._headerRetries = 0;
        return;
      }
      if (this.isConnected && ++this._headerRetries <= 40) {
        clearTimeout(this._headerTimer);
        this._headerTimer = setTimeout(() => this._syncHeader(), 100);
      }
    }
    _ensureNavigation() {
      if (!this.isConnected || this._navigation || !customElements.get("dwainsboard-navigation-card")) return;
      var navigation = document.createElement("dwainsboard-navigation-card");
      if (this._hass) navigation.hass = this._hass;
      this._navigationHost.replaceChildren(navigation);
      this._navigation = navigation;
    }
    // Lovelace view-layout contract:
    setConfig(config) {
      this.config = config;
    }
    set hass(h) {
      this._hass = h;
      this._ensureNavigation();
      if (this._navigation) this._navigation.hass = h;
      if (this._cards) {
        for (const c of this._cards) {
          if (c && "hass" in c) {
            try { c.hass = h; } catch (e) { reportPreloadError("failed to update a child card", e); }
          }
        }
      }
    }
    get hass() { return this._hass; }
    set narrow(n) { this._narrow = n; }
    get narrow() { return this._narrow; }
    set cards(cards) {
      this._cards = cards;
      this._render();
    }
    get cards() { return this._cards; }
    // No-ops in case HA calls LitElement-style APIs on the layout:
    requestUpdate() {}
    get updateComplete() { return Promise.resolve(true); }
    _render() {
      if (!this._wrap) return;
      // HA sets the cards again whenever it rebuilds the view, mostly the
      // same elements. Re-inserting them all would disconnect every card
      // (reloading the page cards and their subscriptions); only remove
      // and insert what changed.
      const cards = (this._cards || []).filter(Boolean);
      for (const child of [...this._wrap.children]) {
        if (!cards.includes(child)) child.remove();
      }
      cards.forEach((card, index) => {
        const current = this._wrap.children[index];
        if (current !== card) this._wrap.insertBefore(card, current || null);
      });
      this._ensureNavigation();
      this._syncHeader();
    }
  };

  function defineLayout() {
    if (customElements.get("dwains-dashboard-layout")) return;
    try {
      customElements.define("dwains-dashboard-layout", layoutClass());
    } catch (e) {
      reportPreloadError("failed to define the layout", e);
    }
  }

  // When its app starts, Home Assistant replaces window.customElements with
  // a scoped registry polyfill, and elements defined before that stay
  // unknown to it. This file loads in parallel with the app, so the layout
  // is defined on the final registry: the app defines <home-assistant> on it
  // right after the replacement, long before it shows a dashboard.
  if (customElements.get("home-assistant")) defineLayout();
  else customElements.whenDefined("home-assistant").then(defineLayout);
})();
