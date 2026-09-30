import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  hasText,
  normalizeTags,
  normalizePathList,
  collectExperienceIds,
  selectHeroKpis,
  selectPrimaryChartMetric,
  selectCaseAchievements,
  HERO_KPI_MAX,
} from "../index.js";

describe("hasText", () => {
  it("rejects empty and empty paragraphs", () => {
    assert.equal(hasText(null), false);
    assert.equal(hasText(""), false);
    assert.equal(hasText("<p></p>"), false);
    assert.equal(hasText("Hello"), true);
  });
});

describe("normalizeTags / paths", () => {
  it("parses comma tags", () => {
    assert.deepEqual(normalizeTags("E-commerce, Operations"), [
      "E-commerce",
      "Operations",
    ]);
  });

  it("parses path lists", () => {
    assert.deepEqual(normalizePathList("/a.jpg\n/b.jpg\n"), [
      "/a.jpg",
      "/b.jpg",
    ]);
  });
});

describe("collectExperienceIds", () => {
  it("returns unique ids from achievements and metrics", () => {
    const ids = collectExperienceIds({
      achievements: [{ experienceId: 1 }, { experienceId: 2 }],
      metrics: [{ experienceId: 2 }, { experienceId: 3 }, { experienceId: null }],
    });
    assert.deepEqual(ids.sort(), [1, 2, 3]);
  });

  it("returns empty when none linked", () => {
    assert.deepEqual(collectExperienceIds({}), []);
    assert.deepEqual(
      collectExperienceIds({ achievements: [], metrics: [] }),
      []
    );
  });
});

describe("selectHeroKpis", () => {
  it("prefers featured max 4", () => {
    const metrics = [
      { id: 1, featured: true, sortOrder: 2 },
      { id: 2, featured: true, sortOrder: 1 },
      { id: 3, featured: true, sortOrder: 3 },
      { id: 4, featured: true, sortOrder: 4 },
      { id: 5, featured: true, sortOrder: 5 },
      { id: 6, featured: false, sortOrder: 0 },
    ];
    const picked = selectHeroKpis(metrics);
    assert.equal(picked.length, HERO_KPI_MAX);
    assert.deepEqual(
      picked.map((m) => m.id),
      [2, 1, 3, 4]
    );
  });
});

describe("selectPrimaryChartMetric", () => {
  it("picks series metric preferring not in hero", () => {
    const hero = [{ id: 1 }];
    const metrics = [
      {
        id: 1,
        featured: true,
        sortOrder: 0,
        series: [
          { valueNumeric: 1 },
          { valueNumeric: 2 },
        ],
      },
      {
        id: 2,
        featured: false,
        sortOrder: 1,
        series: [
          { valueNumeric: 3 },
          { valueNumeric: 4 },
        ],
      },
    ];
    const chart = selectPrimaryChartMetric(metrics, hero);
    assert.equal(chart.id, 2);
  });

  it("returns null when no series", () => {
    assert.equal(
      selectPrimaryChartMetric([{ id: 1, series: [] }], []),
      null
    );
  });
});

describe("selectCaseAchievements", () => {
  it("featured first capped", () => {
    const list = [
      { id: 1, featured: false, sortOrder: 0 },
      { id: 2, featured: true, sortOrder: 2 },
      { id: 3, featured: true, sortOrder: 1 },
    ];
    const picked = selectCaseAchievements(list, 2);
    assert.deepEqual(
      picked.map((a) => a.id),
      [3, 2]
    );
  });
});
