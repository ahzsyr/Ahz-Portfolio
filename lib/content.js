import { siteConfig } from "../config/site";
import { projects as staticProjects } from "../data/projects";
import { experience as staticExperience } from "../data/experience";
import { buildMetricDomain, toContentDto } from "./metrics";
import {
  collectExperienceIds,
  normalizePathList,
  normalizeTags,
} from "./case-study";

/**
 * Composition boundary between professional-archive data and public presentation.
 * Metric logic lives in lib/metrics; this module loads Prisma rows and adapts DTOs.
 */

function normalizeProjectTags(raw) {
  return normalizeTags(raw);
}

function normalizeEvidencePaths(raw) {
  return normalizePathList(raw);
}

function mapProject(project, { includeImpact = false, includeStory = false } = {}) {
  const tools = Array.isArray(project.tools)
    ? project.tools
    : typeof project.tools === "string"
      ? project.tools.split("|").filter(Boolean)
      : [];

  const mediaRows = project.media || [];
  const mediaPaths =
    mediaRows.map((m) => (typeof m === "string" ? m : m.path)).filter(Boolean) ||
    [];

  const mapped = {
    id: project.id,
    slug: project.slug,
    title: project.title,
    category: project.category?.name || project.category,
    categoryId: project.categoryId || null,
    experienceId: project.experienceId ?? null,
    description: project.description,
    overview: project.overview || null,
    role: project.role || null,
    challenge: project.challenge || null,
    approach: project.approach || null,
    process: project.process || null,
    results: project.results || null,
    tags: normalizeProjectTags(project.tags),
    evidencePaths: normalizeEvidencePaths(project.evidencePaths),
    client: project.client,
    tools: tools.join("|"),
    toolsList: tools,
    image: project.coverPath || project.image,
    media: mediaPaths,
    mediaItems: mediaRows
      .filter((m) => m && typeof m === "object")
      .map((m) => ({
        id: m.id,
        path: m.path,
        alt: m.alt || null,
        sortOrder: m.sortOrder ?? 0,
      })),
    featured: Boolean(project.featured),
    featuredOrder: project.featuredOrder || 0,
    status: project.status || "published",
    presentationMode: project.presentationMode || "minimal",
    seoTitle: project.seoTitle || null,
    seoDescription: project.seoDescription || null,
  };

  if (includeImpact) {
    mapped.achievements = (project.achievements || []).map(mapAchievement);
    mapped.metrics = (project.metrics || []).map((m) =>
      mapMetric(m, { includeSeries: true })
    );
  }

  if (includeStory) {
    mapped.story = mapStory(project.story);
  }

  return mapped;
}

function mapSettings(row) {
  if (!row) {
    return {
      ...siteConfig,
      contact: { ...siteConfig.contact },
      socials: { ...siteConfig.socials },
    };
  }

  return {
    siteName: row.siteName,
    personName: row.personName,
    tagline: row.tagline,
    headline: row.headline,
    heroSupporting: row.heroSupporting,
    aboutBio: row.aboutBio,
    locations: row.locations,
    tools: row.tools,
    contact: {
      phone: row.phone,
      phoneDisplay: row.phoneDisplay,
      email: row.email,
      location: row.location,
    },
    socials: {
      linkedin: row.linkedin,
      linkedinHandle: row.linkedinHandle,
      github: row.github,
      facebook: row.facebook,
    },
    resumePath: row.resumePath,
    ogImagePath: row.ogImagePath,
    canonicalUrl: row.canonicalUrl,
    gaId: row.gaId,
  };
}

/**
 * Map a Metric via the Metric Service domain layer.
 * @param {object} row - Prisma metric (optionally with dataPoints)
 * @param {{ includeSeries?: boolean }} [options]
 */
export function mapMetric(row, { includeSeries = false } = {}) {
  if (!row) return null;
  const points = row.dataPoints || [];
  const domain = buildMetricDomain(
    row,
    includeSeries || points.length ? points : []
  );
  return toContentDto(domain);
}

