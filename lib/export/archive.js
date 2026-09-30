/**
 * Professional archive JSON builder (pure — no Prisma).
 */

export const ARCHIVE_VERSION = 1;

/**
 * Slim project refs for FK context.
 * @param {object[]} projects
 */
export function slimProjects(projects = []) {
  return projects.map((p) => ({
    id: p.id,
    title: p.title ?? null,
    slug: p.slug ?? null,
    category:
      typeof p.category === "string"
        ? p.category
        : p.category?.name ?? p.categoryName ?? null,
    client: p.client ?? null,
  }));
}

/**
 * @param {object} collections
 * @param {{ exportedAt?: string|Date }} [options]
 */
export function buildProfessionalArchive(collections = {}, options = {}) {
  const exportedAt =
    options.exportedAt instanceof Date
      ? options.exportedAt.toISOString()
      : options.exportedAt || new Date().toISOString();

  return {
    version: ARCHIVE_VERSION,
    exportedAt,
    metricGroups: collections.metricGroups || [],
    metrics: collections.metrics || [],
    achievements: collections.achievements || [],
    experience: collections.experience || [],
    education: collections.education || [],
    certifications: collections.certifications || [],
    milestones: collections.milestones || [],
    skills: collections.skills || [],
    projects: slimProjects(collections.projects || []),
  };
}
