import { requireAdmin } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export default async function handler(req, res) {
  const session = await requireAdmin(req, res);
  if (!session) return;

  if (req.method === "GET") {
    const rows = await prisma.skill.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return res.status(200).json(rows);
  }

  if (req.method === "POST") {
    const { name, category, level, sortOrder, featured } = req.body || {};
    if (!name) return res.status(400).json({ error: "name required" });
    const row = await prisma.skill.create({
      data: {
        name,
        category: category || null,
        level: level || null,
        sortOrder: Number(sortOrder) || 0,
        featured: Boolean(featured),
      },
    });
    return res.status(201).json(row);
  }

  if (req.method === "PUT") {
    const { id, name, category, level, sortOrder, featured } = req.body || {};
    if (!id) return res.status(400).json({ error: "id required" });
    const row = await prisma.skill.update({
      where: { id: Number(id) },
      data: {
        name,
        category: category || null,
        level: level || null,
        sortOrder: Number(sortOrder) || 0,
        featured: Boolean(featured),
      },
    });
    return res.status(200).json(row);
  }

  if (req.method === "DELETE") {
    const id = Number(req.body?.id || req.query.id);
    if (!id) return res.status(400).json({ error: "id required" });
    await prisma.skill.delete({ where: { id } });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
