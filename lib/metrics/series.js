/**
 * Time-series helpers — chronological ordering for chart-ready DTOs.
 */

import { formatMetricValue } from "./format.js";

export function sortDataPoints(points = []) {
  return [...(points || [])].sort((a, b) => {
    const da = new Date(a.date).getTime();
    const db = new Date(b.date).getTime();
    if (da !== db) return da - db;
    return (a.sortOrder || 0) - (b.sortOrder || 0);
  });
}

/**
 * Build chart-ready series from data points.
 */
export function buildSeries(metric, dataPoints = []) {
  const sorted = sortDataPoints(dataPoints);
  const period = metric?.period || null;

  return sorted.map((point) => {
    const formatted = formatMetricValue(metric, {
      valueNumeric: point.valueNumeric,
      value: point.value,
      forceNumericFormat: point.valueNumeric != null,
      preferDisplayString: point.valueNumeric == null,
    });

    return {
      id: point.id ?? null,
      date: point.date,
      label: point.label || null,
      valueNumeric:
        point.valueNumeric != null ? Number(point.valueNumeric) : null,
      value: point.value || null,
      display: formatted.display,
      period,
      metadata: point.metadata ?? null,
      sortOrder: point.sortOrder ?? 0,
    };
  });
}
