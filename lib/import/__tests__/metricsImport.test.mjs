import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseImportDate } from "../parseDate.js";
import { buildMetricsImportPreview } from "../metrics.js";

describe("parseImportDate", () => {
  it("parses YYYY-MM as first of month UTC", () => {
    const d = parseImportDate("2026-01");
    assert.ok(d);
    assert.equal(d.toISOString(), "2026-01-01T00:00:00.000Z");
  });

  it("parses YYYY-MM-DD", () => {
    const d = parseImportDate("2026-02-15");
    assert.equal(d.toISOString(), "2026-02-15T00:00:00.000Z");
  });

  it("rejects invalid", () => {
    assert.equal(parseImportDate("not-a-date"), null);
    assert.equal(parseImportDate(""), null);
  });
});

describe("buildMetricsImportPreview", () => {
  it("parses sample Revenue CSV", () => {
    const csv = `date,metric,value
2026-01,Revenue,18200
2026-02,Revenue,21500
2026-03,Revenue,26200
`;
    const preview = buildMetricsImportPreview(csv, "csv", {
      metricsByName: new Map(),
      existingDatesByMetricId: new Map(),
    });
    assert.equal(preview.summary.total, 3);
    assert.equal(preview.summary.valid, 3);
    assert.equal(preview.summary.errors, 0);
    assert.equal(preview.summary.creates, 3);
    assert.equal(preview.summary.metricCreates, 1);
    assert.equal(preview.rows[0].action, "create");
    assert.equal(preview.rows[0].willCreateMetric, true);
  });

  it("marks updates when date exists", () => {
    const csv = `date,metric,value
2026-01,Revenue,18200
`;
    const metric = { id: 7, name: "Revenue", type: "count", percentScale: "auto" };
    const dateKey = "2026-01-01T00:00:00.000Z";
    const preview = buildMetricsImportPreview(csv, "csv", {
      metricsByName: new Map([["revenue", metric]]),
      existingDatesByMetricId: new Map([[7, [dateKey]]]),
    });
    assert.equal(preview.rows[0].action, "update");
    assert.equal(preview.summary.updates, 1);
  });

  it("flags invalid rows", () => {
    const csv = `date,metric,value
,Revenue,100
2026-01,,100
`;
    const preview = buildMetricsImportPreview(csv, "csv");
    assert.equal(preview.summary.errors, 2);
  });
});
