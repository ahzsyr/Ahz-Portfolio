import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { easeOutCubic, interpolateCount, clamp01 } from "../ease.js";
import { projectHeroLayoutId } from "../projectHeroId.js";

describe("easeOutCubic", () => {
  it("starts at 0 and ends at 1", () => {
    assert.equal(easeOutCubic(0), 0);
    assert.equal(easeOutCubic(1), 1);
  });

  it("clamps out of range", () => {
    assert.equal(easeOutCubic(-1), 0);
    assert.equal(easeOutCubic(2), 1);
  });
});

describe("interpolateCount", () => {
  it("interpolates from → to", () => {
    assert.equal(interpolateCount(0, 0, 100).value, 0);
    assert.equal(interpolateCount(1, 0, 100).value, 100);
    assert.equal(interpolateCount(1, 0, 100).done, true);
  });

  it("eases mid values above linear", () => {
    const mid = interpolateCount(0.5, 0, 100).value;
    assert.ok(mid > 50);
  });
});

describe("clamp01", () => {
  it("clamps", () => {
    assert.equal(clamp01(-0.5), 0);
    assert.equal(clamp01(1.5), 1);
    assert.equal(clamp01(0.3), 0.3);
  });
});

describe("projectHeroLayoutId", () => {
  it("builds id from project", () => {
    assert.equal(projectHeroLayoutId({ id: 12 }), "project-hero-12");
    assert.equal(projectHeroLayoutId({ slug: "x" }), "project-hero-x");
    assert.equal(projectHeroLayoutId(null), null);
  });
});
