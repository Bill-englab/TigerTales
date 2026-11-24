// app/tests-js/map-model.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import {
  CHAPTER_THEMES,
  getChapterTheme,
  getLevelVisualState,
  LEVEL_STATUS,
  getStableRotation,
  isFrameDark,
} from "../static/map-model.mjs";

test("defines ten distinct chapter worlds with accent colors", () => {
  assert.equal(Object.keys(CHAPTER_THEMES).length, 10);
  assert.equal(new Set(Object.values(CHAPTER_THEMES).map(theme => theme.world)).size, 10);
  for (const theme of Object.values(CHAPTER_THEMES)) {
    assert.ok(typeof theme.world === "string" && theme.world.length > 0);
    assert.ok(theme.accent.startsWith("#"));
  }
});

test("selects visual state without disabling locked levels", () => {
  assert.equal(getLevelVisualState({ has_performance: true, current: false }), "completed");
  assert.equal(getLevelVisualState({ has_performance: false, current: true }), "current");
  assert.equal(getLevelVisualState({ has_performance: false, current: false }), "locked");
});

test("unlock-all shows unfinished lessons as open but keeps stars and the current marker", () => {
  assert.equal(getLevelVisualState({ has_performance: true, current: false }, true), "completed");
  assert.equal(getLevelVisualState({ has_performance: false, current: true }, true), "current");
  assert.equal(getLevelVisualState({ has_performance: false, current: false }, true), "unlocked");
  assert.equal(getLevelVisualState({ has_performance: false, current: false }), "locked");
});

test("every visual state has one shared status label", () => {
  for (const state of ["completed", "current", "unlocked", "locked"]) {
    assert.equal(typeof LEVEL_STATUS[state], "string", state);
  }
  assert.equal(LEVEL_STATUS.unlocked, "Available");
  assert.equal(LEVEL_STATUS.locked, "Locked · preview available");
  assert.equal(Object.isFrozen(LEVEL_STATUS), true);
});

test("completed-card rotation is stable and bounded", () => {
  const values = Array.from({ length: 30 }, (_, index) => getStableRotation(index));
  assert.deepEqual(values, Array.from({ length: 30 }, (_, index) => getStableRotation(index)));
  assert.ok(values.every(value => value >= -3 && value <= 3));
});

test("detects nearly black video frames", () => {
  assert.equal(isFrameDark(new Uint8ClampedArray([0, 0, 0, 255, 8, 8, 8, 255])), true);
  assert.equal(isFrameDark(new Uint8ClampedArray([230, 120, 60, 255, 250, 220, 180, 255])), false);
});

test("ignores transparent pixels while evaluating frame darkness", () => {
  const transparentBlackAndBright = new Uint8ClampedArray([0, 0, 0, 0, 240, 180, 80, 255]);
  assert.equal(isFrameDark(transparentBlackAndBright), false);
});
