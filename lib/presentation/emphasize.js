import { normalizePresentationMode } from "./types.js";

/**
 * Block types to pull earlier for modes that use light reorder.
 * Relative order within emphasized / other groups is preserved (stable).
 */
const EMPHASIS = {
  business: [
    "statGrid",
    "metricCard",
    "chartCard",
    "comparisonCard",
    "progressCard",
    "cta",
  ],
  career: ["timelineCard", "achievementCard", "toolsList", "prose"],
};

/**
 * Stable reorder: emphasized types first (in EMPHASIS list order of groups,
 * preserving relative order among emphasized blocks and among the rest).
 * Hero always stays first if present.
 */
export function orderBlocksForMode(blocks = [], mode) {
  const list = Array.isArray(blocks) ? blocks.slice() : [];
  if (!list.length) return list;

  const id = normalizePresentationMode(mode);
  const emphasis = EMPHASIS[id];
  if (!emphasis?.length) return list;

  const hero = [];
  const rest = [];
  for (const b of list) {
    if (b?.type === "hero") hero.push(b);
    else rest.push(b);
  }

  const rank = new Map(emphasis.map((t, i) => [t, i]));
  const emphasized = [];
  const other = [];
  for (const b of rest) {
    if (rank.has(b?.type)) emphasized.push(b);
    else other.push(b);
  }

  emphasized.sort((a, b) => {
    const ra = rank.get(a.type) ?? 99;
    const rb = rank.get(b.type) ?? 99;
    if (ra !== rb) return ra - rb;
    return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
  });

  return [...hero, ...emphasized, ...other];
}

export function modeUsesReorder(mode) {
  const id = normalizePresentationMode(mode);
  return Boolean(EMPHASIS[id]);
}
