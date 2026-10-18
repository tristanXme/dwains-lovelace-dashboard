"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { clockText, greetingKey, untilNextMinute } = require("../src/homepage-clock");

const at = (hours, minutes) => new Date(2026, 9, 14, hours, minutes);

test("the 24-hour clock has two digits for the hour", () => {
  assert.equal(clockText(at(9, 5)), "09:05");
  assert.equal(clockText(at(0, 0)), "00:00");
  assert.equal(clockText(at(23, 59)), "23:59");
});

test("the AM/PM clock shows noon and midnight as 12", () => {
  assert.equal(clockText(at(0, 5), true), "12:05 am");
  assert.equal(clockText(at(9, 5), true), "9:05 am");
  assert.equal(clockText(at(11, 59), true), "11:59 am");
  assert.equal(clockText(at(12, 5), true), "12:05 pm");
  assert.equal(clockText(at(13, 30), true), "1:30 pm");
  assert.equal(clockText(at(23, 59), true), "11:59 pm");
});

test("the greeting changes at 12 and 18 o'clock", () => {
  assert.equal(greetingKey(at(0, 0)), "global.greeting_morning");
  assert.equal(greetingKey(at(11, 59)), "global.greeting_morning");
  assert.equal(greetingKey(at(12, 0)), "global.greeting_afternoon");
  assert.equal(greetingKey(at(17, 59)), "global.greeting_afternoon");
  assert.equal(greetingKey(at(18, 0)), "global.greeting_evening");
});

test("the clock renders again just after the next full minute", () => {
  assert.equal(untilNextMinute(Date.UTC(2026, 9, 14, 10, 0, 0)), 60050);
  assert.equal(untilNextMinute(Date.UTC(2026, 9, 14, 10, 0, 59, 900)), 150);
});
