import { requireAdmin } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import {
  flattenMetricsForCsv,
  metricsPointsToCsv,
} from "../../../../lib/export";

export default async function handler(req, res) {
  const session = await requireAdmin(req, res);
  if (!session) return;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const format = String(req.query.format || "json").toLowerCase();
  const metrics = await prisma.metric.findMany({
    include: { dataPoints: { orderBy: { date: "asc" } } },
    orderBy: { sortOrder: "asc" },
  });

  const stamp = new Date().toISOString().slice(0, 10);

  if (format === "csv") {
    const points = flattenMetricsForCsv(metrics);
    const csv = metricsPointsToCsv(points);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="metrics-${stamp}.csv"`
    );
    return res.status(200).send(csv);
  }

  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="metrics-${stamp}.json"`
  );
  return res.status(200).send(JSON.stringify({ metrics }, null, 2));
}
