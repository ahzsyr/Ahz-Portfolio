/**
 * Story block type ids — admin-authored narrative units.
 */

export const STORY_BLOCK_TYPES = [
  "hero",
  "prose",
  "metricCard",
  "chartCard",
  "comparisonCard",
  "timelineCard",
  "statGrid",
  "progressCard",
  "quoteCard",
  "mediaCard",
  "gallery",
  "video",
  "achievementCard",
  "toolsList",
  "cta",
];

/** Types that need project context (hidden on Impact stories). */
export const PROJECT_ONLY_BLOCK_TYPES = ["hero", "toolsList"];

export const STORY_BLOCK_TYPE_LABELS = {
  hero: "Hero",
  prose: "Rich text",
  metricCard: "Metric card",
  chartCard: "Chart",
  comparisonCard: "Comparison",
  timelineCard: "Timeline",
  statGrid: "Stat grid",
  progressCard: "Progress",
  quoteCard: "Quote",
  mediaCard: "Media",
  gallery: "Image gallery",
  video: "Video",
  achievementCard: "Achievement",
  toolsList: "Tools / tech",
  cta: "CTA",
};

export const STORY_SCOPES = ["impact", "project"];

export function isStoryBlockType(type) {
  return STORY_BLOCK_TYPES.includes(type);
}

export function isProjectOnlyBlockType(type) {
  return PROJECT_ONLY_BLOCK_TYPES.includes(type);
}

export function blockTypesForScope(scope) {
  if (scope === "project") return STORY_BLOCK_TYPES.slice();
  return STORY_BLOCK_TYPES.filter((t) => !isProjectOnlyBlockType(t));
}

export const STAT_GRID_MAX = 4;
export const STAT_GRID_MIN = 2;
