/**
 * MetricChart — registry resolver only.
 * VizShell owns shared UX; typed charts own rendering.
 */

import VizShell from "./VizShell";
import { resolveChart } from "./registry";

export default function MetricChart({
  type,
  data,
  config = {},
  status = "ready",
  title,
  subtitle,
}) {
  const Renderer = resolveChart(type);

  const shellConfig = {
    ...config,
    title: title || config.title,
    subtitle: subtitle || config.subtitle,
    _tableData: Array.isArray(config._tableData)
      ? config._tableData
      : Array.isArray(data)
        ? data
        : [],
    error: !Renderer
      ? `Unknown visualization type: ${type}`
      : config.error,
  };

  const resolvedStatus =
    !Renderer && status === "ready" ? "error" : status;

  return (
    <VizShell
      title={title}
      subtitle={subtitle}
      config={shellConfig}
      status={resolvedStatus}
      chartType={type}
    >
      {Renderer ? <Renderer data={data} config={shellConfig} /> : null}
    </VizShell>
  );
}
