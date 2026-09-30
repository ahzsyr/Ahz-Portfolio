import MetricChart from "../viz/MetricChartLazy";
import { toKpiConfig } from "../../lib/viz";
import StorySection from "./StorySection";

export default function StatGrid({ title, subtitle, metrics = [], columns }) {
  const cols = Math.min(Math.max(columns || metrics.length, 2), 4);
  const gridClass =
    cols >= 4
      ? "grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
      : cols === 3
        ? "grid sm:grid-cols-3 gap-4"
        : "grid sm:grid-cols-2 gap-4";

  return (
    <StorySection title={title} subtitle={subtitle}>
      <div className={gridClass}>
        {metrics.map((metric) => (
          <MetricChart
            key={metric.id}
            type="kpi"
            data={metric}
            config={toKpiConfig(metric)}
          />
        ))}
      </div>
    </StorySection>
  );
}
