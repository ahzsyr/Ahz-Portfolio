/**
 * Pure story composer: StoryBlock rows + hydrated entities → card descriptors.
 * No React, no Prisma — pages/admin pass already-mapped DTOs.
 */

import {
  isStoryBlockType,
  STAT_GRID_MAX,
  STAT_GRID_MIN,
} from "./types.js";
import {
  selectMetricVisualization,
  toKpiConfig,
  toComparisonConfig,
  toProgressConfig,
  toTimelineConfig,
} from "../viz/adapters.js";
import { orderBlocksForMode } from "../presentation/emphasize.js";
import { normalizePresentationMode } from "../presentation/types.js";

function parseConfig(raw) {
  if (!raw || typeof raw !== "object") return {};
  return raw;
}

function metricFromBlock(block, metricsById) {
  if (block.metric) return block.metric;
  if (block.metricId != null && metricsById?.[block.metricId]) {
    return metricsById[block.metricId];
  }
  return null;
}

function metricsFromBlock(block, metricsById) {
  const links = Array.isArray(block.metrics) ? block.metrics : [];
  const fromLinks = links
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((link) => link.metric || metricsById?.[link.metricId])
    .filter(Boolean);

  if (fromLinks.length) return fromLinks.slice(0, STAT_GRID_MAX);

  const single = metricFromBlock(block, metricsById);
  return single ? [single] : [];
}

function projectTools(project) {
  if (!project) return [];
  if (Array.isArray(project.toolsList) && project.toolsList.length) {
    return project.toolsList;
  }
  if (typeof project.tools === "string") {
    return project.tools.split("|").map((t) => t.trim()).filter(Boolean);
  }
  if (Array.isArray(project.tools)) return project.tools.filter(Boolean);
  return [];
}

function projectTags(project) {
  if (!project) return [];
  if (Array.isArray(project.tags) && project.tags.length) return project.tags;
  if (project.category) return [project.category];
  return [];
}

/**
 * @param {object[]} blocks - story blocks (hydrated relations optional)
 * @param {object} [context]
 * @param {Record<number, object>} [context.metricsById]
 * @param {object[]} [context.milestones]
 * @param {object} [context.project] - mapped project for hero/tools defaults
 * @param {string} [context.presentationMode]
 * @param {boolean} [options.warn]
 * @returns {{ key: string, cardType: string, props: object }[]}
 */
