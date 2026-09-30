/**
 * Pure adapters: Metric DTO → VizConfig.
 * Deterministic selection — UI must not guess chart type from raw data.
 */

import { SERIES_VIZ_TYPES } from "./types.js";
import { resolveTrendTone } from "./trend.js";
import {
  summarizeComparison,
  summarizeKpi,
  summarizeProgress,
  summarizeSeries,
} from "./summarize.js";

function titleOf(metricDto) {
  return metricDto?.label || metricDto?.name || "Metric";
}

function seriesOf(metricDto) {
  return Array.isArray(metricDto?.series) ? metricDto.series : [];
}

function formatterFromMetric(metricDto) {
  // Prefer precomputed point.display from Metric Service — no format re-implementation.
  return (n, _name, item) => {
    if (item && item.payload && item.payload.display) {
      return item.payload.display;
    }
    if (n == null || !Number.isFinite(Number(n))) return "—";
    const hit = seriesOf(metricDto).find(
      (p) => Number(p.valueNumeric) === Number(n)
    );
    if (hit?.display) return hit.display;
    if (
      metricDto?.formatted?.display &&
      Number(metricDto.valueNumeric) === Number(n)
    ) {
      return metricDto.formatted.display;
    }
    return String(n);
  };
}

export function toKpiConfig(metricDto) {
  const comparison = metricDto?.comparison || null;
  const tone = resolveTrendTone(
    comparison?.changeDirection,
    metricDto?.trendPreference
  );
  const textSummary = summarizeKpi(metricDto, comparison);
  return {
    title: titleOf(metricDto),
    subtitle: metricDto?.category || null,
    tone,
    ariaLabel: textSummary,
    textSummary,
    tableFallback: false,
    empty: false,
    display:
      comparison?.current?.display ||
      metricDto?.formatted?.display ||
      metricDto?.value ||
      "—",
    changePercent: comparison?.hasComparison ? comparison.changePercent : null,
    changeDirection: comparison?.changeDirection || null,
    comparisonSource: comparison?.comparisonSource || null,
  };
}

export function toSeriesConfig(metricDto, { chartType = "area" } = {}) {
  const type = SERIES_VIZ_TYPES.includes(chartType) ? chartType : "area";
  const series = seriesOf(metricDto);
  const textSummary = summarizeSeries(metricDto, series);
  const empty = series.length < 2;

  return {
    type,
    config: {
      title: titleOf(metricDto),
      subtitle: metricDto?.period ? `Period: ${metricDto.period}` : null,
      seriesKey: "valueNumeric",
      xKey: "label",
      valueFormatter: formatterFromMetric(metricDto),
      showLegend: false,
      height: 280,
      ariaLabel: textSummary,
      textSummary,
      tableFallback: true,
      empty,
      columns: [
        { key: "label", label: "Period" },
        { key: "display", label: "Value" },
      ],
    },
    data: series.map((p) => ({
      ...p,
      label: p.label || (p.date ? String(p.date).slice(0, 7) : ""),
    })),
  };
}

export function toProgressConfig(metricDto) {
  const current =
    metricDto?.comparison?.current?.numeric ?? metricDto?.valueNumeric ?? null;
  const target = metricDto?.targetNumeric ?? null;
  const empty =
    current == null ||
    target == null ||
    !Number.isFinite(Number(target)) ||
    Number(target) === 0;
  const pct = empty
    ? 0
    : Math.min(100, Math.max(0, Math.round((Number(current) / Number(target)) * 100)));
  const textSummary = summarizeProgress(metricDto, current, target);

  return {
    title: titleOf(metricDto),
    ariaLabel: textSummary,
    textSummary,
    tableFallback: true,
    empty,
    percent: pct,
    currentDisplay:
      metricDto?.comparison?.current?.display ||
      metricDto?.formatted?.display ||
      String(current ?? "—"),
    targetDisplay: String(target ?? "—"),
    columns: [
      { key: "label", label: "Measure" },
      { key: "display", label: "Value" },
    ],
    _tableData: [
      { label: "Current", display: metricDto?.comparison?.current?.display || metricDto?.formatted?.display || String(current ?? "—") },
      { label: "Target", display: String(target ?? "—") },
    ],
  };
}

export function toComparisonConfig(metricDto) {
  const comparison = metricDto?.comparison || {};
  const before =
    comparison.previous?.display || metricDto?.startValue || null;
  const after =
    comparison.current?.display ||
    metricDto?.endValue ||
    metricDto?.formatted?.display ||
    null;
  const empty = !before || !after;
  const textSummary = summarizeComparison(metricDto, comparison);

  return {
    title: titleOf(metricDto),
    ariaLabel: textSummary,
    textSummary,
    tableFallback: true,
    empty,
    before,
    after,
    beforeLabel: "Before",
    afterLabel: "After",
    columns: [
      { key: "label", label: "Stage" },
      { key: "display", label: "Value" },
    ],
    _tableData: [
      { label: "Before", display: before || "—" },
      { label: "After", display: after || "—" },
    ],
  };
}

/**
 * Donut: require 2–6 slices. If >6 categories, top 5 + Other.
 * If <2, return empty.
 */
