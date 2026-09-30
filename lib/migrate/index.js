/**
 * Migration / backfill helpers — pure + Prisma-backed.
 * Safe for upgrades: never wipe CMS content; only fill gaps.
 */

import { slugify as baseSlugify } from "../adminHelpers.js";

export function slugify(value) {
  return baseSlugify(value) || "item";
}

/**
 * Build a unique slug from title/id, avoiding collisions with `taken` set.
 * Existing slug is kept when non-empty and not already in `taken`.
 * @param {{ title?: string, slug?: string|null, id?: number|string }} project
 * @param {Set<string>} taken — slugs already claimed by *other* rows
 */
export function ensureUniqueProjectSlug(project, taken = new Set()) {
  const existing = String(project?.slug || "").trim();
  if (existing && !taken.has(existing)) {
    return existing;
  }

  const base =
    slugify(existing || project?.title || `project-${project?.id || "x"}`) ||
    `project-${project?.id || "x"}`;

  let candidate = base;
  let n = 2;
  while (taken.has(candidate)) {
    const idPart = project?.id != null ? String(project.id) : String(n);
    candidate = `${base}-${idPart}`;
    if (!taken.has(candidate)) break;
    candidate = `${base}-${idPart}-${n}`;
    n += 1;
    if (n > 1000) {
      candidate = `${base}-${Date.now()}`;
      break;
    }
  }
  return candidate;
}

/**
 * Normalize presentationMode for legacy rows.
 */
export function ensurePresentationMode(raw) {
  const v = String(raw || "").trim().toLowerCase();
  if (!v) return "minimal";
  return v;
}

/**
 * Backfill project slugs + presentationMode. Idempotent.
 * @param {import('@prisma/client').PrismaClient} prisma
 * @returns {Promise<{ updatedSlugs: number, updatedModes: number }>}
 */
export async function backfillProjects(prisma) {
  const projects = await prisma.project.findMany({
    select: { id: true, title: true, slug: true, presentationMode: true },
    orderBy: { id: "asc" },
  });

  const taken = new Set();
  let updatedSlugs = 0;
  let updatedModes = 0;

  for (const project of projects) {
    const nextSlug = ensureUniqueProjectSlug(project, taken);
    taken.add(nextSlug);

    const data = {};
    if (nextSlug !== project.slug) {
      data.slug = nextSlug;
      updatedSlugs += 1;
    }

    if (!project.presentationMode || !String(project.presentationMode).trim()) {
      data.presentationMode = "minimal";
      updatedModes += 1;
    }

    if (Object.keys(data).length) {
      await prisma.project.update({ where: { id: project.id }, data });
    }
  }

  return { updatedSlugs, updatedModes };
}
