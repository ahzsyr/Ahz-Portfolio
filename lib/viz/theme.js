/**
 * Read CSS custom properties for Recharts styling (SSR-safe defaults).
 */

const DEFAULTS = {
  fg: "#0f172a",
  muted: "#64748b",
  grid: "#e2e8f0",
  series1: "#2563eb",
  series2: "#1e3a8a",
  positive: "#15803d",
  negative: "#b91c1c",
  surface: "#ffffff",
};

function readVar(name, fallback) {
  if (typeof window === "undefined" || !window.getComputedStyle) {
    return fallback;
  }
  try {
    const v = getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim();
    return v || fallback;
  } catch {
    return fallback;
  }
}

export function getVizTheme() {
  return {
    fg: readVar("--viz-fg", DEFAULTS.fg),
    muted: readVar("--viz-muted", DEFAULTS.muted),
    grid: readVar("--viz-grid", DEFAULTS.grid),
    series1: readVar("--viz-series-1", DEFAULTS.series1),
    series2: readVar("--viz-series-2", DEFAULTS.series2),
    positive: readVar("--viz-positive", DEFAULTS.positive),
    negative: readVar("--viz-negative", DEFAULTS.negative),
    surface: readVar("--viz-surface", DEFAULTS.surface),
  };
}
