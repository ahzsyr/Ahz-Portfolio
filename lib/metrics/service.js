/**
 * Metric Service — builds domain objects from Prisma rows + data points.
 */

import { buildComparison } from "./compare.js";
import { formatMetricValue } from "./format.js";
import { buildSeries } from "./series.js";
import {
  normalizePeriod,
  normalizePercentScale,
  normalizeTrendPreference,
  normalizeType,
} from "./types.js";

/**
 * Build a Metric Domain Object from a Prisma metric row and optional points.
 */
export function buildMetricDomain(metric, dataPoints = []) {
  if (!metric) return null;

  const points = dataPoints?.length
    ? dataPoints
    : metric.dataPoints || [];

  const series = buildSeries(metric, points);
  const comparison = buildComparison(metric, points);
  const formatted = formatMetricValue(metric, {
    preferDisplayString: true,
  });

  // When series drives current, expose series-based formatted current as well
  const formattedCurrent =
    comparison.current?.display != null
      ? {
          display: comparison.current.display,
          valueNumeric: comparison.current.numeric,
          type: normalizeType(metric.type),
          prefix: metric.prefix || null,
          suffix: metric.suffix || null,
          unit: metric.unit || null,
        }
      : formatted;

  return {
    id: metric.id,
    name: metric.name,
    label: metric.label || null,
    value: metric.value,
    valueNumeric: metric.valueNumeric ?? null,
    unit: metric.unit || null,
    type: normalizeType(metric.type),
    prefix: metric.prefix || null,
    suffix: metric.suffix || null,
    startValue: metric.startValue || null,
    endValue: metric.endValue || null,
    date: metric.date || null,
    category: metric.category || null,
    visibility: metric.visibility || "public",
    featured: Boolean(metric.featured),
    sortOrder: metric.sortOrder ?? 0,
    period: normalizePeriod(metric.period),
    trendPreference: normalizeTrendPreference(metric.trendPreference),
    previousNumeric: metric.previousNumeric ?? null,
    targetNumeric: metric.targetNumeric ?? null,
    baselineNumeric: metric.baselineNumeric ?? null,
    decimals: metric.decimals ?? null,
    compact: Boolean(metric.compact),
    percentScale: normalizePercentScale(metric.percentScale),
    ratingMax: metric.ratingMax ?? null,
    metricGroupId: metric.metricGroupId ?? null,
    projectId: metric.projectId ?? null,
    experienceId: metric.experienceId ?? null,
    achievementId: metric.achievementId ?? null,
    series,
    comparison,
    formatted: formattedCurrent,
  };
}

/**
 * Map domain object to a Content DTO (presentation-safe).
 */
export function toContentDto(domain) {
  if (!domain) return null;
  return { ...domain };
}
