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

  const id = Number(req.query.id);
  if (!id) return res.status(400).json({ error: "Invalid id" });

  if (req.method === "GET") {
    const project = await prisma.project.findUnique({
      where: { id },
      include: { category: true, media: { orderBy: { sortOrder: "asc" } } },
    });
    if (!project) return res.status(404).json({ error: "Not found" });
    return res.status(200).json(project);
  }

  if (req.method === "PUT") {
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

    const toolsList = Array.isArray(tools)
      ? tools
      : String(tools || "")
          .split("|")
          .map((t) => t.trim())
          .filter(Boolean);

    await prisma.projectMedia.deleteMany({ where: { projectId: id } });

    const project = await prisma.project.update({
      where: { id },
      data: {
        title,
        slug: slugify(slug || title),
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

    return res.status(200).json(project);
  }

  if (req.method === "DELETE") {
    await prisma.project.delete({ where: { id } });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
