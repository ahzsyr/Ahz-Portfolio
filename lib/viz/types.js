/**
 * Visualization type ids and config conventions.
 *
 * Invariant: Metric DTO → Pure Adapter → VizConfig → Registry → Visualization
 * Charts never touch Prisma, APIs, or formatting business logic.
 */

export const VIZ_TYPES = [
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
];

export const SERIES_VIZ_TYPES = ["line", "area", "bar"];

/**
 * @typedef {object} VizConfig
 * @property {string} [title]
 * @property {string} [subtitle]
 * @property {string} [seriesKey]
 * @property {string} [xKey]
 * @property {string} [nameKey]
 * @property {Function} [valueFormatter]
 * @property {'positive'|'negative'|'neutral'} [tone]
 * @property {boolean} [showLegend]
 * @property {number} [height]
 * @property {string} [ariaLabel]
 * @property {string} [textSummary]
 * @property {boolean} [tableFallback]
 * @property {boolean} [empty]
 * @property {string} [error]
 * @property {Array<{key:string,label:string}>} [columns]
 */

export function isVizType(type) {
  return VIZ_TYPES.includes(type);
}
