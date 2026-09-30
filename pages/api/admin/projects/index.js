import { requireAdmin } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { sanitizeHtmlForStorage } from "../../../../lib/sanitizeHtml";
import {
  normalizeTags,
  normalizePathList,
} from "../../../../lib/case-study";
import { optionalId } from "../../../../lib/adminHelpers";
import { normalizePresentationMode } from "../../../../lib/presentation";

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function sanitizeOptHtml(html) {
  if (html == null || html === "") return null;
  const s = sanitizeHtmlForStorage(html);
  return s && s !== "<p></p>" ? s : null;
}

function caseStudyData(body) {
  return {
    overview: sanitizeOptHtml(body.overview),
    role: sanitizeOptHtml(body.role),
    challenge: sanitizeOptHtml(body.challenge),
    approach: sanitizeOptHtml(body.approach),
    process: sanitizeOptHtml(body.process),
    results: sanitizeOptHtml(body.results),
    tags: normalizeTags(body.tags),
    evidencePaths: normalizePathList(body.evidencePaths),
    experienceId: optionalId(body.experienceId),
  };
}

export default async function handler(req, res) {
  const session = await requireAdmin(req, res);
  if (!session) return;

  if (req.method === "GET") {
    const projects = await prisma.project.findMany({
      include: { category: true, media: { orderBy: { sortOrder: "asc" } } },
      orderBy: { updatedAt: "desc" },
    });
    return res.status(200).json(projects);
  }

  if (req.method === "POST") {
    const {
      title,
      slug,
      description,
      client,
      tools,
      coverPath,
      featured,
      featuredOrder,
      status,
      presentationMode,
      categoryId,
      seoTitle,
      seoDescription,
      media = [],
    } = req.body || {};

    if (!title || !description || !client || !coverPath || !categoryId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const finalSlug = slugify(slug || title);
    const toolsList = Array.isArray(tools)
      ? tools
      : String(tools || "")
          .split("|")
          .map((t) => t.trim())
          .filter(Boolean);

    const project = await prisma.project.create({
      data: {
        title,
        slug: finalSlug,
        description: sanitizeHtmlForStorage(description),
        client,
        tools: toolsList,
        coverPath,
        featured: Boolean(featured),
        featuredOrder: Number(featuredOrder) || 0,
        status: status || "published",
        presentationMode: normalizePresentationMode(presentationMode),
        categoryId: Number(categoryId),
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        ...caseStudyData(req.body || {}),
        media: {
          create: (media || []).map((path, index) => ({
            path,
            alt: title,
            sortOrder: index,
          })),
        },
      },
      include: { category: true, media: true },
    });

    return res.status(201).json(project);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
