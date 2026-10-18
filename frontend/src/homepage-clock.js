"use strict";

// The clock and the greeting at the top of the homepage.

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

module.exports = { clockText, greetingKey, untilNextMinute };
