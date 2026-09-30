import { requireAdmin } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { slugify } from "../../../../lib/adminHelpers";

export default async function handler(req, res) {
  const session = await requireAdmin(req, res);
  if (!session) return;

  if (req.method === "GET") {
    const rows = await prisma.metricGroup.findMany({
      include: { _count: { select: { metrics: true } } },
      orderBy: { sortOrder: "asc" },
    });
    return res.status(200).json(rows);
  }

  if (req.method === "POST") {
    const { name, description, sortOrder, visibility } = req.body || {};
    if (!name) return res.status(400).json({ error: "Name required" });
    const row = await prisma.metricGroup.create({
      data: {
        name,
        slug: slugify(name),
        description: description || null,
        sortOrder: Number(sortOrder) || 0,
        visibility: visibility === "admin" ? "admin" : "public",
      },
    });
    return res.status(201).json(row);
  }

  if (req.method === "PUT") {
    const { id, name, description, sortOrder, visibility } = req.body || {};
    if (!id) return res.status(400).json({ error: "id required" });
    const row = await prisma.metricGroup.update({
      where: { id: Number(id) },
      data: {
        ...(name != null
          ? { name, slug: slugify(name) }
          : {}),
        description: description !== undefined ? description || null : undefined,
        sortOrder:
          sortOrder !== undefined ? Number(sortOrder) || 0 : undefined,
        visibility:
          visibility !== undefined
            ? visibility === "admin"
              ? "admin"
              : "public"
            : undefined,
      },
    });
    return res.status(200).json(row);
  }

  if (req.method === "DELETE") {
    const id = Number(req.body?.id || req.query.id);
    if (!id) return res.status(400).json({ error: "id required" });
    // Metrics keep SetNull on metricGroupId — group delete does not wipe metrics
    await prisma.metricGroup.delete({ where: { id } });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
