import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  selectMetricVisualization,
  selectProjectMetrics,
  selectFeaturedKpis,
  toCategoryDonutConfig,
  toKpiConfig,
  toProgressConfig,
  toComparisonConfig,
  toTimelineConfig,
  resolveTrendTone,
  summarizeSeries,
  seriesGrowthPercent,
  resolveVizShellStatus,
  isVizType,
  VIZ_TYPES,
} from "../index.js";

function metricStub(overrides = {}) {
  return {
    id: 1,
    name: "Revenue",
    label: "Revenue",
    value: "AED 10K",
    valueNumeric: 10000,
    type: "currency",
    prefix: "AED ",
    trendPreference: "higher_is_better",
    featured: false,
    sortOrder: 0,
    series: [],
    comparison: {
      hasComparison: false,
      current: { display: "AED 10K", numeric: 10000 },
    },
    formatted: { display: "AED 10K" },
    ...overrides,
  };
}

describe("selectMetricVisualization", () => {
  it("picks kpi when series length < 2", () => {
    const viz = selectMetricVisualization(
      metricStub({
        series: [{ label: "Jan", valueNumeric: 10, display: "10" }],
      })
    );
    assert.equal(viz.type, "kpi");
    assert.ok(viz.config.textSummary);
  });

  it("picks area by default when series length >= 2", () => {
    const viz = selectMetricVisualization(
      metricStub({
        series: [
          { label: "Jan", valueNumeric: 18000, display: "AED 18K" },
          { label: "May", valueNumeric: 34500, display: "AED 34.5K" },
        ],
      })
    );
    assert.equal(viz.type, "area");
    assert.equal(viz.data.length, 2);
    assert.equal(viz.config.tableFallback, true);
    assert.ok(viz.config.textSummary.length > 0);
  });

  it("honors preferredSeriesType line and bar", () => {
    const series = [
      { label: "A", valueNumeric: 1, display: "1" },
      { label: "B", valueNumeric: 2, display: "2" },
    ];
    assert.equal(
      selectMetricVisualization(metricStub({ series }), {
        preferredSeriesType: "line",
      }).type,
      "line"
    );
    assert.equal(
      selectMetricVisualization(metricStub({ series }), {
        preferredSeriesType: "bar",
      }).type,
      "bar"
    );
  });

  it("handles missing metric as empty kpi", () => {
    const viz = selectMetricVisualization(null);
    assert.equal(viz.type, "kpi");
    assert.ok(viz.config.error || viz.config.empty);
  });
});

describe("resolveTrendTone", () => {
  it("maps higher_is_better", () => {
    assert.equal(resolveTrendTone("up", "higher_is_better"), "positive");
    assert.equal(resolveTrendTone("down", "higher_is_better"), "negative");
  });

  it("maps lower_is_better", () => {
    assert.equal(resolveTrendTone("down", "lower_is_better"), "positive");
    assert.equal(resolveTrendTone("up", "lower_is_better"), "negative");
  });

  it("stays neutral for flat or neutral preference", () => {
    assert.equal(resolveTrendTone("flat", "higher_is_better"), "neutral");
    assert.equal(resolveTrendTone("up", "neutral"), "neutral");
  });
});

describe("summarizeSeries", () => {
  it("produces a multi-point summary with growth percent", () => {
    const text = summarizeSeries(
      { label: "Revenue" },
      [
        { label: "January", valueNumeric: 18200, display: "AED 18,200" },
        { label: "May", valueNumeric: 34500, display: "AED 34,500" },
      ]
    );
    assert.match(text, /Revenue/);
    assert.match(text, /AED 18,200/);
    assert.match(text, /AED 34,500/);
    assert.match(text, /increased/);
    assert.match(text, /approximately 89\.6% growth/);
  });

  it("skips growth percent when first value is zero", () => {
    const text = summarizeSeries(
      { label: "Users" },
      [
        { label: "Jan", valueNumeric: 0, display: "0" },
        { label: "May", valueNumeric: 100, display: "100" },
      ]
    );
    assert.match(text, /increased/);
    assert.equal(/growth/.test(text), false);
  });
});

describe("seriesGrowthPercent", () => {
  it("computes one-decimal growth", () => {
    assert.equal(seriesGrowthPercent(18200, 34500), "89.6");
    assert.equal(seriesGrowthPercent(0, 10), null);
  });
});

