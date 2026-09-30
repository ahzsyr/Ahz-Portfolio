import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  selectHomepageProjects,
  selectHomepageImpactKpis,
  selectHomepageAchievements,
  selectHomepageSkills,
  buildHomepageSnapshot,
  HOMEPAGE_PROJECT_MAX,
  HOMEPAGE_IMPACT_KPI_MAX,
  HOMEPAGE_ACHIEVEMENT_MAX,
} from "../index.js";

describe("selectHomepageProjects", () => {
  it("caps at 3 and sorts by featuredOrder", () => {
    const projects = [
      { id: 1, featured: true, featuredOrder: 3 },
      { id: 2, featured: true, featuredOrder: 1 },
      { id: 3, featured: false, featuredOrder: 0 },
      { id: 4, featured: true, featuredOrder: 2 },
      { id: 5, featured: true, featuredOrder: 4 },
    ];
    const out = selectHomepageProjects(projects);
    assert.equal(out.length, HOMEPAGE_PROJECT_MAX);
    assert.deepEqual(
      out.map((p) => p.id),
      [2, 4, 1]
    );
  });

  it("returns empty when none featured", () => {
    assert.deepEqual(selectHomepageProjects([{ featured: false }]), []);
  });
});

describe("selectHomepageImpactKpis", () => {
  it("caps featured metrics", () => {
    const metrics = [1, 2, 3, 4, 5].map((id) => ({
      id,
      featured: true,
      sortOrder: id,
    }));
    assert.equal(
      selectHomepageImpactKpis(metrics).length,
      HOMEPAGE_IMPACT_KPI_MAX
    );
  });
});

describe("selectHomepageAchievements", () => {
  it("caps featured published achievements", () => {
    const list = [1, 2, 3, 4, 5].map((id) => ({
      id,
      featured: true,
      status: "published",
      sortOrder: id,
    }));
    assert.equal(
      selectHomepageAchievements(list).length,
      HOMEPAGE_ACHIEVEMENT_MAX
    );
  });
});

describe("selectHomepageSkills", () => {
  it("prefers featured then fills", () => {
    const skills = [
      { id: 1, name: "A", featured: false, sortOrder: 1 },
      { id: 2, name: "B", featured: true, sortOrder: 2 },
      { id: 3, name: "C", featured: true, sortOrder: 1 },
    ];
    const out = selectHomepageSkills(skills, 2);
    assert.deepEqual(
      out.map((s) => s.name),
      ["C", "B"]
    );
  });
});

describe("buildHomepageSnapshot", () => {
  it("returns Years Projects Tools Domains shape", () => {
    const { stats, hasData } = buildHomepageSnapshot(
      {
        experiences: [
          { startYear: 2018, endYear: 2024, domain: "IT" },
          { startYear: 2020, endYear: 2024, domain: "Design" },
        ],
        projects: [{ status: "published" }, { status: "published" }],
        skills: [{ name: "React" }],
        tools: ["Figma", "Next"],
      },
      2024
    );
    assert.equal(hasData, true);
    assert.deepEqual(
      stats.map((s) => s.label),
      ["Years", "Projects", "Tools", "Domains"]
    );
    assert.ok(stats[0].valueNumeric >= 6);
  });

  it("hasData false when empty", () => {
    assert.equal(buildHomepageSnapshot({}).hasData, false);
  });
});
