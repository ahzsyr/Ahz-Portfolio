/**
 * Concise textual summaries for chart accessibility.
 */

function pointLabel(point) {
  return point?.label || (point?.date ? String(point.date).slice(0, 10) : "start");
}

function pointDisplay(point) {
  return point?.display || String(point?.valueNumeric ?? "—");
}

/**
 * @returns {string|null} e.g. "89.6" or null when not computable
 */
export function seriesGrowthPercent(firstNumeric, lastNumeric) {
  const a = Number(firstNumeric);
  const b = Number(lastNumeric);
  if (!Number.isFinite(a) || !Number.isFinite(b) || a === 0) return null;
  const pct = ((b - a) / Math.abs(a)) * 100;
  if (!Number.isFinite(pct)) return null;
  const rounded = Math.round(pct * 10) / 10;
  return String(rounded);
}

/**
 * Build a short English summary for a metric series.
 */
export function summarizeSeries(metricDto, series = []) {
  const title = metricDto?.label || metricDto?.name || "Metric";
  if (!series || series.length === 0) {
    return `${title}: no time-series observations yet.`;
  }
  if (series.length === 1) {
    return `${title} is ${pointDisplay(series[0])} as of ${pointLabel(series[0])}.`;
  }

  const first = series[0];
  const last = series[series.length - 1];
  const a = Number(first.valueNumeric);
  const b = Number(last.valueNumeric);
  let verb = "changed";
  if (Number.isFinite(a) && Number.isFinite(b)) {
    if (b > a) verb = "increased";
    else if (b < a) verb = "decreased";
    else verb = "held steady";
  }

  let summary = `${title} ${verb} from ${pointDisplay(first)} in ${pointLabel(first)} to ${pointDisplay(last)} in ${pointLabel(last)}`;

  const growth = seriesGrowthPercent(a, b);
  if (growth != null && verb !== "held steady") {
    summary += `, representing approximately ${growth}% growth`;
  }

  return `${summary}.`;
}

export function summarizeKpi(metricDto, comparison) {
  const title = metricDto?.label || metricDto?.name || "Metric";
  const display =
    comparison?.current?.display ||
    metricDto?.formatted?.display ||
    metricDto?.value ||
    "—";
  if (
    comparison?.hasComparison &&
    comparison.changePercent != null &&
    comparison.changeDirection
  ) {
    const dir =
      comparison.changeDirection === "up"
        ? "up"
        : comparison.changeDirection === "down"
          ? "down"
          : "unchanged";
    return `${title} is ${display}, ${dir} ${Math.abs(comparison.changePercent)}% versus previous.`;
  }
  return `${title} is ${display}.`;
}

export function summarizeComparison(metricDto, comparison) {
  const title = metricDto?.label || metricDto?.name || "Metric";
  const before =
    comparison?.previous?.display ||
    metricDto?.startValue ||
    "—";
  const after =
    comparison?.current?.display ||
    metricDto?.endValue ||
    metricDto?.formatted?.display ||
    "—";
  return `${title}: before ${before}, after ${after}.`;
}

export function summarizeProgress(metricDto, current, target) {
  const title = metricDto?.label || metricDto?.name || "Metric";
  if (target == null || !Number.isFinite(Number(target)) || Number(target) === 0) {
    return `${title}: progress toward target is unavailable.`;
  }
  const pct = Math.round((Number(current) / Number(target)) * 100);
  return `${title} is at ${pct}% of target.`;
}