export function toCategoryDonutConfig(categoriesWithCounts = []) {
  const cleaned = (categoriesWithCounts || [])
    .map((c) => ({
      name: c.name || c.label || "Unknown",
      value: Number(c.count ?? c.value ?? 0),
    }))
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value);

  if (cleaned.length < 2) {
    return {
      type: "donut",
      data: [],
      config: {
        title: "Projects by category",
        empty: true,
        tableFallback: true,
        textSummary: "Not enough categories for a proportion chart.",
        ariaLabel: "Not enough categories for a proportion chart.",
      },
    };
  }

  let slices = cleaned;
  if (cleaned.length > 6) {
    const top = cleaned.slice(0, 5);
    const other = cleaned.slice(5).reduce((sum, c) => sum + c.value, 0);
    slices = [...top, { name: "Other", value: other }];
  }

  const total = slices.reduce((s, c) => s + c.value, 0);
  const textSummary = `Projects by category: ${slices
    .map((c) => `${c.name} ${Math.round((c.value / total) * 100)}%`)
    .join(", ")}.`;

  return {
    type: "donut",
    data: slices,
    config: {
      title: "Projects by category",
      nameKey: "name",
      seriesKey: "value",
      showLegend: true,
      height: 280,
      tableFallback: true,
      empty: false,
      textSummary,
      ariaLabel: textSummary,
      columns: [
        { key: "name", label: "Category" },
        { key: "value", label: "Projects" },
      ],
    },
  };
}

export function toSkillsBarConfig(skills = []) {
  const data = (skills || [])
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((s, i) => ({
      name: s.name,
      value: s.featured ? 100 - i : Math.max(40, 90 - i * 5),
      label: s.name,
    }));

  const empty = data.length === 0;
  const textSummary = empty
    ? "No skills listed."
    : `Skills include ${data
        .slice(0, 5)
        .map((d) => d.name)
        .join(", ")}${data.length > 5 ? ", and more" : ""}.`;

  return {
    type: "barHorizontal",
    data,
    config: {
      title: "Skills",
      xKey: "name",
      seriesKey: "value",
      height: Math.max(200, data.length * 28),
      showLegend: false,
      tableFallback: true,
      empty,
      textSummary,
      ariaLabel: textSummary,
      columns: [{ key: "name", label: "Skill" }],
    },
  };
}

export function toSkillsRadarConfig(skills = []) {
  const byCategory = {};
  for (const s of skills || []) {
    const cat = s.category || "General";
    byCategory[cat] = (byCategory[cat] || 0) + 1;
  }
  const data = Object.entries(byCategory).map(([name, value]) => ({
    name,
    value,
  }));
  const empty = data.length < 3;
  const textSummary = empty
    ? "Not enough skill categories for a radar profile."
    : `Skill profile across ${data.map((d) => d.name).join(", ")}.`;

  return {
    type: "radar",
    data,
    config: {
      title: "Skill profile",
      seriesKey: "value",
      nameKey: "name",
      height: 320,
      showLegend: false,
      tableFallback: true,
      empty,
      textSummary,
      ariaLabel: textSummary,
      columns: [
        { key: "name", label: "Category" },
        { key: "value", label: "Count" },
      ],
    },
  };
}

export function toTimelineConfig(milestones = []) {
  const data = (milestones || [])
    .slice()
    .sort((a, b) => {
      const da = a.date ? new Date(a.date).getTime() : 0;
      const db = b.date ? new Date(b.date).getTime() : 0;
      return da - db;
    })
    .map((m) => ({
      title: m.title,
      description: m.description || "",
      date: m.date,
      label: m.date ? String(m.date).slice(0, 4) : "",
      type: m.type || null,
    }));
  const empty = data.length === 0;
  const textSummary = empty
    ? "No milestones yet."
    : `Career timeline with ${data.length} milestones.`;

  return {
    type: "timeline",
    data,
    config: {
      title: "Milestones",
      tableFallback: true,
      empty,
      textSummary,
      ariaLabel: textSummary,
      columns: [
        { key: "label", label: "Year" },
        { key: "title", label: "Milestone" },
        { key: "description", label: "Notes" },
      ],
    },
  };
}

/**
 * Deterministic metric visualization selection.
 * series.length >= 2 → series chart; else → kpi
 */
export function selectMetricVisualization(
  metricDto,
  { preferredSeriesType = "area" } = {}
) {
  if (!metricDto) {
    return {
      type: "kpi",
      data: null,
      config: {
        empty: true,
        error: "No metric",
        textSummary: "No metric provided.",
        ariaLabel: "No metric provided.",
      },
    };
  }

  const series = seriesOf(metricDto);
  if (series.length >= 2) {
    const built = toSeriesConfig(metricDto, {
      chartType: preferredSeriesType,
    });
    return {
      type: built.type,
      data: built.data,
      config: built.config,
    };
  }

  return {
    type: "kpi",
    data: metricDto,
    config: toKpiConfig(metricDto),
  };
}

/**
 * Select featured metrics for project impact (contextual).
 * Featured first (max 3); else top 2 by sortOrder.
 */
export function selectProjectMetrics(metrics = []) {
  const list = Array.isArray(metrics) ? metrics : [];
  const featured = list
    .filter((m) => m.featured)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .slice(0, 3);
  if (featured.length) return featured;
  return list
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .slice(0, 2);
}

export function selectFeaturedKpis(metrics = [], max = 4) {
  return (metrics || [])
    .filter((m) => m.featured)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .slice(0, max);
}

/**
 * Pick up to maxGroups groups that have a primary metric for a chart/kpi.
 */
export function selectGroupVisualizations(groups = [], maxGroups = 3) {
  const out = [];
  for (const group of groups || []) {
    if (out.length >= maxGroups) break;
    const metrics = group.metrics || [];
    // Prefer a metric with series >= 2, else first featured, else first
    const withSeries = metrics.find((m) => (m.series || []).length >= 2);
    const featured = metrics.find((m) => m.featured);
    const pick = withSeries || featured || metrics[0];
    if (!pick) continue;
    out.push({
      group,
      visualization: selectMetricVisualization(pick, {
        preferredSeriesType: "area",
      }),
    });
  }
  return out;
}
