import { requireAdmin } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import {
  optionalDate,
  optionalFloat,
  optionalId,
} from "../../../../lib/adminHelpers";
import {
  METRIC_TYPES,
  PERIODS,
  validateMetricInput,
} from "../../../../lib/metrics";

function metricData(body) {
  const {
    name,
    label,
    value,
    valueNumeric,
    unit,
    type,
    prefix,
    suffix,
    startValue,
    endValue,
    date,
    category,
    visibility,
    featured,
    sortOrder,
    metricGroupId,
    projectId,
    experienceId,
    achievementId,
    period,
    trendPreference,
    previousNumeric,
    targetNumeric,
    baselineNumeric,
    decimals,
    compact,
    percentScale,
    ratingMax,
  } = body || {};

  const validated = validateMetricInput({
    name,
    value:
      value != null && String(value).trim() !== ""
        ? value
        : valueNumeric != null
          ? String(valueNumeric)
          : "",
    valueNumeric,
    type,
    period,
    trendPreference,
    percentScale,
    ratingMax,
    date,
    previousNumeric,
    targetNumeric,
    baselineNumeric,
  });

  if (!validated.ok) {
    return { error: validated.error };
  }

  return {
    data: {
      name,
      label: label || null,
      value:
        value != null && String(value).trim() !== ""
          ? String(value)
          : String(valueNumeric),
      valueNumeric: optionalFloat(valueNumeric),
      unit: unit || null,
      type: validated.data.type,
      prefix: prefix || null,
      suffix: suffix || null,
      startValue: startValue || null,
      endValue: endValue || null,
      date: optionalDate(date),
      category: category || null,
      visibility: visibility === "admin" ? "admin" : "public",
      featured: Boolean(featured),
      sortOrder: Number(sortOrder) || 0,
      metricGroupId: optionalId(metricGroupId),
      projectId: optionalId(projectId),
      experienceId: optionalId(experienceId),
      achievementId: optionalId(achievementId),
      period: validated.data.period,
      trendPreference: validated.data.trendPreference,
      previousNumeric: optionalFloat(previousNumeric),
      targetNumeric: optionalFloat(targetNumeric),
      baselineNumeric: optionalFloat(baselineNumeric),
      decimals:
        decimals === null || decimals === undefined || decimals === ""
          ? null
          : Number(decimals),
      compact: Boolean(compact),
      percentScale: validated.data.percentScale,
      ratingMax: optionalFloat(ratingMax),
    },
  };
}

export default async function handler(req, res) {
  const session = await requireAdmin(req, res);
  if (!session) return;

  if (req.method === "GET") {
    const rows = await prisma.metric.findMany({
      include: {
        metricGroup: { select: { id: true, name: true } },
        project: { select: { id: true, title: true } },
        experience: { select: { id: true, position: true, company: true } },
        achievement: { select: { id: true, title: true } },
        dataPoints: { orderBy: [{ date: "asc" }, { sortOrder: "asc" }] },
        _count: { select: { dataPoints: true } },
      },
      orderBy: { sortOrder: "asc" },
    });
    return res.status(200).json({
      metrics: rows,
      meta: { types: METRIC_TYPES, periods: PERIODS },
    });
  }

  if (req.method === "POST") {
    const parsed = metricData(req.body);
    if (parsed.error) return res.status(400).json({ error: parsed.error });
    const row = await prisma.metric.create({ data: parsed.data });
    return res.status(201).json(row);
  }

  if (req.method === "PUT") {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: "id required" });
    const parsed = metricData(req.body);
    if (parsed.error) return res.status(400).json({ error: parsed.error });
    const row = await prisma.metric.update({
      where: { id: Number(id) },
      data: parsed.data,
    });
    return res.status(200).json(row);
  }

  if (req.method === "DELETE") {
    const id = Number(req.body?.id || req.query.id);
    if (!id) return res.status(400).json({ error: "id required" });
    await prisma.metric.delete({ where: { id } });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
