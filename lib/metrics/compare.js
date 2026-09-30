/**
 * Comparison engine: current / previous / target / baseline + provenance.
 * changeDirection is descriptive only — not "good" or "bad".
 */

import { formatMetricValue } from "./format.js";
import { normalizeTrendPreference } from "./types.js";
import { sortDataPoints } from "./series.js";

const FLAT_EPSILON = 1e-9;

function pctChange(current, previous) {
  if (current == null || previous == null) return null;
  if (!Number.isFinite(current) || !Number.isFinite(previous)) return null;
  if (Math.abs(previous) < FLAT_EPSILON) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

function direction(current, previous) {
  if (current == null || previous == null) return null;
  const delta = current - previous;
  if (Math.abs(delta) < FLAT_EPSILON) return "flat";
  return delta > 0 ? "up" : "down";
}

function formattedPair(metric, numeric) {
  if (numeric == null || !Number.isFinite(Number(numeric))) return null;
  const formatted = formatMetricValue(metric, {
    valueNumeric: Number(numeric),
    forceNumericFormat: true,
    preferDisplayString: false,
  });
  return { numeric: Number(numeric), display: formatted.display };
}

/**
 * @param {object} metric
 * @param {Array} dataPoints
 */
export function buildComparison(metric, dataPoints = []) {
  const sorted = sortDataPoints(dataPoints);
  const trendPreference = normalizeTrendPreference(metric?.trendPreference);

  let currentNumeric = null;
  let currentSource = "none";
  let previousNumeric = null;
  let previousSource = "none";

  if (sorted.length >= 1) {
    const latest = sorted[sorted.length - 1];
    if (latest.valueNumeric != null && Number.isFinite(Number(latest.valueNumeric))) {
      currentNumeric = Number(latest.valueNumeric);
      currentSource = "series";
    }
  }

  if (currentSource === "none" && metric?.valueNumeric != null) {
    currentNumeric = Number(metric.valueNumeric);
    currentSource = Number.isFinite(currentNumeric) ? "snapshot" : "none";
    if (currentSource === "none") currentNumeric = null;
  }

  if (sorted.length >= 2) {
    const prior = sorted[sorted.length - 2];
    if (prior.valueNumeric != null && Number.isFinite(Number(prior.valueNumeric))) {
      previousNumeric = Number(prior.valueNumeric);
      previousSource = "series";
    }
  }

  if (
    previousSource === "none" &&
    metric?.previousNumeric != null &&
    Number.isFinite(Number(metric.previousNumeric))
  ) {
    previousNumeric = Number(metric.previousNumeric);
    previousSource = "fallback";
  }

  const targetNumeric =
    metric?.targetNumeric != null && Number.isFinite(Number(metric.targetNumeric))
      ? Number(metric.targetNumeric)
      : null;
  const baselineNumeric =
    metric?.baselineNumeric != null &&
    Number.isFinite(Number(metric.baselineNumeric))
      ? Number(metric.baselineNumeric)
      : null;

  const changePercent = pctChange(currentNumeric, previousNumeric);
  const changeDirection = direction(currentNumeric, previousNumeric);
  const hasComparison =
    changePercent != null && previousSource !== "none" && currentSource !== "none";

  // If only snapshot current with no previous, still expose current
  const hasAnyValue = currentSource !== "none";

  return {
    current: hasAnyValue
      ? formattedPair(metric, currentNumeric) || {
          numeric: currentNumeric,
          display: metric?.value || "—",
        }
      : null,
    previous: previousSource !== "none"
      ? formattedPair(metric, previousNumeric)
      : null,
    target: targetNumeric != null ? formattedPair(metric, targetNumeric) : null,
    baseline:
      baselineNumeric != null ? formattedPair(metric, baselineNumeric) : null,
    changePercent:
      changePercent != null ? Math.round(changePercent * 100) / 100 : null,
    changeDirection,
    vsTargetPercent:
      pctChange(currentNumeric, targetNumeric) != null
        ? Math.round(pctChange(currentNumeric, targetNumeric) * 100) / 100
        : null,
    vsBaselinePercent:
      pctChange(currentNumeric, baselineNumeric) != null
        ? Math.round(pctChange(currentNumeric, baselineNumeric) * 100) / 100
        : null,
    hasComparison,
    comparisonSource: {
      current: currentSource,
      previous: previousSource,
    },
    trendPreference,
  };
}
