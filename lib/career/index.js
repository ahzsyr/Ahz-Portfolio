/**
 * Career visualization helpers — pure, no Prisma.
 */

const LEVEL_MAP = {
  beginner: 25,
  novice: 30,
  intermediate: 55,
  advanced: 80,
  expert: 95,
  master: 100,
};

/**
 * Extract start/end years from period strings like "2021 – 2023", "2024-Present".
 */
export function parsePeriodYears(period, currentYear = new Date().getFullYear()) {
  if (period == null || period === "") {
    return { startYear: null, endYear: null };
  }
  const text = String(period);
  const years = [...text.matchAll(/\b(19|20)\d{2}\b/g)].map((m) => Number(m[0]));
  const present = /present|current|now|ongoing/i.test(text);

  if (years.length === 0) {
    return { startYear: null, endYear: present ? currentYear : null };
  }
  const startYear = years[0];
  let endYear = years.length > 1 ? years[years.length - 1] : null;
  if (present) endYear = currentYear;
  if (endYear == null && years.length === 1 && !present) {
    // Single year — treat as start=end unless "Present"
    endYear = startYear;
  }
  return { startYear, endYear };
}

export function resolveExperienceYears(exp, currentYear = new Date().getFullYear()) {
  const parsed = parsePeriodYears(exp?.period, currentYear);
  const startYear =
    exp?.startYear != null && Number.isFinite(Number(exp.startYear))
      ? Number(exp.startYear)
      : parsed.startYear;
  const endYear =
    exp?.endYear != null && Number.isFinite(Number(exp.endYear))
      ? Number(exp.endYear)
      : parsed.endYear;
  return { startYear, endYear };
}

export function resolveDomain(exp) {
  if (exp?.domain && String(exp.domain).trim()) return String(exp.domain).trim();
  if (exp?.position) {
    const first = String(exp.position).split(/[|,/–-]/)[0].trim();
    if (first) return first;
  }
  return exp?.company || "Role";
}

/**
 * Build ordered timeline lanes (chronological by startYear).
 */
export function buildCareerTimeline(experiences = [], currentYear = new Date().getFullYear()) {
  return (experiences || [])
    .map((exp) => {
      const { startYear, endYear } = resolveExperienceYears(exp, currentYear);
      return {
        id: exp.id,
        position: exp.position,
        company: exp.company,
        period: exp.period,
        domain: resolveDomain(exp),
        startYear,
        endYear: endYear ?? currentYear,
        sortOrder: exp.sortOrder ?? 0,
      };
    })
    .sort((a, b) => {
      const sa = a.startYear ?? 9999;
      const sb = b.startYear ?? 9999;
      if (sa !== sb) return sa - sb;
      return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    });
}

function formatPlus(n, threshold = 10) {
  if (n >= threshold) return `${n}+`;
  return String(n);
}

/**
 * Computed career statistics.
 */
export function computeCareerStats(
  { experiences = [], projects = [], skills = [], tools = [] } = {},
  currentYear = new Date().getFullYear()
) {
  const yearsList = (experiences || [])
    .map((e) => resolveExperienceYears(e, currentYear))
    .filter((y) => y.startYear != null);

  let yearsValue = 0;
  if (yearsList.length) {
    const minStart = Math.min(...yearsList.map((y) => y.startYear));
    const maxEnd = Math.max(
      ...yearsList.map((y) => y.endYear ?? currentYear)
    );
    yearsValue = Math.max(0, maxEnd - minStart);
  }

  const projectCount = (projects || []).filter(
    (p) => !p.status || p.status === "published"
  ).length;

  const techSet = new Set();
  for (const s of skills || []) {
    if (s?.name) techSet.add(String(s.name).trim().toLowerCase());
  }
  for (const t of tools || []) {
    if (t) techSet.add(String(t).trim().toLowerCase());
  }

  const domains = new Set();
  for (const e of experiences || []) {
    if (e?.domain && String(e.domain).trim()) {
      domains.add(String(e.domain).trim().toLowerCase());
    }
  }
  if (domains.size === 0) {
    for (const e of experiences || []) {
      if (e?.company) domains.add(String(e.company).trim().toLowerCase());
    }
  }

  return [
    {
      id: "years",
      label: "Years Experience",
      display: yearsValue > 0 ? `${yearsValue}+` : "—",
      valueNumeric: yearsValue,
    },
    {
      id: "projects",
      label: "Projects",
      display: formatPlus(projectCount, 10),
      valueNumeric: projectCount,
    },
    {
      id: "technologies",
      label: "Technologies",
      display: formatPlus(techSet.size, 10),
      valueNumeric: techSet.size,
    },
    {
      id: "domains",
      label: "Professional Domains",
      display: String(domains.size || "—"),
      valueNumeric: domains.size,
    },
  ];
}

export function parseSkillLevel(level) {
  if (level == null || level === "") return null;
  if (typeof level === "number" && Number.isFinite(level)) {
    if (level <= 5) return Math.round((level / 5) * 100);
    return Math.min(100, Math.max(0, Math.round(level)));
  }
  const s = String(level).trim().toLowerCase();
  if (LEVEL_MAP[s] != null) return LEVEL_MAP[s];
  const pct = s.match(/^(\d+)\s*%?$/);
  if (pct) return Math.min(100, Math.max(0, Number(pct[1])));
  const of5 = s.match(/^(\d+)\s*\/\s*5$/);
  if (of5) return Math.round((Number(of5[1]) / 5) * 100);
  return null;
}

/**
 * Deterministic skills visualization selection.
 * @returns {{ mode: 'omit'|'bars'|'radar'|'grouped', allowRadar: boolean, data: object[] }}
 */
export function selectSkillsVisualization(skills = []) {
  const list = Array.isArray(skills) ? skills : [];
  if (!list.length) {
    return { mode: "omit", allowRadar: false, data: [] };
  }

  const categories = [
    ...new Set(list.map((s) => s.category).filter(Boolean)),
  ];

  const withLevels = list
    .map((s) => ({
      name: s.name,
      category: s.category || "General",
      value: parseSkillLevel(s.level),
      featured: Boolean(s.featured),
      sortOrder: s.sortOrder ?? 0,
    }))
    .filter((s) => s.value != null);

  if (categories.length >= 3) {
    const byCat = {};
    for (const s of list) {
      const cat = s.category || "General";
      const lvl = parseSkillLevel(s.level);
      const score = lvl != null ? lvl : s.featured ? 90 : 60;
      byCat[cat] = Math.max(byCat[cat] || 0, score);
    }
    const data = Object.entries(byCat).map(([name, value]) => ({
      name,
      value,
      label: name,
    }));
    return {
      mode: "bars",
      allowRadar: categories.length >= 3,
      data,
    };
  }

  if (withLevels.length > 0) {
    return {
      mode: "bars",
      allowRadar: false,
      data: withLevels
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .map((s) => ({
          name: s.name,
          value: s.value,
          label: s.name,
        })),
    };
  }

  // Grouped / order-weighted fallback
  const data = list
    .slice()
    .sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    })
    .map((s, i) => ({
      name: s.name,
      value: s.featured ? 100 - i : Math.max(40, 90 - i * 5),
      label: s.name,
      category: s.category || null,
    }));

  return { mode: "grouped", allowRadar: false, data };
}

/**
 * Featured-first metrics for an experience (max 3).
 */
export function selectExperienceMetrics(metrics = [], max = 3) {
  const list = Array.isArray(metrics) ? metrics : [];
  const featured = list
    .filter((m) => m.featured)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const pool = featured.length
    ? featured
    : list.slice().sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  return pool.slice(0, max);
}
