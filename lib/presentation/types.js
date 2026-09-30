/**
 * Project presentation modes — visual treatment only.
 */

export const PRESENTATION_MODES = [
  "minimal",
  "creative",
  "business",
  "technical",
  "career",
];

export const PRESENTATION_MODE_META = {
  minimal: {
    label: "Minimal",
    description: "Hero, short prose, restrained metrics and gallery.",
  },
  creative: {
    label: "Creative",
    description: "Large imagery, generous type, airy gallery.",
  },
  business: {
    label: "Business",
    description: "KPIs and charts first — results-forward.",
  },
  technical: {
    label: "Technical",
    description: "Tools, architecture prose, compact metrics.",
  },
  career: {
    label: "Career",
    description: "Timeline, achievements, and skills rhythm.",
  },
};

export const DEFAULT_PRESENTATION_MODE = "minimal";

export function isPresentationMode(value) {
  return PRESENTATION_MODES.includes(value);
}

export function normalizePresentationMode(raw) {
  if (raw == null || raw === "") return DEFAULT_PRESENTATION_MODE;
  const mode = String(raw).trim().toLowerCase();
  return isPresentationMode(mode) ? mode : DEFAULT_PRESENTATION_MODE;
}
