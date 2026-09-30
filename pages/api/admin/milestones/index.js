import { requireAdmin } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { optionalDate } from "../../../../lib/adminHelpers";

export default async function handler(req, res) {
  const session = await requireAdmin(req, res);
  if (!session) return;

  if (req.method === "GET") {
    const rows = await prisma.milestone.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return res.status(200).json(rows);
  }

  if (req.method === "POST") {
    const { title, date, description, type, sortOrder, featured } =
      req.body || {};
    if (!title) return res.status(400).json({ error: "title required" });
    const row = await prisma.milestone.create({
      data: {
        title,
        date: optionalDate(date),
        description: description || null,
        type: type || null,
        sortOrder: Number(sortOrder) || 0,
        featured: Boolean(featured),
      },
    });
    return res.status(201).json(row);
  }

  if (req.method === "PUT") {
    const { id, title, date, description, type, sortOrder, featured } =
      req.body || {};
    if (!id) return res.status(400).json({ error: "id required" });
    const row = await prisma.milestone.update({
      where: { id: Number(id) },
      data: {
        title,
        date: optionalDate(date),
        description: description || null,
        type: type || null,
        sortOrder: Number(sortOrder) || 0,
        featured: Boolean(featured),
      },
    });
    return res.status(200).json(row);
  }

  if (req.method === "DELETE") {
    const id = Number(req.body?.id || req.query.id);
    if (!id) return res.status(400).json({ error: "id required" });
    await prisma.milestone.delete({ where: { id } });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
