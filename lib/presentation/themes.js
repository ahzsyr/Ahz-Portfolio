import {
  normalizePresentationMode,
  PRESENTATION_MODE_META,
} from "./types.js";

/**
 * CSS class + token hints per mode (tokens applied via presentation.css).
 */
export function getPresentationTheme(mode) {
  const id = normalizePresentationMode(mode);
  const meta = PRESENTATION_MODE_META[id] || PRESENTATION_MODE_META.minimal;
  return {
    id,
    label: meta.label,
    description: meta.description,
    className: `project-presentation project-presentation--${id}`,
    streamClassName: `story-stream story-stream--${id}`,
  };
}
