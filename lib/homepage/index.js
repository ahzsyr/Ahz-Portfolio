/**
 * Homepage selective composition helpers — pure, no Prisma.
 */

import { computeCareerStats } from "../career/index.js";
import { selectFeaturedKpis } from "../viz/adapters.js";

export const HOMEPAGE_PROJECT_MAX = 3;
export const HOMEPAGE_IMPACT_KPI_MAX = 3;
export const HOMEPAGE_ACHIEVEMENT_MAX = 4;
export const HOMEPAGE_SKILLS_MAX = 8;
export const HOMEPAGE_TOOLS_MAX = 10;

/**
 * Featured projects for homepage — sorted, capped.
 */
export function selectHomepageProjects(projects = [], max = HOMEPAGE_PROJECT_MAX) {
  return (projects || [])
    .filter((p) => p.featured)
    .sort((a, b) => (a.featuredOrder || 0) - (b.featuredOrder || 0))
    .slice(0, max);
}

/**
 * Featured public metrics → KPI cards (max 3).
 */
export function selectHomepageImpactKpis(
  metrics = [],
  max = HOMEPAGE_IMPACT_KPI_MAX
) {
  return selectFeaturedKpis(metrics, max);
}

/**
 * Featured achievements — capped.
 */
export function selectHomepageAchievements(
  achievements = [],
  max = HOMEPAGE_ACHIEVEMENT_MAX
) {
  return (achievements || [])
    .filter((a) => a.featured && (!a.status || a.status === "published"))
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .slice(0, max);
}

/**
 * Prefer featured skills; fill with others up to max.
 */
export function selectHomepageSkills(skills = [], max = HOMEPAGE_SKILLS_MAX) {
  const list = (skills || []).slice();
  const featured = list
    .filter((s) => s.featured)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  if (featured.length >= max) return featured.slice(0, max);
  const rest = list
    .filter((s) => !s.featured)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  return [...featured, ...rest].slice(0, max);
}

export function selectHomepageTools(tools = [], max = HOMEPAGE_TOOLS_MAX) {
  return (tools || []).filter(Boolean).slice(0, max);
}

/**
 * Fixed 4-stat snapshot: Years / Projects / Tools / Domains.
 */
export function buildHomepageSnapshot(inputs = {}, currentYear) {
  const raw = computeCareerStats(inputs, currentYear);
  const byId = Object.fromEntries(raw.map((s) => [s.id, s]));
  const years = byId.years;
  const projects = byId.projects;
  const tools = byId.technologies;
  const domains = byId.domains;

  const stats = [
    {
      id: "years",
      label: "Years",
      display: years?.display || "—",
      valueNumeric: years?.valueNumeric ?? 0,
    },
    {
      id: "projects",
      label: "Projects",
      display: projects?.display || "—",
      valueNumeric: projects?.valueNumeric ?? 0,
    },
    {
      id: "tools",
      label: "Tools",
      display: tools?.display || "—",
      valueNumeric: tools?.valueNumeric ?? 0,
    },
    {
      id: "domains",
      label: "Domains",
      display: domains?.display || "—",
      valueNumeric: domains?.valueNumeric ?? 0,
    },
  ];

  const hasData = stats.some((s) => s.valueNumeric > 0);
  return { stats, hasData };
}
