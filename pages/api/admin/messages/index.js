import { requireAdmin } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export default async function handler(req, res) {
  const session = await requireAdmin(req, res);
  if (!session) return;

  if (req.method === "GET") {
    const messages = await prisma.message.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json(messages);
  }

  if (req.method === "PUT") {
    const { id, read } = req.body || {};
    const message = await prisma.message.update({
      where: { id: Number(id) },
      data: { read: Boolean(read) },
    });
    return res.status(200).json(message);
  }

  if (req.method === "DELETE") {
    const id = Number(req.body?.id || req.query.id);
    await prisma.message.delete({ where: { id } });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
