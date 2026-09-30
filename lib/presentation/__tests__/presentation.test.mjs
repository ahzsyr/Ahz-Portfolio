import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  PRESENTATION_MODES,
  normalizePresentationMode,
  getPresentationTheme,
  orderBlocksForMode,
  modeUsesReorder,
} from "../index.js";

describe("normalizePresentationMode", () => {
  it("defaults unknown to minimal", () => {
    assert.equal(normalizePresentationMode(null), "minimal");
    assert.equal(normalizePresentationMode("nope"), "minimal");
    assert.equal(normalizePresentationMode("CREATIVE"), "creative");
  });

  it("lists five modes", () => {
    assert.deepEqual(PRESENTATION_MODES, [
      "minimal",
      "creative",
      "business",
      "technical",
      "career",
    ]);
  });
});

describe("getPresentationTheme", () => {
  it("returns class hooks", () => {
    const t = getPresentationTheme("business");
    assert.equal(t.id, "business");
    assert.match(t.className, /project-presentation--business/);
    assert.match(t.streamClassName, /story-stream--business/);
  });
});

describe("orderBlocksForMode", () => {
  it("leaves minimal and creative in input order (after hero)", () => {
    const blocks = [
      { id: 1, type: "prose", sortOrder: 0 },
      { id: 2, type: "metricCard", sortOrder: 1 },
      { id: 3, type: "gallery", sortOrder: 2 },
    ];
    assert.deepEqual(
      orderBlocksForMode(blocks, "minimal").map((b) => b.id),
      [1, 2, 3]
    );
    assert.deepEqual(
      orderBlocksForMode(blocks, "creative").map((b) => b.id),
      [1, 2, 3]
    );
  });

  it("pulls business KPIs earlier; keeps hero first", () => {
    const blocks = [
      { id: 1, type: "hero", sortOrder: 0 },
      { id: 2, type: "prose", sortOrder: 1 },
      { id: 3, type: "metricCard", sortOrder: 2 },
      { id: 4, type: "chartCard", sortOrder: 3 },
      { id: 5, type: "gallery", sortOrder: 4 },
    ];
    const ordered = orderBlocksForMode(blocks, "business").map((b) => b.type);
    assert.equal(ordered[0], "hero");
    assert.ok(ordered.indexOf("metricCard") < ordered.indexOf("prose"));
    assert.ok(ordered.indexOf("chartCard") < ordered.indexOf("gallery"));
  });

  it("career emphasizes timeline and achievements", () => {
    const blocks = [
      { id: 1, type: "prose", sortOrder: 0 },
      { id: 2, type: "timelineCard", sortOrder: 1 },
      { id: 3, type: "achievementCard", sortOrder: 2 },
    ];
    const ordered = orderBlocksForMode(blocks, "career").map((b) => b.type);
    assert.equal(ordered[0], "timelineCard");
    assert.equal(ordered[1], "achievementCard");
    assert.equal(ordered[2], "prose");
  });

  it("modeUsesReorder only for business and career", () => {
    assert.equal(modeUsesReorder("business"), true);
    assert.equal(modeUsesReorder("career"), true);
    assert.equal(modeUsesReorder("minimal"), false);
    assert.equal(modeUsesReorder("creative"), false);
  });
});
