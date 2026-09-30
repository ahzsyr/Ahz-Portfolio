/**
 * Achievements import — parse CSV/JSON → preview rows (no Prisma).
 */

import { parseCsv } from "./csv.js";
import { parseImportDate } from "./parseDate.js";
import { slugify, optionalId } from "../adminHelpers.js";

const ACHIEVEMENT_TYPES = [
  "design",
  "sales",
  "technical",
  "operations",
  "launch",
  "general",
];

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

function parseBool(value, fallback = false) {
  if (value == null || value === "") return fallback;
  const s = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "y"].includes(s)) return true;
  if (["0", "false", "no", "n"].includes(s)) return false;
  return fallback;
}

/**
 * @param {unknown} parsed
 */
export function flattenAchievementsJson(parsed) {
  if (Array.isArray(parsed)) return parsed;
  if (parsed && typeof parsed === "object" && Array.isArray(parsed.achievements)) {
    return parsed.achievements;
  }
  return [];
}

/**
 * @param {string} content
 * @param {"csv"|"json"} format
 */
export function parseAchievementsContent(content, format) {
  const text = String(content ?? "");
  if (!text.trim()) return { ok: false, error: "empty content" };

  if (format === "json") {
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return { ok: false, error: "invalid JSON" };
    }
    const raw = flattenAchievementsJson(parsed);
    if (!raw.length) {
      return { ok: false, error: "no achievements found in JSON" };
    }
    return { ok: true, raw };
  }

  const { records } = parseCsv(text);
  if (!records.length) return { ok: false, error: "no data rows in CSV" };
  return { ok: true, raw: records };
}

/**
 * @param {object} raw
 */
export function normalizeAchievementRawRow(raw) {
  const rec = normalizeKeyMap(raw);
  const title = pick(rec, ["title", "name"]);
  const description = pick(rec, ["description", "body", "desc"]);
  const typeRaw = pick(rec, ["type"]) || "general";
  const type = ACHIEVEMENT_TYPES.includes(typeRaw.toLowerCase())
    ? typeRaw.toLowerCase()
    : typeRaw || "general";
  const date = parseImportDate(pick(rec, ["date"]));
  const category = pick(rec, ["category"]) || null;
  const featured = parseBool(pick(rec, ["featured"]), false);
  const statusRaw = pick(rec, ["status"]) || "published";
  const status = statusRaw === "draft" ? "draft" : "published";
  const sortOrder = Number(pick(rec, ["sortorder", "order"])) || 0;
  const projectId = optionalId(pick(rec, ["projectid"]));
  const experienceId = optionalId(pick(rec, ["experienceid"]));
  const slug = slugify(title || "achievement");

  return {
    title,
    description,
    type,
    date,
    category,
    featured,
    status,
    sortOrder,
    projectId,
    experienceId,
    slug,
    source: raw,
  };
}

/**
 * @param {object[]} rawRows
 * @param {{ bySlug?: Map<string, object>, byTitle?: Map<string, object> }} ctx
 */
export function previewAchievementsImport(rawRows, ctx = {}) {
  const bySlug = ctx.bySlug || new Map();
  const byTitle = ctx.byTitle || new Map();

  const rows = [];
  let creates = 0;
  let updates = 0;
  let errors = 0;

  rawRows.forEach((raw, index) => {
    const norm = normalizeAchievementRawRow(raw);
    const line = index + 1;

    if (!norm.title) {
      errors += 1;
      rows.push({
        row: line,
        status: "error",
        action: "skip",
        error: "title required",
        data: norm,
      });
      return;
    }

    if (!norm.description) {
      errors += 1;
      rows.push({
        row: line,
        status: "error",
        action: "skip",
        error: "description required",
        data: norm,
      });
      return;
    }

    const existing =
      bySlug.get(norm.slug) ||
      byTitle.get(norm.title.toLowerCase()) ||
      null;

    const action = existing ? "update" : "create";
    if (action === "create") creates += 1;
    else updates += 1;

    rows.push({
      row: line,
      status: "valid",
      action,
      existingId: existing?.id ?? null,
      error: null,
      data: {
        title: norm.title,
        slug: norm.slug,
        description: norm.description,
        type: ACHIEVEMENT_TYPES.includes(norm.type) ? norm.type : "general",
        date: norm.date,
        category: norm.category,
        featured: norm.featured,
        status: norm.status,
        sortOrder: norm.sortOrder,
        projectId: norm.projectId,
        experienceId: norm.experienceId,
      },
    });
  });

  const valid = rows.filter((r) => r.status === "valid").length;

  return {
    ok: errors === 0 || valid > 0,
    summary: { total: rows.length, valid, errors, creates, updates },
    rows,
  };
}

export function buildAchievementsImportPreview(content, format, ctx = {}) {
  const parsed = parseAchievementsContent(content, format);
  if (!parsed.ok) {
    return {
      ok: false,
      error: parsed.error,
      summary: { total: 0, valid: 0, errors: 1, creates: 0, updates: 0 },
      rows: [],
    };
  }
  return previewAchievementsImport(parsed.raw, ctx);
}

export { ACHIEVEMENT_TYPES };
