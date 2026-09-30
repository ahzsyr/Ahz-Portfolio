/**
 * Pure VizShell status resolution — testable without React.
 */

export function resolveVizShellStatus(config = {}, status = "ready") {
  if (status !== "ready") return status;
  if (config.error) return "error";
  if (config.empty) return "empty";
  return "ready";
}
