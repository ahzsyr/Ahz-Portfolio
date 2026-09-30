/**
 * Shared metric validation for API and admin.
 */

import {
  METRIC_TYPES,
  normalizePercentScale,
  normalizePeriod,
  normalizeTrendPreference,
  normalizeType,
  PERIODS,
  PERCENT_SCALES,
  TREND_PREFERENCES,
} from "./types.js";

const EPSILON = 1e-6;

export function isValidDate(value) {
  if (value == null || value === "") return false;
  const d = value instanceof Date ? value : new Date(value);
  return !Number.isNaN(d.getTime());
}

export function normalizePointDate(value) {
  if (!isValidDate(value)) return null;
  const d = value instanceof Date ? new Date(value) : new Date(value);
  // Normalize to UTC midnight for unique(metricId, date) stability
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/**
 * Validate a metric payload (create/update).
 * @returns {{ ok: true, data: object } | { ok: false, error: string }}
 */
export function validateMetricInput(input = {}) {
  const name = input.name != null ? String(input.name).trim() : "";
  if (!name) return { ok: false, error: "name required" };

  const value =
    input.value != null && String(input.value).trim() !== ""
      ? String(input.value)
      : input.valueNumeric != null
        ? String(input.valueNumeric)
        : "";
  if (value === "") return { ok: false, error: "value required" };

  const type = normalizeType(input.type);
  if (!METRIC_TYPES.includes(type)) {
    return { ok: false, error: `invalid type: ${input.type}` };
  }

  const period = normalizePeriod(input.period);
  if (input.period != null && input.period !== "" && !period) {
    return {
      ok: false,
      error: `invalid period: ${input.period}. Use ${PERIODS.join(", ")}`,
    };
  }

  const trendPreference = normalizeTrendPreference(input.trendPreference);
  const percentScale = normalizePercentScale(input.percentScale);
  if (input.percentScale && !PERCENT_SCALES.includes(percentScale)) {
    return { ok: false, error: `invalid percentScale: ${input.percentScale}` };
  }
  if (input.trendPreference && !TREND_PREFERENCES.includes(trendPreference)) {
    return {
      ok: false,
      error: `invalid trendPreference: ${input.trendPreference}`,
    };
  }

  const valueNumeric =
    input.valueNumeric === null ||
    input.valueNumeric === undefined ||
    input.valueNumeric === ""
      ? null
      : Number(input.valueNumeric);

  if (valueNumeric != null && !Number.isFinite(valueNumeric)) {
    return { ok: false, error: "valueNumeric must be a finite number" };
  }

  const numericCheck = validateNumericForType(valueNumeric, {
    type,
    percentScale,
    ratingMax: input.ratingMax,
  });
  if (!numericCheck.ok) return numericCheck;

  for (const key of ["previousNumeric", "targetNumeric", "baselineNumeric"]) {
    const v = input[key];
    if (v === null || v === undefined || v === "") continue;
    if (!Number.isFinite(Number(v))) {
      return { ok: false, error: `${key} must be a finite number` };
    }
  }

  if (input.date != null && input.date !== "" && !isValidDate(input.date)) {
    return { ok: false, error: "invalid date" };
  }

  return {
    ok: true,
    data: {
      type,
      period,
      trendPreference,
      percentScale,
      valueNumeric,
    },
  };
}

/**
 * Validate numeric value against type rules.
 */
export function validateNumericForType(
  valueNumeric,
  { type, percentScale = "auto", ratingMax = null } = {}
) {
  if (valueNumeric == null) return { ok: true };
  if (!Number.isFinite(Number(valueNumeric))) {
    return { ok: false, error: "valueNumeric must be a finite number" };
  }
  const n = Number(valueNumeric);
  const t = normalizeType(type);
  const scale = normalizePercentScale(percentScale);

  if (t === "percent") {
    if (scale === "ratio") {
      if (n < -EPSILON || n > 1 + EPSILON) {
        return {
          ok: false,
          error: "percent with percentScale=ratio expects valueNumeric in 0..1",
        };
      }
    } else if (scale === "percent") {
      if (n < -EPSILON || n > 100 + EPSILON) {
        return {
          ok: false,
          error:
            "percent with percentScale=percent expects valueNumeric in 0..100",
        };
      }
    }
  }

  if (t === "rating") {
    const max = ratingMax != null && Number.isFinite(Number(ratingMax))
      ? Number(ratingMax)
      : 5;
    if (n < -EPSILON || n > max + EPSILON) {
      return { ok: false, error: `rating expects valueNumeric in 0..${max}` };
    }
  }

  if (t === "boolean" && n !== 0 && n !== 1) {
    return { ok: false, error: "boolean expects valueNumeric 0 or 1" };
  }

  return { ok: true };
}

/**
 * Validate a data point payload.
 * @param {object} input
 * @param {object} metric - parent metric for type rules
 * @param {{ existingDates?: Date[], excludePointId?: number }} [ctx]
 */
export function validateDataPointInput(input = {}, metric = {}, ctx = {}) {
  if (!isValidDate(input.date)) {
    return { ok: false, error: "date required and must be valid" };
  }

  const date = normalizePointDate(input.date);
  const valueNumeric =
    input.valueNumeric === null ||
    input.valueNumeric === undefined ||
    input.valueNumeric === ""
      ? null
      : Number(input.valueNumeric);

  if (valueNumeric != null && !Number.isFinite(valueNumeric)) {
    return { ok: false, error: "valueNumeric must be a finite number" };
  }

  const numericCheck = validateNumericForType(valueNumeric, {
    type: metric.type,
    percentScale: metric.percentScale,
    ratingMax: metric.ratingMax,
  });
  if (!numericCheck.ok) return numericCheck;

  if (Array.isArray(ctx.existingDates)) {
    const key = date.toISOString();
    const dup = ctx.existingDates.some((d) => {
      const nd = normalizePointDate(d);
      if (!nd) return false;
      return nd.toISOString() === key;
    });
    if (dup) {
      return {
        ok: false,
        error: "duplicate date: one observation per metric per date",
        code: "DUPLICATE_DATE",
      };
    }
  }

  let metadata = null;
  if (input.metadata != null && input.metadata !== "") {
    if (typeof input.metadata === "string") {
      try {
        metadata = JSON.parse(input.metadata);
      } catch {
        return { ok: false, error: "metadata must be valid JSON" };
      }
    } else if (typeof input.metadata === "object") {
      metadata = input.metadata;
    } else {
      return { ok: false, error: "metadata must be an object or JSON string" };
    }
  }

  return {
    ok: true,
    data: {
      date,
      valueNumeric,
      value:
        input.value != null && String(input.value).trim() !== ""
          ? String(input.value)
          : null,
      label:
        input.label != null && String(input.label).trim() !== ""
          ? String(input.label)
          : null,
      metadata,
      sortOrder: Number(input.sortOrder) || 0,
    },
  };
}
