import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  resolveProjectYear,
  resolveProjectDomain,
  resolveAchievementYear,
  buildProjectsByYear,
  buildProjectsByDomain,
  buildAchievementsByYear,
  projectsByYearViz,
  projectsByDomainViz,
  achievementsByYearViz,
} from "../adminAnalytics.js";

describe("resolveProjectYear", () => {
  it("prefers experience startYear", () => {
    assert.equal(
      resolveProjectYear({
        createdAt: "2020-01-01",
        experience: { startYear: 2022, period: "2019 – 2021" },
      }),
      2022
    );
  });

  it("falls back to createdAt", () => {
    assert.equal(
      resolveProjectYear({ createdAt: "2019-06-15T00:00:00.000Z" }),
      2019
    );
  });
});

describe("resolveProjectDomain", () => {
  it("prefers experience domain", () => {
    assert.equal(
      resolveProjectDomain({
        experience: { domain: "IT" },
        category: { name: "Web" },
      }),
      "IT"
    );
  });

  it("falls back to category then Other", () => {
    assert.equal(
      resolveProjectDomain({ category: { name: "Design" } }),
      "Design"
    );
    assert.equal(resolveProjectDomain({}), "Other");
  });
});

describe("buildProjectsByYear", () => {
  it("buckets and sorts ascending", () => {
    const series = buildProjectsByYear([
      { createdAt: "2024-01-01", experience: { startYear: 2023 } },
      { createdAt: "2024-02-01", experience: { startYear: 2023 } },
      { createdAt: "2025-01-01" },
    ]);
    assert.deepEqual(
      series.map((r) => [r.label, r.valueNumeric]),
      [
        ["2023", 2],
        ["2025", 1],
      ]
    );
  });
});

describe("buildProjectsByDomain", () => {
  it("aggregates with locked fallbacks", () => {
    const rows = buildProjectsByDomain([
      { experience: { domain: "Design" } },
      { experience: { domain: "Design" } },
      { category: { name: "E-commerce" } },
      {},
    ]);
    assert.deepEqual(
      rows.map((r) => [r.name, r.count]),
      [
        ["Design", 2],
        ["E-commerce", 1],
        ["Other", 1],
      ]
    );
  });
});

describe("buildAchievementsByYear", () => {
  it("prefers date then createdAt; newest first", () => {
    const series = buildAchievementsByYear([
      { date: "2024-05-01", createdAt: "2020-01-01" },
      { date: null, createdAt: "2025-03-01" },
      { date: "2025-01-01", createdAt: "2025-01-02" },
    ]);
    assert.deepEqual(
      series.map((r) => [r.name, r.value]),
      [
        ["2025", 2],
        ["2024", 1],
      ]
    );
  });
});

describe("viz wrappers", () => {
  it("marks empty series", () => {
    assert.equal(projectsByYearViz([]).config.empty, true);
    assert.equal(achievementsByYearViz([]).config.empty, true);
  });

  it("donut needs at least two domains", () => {
    const one = projectsByDomainViz([{ name: "Only", count: 3 }]);
    assert.equal(one.config.empty, true);
    const two = projectsByDomainViz([
      { name: "A", count: 2 },
      { name: "B", count: 1 },
    ]);
    assert.equal(two.type, "donut");
    assert.equal(two.data.length, 2);
  });
});

describe("resolveAchievementYear", () => {
  it("uses date over createdAt", () => {
    assert.equal(
      resolveAchievementYear({
        date: "2021-08-01",
        createdAt: "2023-01-01",
      }),
      2021
    );
  });
});
