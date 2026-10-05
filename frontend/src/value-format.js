"use strict";

// Languages that put a space before "%" (same list Home Assistant uses).
const BLANK_BEFORE_PERCENT = new Set(["cs", "de", "fi", "fr", "sk", "sv"]);

function language(locale) {
  return String(locale || "en").split("-")[0].toLowerCase();
}

/**
 * Format a measurement the way Home Assistant does: localized decimals and a
 * space before the unit ("24,1 °C", "48 %" in German, "48%" in English).
 */
function formatValueWithUnit(value, unit, locale = "en", maximumFractionDigits = 1) {
  let number;
  try {
    number = new Intl.NumberFormat(locale, { maximumFractionDigits }).format(value);
  } catch (error) {
    number = String(Math.round(value * 10 ** maximumFractionDigits) / 10 ** maximumFractionDigits);
  }
  if (!unit) return number;
  if (unit === "%") return BLANK_BEFORE_PERCENT.has(language(locale)) ? `${number}\u00a0%` : `${number}%`;
  return `${number}\u00a0${unit}`;
}

module.exports = { formatValueWithUnit };
