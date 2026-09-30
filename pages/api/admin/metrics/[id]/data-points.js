import { requireAdmin } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/prisma";
import {
  normalizePointDate,
  validateDataPointInput,
} from "../../../../../lib/metrics";

export default async function handler(req, res) {
  const session = await requireAdmin(req, res);
  if (!session) return;

  const metricId = Number(req.query.id);
  if (!Number.isFinite(metricId)) {
    return res.status(400).json({ error: "metric id required" });
  }

  const metric = await prisma.metric.findUnique({ where: { id: metricId } });
  if (!metric) return res.status(404).json({ error: "Metric not found" });

  if (req.method === "GET") {
    const rows = await prisma.metricDataPoint.findMany({
      where: { metricId },
      orderBy: [{ date: "asc" }, { sortOrder: "asc" }],
    });
    return res.status(200).json(rows);
  }

  if (req.method === "POST") {
    const upsert = Boolean(req.body?.upsert);
    const validated = validateDataPointInput(req.body, metric);
    if (!validated.ok) {
      const status = validated.code === "DUPLICATE_DATE" ? 409 : 400;
      return res.status(status).json({ error: validated.error });
    }

    const existing = await prisma.metricDataPoint.findUnique({
      where: {
        metricId_date: {
          metricId,
          date: validated.data.date,
        },
      },
    });

    if (existing && !upsert) {
      return res.status(409).json({
        error: "duplicate date: one observation per metric per date",
        code: "DUPLICATE_DATE",
      });
    }

    if (existing && upsert) {
      const row = await prisma.metricDataPoint.update({
        where: { id: existing.id },
        data: {
          valueNumeric: validated.data.valueNumeric,
          value: validated.data.value,
          label: validated.data.label,
          metadata: validated.data.metadata,
          sortOrder: validated.data.sortOrder,
        },
      });
      return res.status(200).json(row);
    }

    try {
      const row = await prisma.metricDataPoint.create({
        data: {
          metricId,
          ...validated.data,
        },
      });
      return res.status(201).json(row);
    } catch (err) {
      if (err?.code === "P2002") {
        return res.status(409).json({
          error: "duplicate date: one observation per metric per date",
          code: "DUPLICATE_DATE",
        });
      }
      throw err;
    }
  }

  if (req.method === "PUT") {
    const pointId = Number(req.body?.id);
    if (!pointId) return res.status(400).json({ error: "point id required" });

    const existing = await prisma.metricDataPoint.findFirst({
      where: { id: pointId, metricId },
    });
    if (!existing) return res.status(404).json({ error: "Data point not found" });

    const validated = validateDataPointInput(req.body, metric);
    if (!validated.ok) {
      return res.status(400).json({ error: validated.error });
    }

    // If date changed, ensure uniqueness
    const newDate = validated.data.date;
    const oldKey = normalizePointDate(existing.date)?.toISOString();
    const newKey = newDate.toISOString();
    if (oldKey !== newKey) {
      const clash = await prisma.metricDataPoint.findUnique({
        where: { metricId_date: { metricId, date: newDate } },
      });
      if (clash && clash.id !== pointId) {
        return res.status(409).json({
          error: "duplicate date: one observation per metric per date",
          code: "DUPLICATE_DATE",
        });
      }
    }

    try {
      const row = await prisma.metricDataPoint.update({
        where: { id: pointId },
        data: validated.data,
      });
      return res.status(200).json(row);
    } catch (err) {
      if (err?.code === "P2002") {
        return res.status(409).json({
          error: "duplicate date: one observation per metric per date",
          code: "DUPLICATE_DATE",
        });
      }
      throw err;
    }
  }

  if (req.method === "DELETE") {
    const pointId = Number(req.body?.id || req.query.pointId);
    if (!pointId) return res.status(400).json({ error: "point id required" });
    const existing = await prisma.metricDataPoint.findFirst({
      where: { id: pointId, metricId },
    });
    if (!existing) return res.status(404).json({ error: "Data point not found" });
    await prisma.metricDataPoint.delete({ where: { id: pointId } });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
