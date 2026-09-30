import { requireAdmin } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import {
  optionalDate,
  optionalId,
  slugify,
} from "../../../../lib/adminHelpers";

function achievementData(body) {
  const {
    title,
    description,
    type,
    date,
    category,
    featured,
    sortOrder,
    status,
    projectId,
    experienceId,
  } = body || {};

  return {
    title,
    slug: slugify(title || "achievement"),
    description: description || "",
    type: type || "general",
    date: optionalDate(date),
    category: category || null,
    featured: Boolean(featured),
    sortOrder: Number(sortOrder) || 0,
    status: status === "draft" ? "draft" : "published",
    projectId: optionalId(projectId),
    experienceId: optionalId(experienceId),
  };
}

export default async function handler(req, res) {
  const session = await requireAdmin(req, res);
  if (!session) return;

  if (req.method === "GET") {
    const rows = await prisma.achievement.findMany({
      include: {
        project: { select: { id: true, title: true } },
        experience: { select: { id: true, position: true, company: true } },
        _count: { select: { metrics: true } },
      },
      orderBy: { sortOrder: "asc" },
    });
    return res.status(200).json(rows);
  }

  if (req.method === "POST") {
    const data = achievementData(req.body);
    if (!data.title) return res.status(400).json({ error: "title required" });
    const row = await prisma.achievement.create({ data });
    return res.status(201).json(row);
  }

  if (req.method === "PUT") {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: "id required" });
    const data = achievementData(req.body);
    if (!data.title) return res.status(400).json({ error: "title required" });
    const row = await prisma.achievement.update({
      where: { id: Number(id) },
      data,
    });
    return res.status(200).json(row);
  }

  if (req.method === "DELETE") {
    const id = Number(req.body?.id || req.query.id);
    if (!id) return res.status(400).json({ error: "id required" });
    // Metrics keep SetNull on achievementId
    await prisma.achievement.delete({ where: { id } });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
