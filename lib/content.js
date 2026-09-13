import { siteConfig } from "../config/site";
import { projects as staticProjects } from "../data/projects";
import { experience as staticExperience } from "../data/experience";

function mapProject(project) {
  const tools = Array.isArray(project.tools)
    ? project.tools
    : typeof project.tools === "string"
      ? project.tools.split("|").filter(Boolean)
      : [];

  return {
    id: project.id,
    slug: project.slug,
    title: project.title,
    category: project.category?.name || project.category,
    categoryId: project.categoryId || null,
    description: project.description,
    client: project.client,
    tools: tools.join("|"),
    toolsList: tools,
    image: project.coverPath || project.image,
    media:
      project.media?.map((m) => (typeof m === "string" ? m : m.path)) ||
      project.media ||
      [],
    featured: Boolean(project.featured),
    featuredOrder: project.featuredOrder || 0,
    status: project.status || "published",
    seoTitle: project.seoTitle || null,
    seoDescription: project.seoDescription || null,
  };
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
    return staticProjects.map(mapProject);
  }
  return rows.map(mapProject);
}

export async function getFeaturedProjects() {
  const projects = await getPublishedProjects();
  return projects
    .filter((p) => p.featured)
    .sort((a, b) => a.featuredOrder - b.featuredOrder);
}

export async function getProjectByParam(param) {
  const rows = await withDb((prisma) =>
    prisma.project.findFirst({
      where: {
        status: "published",
        OR: [
          { slug: String(param) },
          ...(Number.isFinite(Number(param)) ? [{ id: Number(param) }] : []),
        ],
      },
      include: { category: true, media: { orderBy: { sortOrder: "asc" } } },
    })
  );

  if (rows) {
    return mapProject(rows);
  }

  const found = staticProjects.find(
    (p) => String(p.id) === String(param) || p.slug === String(param)
  );
  return found ? mapProject(found) : null;
}

export async function getExperience() {
  const rows = await withDb((prisma) =>
    prisma.experience.findMany({ orderBy: { sortOrder: "asc" } })
  );

  if (!rows) {
    return staticExperience;
  }

  return rows.map((row) => ({
    id: row.id,
    position: row.position,
    company: row.company,
    period: row.period,
    desc: Array.isArray(row.bullets) ? row.bullets : [],
  }));
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
