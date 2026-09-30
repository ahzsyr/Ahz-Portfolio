export {
  METRIC_TYPES,
  PERIODS,
  TREND_PREFERENCES,
  PERCENT_SCALES,
  normalizeType,
  normalizePeriod,
  normalizeTrendPreference,
  normalizePercentScale,
  isChartableType,
} from "./types.js";

export {
  formatMetricValue,
  formatCompactNumber,
  formatFullNumber,
  resolvePercentDisplay,
} from "./format.js";

export {
  validateMetricInput,
  validateNumericForType,
  validateDataPointInput,
  normalizePointDate,
  isValidDate,
} from "./validate.js";

export { buildComparison } from "./compare.js";
export { buildSeries, sortDataPoints } from "./series.js";
export { buildMetricDomain, toContentDto } from "./service.js";
