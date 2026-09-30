/** Canonical metric types, periods, and trend preferences. */

export const METRIC_TYPES = [
  "number",
  "percent",
  "currency",
  "duration",
  "count",
  "ratio",
  "rating",
  "boolean",
  "text",
  "date",
];

/** Phase 1 aliases that remain valid. */
export const TYPE_ALIASES = {
  count: "count",
  currency: "currency",
  percent: "percent",
  ratio: "ratio",
  duration: "duration",
  text: "text",
};

export const PERIODS = ["day", "week", "month", "quarter", "year", "custom"];

export const TREND_PREFERENCES = [
  "neutral",
  "higher_is_better",
  "lower_is_better",
];

export const PERCENT_SCALES = ["auto", "ratio", "percent"];

export function normalizeType(type) {
  const t = String(type || "number").toLowerCase();
  if (METRIC_TYPES.includes(t)) return t;
  if (TYPE_ALIASES[t]) return TYPE_ALIASES[t];
  return "number";
}

export function normalizePeriod(period) {
  if (period == null || period === "") return null;
  const p = String(period).toLowerCase();
  return PERIODS.includes(p) ? p : null;
}

export function normalizeTrendPreference(value) {
  const v = String(value || "neutral").toLowerCase();
  return TREND_PREFERENCES.includes(v) ? v : "neutral";
}

export function normalizePercentScale(value) {
  const v = String(value || "auto").toLowerCase();
  return PERCENT_SCALES.includes(v) ? v : "auto";
}

export function isChartableType(type) {
  const t = normalizeType(type);
  return !["boolean", "text", "date"].includes(t);
}
