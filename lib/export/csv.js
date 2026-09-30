/**
 * Serialize metrics points / achievements to CSV.
 */

import { toCsv } from "../import/csv.js";

/**
 * @param {Array<{ date: Date|string, metric?: string, metricName?: string, valueNumeric?: number|null, value?: string|null, label?: string|null }>} points
 */
export function metricsPointsToCsv(points = []) {
  const records = points.map((p) => ({
    date:
      p.date instanceof Date
        ? p.date.toISOString().slice(0, 10)
        : String(p.date || "").slice(0, 10),
    metric: p.metric || p.metricName || "",
    value: p.valueNumeric != null ? p.valueNumeric : p.value ?? "",
    label: p.label || "",
  }));
  return toCsv(["date", "metric", "value", "label"], records);
}

/**
 * @param {object[]} achievements
 */
export function achievementsToCsv(achievements = []) {
  const records = achievements.map((a) => ({
    title: a.title || "",
    description: a.description || "",
    type: a.type || "general",
    date: a.date
      ? (a.date instanceof Date
          ? a.date.toISOString().slice(0, 10)
          : String(a.date).slice(0, 10))
      : "",
    category: a.category || "",
    featured: a.featured ? "true" : "false",
    status: a.status || "published",
    sortOrder: a.sortOrder ?? 0,
    projectId: a.projectId ?? "",
    experienceId: a.experienceId ?? "",
  }));
  return toCsv(
    [
      "title",
      "description",
      "type",
      "date",
      "category",
      "featured",
      "status",
      "sortOrder",
      "projectId",
      "experienceId",
    ],
    records
  );
}

/**
 * Flatten metrics with dataPoints for CSV export.
 * @param {Array<{ name: string, dataPoints?: object[] }>} metrics
 */
export function flattenMetricsForCsv(metrics = []) {
  const points = [];
  for (const m of metrics) {
    for (const p of m.dataPoints || []) {
      points.push({
        date: p.date,
        metric: m.name,
        valueNumeric: p.valueNumeric,
        value: p.value,
        label: p.label,
      });
    }
  }
  return points;
}
