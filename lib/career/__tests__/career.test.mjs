import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  parsePeriodYears,
  buildCareerTimeline,
  computeCareerStats,
  selectSkillsVisualization,
  selectExperienceMetrics,
  parseSkillLevel,
} from "../index.js";

describe("parsePeriodYears", () => {
  it("parses range", () => {
    assert.deepEqual(parsePeriodYears("2021 – 2023"), {
      startYear: 2021,
      endYear: 2023,
    });
  });

  it("handles Present", () => {
    const r = parsePeriodYears("2024-Present", 2026);
    assert.equal(r.startYear, 2024);
    assert.equal(r.endYear, 2026);
  });

  it("handles single year", () => {
    assert.deepEqual(parsePeriodYears("2019"), {
      startYear: 2019,
      endYear: 2019,
    });
  });
});

describe("buildCareerTimeline", () => {
  it("orders by startYear", () => {
    const lanes = buildCareerTimeline(
      [
        {
          id: 2,
          position: "Ops",
          company: "A",
          period: "2024 – Present",
          domain: "Operations",
          sortOrder: 0,
        },
        {
          id: 1,
          position: "Support",
          company: "B",
          period: "2019 – 2020",
          domain: "IT Support",
          sortOrder: 0,
        },
      ],
      2026
    );
    assert.deepEqual(
      lanes.map((l) => l.id),
      [1, 2]
    );
    assert.equal(lanes[0].domain, "IT Support");
    assert.equal(lanes[1].endYear, 2026);
  });
});

describe("computeCareerStats", () => {
  it("computes years, projects, techs, domains", () => {
    const stats = computeCareerStats(
      {
        experiences: [
          { period: "2019 – 2020", domain: "IT" },
          { period: "2021 – 2023", domain: "E-commerce" },
          { startYear: 2024, endYear: 2026, domain: "Operations" },
        ],
        projects: [{ status: "published" }, { status: "published" }],
        skills: [{ name: "React" }, { name: "Node" }],
        tools: ["Photoshop", "React"],
      },
      2026
    );
    const byId = Object.fromEntries(stats.map((s) => [s.id, s]));
    assert.equal(byId.years.valueNumeric, 7);
    assert.match(byId.years.display, /7\+/);
    assert.equal(byId.projects.valueNumeric, 2);
    assert.equal(byId.technologies.valueNumeric, 3);
    assert.equal(byId.domains.valueNumeric, 3);
  });
});

describe("parseSkillLevel", () => {
  it("maps labels and numbers", () => {
    assert.equal(parseSkillLevel("expert"), 95);
    assert.equal(parseSkillLevel(4), 80);
    assert.equal(parseSkillLevel("80%"), 80);
  });
});

describe("selectSkillsVisualization", () => {
  it("omits when empty", () => {
    assert.equal(selectSkillsVisualization([]).mode, "omit");
  });

  it("uses bars + radar when categories >= 3", () => {
    const viz = selectSkillsVisualization([
      { name: "A", category: "Ops" },
      { name: "B", category: "Commerce" },
      { name: "C", category: "Web" },
    ]);
    assert.equal(viz.mode, "bars");
    assert.equal(viz.allowRadar, true);
    assert.equal(viz.data.length, 3);
  });

  it("uses level bars when levels present and few categories", () => {
    const viz = selectSkillsVisualization([
      { name: "React", category: "Web", level: "advanced" },
      { name: "CSS", category: "Web", level: "intermediate" },
    ]);
    assert.equal(viz.mode, "bars");
    assert.equal(viz.allowRadar, false);
    assert.ok(viz.data[0].value > 0);
  });

  it("falls back to grouped", () => {
    const viz = selectSkillsVisualization([
      { name: "A", featured: true, sortOrder: 0 },
      { name: "B", sortOrder: 1 },
    ]);
    assert.equal(viz.mode, "grouped");
  });
});

describe("selectExperienceMetrics", () => {
  it("caps featured at 3", () => {
    const list = [1, 2, 3, 4].map((id) => ({
      id,
      featured: true,
      sortOrder: id,
    }));
    assert.equal(selectExperienceMetrics(list).length, 3);
  });
});