export function mapMetricGroup(row, { includeMetrics = false } = {}) {
  if (!row) return null;
  const mapped = {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || null,
    sortOrder: row.sortOrder ?? 0,
    visibility: row.visibility || "public",
  };
  if (includeMetrics) {
    mapped.metrics = (row.metrics || []).map((m) =>
      mapMetric(m, { includeSeries: Boolean(m.dataPoints) })
    );
  }
  return mapped;
}

/** Achievement = outcome narrative (not a metric). */
export function mapAchievement(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    type: row.type,
    date: row.date || null,
    category: row.category || null,
    featured: Boolean(row.featured),
    sortOrder: row.sortOrder ?? 0,
    status: row.status || "published",
    projectId: row.projectId ?? null,
    experienceId: row.experienceId ?? null,
  };
}

export function mapCertification(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    issuer: row.issuer,
    issuedAt: row.issuedAt,
    expiresAt: row.expiresAt || null,
    credentialUrl: row.credentialUrl || null,
    imagePath: row.imagePath || null,
    sortOrder: row.sortOrder ?? 0,
    featured: Boolean(row.featured),
  };
}

export function mapEducation(row) {
  if (!row) return null;
  return {
    id: row.id,
    institution: row.institution,
    degree: row.degree,
    field: row.field || null,
    period: row.period,
    description: row.description || null,
    sortOrder: row.sortOrder ?? 0,
  };
}

export function mapSkill(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    category: row.category || null,
    level: row.level || null,
    sortOrder: row.sortOrder ?? 0,
    featured: Boolean(row.featured),
  };
}

export function mapMilestone(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    date: row.date || null,
    description: row.description || null,
    type: row.type || null,
    sortOrder: row.sortOrder ?? 0,
    featured: Boolean(row.featured),
  };
}

const storyBlockInclude = {
  metric: {
    include: {
      dataPoints: { orderBy: [{ date: "asc" }, { sortOrder: "asc" }] },
    },
  },
  achievement: true,
  projectMedia: true,
  milestone: true,
  metrics: {
    orderBy: { sortOrder: "asc" },
    include: {
      metric: {
        include: {
          dataPoints: { orderBy: [{ date: "asc" }, { sortOrder: "asc" }] },
        },
      },
    },
  },
};

export function mapStoryBlock(row) {
  if (!row) return null;
  return {
    id: row.id,
    storyId: row.storyId,
    type: row.type,
    sortOrder: row.sortOrder ?? 0,
    title: row.title || null,
    subtitle: row.subtitle || null,
    body: row.body || null,
    config: row.config && typeof row.config === "object" ? row.config : {},
    metricId: row.metricId ?? null,
    achievementId: row.achievementId ?? null,
    projectMediaId: row.projectMediaId ?? null,
    milestoneId: row.milestoneId ?? null,
    metric: row.metric ? mapMetric(row.metric, { includeSeries: true }) : null,
    achievement: row.achievement ? mapAchievement(row.achievement) : null,
    projectMedia: row.projectMedia
      ? {
          id: row.projectMedia.id,
          path: row.projectMedia.path,
          alt: row.projectMedia.alt || null,
        }
      : null,
    milestone: row.milestone ? mapMilestone(row.milestone) : null,
    metrics: (row.metrics || []).map((link) => ({
      metricId: link.metricId,
      sortOrder: link.sortOrder ?? 0,
      metric: link.metric
        ? mapMetric(link.metric, { includeSeries: true })
        : null,
    })),
  };
}

export function mapStory(row) {
  if (!row) return null;
  const status = row.status || "draft";
  return {
    id: row.id,
    slug: row.slug,
    scope: row.scope,
    projectId: row.projectId ?? null,
    title: row.title || null,
    status,
    blocks: (row.blocks || [])
      .slice()
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map(mapStoryBlock),
  };
}

