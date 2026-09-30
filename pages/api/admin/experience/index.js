import { requireAdmin } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

function optionalYear(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export default async function handler(req, res) {
  const session = await requireAdmin(req, res);
  if (!session) return;

  if (req.method === "GET") {
    const rows = await prisma.experience.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return res.status(200).json(rows);
  }

  if (req.method === "POST") {
    const {
      position,
      company,
      period,
      bullets,
      sortOrder,
      startYear,
      endYear,
      domain,
    } = req.body || {};
    const row = await prisma.experience.create({
      data: {
        position,
        company,
        period,
        bullets: Array.isArray(bullets) ? bullets : [],
        sortOrder: Number(sortOrder) || 0,
        startYear: optionalYear(startYear),
        endYear: optionalYear(endYear),
        domain: domain || null,
      },
    });
    return res.status(201).json(row);
  }

  if (req.method === "PUT") {
    const {
      id,
      position,
      company,
      period,
      bullets,
      sortOrder,
      startYear,
      endYear,
      domain,
    } = req.body || {};
    const row = await prisma.experience.update({
      where: { id: Number(id) },
      data: {
        position,
        company,
        period,
        bullets: Array.isArray(bullets) ? bullets : [],
        sortOrder: Number(sortOrder) || 0,
        startYear: optionalYear(startYear),
        endYear: optionalYear(endYear),
        domain: domain || null,
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
