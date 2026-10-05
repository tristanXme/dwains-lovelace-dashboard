"use strict";

// Strings for languages other than English live in separate files
// (js/lang/<code>.<hash>.json, listed by the route loader). The route loader
// fetches the active language before the bundle runs; this module fetches any
// other language on demand, e.g. after the user switched language, and then
// re-renders the dashboard.

const { getDwainsRuntimeState } = require("./runtime-state");
const { isDwainsElementName } = require("./custom-element-registration");
const { reportLoadFailure } = require("./load-failure");

function languageState(windowObject) {
  const state = getDwainsRuntimeState(windowObject);
  state.translations ||= {};
  state.languageFiles ||= {};
  state.languageRequests ||= {};
  return state;
}

function loadedLanguage(code, windowObject = window) {
  return languageState(windowObject).translations[code];
}

// Re-render every Dwains element, including those inside shadow roots.
function rerenderDwainsElements(root) {
  if (!root || typeof root.querySelectorAll !== "function") return;
  for (const element of root.querySelectorAll("*")) {
    if (isDwainsElementName(element.localName) && typeof element.requestUpdate === "function") {
      element.requestUpdate();
    }
    if (element.shadowRoot) rerenderDwainsElements(element.shadowRoot);
  }
}

// Starts loading a language once. The promise resolves to the strings, or to
// undefined when the language has no file or could not be loaded; a failed
// language is not retried, so a render never triggers a request loop.
function requestLanguage(
  code,
  {
    windowObject = window,
    onLoaded = () => rerenderDwainsElements(windowObject.document),
    reportError = (...args) => console.error(...args),
  } = {},
) {
  const state = languageState(windowObject);
  if (state.translations[code]) return Promise.resolve(state.translations[code]);
  if (state.languageRequests[code]) return state.languageRequests[code];
  const url = state.languageFiles[code];
  if (!url || typeof windowObject.fetch !== "function") return Promise.resolve(undefined);

  state.languageRequests[code] = windowObject.fetch(url)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((strings) => {
      state.translations[code] = strings;
      onLoaded();
      return strings;
    })
    .catch((error) => {
      state.failedLanguages ||= {};
      state.failedLanguages[code] = true;
      reportError(`Dwains Dashboard: failed to load the "${code}" strings`, error);
      reportLoadFailure(error);
      return undefined;
    });
  return state.languageRequests[code];
}

// The strings to fall back on while the language (or its base language,
// "pt" for "pt-BR") is still on the way: those of the language shown before,
// so a language switch does not flash English. undefined once one of them is
// there, when it is English, or when it cannot be loaded at all; English is
// the fallback then.
function stringsWhileLoading(codes, windowObject = window) {
  const state = languageState(windowObject);
  const ready = codes.find((code) => code === "en" || state.translations[code]);
  if (ready) {
    state.shownLanguage = ready;
    return undefined;
  }
  const loading = codes.some(
    (code) => state.languageRequests[code] && !state.failedLanguages?.[code],
  );
  if (!loading) {
    state.shownLanguage = "en";
    return undefined;
  }
  return state.translations[state.shownLanguage];
}

module.exports = { loadedLanguage, requestLanguage, rerenderDwainsElements, stringsWhileLoading };
