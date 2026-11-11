"use strict";

// Applies card-mod styles to an element when card-mod is installed. When it is
// absent nothing is registered: a customElements.whenDefined("card-mod")
// continuation would never resolve and would retain `el` forever.
function applyCardModStyles(el, style, card, win = window, registry = customElements) {
  if (!el) return false;
  const cm = win.cardMod || registry.get("card-mod");
  if (!cm || typeof cm.applyToElement !== "function") return false;
  if (cm.applyToElement.length <= 3) {
    cm.applyToElement(el, style, { config: card, tag: "more-info" });
  } else {
    cm.applyToElement(el, "more-info", style, { config: card }, [], false);
  }
  return true;
}

module.exports = { applyCardModStyles };