async function withDb(fn) {
  if (!process.env.DATABASE_URL) {
    return null;
  }
  try {
    const { prisma } = await import("./prisma");
    return await fn(prisma);
  } catch (error) {
    console.error("[content] database unavailable, using static fallback", error.message);
    return null;
  }
}

export async function getSiteSettings() {
  const row = await withDb((prisma) =>
    prisma.siteSettings.findUnique({ where: { id: 1 } })
  );
  return mapSettings(row);
}

export async function getPublishedProjects() {
  const rows = await withDb((prisma) =>
    prisma.project.findMany({
      where: { status: "published" },
      include: { category: true, media: { orderBy: { sortOrder: "asc" } } },
      orderBy: { id: "asc" },
    })
  );

  if (!rows) {
    return staticProjects.map((p) => mapProject(p));
  }
  return rows.map((p) => mapProject(p));
}

export async function getFeaturedProjects() {
  const projects = await getPublishedProjects();
  return projects
    .filter((p) => p.featured)
    .sort((a, b) => a.featuredOrder - b.featuredOrder);
}

/**
 * @param {string|number} param - slug or id
 * @param {{ includeImpact?: boolean, includeStory?: boolean }} [options]
 */
export async function getProjectByParam(param, options = {}) {
  const { includeImpact = false, includeStory = false } = options;

  const include = {
    category: true,
    media: { orderBy: { sortOrder: "asc" } },
  };

  if (includeImpact) {
    include.achievements = {
      where: { status: "published" },
      orderBy: { sortOrder: "asc" },
    };
    include.metrics = {
      where: { visibility: "public" },
      include: {
        dataPoints: { orderBy: [{ date: "asc" }, { sortOrder: "asc" }] },
      },
      orderBy: { sortOrder: "asc" },
    };
  }

  if (includeStory) {
    include.story = {
      where: { status: "published" },
      include: {
        blocks: {
          orderBy: { sortOrder: "asc" },
          include: storyBlockInclude,
        },
      },
    };
  }

  const rows = await withDb((prisma) =>
    prisma.project.findFirst({
      where: {
        status: "published",
        OR: [
          { slug: String(param) },
          ...(Number.isFinite(Number(param)) ? [{ id: Number(param) }] : []),
        ],
      },
      include,
    })
  );

  if (rows) {
    return mapProject(rows, { includeImpact, includeStory });
  }

  const found = staticProjects.find(
    (p) => String(p.id) === String(param) || p.slug === String(param)
  );
  return found ? mapProject(found, { includeImpact, includeStory }) : null;
}

export async function getExperience({ includeCareer = false } = {}) {
  const include = includeCareer
    ? {
        achievements: {
          where: { status: "published" },
          orderBy: { sortOrder: "asc" },
        },
        metrics: {
          where: { visibility: "public" },
          include: {
            dataPoints: { orderBy: [{ date: "asc" }, { sortOrder: "asc" }] },
          },
          orderBy: { sortOrder: "asc" },
        },
        projects: {
          where: { status: "published" },
          include: { category: true },
          orderBy: { featuredOrder: "asc" },
        },
      }
    : undefined;

  const rows = await withDb((prisma) =>
    prisma.experience.findMany({
      orderBy: { sortOrder: "asc" },
      include,
    })
  );

  if (!rows) {
    return staticExperience.map((e) => ({
      ...e,
      startYear: null,
      endYear: null,
      domain: null,
      achievements: [],
      metrics: [],
      projects: [],
    }));
  }

  return rows.map((row) => {
    const mapped = {
      id: row.id,
      position: row.position,
      company: row.company,
      period: row.period,
      desc: Array.isArray(row.bullets) ? row.bullets : [],
      startYear: row.startYear ?? null,
      endYear: row.endYear ?? null,
      domain: row.domain || null,
      sortOrder: row.sortOrder ?? 0,
    };

    if (includeCareer) {
      mapped.achievements = (row.achievements || [])
        .map(mapAchievement)
        .sort((a, b) => {
          if (a.featured !== b.featured) return a.featured ? -1 : 1;
          return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
        })
        .slice(0, 3);
      mapped.metrics = (row.metrics || []).map((m) =>
        mapMetric(m, { includeSeries: true })
      );
      mapped.projects = (row.projects || []).map((p) =>
        mapProject(p, { includeImpact: false })
      );
    }

    return mapped;
  });
}