describe("adapter tableFallback", () => {
  it("enables tables for progress, comparison, and timeline", () => {
    const progress = toProgressConfig({
      name: "Goal",
      valueNumeric: 50,
      targetNumeric: 100,
      formatted: { display: "50" },
    });
    assert.equal(progress.tableFallback, true);
    assert.equal(progress._tableData.length, 2);

    const comparison = toComparisonConfig({
      name: "Conv",
      startValue: "2%",
      endValue: "5%",
      comparison: {
        previous: { display: "2%" },
        current: { display: "5%" },
      },
    });
    assert.equal(comparison.tableFallback, true);

    const timeline = toTimelineConfig([
      { title: "Launch", date: "2024-01-01", description: "Shipped" },
    ]);
    assert.equal(timeline.config.tableFallback, true);
  });
});

describe("toCategoryDonutConfig", () => {
  it("rejects fewer than 2 categories", () => {
    const viz = toCategoryDonutConfig([{ name: "Only", count: 3 }]);
    assert.equal(viz.type, "donut");
    assert.equal(viz.config.empty, true);
  });

  it("keeps 2–6 slices as-is", () => {
    const viz = toCategoryDonutConfig([
      { name: "A", count: 2 },
      { name: "B", count: 3 },
      { name: "C", count: 1 },
    ]);
    assert.equal(viz.config.empty, false);
    assert.equal(viz.data.length, 3);
  });

  it("buckets Other when more than 6", () => {
    const cats = Array.from({ length: 8 }, (_, i) => ({
      name: `Cat ${i}`,
      count: 10 - i,
    }));
    const viz = toCategoryDonutConfig(cats);
    assert.equal(viz.data.length, 6);
    assert.equal(viz.data[5].name, "Other");
    assert.ok(viz.data[5].value > 0);
  });
});

describe("selectProjectMetrics / featured KPIs", () => {
  it("prefers featured max 3", () => {
    const list = [
      metricStub({ id: 1, featured: true, sortOrder: 2 }),
      metricStub({ id: 2, featured: true, sortOrder: 1 }),
      metricStub({ id: 3, featured: true, sortOrder: 3 }),
      metricStub({ id: 4, featured: true, sortOrder: 4 }),
      metricStub({ id: 5, featured: false, sortOrder: 0 }),
    ];
    const picked = selectProjectMetrics(list);
    assert.equal(picked.length, 3);
    assert.deepEqual(
      picked.map((m) => m.id),
      [2, 1, 3]
    );
  });

  it("falls back to top 2 by sortOrder when none featured", () => {
    const list = [
      metricStub({ id: 10, featured: false, sortOrder: 5 }),
      metricStub({ id: 11, featured: false, sortOrder: 1 }),
      metricStub({ id: 12, featured: false, sortOrder: 3 }),
    ];
    const picked = selectProjectMetrics(list);
    assert.equal(picked.length, 2);
    assert.deepEqual(
      picked.map((m) => m.id),
      [11, 12]
    );
  });

  it("caps featured KPIs at max", () => {
    const list = Array.from({ length: 6 }, (_, i) =>
      metricStub({ id: i, featured: true, sortOrder: i })
    );
    assert.equal(selectFeaturedKpis(list, 4).length, 4);
  });
});

describe("toKpiConfig tone", () => {
  it("uses trend preference for tone", () => {
    const cfg = toKpiConfig(
      metricStub({
        trendPreference: "higher_is_better",
        comparison: {
          hasComparison: true,
          changeDirection: "up",
          changePercent: 12,
          current: { display: "AED 12K", numeric: 12000 },
        },
      })
    );
    assert.equal(cfg.tone, "positive");
  });
});

describe("viz types / registry contract", () => {
  it("lists all supported registry types", () => {
    for (const t of [
      "kpi",
      "line",
      "area",
      "bar",
      "barHorizontal",
      "donut",
      "radar",
      "timeline",
      "progress",
      "comparison",
    ]) {
      assert.equal(isVizType(t), true);
    }
    assert.equal(isVizType("unknown"), false);
    assert.ok(VIZ_TYPES.length >= 10);
  });
});

describe("resolveVizShellStatus (VizShell smoke)", () => {
  it("maps empty and error configs", () => {
    assert.equal(resolveVizShellStatus({ empty: true }), "empty");
    assert.equal(resolveVizShellStatus({ error: "boom" }), "error");
    assert.equal(resolveVizShellStatus({}, "loading"), "loading");
    assert.equal(resolveVizShellStatus({}), "ready");
  });

  it("prefers error over empty", () => {
    assert.equal(
      resolveVizShellStatus({ empty: true, error: "bad" }),
      "error"
    );
  });
});
