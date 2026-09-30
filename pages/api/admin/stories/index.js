import { requireAdmin } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { optionalId } from "../../../../lib/adminHelpers";

const storyListInclude = {
  project: { select: { id: true, title: true, slug: true } },
  _count: { select: { blocks: true } },
};

export default async function handler(req, res) {
  const session = await requireAdmin(req, res);
  if (!session) return;

  if (req.method === "GET") {
    const rows = await prisma.story.findMany({
      include: storyListInclude,
      orderBy: [{ scope: "asc" }, { updatedAt: "desc" }],
    });
    return res.status(200).json(rows);
  }

  if (req.method === "POST") {
    const { scope, projectId, title, status } = req.body || {};
    if (scope !== "impact" && scope !== "project") {
      return res.status(400).json({ error: "scope must be impact or project" });
    }

    if (scope === "impact") {
      const existing = await prisma.story.findFirst({
        where: { scope: "impact", slug: "impact" },
      });
      if (existing) {
        return res.status(400).json({ error: "Impact story already exists" });
      }
      const row = await prisma.story.create({
        data: {
          slug: "impact",
          scope: "impact",
          title: title || "Impact",
          status: status === "published" ? "published" : "draft",
        },
        include: storyListInclude,
      });
      return res.status(201).json(row);
    }

    const pid = optionalId(projectId);
    if (!pid) {
      return res.status(400).json({ error: "projectId required for project story" });
    }
    const project = await prisma.project.findUnique({ where: { id: pid } });
    if (!project) return res.status(404).json({ error: "project not found" });

    const existing = await prisma.story.findUnique({
      where: { projectId: pid },
    });
    if (existing) {
      return res.status(400).json({ error: "Project already has a story" });
    }

    const row = await prisma.story.create({
      data: {
        slug: `project-${pid}`,
        scope: "project",
        projectId: pid,
        title: title || project.title,
        status: status === "published" ? "published" : "draft",
      },
      include: storyListInclude,
    });
    return res.status(201).json(row);
  }

  if (req.method === "PUT") {
    const { id, title, status } = req.body || {};
    if (!id) return res.status(400).json({ error: "id required" });
    const data = {};
    if (title !== undefined) data.title = title || null;
    if (status !== undefined) {
      data.status = status === "published" ? "published" : "draft";
    }
    const row = await prisma.story.update({
      where: { id: Number(id) },
      data,
      include: storyListInclude,
    });
    return res.status(200).json(row);
  }

  if (req.method === "DELETE") {
    const id = Number(req.body?.id || req.query.id);
    if (!id) return res.status(400).json({ error: "id required" });
    await prisma.story.delete({ where: { id } });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
