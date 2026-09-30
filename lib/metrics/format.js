/**
 * Metric formatting engine.
 *
 * Percentage semantics (percentScale):
 * - ratio:   stored 0.487 → display 48.7%
 * - percent: stored 48.7  → display 48.7%
 * - auto:    abs(n) ≤ 1 → ratio; else percent points
 */

import { normalizePercentScale, normalizeType } from "./types.js";

const EPSILON = 1e-9;

function roundTo(n, decimals) {
  if (decimals == null || decimals < 0) {
    if (Number.isInteger(n)) return String(n);
    const s = n.toFixed(2);
    return s.replace(/\.?0+$/, "");
  }
  return n.toFixed(decimals).replace(/\.?0+$/, "");
}

/**
 * Compact number: 250000 → 250K, 1_500_000 → 1.5M
 */
export function formatCompactNumber(n, decimals = null) {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000_000) {
    return `${sign}${roundTo(abs / 1_000_000_000, decimals ?? 1)}B`;
  }
  if (abs >= 1_000_000) {
    return `${sign}${roundTo(abs / 1_000_000, decimals ?? 1)}M`;
  }
  if (abs >= 1_000) {
    return `${sign}${roundTo(abs / 1_000, decimals ?? 1)}K`;
  }
  return `${sign}${roundTo(abs, decimals)}`;
}

export function formatFullNumber(n, decimals = null) {
  const fixed = decimals != null ? Number(n).toFixed(decimals) : String(n);
  const [intPart, frac] = fixed.split(".");
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  if (frac != null && Number(frac) !== 0) {
    return `${withCommas}.${frac.replace(/0+$/, "")}`;
  }
  if (decimals != null && decimals > 0 && frac) {
    return `${withCommas}.${frac}`;
  }
  return withCommas;
}

/**
 * Resolve how a percent valueNumeric should be scaled for display.
 * @returns {{ displayNumber: number, mode: 'ratio'|'percent' }}
 */
export function resolvePercentDisplay(valueNumeric, percentScale = "auto") {
  const scale = normalizePercentScale(percentScale);
  const n = Number(valueNumeric);
  if (scale === "ratio") {
    return { displayNumber: n * 100, mode: "ratio" };
  }
  if (scale === "percent") {
    return { displayNumber: n, mode: "percent" };
  }
  // auto
  if (Math.abs(n) <= 1 + EPSILON) {
    return { displayNumber: n * 100, mode: "ratio" };
  }
  return { displayNumber: n, mode: "percent" };
}

/**
 * Format a numeric value for a metric.
 * Prefer explicit display `value` string when preferDisplayString is true (default).
 */
export function formatMetricValue(metric, options = {}) {
  const {
    valueNumeric: overrideNumeric,
    value: overrideValue,
    preferDisplayString = true,
  } = options;

  const type = normalizeType(metric?.type);
  const prefix = metric?.prefix || "";
  const suffix = metric?.suffix || "";
  const unit = metric?.unit || null;
  const decimals = metric?.decimals ?? null;
  const compact = Boolean(metric?.compact);
  const percentScale = metric?.percentScale || "auto";

  const displayOverride =
    overrideValue !== undefined ? overrideValue : metric?.value;
  const numeric =
    overrideNumeric !== undefined
      ? overrideNumeric
      : metric?.valueNumeric ?? null;

  if (
    preferDisplayString &&
    displayOverride != null &&
    String(displayOverride).trim() !== "" &&
    overrideNumeric === undefined
  ) {
    // Snapshot display path: use stored display string as-is when not formatting a series point numeric
    if (options.forceNumericFormat !== true) {
      return {
        display: String(displayOverride),
        valueNumeric: numeric,
        type,
        prefix: prefix || null,
        suffix: suffix || null,
        unit,
      };
    }
  }

  if (numeric == null || !Number.isFinite(Number(numeric))) {
    const fallback =
      displayOverride != null && String(displayOverride).trim() !== ""
        ? String(displayOverride)
        : "—";
    return {
      display: fallback,
      valueNumeric: null,
      type,
      prefix: prefix || null,
      suffix: suffix || null,
      unit,
    };
  }

  const n = Number(numeric);
  let core = "";

  switch (type) {
    case "percent": {
      const { displayNumber } = resolvePercentDisplay(n, percentScale);
      core = `${roundTo(displayNumber, decimals ?? 1)}%`;
      break;
    }
    case "currency": {
      const num = compact
        ? formatCompactNumber(n, decimals)
        : formatFullNumber(n, decimals);
      core = `${prefix}${num}${suffix}`;
      return {
        display: core,
        valueNumeric: n,
        type,
        prefix: prefix || null,
        suffix: suffix || null,
        unit,
      };
    }
    case "ratio": {
      const num = roundTo(n, decimals ?? 2);
      const s = suffix || "x";
      core = `${prefix}${num}${s}`;
      return {
        display: core,
        valueNumeric: n,
        type,
        prefix: prefix || null,
        suffix: s,
        unit,
      };
    }
    case "rating": {
      const max = metric?.ratingMax ?? 5;
      const num = roundTo(n, decimals ?? 1);
      core = suffix
        ? `${prefix}${num}${suffix}`
        : `${prefix}${num}/${max}`;
      break;
    }
    case "duration":
    case "count":
    case "number":
    default: {
      const num = compact
        ? formatCompactNumber(n, decimals)
        : formatFullNumber(n, decimals);
      core = `${prefix}${num}${suffix}`;
      if (!suffix && !prefix && unit && type === "duration") {
        core = `${num} ${unit}`;
      }
      break;
    }
  }

  // percent / rating already built core; ensure prefix applied for percent if set
  if (type === "percent" && prefix) {
    core = `${prefix}${core}`;
  }

  return {
    display: core,
    valueNumeric: n,
    type,
    prefix: prefix || null,
    suffix: suffix || null,
    unit,
  };
}
