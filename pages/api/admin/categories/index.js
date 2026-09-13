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
    const categories = await prisma.category.findMany({
      include: { _count: { select: { projects: true } } },
      orderBy: { sortOrder: "asc" },
    });
    return res.status(200).json(categories);
  }

  if (req.method === "POST") {
    const { name, sortOrder } = req.body || {};
    if (!name) return res.status(400).json({ error: "Name required" });
    const category = await prisma.category.create({
      data: {
        name,
        slug: slugify(name),
        sortOrder: Number(sortOrder) || 0,
      },
    });
    return res.status(201).json(category);
  }

  if (req.method === "PUT") {
    const { id, name, sortOrder } = req.body || {};
    const category = await prisma.category.update({
      where: { id: Number(id) },
      data: {
        name,
        slug: slugify(name),
        sortOrder: Number(sortOrder) || 0,
      },
    });
    return res.status(200).json(category);
  }

  if (req.method === "DELETE") {
    const id = Number(req.body?.id || req.query.id);
    const count = await prisma.project.count({ where: { categoryId: id } });
    if (count > 0) {
      return res.status(400).json({ error: "Category is in use by projects" });
    }
    await prisma.category.delete({ where: { id } });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