export function composeBlocks(blocks = [], context = {}, options = {}) {
  const { warn = false } = options;
  const metricsById = context.metricsById || {};
  const milestones = context.milestones || [];
  const project = context.project || null;
  const presentationMode = normalizePresentationMode(
    context.presentationMode || project?.presentationMode
  );
  const out = [];

  const sorted = Array.isArray(blocks)
    ? blocks.slice().sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    : [];
  const list = orderBlocksForMode(sorted, presentationMode);

  for (const block of list) {
    const type = block?.type;
    if (!isStoryBlockType(type)) {
      if (warn) console.warn(`[story] unknown block type: ${type}`);
      continue;
    }

    const config = parseConfig(block.config);
    const key = String(block.id ?? `${type}-${block.sortOrder}`);
    const title = block.title || null;
    const subtitle = block.subtitle || null;
    const body = block.body || null;

    if (type === "hero") {
      const image =
        config.imagePath || project?.image || project?.coverPath || null;
      const resolvedTitle = title || project?.title || null;
      const tags = Array.isArray(config.tags)
        ? config.tags
        : projectTags(project);
      if (!resolvedTitle && !image) continue;
      out.push({
        key,
        cardType: "hero",
        props: {
          title: resolvedTitle,
          subtitle: subtitle || null,
          client: config.client || project?.client || null,
          image,
          tags,
          projectId: project?.id ?? null,
        },
      });
      continue;
    }

    if (type === "gallery") {
      const raw = Array.isArray(config.paths) ? config.paths : [];
      const paths = raw
        .map((entry) => {
          if (typeof entry === "string" && entry) return entry;
          if (entry && typeof entry === "object") {
            const src = entry.src || entry.path || entry.url;
            if (!src) return null;
            return {
              src,
              caption: entry.caption || entry.title || "",
              alt: entry.alt || "",
            };
          }
          return null;
        })
        .filter(Boolean);
      if (!paths.length) continue;
      out.push({
        key,
        cardType: "gallery",
        props: { title, subtitle, paths },
      });
      continue;
    }

    if (type === "video") {
      const src = config.videoPath || config.url || null;
      if (!src) continue;
      out.push({
        key,
        cardType: "video",
        props: { title, subtitle, src },
      });
      continue;
    }

    if (type === "toolsList") {
      const fromConfig = Array.isArray(config.tools)
        ? config.tools.map((t) => String(t).trim()).filter(Boolean)
        : [];
      const tools = fromConfig.length ? fromConfig : projectTools(project);
      if (!tools.length) continue;
      out.push({
        key,
        cardType: "toolsList",
        props: {
          title: title || "Tools",
          subtitle,
          tools,
        },
      });
      continue;
    }

    if (type === "cta") {
      const href = config.href || null;
      const label = config.label || null;
      if (!href && !title) continue;
      out.push({
        key,
        cardType: "cta",
        props: { title, body, href, label },
      });
      continue;
    }

    if (type === "prose") {
      if (!body && !title) continue;
      out.push({
        key,
        cardType: "prose",
        props: { title, subtitle, body },
      });
      continue;
    }

    if (type === "quoteCard") {
      if (!body) continue;
      out.push({
        key,
        cardType: "quoteCard",
        props: { body, attribution: subtitle, title },
      });
      continue;
    }

    if (type === "mediaCard") {
      const media = block.projectMedia || null;
      const src = media?.path || config.imagePath || null;
      if (!src) continue;
      out.push({
        key,
        cardType: "mediaCard",
        props: {
          title,
          subtitle,
          src,
          alt: media?.alt || config.alt || title || "",
        },
      });
      continue;
    }

    if (type === "achievementCard") {
      const achievement =
        block.achievement ||
        (block.achievementId != null
          ? context.achievementsById?.[block.achievementId]
          : null);
      if (!achievement) continue;
      out.push({
        key,
        cardType: "achievementCard",
        props: {
          title: title || achievement.title,
          subtitle,
          achievement,
        },
      });
      continue;
    }

    if (type === "statGrid") {
      const metrics = metricsFromBlock(block, metricsById);
      if (metrics.length < STAT_GRID_MIN) continue;
      out.push({
        key,
        cardType: "statGrid",
        props: {
          title,
          subtitle,
          metrics: metrics.slice(0, STAT_GRID_MAX),
          columns: Math.min(
            Number(config.columns) || metrics.length,
            STAT_GRID_MAX
          ),
        },
      });
      continue;
    }

    if (type === "metricCard") {
      const metric = metricFromBlock(block, metricsById);
      if (!metric) continue;
      out.push({
        key,
        cardType: "metricCard",
        props: {
          title: title || metric.label || metric.name,
          subtitle,
          metric,
          kpiConfig: toKpiConfig(metric),
        },
      });
      continue;
    }

    if (type === "chartCard") {
      const metric = metricFromBlock(block, metricsById);
      if (!metric) continue;
      const preferred =
        config.preferredSeriesType === "line" ||
        config.preferredSeriesType === "bar"
          ? config.preferredSeriesType
          : "area";
      const viz = selectMetricVisualization(metric, {
        preferredSeriesType: preferred,
      });
      out.push({
        key,
        cardType: "chartCard",
        props: {
          title: title || metric.label || metric.name,
          subtitle,
          type: viz.type,
          data: viz.data,
          config: {
            ...viz.config,
            tableFallback: config.showTable !== false,
          },
        },
      });
      continue;
    }

    if (type === "comparisonCard") {
      const metric = metricFromBlock(block, metricsById);
      if (!metric) continue;
      out.push({
        key,
        cardType: "comparisonCard",
        props: {
          title: title || metric.label || metric.name,
          subtitle,
          metric,
          comparisonConfig: toComparisonConfig(metric),
        },
      });
      continue;
    }

    if (type === "progressCard") {
      const metric = metricFromBlock(block, metricsById);
      if (!metric) continue;
      out.push({
        key,
        cardType: "progressCard",
        props: {
          title: title || metric.label || metric.name,
          subtitle,
          metric,
          progressConfig: toProgressConfig(metric),
        },
      });
      continue;
    }

    if (type === "timelineCard") {
      let items = [];
      if (Array.isArray(config.milestoneIds) && config.milestoneIds.length) {
        const byId = Object.fromEntries(
          milestones.map((m) => [m.id, m])
        );
        items = config.milestoneIds.map((id) => byId[id]).filter(Boolean);
      } else if (block.milestone) {
        items = [block.milestone];
      } else if (block.milestoneId != null) {
        const hit = milestones.find((m) => m.id === block.milestoneId);
        if (hit) items = [hit];
      } else if (milestones.length) {
        items = milestones;
      }

      const timeline = toTimelineConfig(items);
      if (timeline.config.empty && !body) continue;

      out.push({
        key,
        cardType: "timelineCard",
        props: {
          title: title || "Milestones",
          subtitle,
          type: timeline.type,
          data: timeline.data,
          config: timeline.config,
        },
      });
      continue;
    }
  }

  return out;
}

export function storyHasBlocks(story) {
  return Boolean(story?.blocks?.length);
}

/** Public project page: published story that composes to at least one card. */
export function shouldRenderProjectStory(project) {
  const story = project?.story;
  if (!story) return false;
  if (story.status && story.status !== "published") return false;
  if (!storyHasBlocks(story)) return false;
  return composeBlocks(story.blocks, { project }).length > 0;
}
