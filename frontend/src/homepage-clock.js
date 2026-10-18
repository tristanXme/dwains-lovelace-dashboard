"use strict";

// The clock and the greeting at the top of the homepage.

// Whether the time format of the user's profile is the AM/PM clock, decided
// as Home Assistant decides it for its own times: "12" or "24", else the
// format of the profile's language ("language") or of the browser
// ("system").
function usesAmPm(locale) {
  const format = locale?.time_format;
  if (format !== "language" && format !== "system") return format === "12";
  const language = format === "language" ? locale.language : undefined;
  return new Date("January 1, 2023 22:00:00").toLocaleString(language).includes("10");
}

// "14:05", or with the AM/PM clock "2:05 pm" (noon is 12 pm, midnight 12 am).
function clockText(date, amPm = false) {
  const minutes = String(date.getMinutes()).padStart(2, "0");
  if (!amPm) return `${String(date.getHours()).padStart(2, "0")}:${minutes}`;
  return `${date.getHours() % 12 || 12}:${minutes} ${date.getHours() < 12 ? "am" : "pm"}`;
}

// Good morning until 12, good afternoon until 18, then good evening.
function greetingKey(date) {
  const hours = date.getHours();
  if (hours < 12) return "global.greeting_morning";
  if (hours < 18) return "global.greeting_afternoon";
  return "global.greeting_evening";
}

// Milliseconds until just after the next full minute, when the clock shows
// the next time.
function untilNextMinute(now) {
  return 60000 - (now % 60000) + 50;
}

module.exports = { clockText, greetingKey, untilNextMinute, usesAmPm };
