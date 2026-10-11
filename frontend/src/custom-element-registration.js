"use strict";

function isDwainsElementName(name) {
  if (typeof name !== "string") return false;
  return (
    name.startsWith("dwains-")
    || name === "homepage-card"
    || name === "devices-card"
    || name === "more-page-card"
    || name === "more-pages-card"
    || name === "dwainsboard-navigation-card"
  );
}

function defineOwnedElement(
  name,
  constructor,
  {
    registry = typeof customElements === "undefined" ? undefined : customElements,
    reportError = (...args) => console.error(...args),
  } = {},
) {
  if (typeof name !== "string" || !name.includes("-")) {
    throw new TypeError(`Invalid custom-element name: ${name}`);
  }
  if (!registry || typeof registry.define !== "function") {
    throw new TypeError("A CustomElementRegistry is required");
  }

  if (registry.get(name)) return undefined;
  try {
    return registry.define(name, constructor);
  } catch (error) {
    reportError("[dwains] define failed:", name, error);
    return undefined;
  }
}

function defineDwainsElement(name, constructor, options = {}) {
  if (!isDwainsElementName(name)) {
    throw new TypeError(`Not a Dwains custom-element name: ${name}`);
  }
  return defineOwnedElement(name, constructor, options);
}

module.exports = {
  defineDwainsElement,
  defineOwnedElement,
  isDwainsElementName,
};
