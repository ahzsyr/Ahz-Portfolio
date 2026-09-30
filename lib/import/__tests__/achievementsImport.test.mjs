import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildAchievementsImportPreview } from "../achievements.js";

describe("buildAchievementsImportPreview", () => {
  it("requires title and description", () => {
    const csv = `title,description,type
,missing title,design
Only Title,,design
`;
    const preview = buildAchievementsImportPreview(csv, "csv");
    assert.equal(preview.summary.errors, 2);
  });

  it("classifies create vs update by slug", () => {
    const csv = `title,description,type,date
Ship Launch,Shipped v1,launch,2026-01-15
`;
    const preview = buildAchievementsImportPreview(csv, "csv", {
      bySlug: new Map([
        ["ship-launch", { id: 3, title: "Ship Launch", slug: "ship-launch" }],
      ]),
    });
    assert.equal(preview.summary.valid, 1);
    assert.equal(preview.rows[0].action, "update");
    assert.equal(preview.rows[0].existingId, 3);
  });

  it("parses JSON array", () => {
    const json = JSON.stringify([
      {
        title: "Win",
        description: "Closed deal",
        type: "sales",
        featured: true,
      },
    ]);
    const preview = buildAchievementsImportPreview(json, "json");
    assert.equal(preview.summary.creates, 1);
    assert.equal(preview.rows[0].data.featured, true);
  });
});
