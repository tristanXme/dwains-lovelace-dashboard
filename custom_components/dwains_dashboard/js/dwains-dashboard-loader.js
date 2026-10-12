(function () {
  "use strict";

  const runtimeStateKey = Symbol.for("dwains-dashboard.runtime");
  const runtimeState = (window[runtimeStateKey] ||= {});
  if (runtimeState.routeLoaderInstalled) return;
  runtimeState.routeLoaderInstalled = true;

  const reportLoaderError = (context, error) => {
    console.error(`Dwains Dashboard loader: ${context}`, error);
  };

  const isDwainsRoute = () => {
    const path = window.location.pathname || "";
    return path === "/dwains-dashboard" || path.startsWith("/dwains-dashboard/");
  };

  try {
    const localStore = window.localStorage
      || (typeof localStorage !== "undefined" ? localStorage : undefined);
    const sessionStore = window.sessionStorage
      || (typeof sessionStorage !== "undefined" ? sessionStorage : undefined);
    localStore?.removeItem("dwains_dashboard_restore_until");
    localStore?.removeItem("dwains_dashboard_last_url");
    sessionStore?.removeItem("dwains_dashboard_last_url");
  } catch (error) {
    reportLoaderError("failed to clear obsolete route restore state", error);
  }

  // Home Assistant loads this file with import(), so there is no <script>
  // element to inspect; import.meta.url carries the versioned module URL.
  // Forwarding its `version` gives the bundle a cache-busting URL: the static
  // files are served with a 31 day cache lifetime.
  const loaderUrl = import.meta.url;
  const bundleUrl = () => {
    const url = new URL("dwains-dashboard.js", loaderUrl);
    try {
      const version = new URL(loaderUrl).searchParams.get("version");
      if (version) url.searchParams.set("version", version);
    } catch (error) {
      reportLoaderError("failed to read the loader version", error);
    }
    return url.href;
  };

  // Written by scripts/postbuild.mjs: language code -> strings file next to
  // this loader (the file name carries a content hash). English is bundled.
  const languageFiles = {"de":"lang/de.8fed00cc.json","es":"lang/es.bffd796e.json","fr":"lang/fr.feca9f85.json","it":"lang/it.703ca647.json","nl":"lang/nl.067cf21f.json","pl":"lang/pl.c0236ecd.json","pt":"lang/pt.746eb639.json","sv":"lang/sv.5de250b4.json","zh":"lang/zh.eaae931c.json"};
  runtimeState.languageFiles = Object.fromEntries(
    Object.entries(languageFiles).map(([code, file]) => [code, new URL(file, loaderUrl).href]),
  );

  const storedLanguage = () => {
    try {
      const value = window.localStorage?.getItem("selectedLanguage");
      return value ? JSON.parse(value) : undefined;
    } catch (error) {
      return undefined;
    }
  };

  // The language Home Assistant shows, or the guess Home Assistant itself
  // starts with while its connection is still coming up.
  const languageCode = () => {
    const hass = window.document?.querySelector("home-assistant")?.hass;
    const language = hass?.selectedLanguage || hass?.language || storedLanguage() || window.navigator?.language;
    if (typeof language !== "string") return undefined;
    if (languageFiles[language]) return language;
    const base = language.split("-")[0];
    return languageFiles[base] ? base : undefined;
  };

  // Same contract as requestLanguage() in frontend/src/language-loader.js,
  // which reuses this request: resolves to the strings or to undefined.
  const requestLanguage = (code) => {
    const requests = (runtimeState.languageRequests ||= {});
    requests[code] ||= window.fetch(runtimeState.languageFiles[code])
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((strings) => {
        (runtimeState.translations ||= {})[code] = strings;
        return strings;
      })
      .catch((error) => {
        reportLoaderError(`failed to load the "${code}" strings`, error);
        return undefined;
      });
    return requests[code];
  };

  // Start downloading the bundle while the strings load; it runs afterwards,
  // so the first render is already in the right language.
  const preloadModule = (url) => {
    try {
      const link = window.document.createElement("link");
      link.rel = "modulepreload";
      link.href = url;
      window.document.head.appendChild(link);
    } catch (error) {
      reportLoaderError("failed to preload the bundle", error);
    }
  };

  const LANGUAGE_WAIT_MS = 3000;

  // When its app starts, Home Assistant replaces window.customElements with
  // a scoped registry polyfill, and elements defined before that stay
  // unknown to it. This file loads in parallel with the app, so the bundle,
  // which defines its elements when it runs, waits for the final registry:
  // the app defines <home-assistant> on it right after the replacement.
  const registryWait = () => {
    const registry = window.customElements;
    if (!registry || registry.get("home-assistant")) return undefined;
    return registry.whenDefined("home-assistant");
  };

  const load = () => {
    if (!isDwainsRoute() || runtimeState.routeBundleRequested) return;
    runtimeState.routeBundleRequested = true;
    const url = bundleUrl();
    const code = languageCode();
    const waits = [registryWait()].filter(Boolean);
    if (code && !runtimeState.translations?.[code]) {
      waits.push(Promise.race([
        requestLanguage(code),
        new Promise((resolve) => setTimeout(resolve, LANGUAGE_WAIT_MS)),
      ]));
    }
    if (waits.length) preloadModule(url);
    Promise.all(waits).then(() => import(url)).catch((err) => {
      runtimeState.routeBundleRequested = false;
      console.error("Dwains Dashboard: failed to load route bundle", err);
    });
  };

  load();
  window.addEventListener("location-changed", load);
  window.addEventListener("popstate", load);
})();
