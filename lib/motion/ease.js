/** Pure easing helpers — safe for unit tests (no DOM). */

export function easeOutCubic(t) {
  const x = Math.min(1, Math.max(0, t));
  return 1 - (1 - x) ** 3;
}

/**
 * Interpolate toward a target with ease-out.
 * @returns {{ value: number, done: boolean }}
 */
export function interpolateCount(progress, from, to) {
  const t = easeOutCubic(progress);
  const value = from + (to - from) * t;
  return { value, done: progress >= 1 };
}

export function clamp01(n) {
  if (!Number.isFinite(n)) return 0;
  return Math.min(1, Math.max(0, n));
}
