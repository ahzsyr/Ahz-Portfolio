import { requireAdmin } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export default async function handler(req, res) {
  const session = await requireAdmin(req, res);
  if (!session) return;

  if (req.method === "GET") {
    const rows = await prisma.education.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return res.status(200).json(rows);
  }

  if (req.method === "POST") {
    const { institution, degree, field, period, description, sortOrder } =
      req.body || {};
    if (!institution || !degree || !period) {
      return res
        .status(400)
        .json({ error: "institution, degree, and period required" });
    }
    const row = await prisma.education.create({
      data: {
        institution,
        degree,
        field: field || null,
        period,
        description: description || null,
        sortOrder: Number(sortOrder) || 0,
      },
    });
    return res.status(201).json(row);
  }

  if (req.method === "PUT") {
    const { id, institution, degree, field, period, description, sortOrder } =
      req.body || {};
    if (!id) return res.status(400).json({ error: "id required" });
    const row = await prisma.education.update({
      where: { id: Number(id) },
      data: {
        institution,
        degree,
        field: field || null,
        period,
        description: description || null,
        sortOrder: Number(sortOrder) || 0,
      },
    });
    return res.status(200).json(row);
  }

  if (req.method === "DELETE") {
    const id = Number(req.body?.id || req.query.id);
    if (!id) return res.status(400).json({ error: "id required" });
    await prisma.education.delete({ where: { id } });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
