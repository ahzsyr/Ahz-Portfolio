/**
 * Chart registry — type → renderer component.
 * Recharts types are dynamically imported to keep KPI-only pages light.
 */

import dynamic from "next/dynamic";
import KpiStat from "./charts/KpiStat";
import TimelineViz from "./charts/TimelineViz";
import ProgressViz from "./charts/ProgressViz";
import ComparisonViz from "./charts/ComparisonViz";

const chartLoading = () => (
  <div
    className="h-40 rounded bg-slate-100 animate-pulse"
    aria-busy="true"
    aria-label="Loading chart"
  />
);

const AreaChartViz = dynamic(() => import("./charts/AreaChartViz"), {
  ssr: false,
  loading: chartLoading,
});
const LineChartViz = dynamic(() => import("./charts/LineChartViz"), {
  ssr: false,
  loading: chartLoading,
});
const BarChartViz = dynamic(() => import("./charts/BarChartViz"), {
  ssr: false,
  loading: chartLoading,
});
const HorizontalBarViz = dynamic(() => import("./charts/HorizontalBarViz"), {
  ssr: false,
  loading: chartLoading,
});
const DonutChartViz = dynamic(() => import("./charts/DonutChartViz"), {
  ssr: false,
  loading: chartLoading,
});
const RadarChartViz = dynamic(() => import("./charts/RadarChartViz"), {
  ssr: false,
  loading: chartLoading,
});

/** Types that pull Recharts — mount only when in view. */
export const HEAVY_CHART_TYPES = new Set([
  "line",
  "area",
  "bar",
  "barHorizontal",
  "donut",
  "radar",
]);

export const chartRegistry = {
  kpi: KpiStat,
  line: LineChartViz,
  area: AreaChartViz,
  bar: BarChartViz,
  barHorizontal: HorizontalBarViz,
  donut: DonutChartViz,
  radar: RadarChartViz,
  timeline: TimelineViz,
  progress: ProgressViz,
  comparison: ComparisonViz,
};

export function resolveChart(type) {
  return chartRegistry[type] || null;
}

export function isHeavyChartType(type) {
  return HEAVY_CHART_TYPES.has(type);
}
