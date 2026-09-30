import { requireAdmin } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/prisma";
import { optionalId } from "../../../../../lib/adminHelpers";
import {
  isStoryBlockType,
  isProjectOnlyBlockType,
  STAT_GRID_MAX,
  STAT_GRID_MIN,
} from "../../../../../lib/story/types";

const blockInclude = {
  metric: {
    include: {
      dataPoints: { orderBy: [{ date: "asc" }, { sortOrder: "asc" }] },
    },
  },
  achievement: true,
  projectMedia: true,
  milestone: true,
  metrics: {
    orderBy: { sortOrder: "asc" },
    include: {
      metric: {
        include: {
          dataPoints: { orderBy: [{ date: "asc" }, { sortOrder: "asc" }] },
        },
      },
    },
  },
};

function parseConfig(raw) {
  if (raw == null || raw === "") return null;
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function validateBlock(type, body, storyScope) {
  if (!isStoryBlockType(type)) {
    return "invalid block type";
  }
  if (isProjectOnlyBlockType(type) && storyScope !== "project") {
    return `${type} is only available on project stories`;
  }
  if (type === "statGrid") {
    const ids = Array.isArray(body.metricIds) ? body.metricIds : [];
    if (ids.length < STAT_GRID_MIN || ids.length > STAT_GRID_MAX) {
      return `statGrid needs ${STAT_GRID_MIN}–${STAT_GRID_MAX} metrics`;
    }
  }
  if (
    (type === "quoteCard" || type === "prose") &&
    !body.body &&
    !body.title
  ) {
    return `${type} needs title or body`;
  }
  if (type === "mediaCard") {
    const mediaId = optionalId(body.projectMediaId);
    const path = body.config?.imagePath || parseConfig(body.config)?.imagePath;
    if (!mediaId && !path) {
      return "mediaCard needs projectMediaId or config.imagePath";
    }
  }
  if (type === "gallery") {
    const cfg = body.config || parseConfig(body.config) || {};
    const paths = Array.isArray(cfg.paths) ? cfg.paths.filter(Boolean) : [];
    if (!paths.length) {
      return "gallery needs at least one image path";
    }
  }
  if (type === "video") {
    const cfg = body.config || parseConfig(body.config) || {};
    if (!cfg.videoPath && !cfg.url) {
      return "video needs config.videoPath or url";
    }
  }
  if (type === "cta") {
    const cfg = body.config || parseConfig(body.config) || {};
    if (!cfg.href && !body.title) {
      return "cta needs title or config.href";
    }
  }
  // hero / toolsList may rely on project defaults — allow empty shells
  return null;
}

async function syncBlockMetrics(blockId, metricIds = []) {
  await prisma.storyBlockMetric.deleteMany({ where: { blockId } });
  const ids = (metricIds || [])
    .map((id) => Number(id))
    .filter((n) => Number.isFinite(n))
    .slice(0, STAT_GRID_MAX);
  if (!ids.length) return;
  await prisma.storyBlockMetric.createMany({
    data: ids.map((metricId, i) => ({
      blockId,
      metricId,
      sortOrder: i,
    })),
  });
}

export default async function handler(req, res) {
  const session = await requireAdmin(req, res);
  if (!session) return;

  const storyId = Number(req.query.id);
  if (!Number.isFinite(storyId)) {
    return res.status(400).json({ error: "story id required" });
  }

  const story = await prisma.story.findUnique({ where: { id: storyId } });
  if (!story) return res.status(404).json({ error: "story not found" });

  if (req.method === "GET") {
    const blocks = await prisma.storyBlock.findMany({
      where: { storyId },
      orderBy: { sortOrder: "asc" },
      include: blockInclude,
    });
    return res.status(200).json(blocks);
  }

  if (req.method === "POST") {
    const body = req.body || {};
    const type = body.type;
    const err = validateBlock(type, body, story.scope);
    if (err) return res.status(400).json({ error: err });

    const maxSort = await prisma.storyBlock.aggregate({
      where: { storyId },
      _max: { sortOrder: true },
    });
    const sortOrder =
      body.sortOrder != null
        ? Number(body.sortOrder)
        : (maxSort._max.sortOrder ?? -1) + 1;

    const row = await prisma.storyBlock.create({
      data: {
        storyId,
        type,
        sortOrder,
        title: body.title || null,
        subtitle: body.subtitle || null,
        body: body.body || null,
        config: parseConfig(body.config),
        metricId: optionalId(body.metricId),
        achievementId: optionalId(body.achievementId),
        projectMediaId: optionalId(body.projectMediaId),
        milestoneId: optionalId(body.milestoneId),
      },
    });

    if (type === "statGrid" && Array.isArray(body.metricIds)) {
      await syncBlockMetrics(row.id, body.metricIds);
    }

    const full = await prisma.storyBlock.findUnique({
      where: { id: row.id },
      include: blockInclude,
    });
    return res.status(201).json(full);
  }

  if (req.method === "PUT") {
    const body = req.body || {};

    // Reorder-only — must run before requiring block id
    if (Array.isArray(body.orderedIds)) {
      const ids = body.orderedIds.map(Number).filter(Number.isFinite);
      await prisma.$transaction(
        ids.map((id, i) =>
          prisma.storyBlock.updateMany({
            where: { id, storyId },
            data: { sortOrder: i },
          })
        )
      );
      const blocks = await prisma.storyBlock.findMany({
        where: { storyId },
        orderBy: { sortOrder: "asc" },
        include: blockInclude,
      });
      return res.status(200).json(blocks);
    }

    const blockId = Number(body.id);
    if (!blockId) return res.status(400).json({ error: "block id required" });

    const existing = await prisma.storyBlock.findFirst({
      where: { id: blockId, storyId },
    });
    if (!existing) return res.status(404).json({ error: "block not found" });

    const type = body.type || existing.type;
    const err = validateBlock(
      type,
      {
        ...existing,
        ...body,
        type,
        config:
          body.config !== undefined
            ? parseConfig(body.config)
            : existing.config,
      },
      story.scope
    );
    if (err) return res.status(400).json({ error: err });

    await prisma.storyBlock.update({
      where: { id: blockId },
      data: {
        type,
        sortOrder:
          body.sortOrder != null ? Number(body.sortOrder) : existing.sortOrder,
        title: body.title !== undefined ? body.title || null : undefined,
        subtitle:
          body.subtitle !== undefined ? body.subtitle || null : undefined,
        body: body.body !== undefined ? body.body || null : undefined,
        config:
          body.config !== undefined ? parseConfig(body.config) : undefined,
        metricId:
          body.metricId !== undefined
            ? optionalId(body.metricId)
            : undefined,
        achievementId:
          body.achievementId !== undefined
            ? optionalId(body.achievementId)
            : undefined,
        projectMediaId:
          body.projectMediaId !== undefined
            ? optionalId(body.projectMediaId)
            : undefined,
        milestoneId:
          body.milestoneId !== undefined
            ? optionalId(body.milestoneId)
            : undefined,
      },
    });

    if (type === "statGrid" && Array.isArray(body.metricIds)) {
      await syncBlockMetrics(blockId, body.metricIds);
    }

    const full = await prisma.storyBlock.findUnique({
      where: { id: blockId },
      include: blockInclude,
    });
    return res.status(200).json(full);
  }

  if (req.method === "DELETE") {
    const blockId = Number(req.body?.id || req.query.blockId);
    if (!blockId) return res.status(400).json({ error: "block id required" });
    await prisma.storyBlock.deleteMany({
      where: { id: blockId, storyId },
    });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