/**
 * Aggregate inputs for About career stats (published projects + skills + tools).
 */
export async function getCareerStatsInputs() {
  const [experiences, projects, skills, settings] = await Promise.all([
    getExperience({ includeCareer: false }),
    getPublishedProjects(),
    getSkills(),
    getSiteSettings(),
  ]);
  return {
    experiences,
    projects,
    skills,
    tools: settings.tools || [],
  };
}

export async function getCategories() {
  const rows = await withDb((prisma) =>
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } })
  );
  if (!rows) {
    const names = [
      "Packages",
      "Business Cards",
      "Logo",
      "Banner",
      "Kelk",
      "Advertising",
    ];
    return names.map((name, index) => ({
      id: index + 1,
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      sortOrder: index,
    }));
  }
  return rows;
}

/** Category names with published project counts for proportion charts. */
export async function getCategoryProjectCounts() {
  const rows = await withDb((prisma) =>
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        projects: {
          where: { status: "published" },
          select: { id: true },
        },
      },
    })
  );
  if (!rows) return [];
  return rows.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    count: c.projects?.length ?? 0,
  }));
}

export async function getAchievements({ featuredOnly = false } = {}) {
  const rows = await withDb((prisma) =>
    prisma.achievement.findMany({
      where: {
        status: "published",
        ...(featuredOnly ? { featured: true } : {}),
      },
      orderBy: { sortOrder: "asc" },
    })
  );
  if (!rows) return [];
  return rows.map(mapAchievement);
}

/** Featured published achievements for homepage (selective). */
export async function getFeaturedAchievements({ take = 4 } = {}) {
  const rows = await getAchievements({ featuredOnly: true });
  return rows.slice(0, take);
}

/** Admin: includes draft achievements. */
export async function getAchievementsAdmin() {
  const rows = await withDb((prisma) =>
    prisma.achievement.findMany({ orderBy: { sortOrder: "asc" } })
  );
  if (!rows) return [];
  return rows.map(mapAchievement);
}

const metricWithPointsInclude = {
  dataPoints: { orderBy: [{ date: "asc" }, { sortOrder: "asc" }] },
};

export async function getMetricGroups({ includeMetrics = true } = {}) {
  const rows = await withDb((prisma) =>
    prisma.metricGroup.findMany({
      where: { visibility: "public" },
      include: includeMetrics
        ? {
            metrics: {
              where: { visibility: "public" },
              include: metricWithPointsInclude,
              orderBy: { sortOrder: "asc" },
            },
          }
        : undefined,
      orderBy: { sortOrder: "asc" },
    })
  );
  if (!rows) return [];
  return rows.map((row) => mapMetricGroup(row, { includeMetrics }));
}

/** Admin: all groups/metrics regardless of visibility. */
export async function getMetricGroupsAdmin({ includeMetrics = true } = {}) {
  const rows = await withDb((prisma) =>
    prisma.metricGroup.findMany({
      include: includeMetrics
        ? {
            metrics: {
              include: metricWithPointsInclude,
              orderBy: { sortOrder: "asc" },
            },
          }
        : undefined,
      orderBy: { sortOrder: "asc" },
    })
  );
  if (!rows) return [];
  return rows.map((row) => mapMetricGroup(row, { includeMetrics }));
}

export async function getMetricsForProject(projectId) {
  const rows = await withDb((prisma) =>
    prisma.metric.findMany({
      where: { projectId: Number(projectId), visibility: "public" },
      include: metricWithPointsInclude,
      orderBy: { sortOrder: "asc" },
    })
  );
  if (!rows) return [];
  return rows.map((m) => mapMetric(m, { includeSeries: true }));
}

