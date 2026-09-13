import { requireAdmin } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export default async function handler(req, res) {
  const session = await requireAdmin(req, res);
  if (!session) return;

  if (req.method === "GET") {
    const rows = await prisma.experience.findMany({ orderBy: { sortOrder: "asc" } });
    return res.status(200).json(rows);
  }

  if (req.method === "POST") {
    const { position, company, period, bullets, sortOrder } = req.body || {};
    const row = await prisma.experience.create({
      data: {
        position,
        company,
        period,
        bullets: Array.isArray(bullets) ? bullets : [],
        sortOrder: Number(sortOrder) || 0,
      },
    });
    return res.status(201).json(row);
  }

  if (req.method === "PUT") {
    const { id, position, company, period, bullets, sortOrder } = req.body || {};
    const row = await prisma.experience.update({
      where: { id: Number(id) },
      data: {
        position,
        company,
        period,
        bullets: Array.isArray(bullets) ? bullets : [],
        sortOrder: Number(sortOrder) || 0,
      },
    });
    return res.status(200).json(row);
  }

  if (req.method === "DELETE") {
    const id = Number(req.body?.id || req.query.id);
    await prisma.experience.delete({ where: { id } });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
