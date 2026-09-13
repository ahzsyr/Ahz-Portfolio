import { requireAdmin } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
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
        description,
        client,
        tools: toolsList,
        coverPath,
        featured: Boolean(featured),
        featuredOrder: Number(featuredOrder) || 0,
        status: status || "published",
        categoryId: Number(categoryId),
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
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
