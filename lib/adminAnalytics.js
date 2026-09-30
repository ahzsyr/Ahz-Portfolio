/**
 * Admin Portfolio Overview analytics — pure builders + SSR fetch.
 * No React. Builders take plain DTOs for unit tests.
 */

import { resolveExperienceYears } from "./career/index.js";
import { toCategoryDonutConfig } from "./viz/adapters.js";

function yearFromDate(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.getFullYear();
}

/**
 * Prefer Experience.startYear; else project.createdAt year.
 */
export function resolveProjectYear(project) {
  if (project?.experience) {
    const { startYear } = resolveExperienceYears(project.experience);
    if (startYear != null) return startYear;
  }
  return yearFromDate(project?.createdAt);
}

/**
 * Prefer Experience.domain; else Category.name; else "Other".
 */
export function resolveProjectDomain(project) {
  const expDomain = project?.experience?.domain;
  if (expDomain && String(expDomain).trim()) {
    return String(expDomain).trim();
  }
  const catName =
    project?.category?.name ||
    (typeof project?.category === "string" ? project.category : null);
  if (catName && String(catName).trim()) return String(catName).trim();
  return "Other";
}

export function resolveAchievementYear(achievement) {
  return (
    yearFromDate(achievement?.date) || yearFromDate(achievement?.createdAt)
  );
}

/**
 * @returns {{ label: string, valueNumeric: number, value: number }[]}
 */
export function buildProjectsByYear(projects = []) {
  const buckets = new Map();
  for (const p of projects || []) {
    const year = resolveProjectYear(p);
    if (year == null) continue;
    const key = String(year);
    buckets.set(key, (buckets.get(key) || 0) + 1);
  }
  return [...buckets.entries()]
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([label, count]) => ({
      label,
      valueNumeric: count,
      value: count,
    }));
}

/**
 * @returns {{ name: string, count: number }[]}
 */
export function buildProjectsByDomain(projects = []) {
  const buckets = new Map();
  for (const p of projects || []) {
    const domain = resolveProjectDomain(p);
    buckets.set(domain, (buckets.get(domain) || 0) + 1);
  }
  return [...buckets.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/**
 * Newest year first (matches example list).
 * @returns {{ label: string, name: string, value: number, valueNumeric: number }[]}
 */
export function buildAchievementsByYear(achievements = []) {
  const buckets = new Map();
  for (const a of achievements || []) {
    const year = resolveAchievementYear(a);
    if (year == null) continue;
    const key = String(year);
    buckets.set(key, (buckets.get(key) || 0) + 1);
  }
  return [...buckets.entries()]
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .map(([label, count]) => ({
      label,
      name: label,
      value: count,
      valueNumeric: count,
    }));
}

export function projectsByYearViz(series) {
  if (!series?.length) {
    return {
      type: "area",
      data: [],
      config: {
        title: "Projects by Year",
        empty: true,
        seriesKey: "valueNumeric",
        xKey: "label",
        tableFallback: true,
        textSummary: "No projects with resolvable years yet.",
      },
    };
  }
  return {
    type: "area",
    data: series,
    config: {
      title: "Projects by Year",
      seriesKey: "valueNumeric",
      xKey: "label",
      height: 260,
      tableFallback: true,
      textSummary: `Projects by year: ${series
        .map((r) => `${r.label} (${r.valueNumeric})`)
        .join(", ")}.`,
    },
  };
}

export function projectsByDomainViz(domains) {
  const viz = toCategoryDonutConfig(domains);
  return {
    ...viz,
    config: {
      ...viz.config,
      title: "Projects by Domain",
      textSummary: viz.config.empty
        ? "Not enough domains for a proportion chart."
        : (viz.config.textSummary || "").replace(
            /Projects by category/g,
            "Projects by Domain"
          ),
      ariaLabel: viz.config.empty
        ? "Not enough domains for a proportion chart."
        : viz.config.ariaLabel,
    },
  };
}

export function achievementsByYearViz(series) {
  if (!series?.length) {
    return {
      type: "barHorizontal",
      data: [],
      config: {
        title: "Achievements by Year",
        empty: true,
        seriesKey: "value",
        xKey: "name",
        tableFallback: true,
        textSummary: "No dated achievements yet.",
      },
    };
  }
  return {
    type: "barHorizontal",
    data: series,
    config: {
      title: "Achievements",
      seriesKey: "value",
      xKey: "name",
      height: Math.max(200, series.length * 36),
      tableFallback: true,
      textSummary: `Achievements by year: ${series
        .map((r) => `${r.name} ${r.value}`)
        .join(", ")}.`,
    },
  };
}

/**
 * SSR loader — pass prisma client.
 */
export async function fetchAdminPortfolioOverview(prisma) {
  const [
    projectsCount,
    experienceCount,
    achievementsCount,
    metricsCount,
    categoriesCount,
    unread,
    projects,
    achievements,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.experience.count(),
    prisma.achievement.count(),
    prisma.metric.count(),
    prisma.category.count(),
    prisma.message.count({ where: { read: false } }),
    prisma.project.findMany({
      select: {
        id: true,
        createdAt: true,
        category: { select: { name: true } },
        experience: {
          select: {
            startYear: true,
            endYear: true,
            period: true,
            domain: true,
            position: true,
            company: true,
          },
        },
      },
    }),
    prisma.achievement.findMany({
      select: { id: true, date: true, createdAt: true },
    }),
  ]);

  const byYear = buildProjectsByYear(projects);
  const byDomain = buildProjectsByDomain(projects);
  const achievementsByYear = buildAchievementsByYear(achievements);

  return {
    counts: {
      projects: projectsCount,
      experience: experienceCount,
      achievements: achievementsCount,
      metrics: metricsCount,
      categories: categoriesCount,
      unread,
    },
    charts: {
      projectsByYear: projectsByYearViz(byYear),
      projectsByDomain: projectsByDomainViz(byDomain),
      achievementsByYear: achievementsByYearViz(achievementsByYear),
    },
  };
}
