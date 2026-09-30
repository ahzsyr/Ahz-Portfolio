/**
 * Pure helpers for project case-study composition.
 */

export const HERO_KPI_MAX = 4;
export const ACHIEVEMENT_MAX = 4;

export function hasText(value) {
  if (value == null) return false;
  const s = String(value).trim();
  if (!s) return false;
  if (s === "<p></p>" || s === "<p><br></p>") return false;
  return true;
}

export function normalizeTags(raw) {
  if (Array.isArray(raw)) {
    return raw.map((t) => String(t).trim()).filter(Boolean);
  }
  if (typeof raw === "string") {
    return raw
      .split(/[,·|]/)
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return [];
}

export function normalizePathList(raw) {
  if (Array.isArray(raw)) {
    return raw.map((p) => String(p).trim()).filter(Boolean);
  }
  if (typeof raw === "string") {
    return raw
      .split("\n")
      .map((p) => p.trim())
      .filter(Boolean);
  }
  return [];
}

/**
 * Collect unique experience ids from project achievements + metrics.
 */
export function collectExperienceIds(project = {}) {
  const ids = new Set();
  for (const a of project.achievements || []) {
    if (a?.experienceId != null) ids.add(Number(a.experienceId));
  }
  for (const m of project.metrics || []) {
    if (m?.experienceId != null) ids.add(Number(m.experienceId));
  }
  return [...ids].filter((n) => Number.isFinite(n));
}

/**
 * Featured-first KPIs for hero (max 4). KPI display only — no series charts.
 */
export function selectHeroKpis(metrics = [], max = HERO_KPI_MAX) {
  const list = Array.isArray(metrics) ? metrics : [];
  const featured = list
    .filter((m) => m.featured)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const pool = featured.length
    ? featured
    : list.slice().sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  return pool.slice(0, max);
}

/**
 * Primary series chart metric: first with series.length >= 2,
 * preferring featured, excluding hero KPI ids when possible.
 */
export function selectPrimaryChartMetric(metrics = [], heroKpis = []) {
  const heroIds = new Set(heroKpis.map((m) => m.id));
  const list = Array.isArray(metrics) ? metrics : [];
  const withSeries = list
    .filter((m) => (m.series || []).length >= 2)
    .sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    });
  const notInHero = withSeries.find((m) => !heroIds.has(m.id));
  return notInHero || withSeries[0] || null;
}

/**
 * Featured achievements first, max N.
 */
export function selectCaseAchievements(achievements = [], max = ACHIEVEMENT_MAX) {
  const list = Array.isArray(achievements) ? achievements : [];
  return list
    .slice()
    .sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    })
    .slice(0, max);
}