export async function getFeaturedMetrics({ includeSeries = false } = {}) {
  const rows = await withDb((prisma) =>
    prisma.metric.findMany({
      where: { visibility: "public", featured: true },
      include: includeSeries ? metricWithPointsInclude : undefined,
      orderBy: { sortOrder: "asc" },
    })
  );
  if (!rows) return [];
  return rows.map((m) => mapMetric(m, { includeSeries }));
}

export async function getMetricById(id, { includeSeries = true } = {}) {
  const row = await withDb((prisma) =>
    prisma.metric.findFirst({
      where: { id: Number(id), visibility: "public" },
      include: includeSeries ? metricWithPointsInclude : undefined,
    })
  );
  if (!row) return null;
  return mapMetric(row, { includeSeries });
}

export async function getMetricSeries(metricId) {
  const dto = await getMetricById(metricId, { includeSeries: true });
  return dto?.series || [];
}

export async function getCertifications({ featuredOnly = false } = {}) {
  const rows = await withDb((prisma) =>
    prisma.certification.findMany({
      where: featuredOnly ? { featured: true } : undefined,
      orderBy: { sortOrder: "asc" },
    })
  );
  if (!rows) return [];
  return rows.map(mapCertification);
}

export async function getEducation() {
  const rows = await withDb((prisma) =>
    prisma.education.findMany({ orderBy: { sortOrder: "asc" } })
  );
  if (!rows) return [];
  return rows.map(mapEducation);
}

export async function getSkills({ featuredOnly = false } = {}) {
  const rows = await withDb((prisma) =>
    prisma.skill.findMany({
      where: featuredOnly ? { featured: true } : undefined,
      orderBy: { sortOrder: "asc" },
    })
  );
  if (!rows) return [];
  return rows.map(mapSkill);
}

export async function getMilestones({ featuredOnly = false } = {}) {
  const rows = await withDb((prisma) =>
    prisma.milestone.findMany({
      where: featuredOnly ? { featured: true } : undefined,
      orderBy: { sortOrder: "asc" },
    })
  );
  if (!rows) return [];
  return rows.map(mapMilestone);
}

/**
 * Published Impact-page story (scope=impact, slug=impact).
 * Returns null when missing or draft — callers use Phase 3 fallback.
 */
export async function getImpactStory() {
  const row = await withDb((prisma) =>
    prisma.story.findFirst({
      where: { scope: "impact", slug: "impact", status: "published" },
      include: {
        blocks: {
          orderBy: { sortOrder: "asc" },
          include: storyBlockInclude,
        },
      },
    })
  );
  return mapStory(row);
}

export async function getStoryById(id) {
  const row = await withDb((prisma) =>
    prisma.story.findUnique({
      where: { id: Number(id) },
      include: {
        project: { select: { id: true, title: true, slug: true } },
        blocks: {
          orderBy: { sortOrder: "asc" },
          include: storyBlockInclude,
        },
      },
    })
  );
  if (!row) return null;
  const mapped = mapStory(row);
  if (mapped && row.project) {
    mapped.project = row.project;
  }
  return mapped;
}

/**
 * Related experience derived from project achievements/metrics experienceId links.
 * No Project.experienceId FK.
 */
export async function getRelatedExperienceForProject(project) {
  const ids = collectExperienceIds(project);
  if (!ids.length) return [];

  const rows = await withDb((prisma) =>
    prisma.experience.findMany({
      where: { id: { in: ids } },
      orderBy: { sortOrder: "asc" },
    })
  );
  if (!rows) return [];

  return rows.map((row) => ({
    id: row.id,
    position: row.position,
    company: row.company,
    period: row.period,
    desc: Array.isArray(row.bullets) ? row.bullets : [],
  }));
}

