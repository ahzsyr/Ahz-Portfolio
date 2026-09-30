/**
 * Shared helpers for admin import commit/preview (Prisma-backed context).
 */

import { prisma } from "../prisma";
import { normalizePointDate } from "../metrics/validate";

export async function loadMetricsImportContext() {
  const metrics = await prisma.metric.findMany({
    include: { dataPoints: { select: { date: true } } },
  });

  const metricsByName = new Map();
  const existingDatesByMetricId = new Map();

  for (const m of metrics) {
    metricsByName.set(String(m.name).toLowerCase().trim(), m);
    const keys = (m.dataPoints || [])
      .map((p) => normalizePointDate(p.date)?.toISOString())
      .filter(Boolean);
    existingDatesByMetricId.set(m.id, keys);
  }

  return { metrics, metricsByName, existingDatesByMetricId };
}

export async function loadAchievementsImportContext() {
  const achievements = await prisma.achievement.findMany();
  const bySlug = new Map();
  const byTitle = new Map();
  for (const a of achievements) {
    bySlug.set(a.slug, a);
    byTitle.set(String(a.title).toLowerCase().trim(), a);
  }
  return { achievements, bySlug, byTitle };
}

/**
 * Resolve or create metrics by name, then upsert data points from valid preview rows.
 */
export async function commitMetricsImport(validRows, options = {}) {
  const createMissing = options.createMissingMetrics !== false;
  const upsert = options.upsert !== false;

  const { metricsByName } = await loadMetricsImportContext();
  const nameToId = new Map();
  for (const [k, m] of metricsByName) {
    nameToId.set(k, m.id);
  }

  let pointsCreated = 0;
  let pointsUpdated = 0;
  let metricsCreated = 0;

  // Create missing metrics first (unique names from valid rows)
  const missingNames = [];
  for (const row of validRows) {
    const key = String(row.data.metricName).toLowerCase().trim();
    if (!nameToId.has(key) && !missingNames.includes(key)) {
      missingNames.push(key);
    }
  }

  if (missingNames.length && !createMissing) {
    return {
      ok: false,
      error: "missing metrics and createMissingMetrics is false",
    };
  }

  await prisma.$transaction(async (tx) => {
    for (const key of missingNames) {
      const sample = validRows.find(
        (r) => String(r.data.metricName).toLowerCase().trim() === key
      );
      const name = sample?.data?.metricName || key;
      const latestValue =
        sample?.data?.value ??
        (sample?.data?.valueNumeric != null
          ? String(sample.data.valueNumeric)
          : "0");
      const created = await tx.metric.create({
        data: {
          name,
          value: latestValue,
          valueNumeric:
            sample?.data?.valueNumeric != null
              ? Number(sample.data.valueNumeric)
              : null,
          type: "count",
          visibility: "public",
        },
      });
      nameToId.set(key, created.id);
      metricsCreated += 1;
    }

    for (const row of validRows) {
      const key = String(row.data.metricName).toLowerCase().trim();
      const metricId = nameToId.get(key);
      if (!metricId) continue;

      const date = row.data.date instanceof Date
        ? row.data.date
        : new Date(row.data.date);

      const existing = await tx.metricDataPoint.findUnique({
        where: { metricId_date: { metricId, date } },
      });

      const payload = {
        valueNumeric: row.data.valueNumeric,
        value: row.data.value,
        label: row.data.label,
        metadata: row.data.metadata ?? null,
        sortOrder: row.data.sortOrder || 0,
      };

      if (existing) {
        if (!upsert) continue;
        await tx.metricDataPoint.update({
          where: { id: existing.id },
          data: payload,
        });
        pointsUpdated += 1;
      } else {
        await tx.metricDataPoint.create({
          data: { metricId, date, ...payload },
        });
        pointsCreated += 1;
      }
    }

    // Refresh metric snapshot value from latest imported point per metric
    for (const [, metricId] of nameToId) {
      const latest = await tx.metricDataPoint.findFirst({
        where: { metricId },
        orderBy: { date: "desc" },
      });
      if (latest) {
        await tx.metric.update({
          where: { id: metricId },
          data: {
            value:
              latest.value ||
              (latest.valueNumeric != null
                ? String(latest.valueNumeric)
                : undefined),
            valueNumeric: latest.valueNumeric,
            date: latest.date,
          },
        });
      }
    }
  });

  return {
    ok: true,
    result: { pointsCreated, pointsUpdated, metricsCreated },
  };
}

export async function commitAchievementsImport(validRows, options = {}) {
  const upsert = options.upsert !== false;
  let created = 0;
  let updated = 0;

  await prisma.$transaction(async (tx) => {
    for (const row of validRows) {
      const data = {
        title: row.data.title,
        slug: row.data.slug,
        description: row.data.description,
        type: row.data.type,
        date: row.data.date,
        category: row.data.category,
        featured: Boolean(row.data.featured),
        sortOrder: Number(row.data.sortOrder) || 0,
        status: row.data.status === "draft" ? "draft" : "published",
        projectId: row.data.projectId,
        experienceId: row.data.experienceId,
      };

      if (row.existingId && upsert) {
        await tx.achievement.update({
          where: { id: row.existingId },
          data,
        });
        updated += 1;
      } else if (!row.existingId) {
        await tx.achievement.create({ data });
        created += 1;
      }
    }
  });

  return { ok: true, result: { created, updated } };
}
