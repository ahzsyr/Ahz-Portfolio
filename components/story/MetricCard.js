import MetricChart from "../viz/MetricChartLazy";
import StorySection from "./StorySection";

export default function MetricCard({ title, subtitle, metric, kpiConfig }) {
  return (
    <StorySection title={title} subtitle={subtitle}>
      <MetricChart type="kpi" data={metric} config={kpiConfig || {}} />
    </StorySection>
  );
}
