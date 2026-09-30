import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  formatMetricValue,
  formatCompactNumber,
  resolvePercentDisplay,
  buildComparison,
  buildSeries,
  sortDataPoints,
  validateDataPointInput,
  validateNumericForType,
  buildMetricDomain,
} from "../index.js";

describe("formatCompactNumber", () => {
  it("formats thousands and millions", () => {
    assert.equal(formatCompactNumber(250000), "250K");
    assert.equal(formatCompactNumber(1_500_000), "1.5M");
  });
});

describe("percentScale", () => {
  it("ratio multiplies by 100", () => {
    const r = resolvePercentDisplay(0.487, "ratio");
    assert.equal(r.mode, "ratio");
    assert.ok(Math.abs(r.displayNumber - 48.7) < 0.001);
  });

  it("percent leaves value as-is", () => {
    const r = resolvePercentDisplay(48.7, "percent");
    assert.equal(r.mode, "percent");
    assert.equal(r.displayNumber, 48.7);
  });

  it("auto treats abs<=1 as ratio", () => {
    assert.equal(resolvePercentDisplay(0.487, "auto").mode, "ratio");
    assert.equal(resolvePercentDisplay(48.7, "auto").mode, "percent");
  });

  it("formats percent ratio for display", () => {
    const f = formatMetricValue(
      { type: "percent", percentScale: "ratio", value: "" },
      { valueNumeric: 0.487, forceNumericFormat: true, preferDisplayString: false }
    );
    assert.match(f.display, /48\.7%/);
  });
});

describe("currency formatting", () => {
  it("formats compact currency with prefix", () => {
    const f = formatMetricValue(
      {
        type: "currency",
        prefix: "AED ",
        compact: true,
        value: "",
      },
      {
        valueNumeric: 250000,
        forceNumericFormat: true,
        preferDisplayString: false,
      }
    );
    assert.equal(f.display, "AED 250K");
  });

  it("formats ratio with x suffix", () => {
    const f = formatMetricValue(
      { type: "ratio", value: "" },
      {
        valueNumeric: 3.72,
        forceNumericFormat: true,
        preferDisplayString: false,
      }
    );
    assert.equal(f.display, "3.72x");
  });
});

describe("series ordering", () => {
  it("orders by date ascending", () => {
    const points = [
      { date: "2024-03-01", valueNumeric: 3, sortOrder: 0 },
      { date: "2024-01-01", valueNumeric: 1, sortOrder: 0 },
      { date: "2024-02-01", valueNumeric: 2, sortOrder: 0 },
    ];
    const sorted = sortDataPoints(points);
    assert.equal(sorted[0].valueNumeric, 1);
    assert.equal(sorted[2].valueNumeric, 3);
  });

  it("empty series returns empty array", () => {
    assert.deepEqual(buildSeries({ type: "count" }, []), []);
  });
});

describe("comparison", () => {
  const metric = {
    type: "currency",
    prefix: "AED ",
    compact: true,
    value: "AED 250K",
    valueNumeric: 250000,
    previousNumeric: 100000,
    targetNumeric: 300000,
    baselineNumeric: 50000,
    trendPreference: "higher_is_better",
  };

  it("prefers chronological previous from series", () => {
    const points = [
      { date: "2024-01-01", valueNumeric: 18000 },
      { date: "2024-02-01", valueNumeric: 21500 },
      { date: "2024-03-01", valueNumeric: 26200 },
    ];
    const cmp = buildComparison(metric, points);
    assert.equal(cmp.comparisonSource.current, "series");
    assert.equal(cmp.comparisonSource.previous, "series");
    assert.equal(cmp.current.numeric, 26200);
    assert.equal(cmp.previous.numeric, 21500);
    assert.equal(cmp.hasComparison, true);
    assert.ok(cmp.changePercent != null);
  });

  it("falls back to previousNumeric when series too short", () => {
    const cmp = buildComparison(metric, [
      { date: "2024-05-01", valueNumeric: 34500 },
    ]);
    assert.equal(cmp.comparisonSource.current, "series");
    assert.equal(cmp.comparisonSource.previous, "fallback");
    assert.equal(cmp.previous.numeric, 100000);
  });

  it("falls back to snapshot when series empty", () => {
    const cmp = buildComparison(metric, []);
    assert.equal(cmp.comparisonSource.current, "snapshot");
    assert.equal(cmp.comparisonSource.previous, "fallback");
    assert.equal(cmp.current.numeric, 250000);
  });

  it("handles zero previous without bogus change%", () => {
    const cmp = buildComparison(
      { ...metric, previousNumeric: 0, valueNumeric: 10 },
      []
    );
    assert.equal(cmp.changePercent, null);
    assert.equal(cmp.hasComparison, false);
  });

  it("handles missing target/baseline", () => {
    const cmp = buildComparison(
      { type: "count", valueNumeric: 5, value: "5" },
      []
    );
    assert.equal(cmp.target, null);
    assert.equal(cmp.baseline, null);
    assert.equal(cmp.vsTargetPercent, null);
    assert.equal(cmp.comparisonSource.previous, "none");
  });

  it("exposes trendPreference without implying good/bad", () => {
    const cmp = buildComparison(metric, []);
    assert.equal(cmp.trendPreference, "higher_is_better");
    assert.ok(["up", "down", "flat", null].includes(cmp.changeDirection));
  });
});

describe("validation", () => {
  it("rejects percent ratio outside 0..1", () => {
    const r = validateNumericForType(48.7, {
      type: "percent",
      percentScale: "ratio",
    });
    assert.equal(r.ok, false);
  });

  it("rejects duplicate dates in validateDataPointInput", () => {
    const r = validateDataPointInput(
      { date: "2024-01-01", valueNumeric: 1 },
      { type: "count" },
      { existingDates: [new Date("2024-01-01T00:00:00.000Z")] }
    );
    assert.equal(r.ok, false);
    assert.equal(r.code, "DUPLICATE_DATE");
  });

  it("accepts valid point", () => {
    const r = validateDataPointInput(
      { date: "2024-02-01", valueNumeric: 100, label: "Feb" },
      { type: "currency" }
    );
    assert.equal(r.ok, true);
    assert.equal(r.data.label, "Feb");
  });
});

describe("buildMetricDomain", () => {
  it("includes series and comparison", () => {
    const domain = buildMetricDomain(
      {
        id: 1,
        name: "Revenue",
        value: "31K",
        valueNumeric: 31000,
        type: "currency",
        prefix: "AED ",
        compact: true,
        period: "month",
        trendPreference: "higher_is_better",
        percentScale: "auto",
      },
      [
        { date: "2024-01-01", valueNumeric: 18000, label: "Jan" },
        { date: "2024-02-01", valueNumeric: 21500, label: "Feb" },
      ]
    );
    assert.equal(domain.series.length, 2);
    assert.equal(domain.comparison.comparisonSource.current, "series");
    assert.equal(domain.period, "month");
  });
});
