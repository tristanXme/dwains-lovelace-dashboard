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

  const load = () => {
    if (!isDwainsRoute() || runtimeState.routeBundleRequested) return;
    runtimeState.routeBundleRequested = true;
    import(bundleUrl()).catch((err) => {
      runtimeState.routeBundleRequested = false;
      console.error("Dwains Dashboard: failed to load route bundle", err);
    });
  };

  load();
  window.addEventListener("location-changed", load);
  window.addEventListener("popstate", load);
})();
