/**
 * Metrics import — parse CSV/JSON → preview rows (no Prisma).
 */

import { parseCsv } from "./csv.js";
import { parseImportDate } from "./parseDate.js";
import { validateDataPointInput } from "../metrics/validate.js";

function pick(rec, keys) {
  for (const k of keys) {
    if (rec[k] != null && String(rec[k]).trim() !== "") {
      return String(rec[k]).trim();
    }
  }
  return "";
}

function normalizeKeyMap(rec) {
  const out = {};
  for (const [k, v] of Object.entries(rec || {})) {
    out[String(k).trim().toLowerCase()] = v;
  }
  return out;
}

/**
 * Flatten JSON metrics payloads into point rows.
 * @param {unknown} parsed
 * @returns {object[]}
 */
export function flattenMetricsJson(parsed) {
  if (Array.isArray(parsed)) {
    // Could be points or full metrics with dataPoints
    if (
      parsed.length &&
      parsed[0] &&
      typeof parsed[0] === "object" &&
      Array.isArray(parsed[0].dataPoints)
    ) {
      const rows = [];
      for (const m of parsed) {
        const name = m.name || m.metric || m.label;
        for (const p of m.dataPoints || []) {
          rows.push({
            date: p.date,
            metric: name,
            value: p.valueNumeric ?? p.value,
            valueNumeric: p.valueNumeric,
            label: p.label,
            displayValue: p.value,
          });
        }
      }
      return rows;
    }
    return parsed;
  }
  if (parsed && typeof parsed === "object") {
    if (Array.isArray(parsed.points)) return parsed.points;
    if (Array.isArray(parsed.metrics)) return flattenMetricsJson(parsed.metrics);
  }
  return [];
}

/**
 * @param {string} content
 * @param {"csv"|"json"} format
 * @returns {{ ok: true, raw: object[] } | { ok: false, error: string }}
 */
export function parseMetricsContent(content, format) {
  const text = String(content ?? "");
  if (!text.trim()) {
    return { ok: false, error: "empty content" };
  }

  if (format === "json") {
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return { ok: false, error: "invalid JSON" };
    }
    const raw = flattenMetricsJson(parsed);
    if (!raw.length) {
      return { ok: false, error: "no metric points found in JSON" };
    }
    return { ok: true, raw };
  }

  // csv
  const { records } = parseCsv(text);
  if (!records.length) {
    return { ok: false, error: "no data rows in CSV" };
  }
  return { ok: true, raw: records };
}

/**
 * @param {object} raw
 * @returns {{ metricName: string, date: Date|null, valueNumeric: number|null, value: string|null, label: string|null, source: object }}
 */
export function normalizeMetricsRawRow(raw) {
  const rec = normalizeKeyMap(raw);
  const metricName = pick(rec, ["metric", "metricname", "name"]);
  const dateRaw = pick(rec, ["date"]);
  const valueRaw = pick(rec, ["value", "valuenumeric"]);
  const label = pick(rec, ["label"]) || null;
  const displayValue = pick(rec, ["displayvalue", "display"]) || null;

  let valueNumeric = null;
  if (valueRaw !== "") {
    const n = Number(valueRaw);
    valueNumeric = Number.isFinite(n) ? n : null;
  }

  // Prefer explicit valueNumeric if both present in original
  if (rec.valuenumeric != null && String(rec.valuenumeric).trim() !== "") {
    const n = Number(rec.valuenumeric);
    if (Number.isFinite(n)) valueNumeric = n;
  }

  const value =
    displayValue ||
    (valueRaw !== "" && !Number.isFinite(Number(valueRaw)) ? valueRaw : null) ||
    (valueNumeric != null ? String(valueNumeric) : null);

  return {
    metricName,
    date: parseImportDate(dateRaw),
    dateRaw,
    valueNumeric,
    value,
    label,
    source: raw,
  };
}

/**
 * Build preview against existing metrics map.
 * @param {object[]} rawRows
 * @param {{ metricsByName?: Map<string, object>, existingDatesByMetricId?: Map<number, string[]> }} ctx
 */
export function previewMetricsImport(rawRows, ctx = {}) {
  const metricsByName = ctx.metricsByName || new Map();
  const existingDatesByMetricId = ctx.existingDatesByMetricId || new Map();

  const rows = [];
  let creates = 0;
  let updates = 0;
  let errors = 0;
  let metricCreates = 0;
  const plannedNewNames = new Set();

  rawRows.forEach((raw, index) => {
    const norm = normalizeMetricsRawRow(raw);
    const line = index + 1;

    if (!norm.metricName) {
      errors += 1;
      rows.push({
        row: line,
        status: "error",
        action: "skip",
        error: "metric name required",
        data: norm,
      });
      return;
    }

    if (!norm.date) {
      errors += 1;
      rows.push({
        row: line,
        status: "error",
        action: "skip",
        error: `invalid date: ${norm.dateRaw || "(empty)"}`,
        data: norm,
      });
      return;
    }

    const key = norm.metricName.toLowerCase();
    let metric = metricsByName.get(key) || null;
    let willCreateMetric = false;
    if (!metric) {
      willCreateMetric = true;
      if (!plannedNewNames.has(key)) {
        plannedNewNames.add(key);
        metricCreates += 1;
      }
      metric = {
        id: null,
        name: norm.metricName,
        type: "count",
        percentScale: "auto",
        ratingMax: null,
      };
    }

    const validated = validateDataPointInput(
      {
        date: norm.date,
        valueNumeric: norm.valueNumeric,
        value: norm.value,
        label: norm.label,
      },
      metric
    );

    if (!validated.ok) {
      errors += 1;
      rows.push({
        row: line,
        status: "error",
        action: "skip",
        error: validated.error,
        data: { ...norm, metricId: metric.id },
      });
      return;
    }

    const dateKey = validated.data.date.toISOString();
    let action = "create";
    if (metric.id != null) {
      const existing = existingDatesByMetricId.get(metric.id) || [];
      if (existing.includes(dateKey)) action = "update";
    }

    if (action === "create") creates += 1;
    else updates += 1;

    rows.push({
      row: line,
      status: "valid",
      action,
      willCreateMetric,
      metricName: norm.metricName,
      metricId: metric.id,
      error: null,
      data: {
        ...validated.data,
        metricName: norm.metricName,
        valueNumeric: validated.data.valueNumeric,
      },
    });
  });

  const valid = rows.filter((r) => r.status === "valid").length;

  return {
    ok: errors === 0 || valid > 0,
    summary: {
      total: rows.length,
      valid,
      errors,
      creates,
      updates,
      metricCreates,
    },
    rows,
  };
}

/**
 * Parse + preview from content string.
 */
export function buildMetricsImportPreview(content, format, ctx = {}) {
  const parsed = parseMetricsContent(content, format);
  if (!parsed.ok) {
    return {
      ok: false,
      error: parsed.error,
      summary: { total: 0, valid: 0, errors: 1, creates: 0, updates: 0, metricCreates: 0 },
      rows: [],
    };
  }
  return previewMetricsImport(parsed.raw, ctx);
}
