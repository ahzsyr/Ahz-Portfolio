import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  ARCHIVE_VERSION,
  buildProfessionalArchive,
  slimProjects,
} from "../archive.js";
import { metricsPointsToCsv, achievementsToCsv } from "../csv.js";

describe("buildProfessionalArchive", () => {
  it("sets version and collections", () => {
    const arch = buildProfessionalArchive(
      {
        metrics: [{ id: 1, name: "Revenue", dataPoints: [] }],
        achievements: [{ id: 2, title: "Win" }],
        projects: [
          {
            id: 9,
            title: "Site",
            slug: "site",
            category: { name: "web" },
            client: "Acme",
            overview: "secret",
          },
        ],
      },
      { exportedAt: "2026-09-21T00:00:00.000Z" }
    );
    assert.equal(arch.version, ARCHIVE_VERSION);
    assert.equal(arch.exportedAt, "2026-09-21T00:00:00.000Z");
    assert.equal(arch.metrics.length, 1);
    assert.equal(arch.achievements.length, 1);
    assert.deepEqual(arch.projects[0], {
      id: 9,
      title: "Site",
      slug: "site",
      category: "web",
      client: "Acme",
    });
  });
});

describe("slimProjects", () => {
  it("returns empty for empty input", () => {
    assert.deepEqual(slimProjects(), []);
  });
});

describe("export csv helpers", () => {
  it("serializes metric points", () => {
    const csv = metricsPointsToCsv([
      {
        date: new Date("2026-01-01T00:00:00.000Z"),
        metric: "Revenue",
        valueNumeric: 18200,
      },
    ]);
    assert.match(csv, /date,metric,value,label/);
    assert.match(csv, /2026-01-01,Revenue,18200/);
  });

  it("serializes achievements", () => {
    const csv = achievementsToCsv([
      {
        title: "Win",
        description: "Closed",
        type: "sales",
        featured: true,
        status: "published",
      },
    ]);
    assert.match(csv, /title,description,type/);
    assert.match(csv, /Win,Closed,sales/);
  });
});
