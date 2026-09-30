import MetricChart from "../viz/MetricChartLazy";
import StorySection from "./StorySection";

export default function ComparisonCard({
  title,
  subtitle,
  metric,
  comparisonConfig,
}) {
  return (
    <StorySection title={title} subtitle={subtitle}>
      <MetricChart
        type="comparison"
        data={metric}
        config={comparisonConfig || {}}
      />
    </StorySection>
  );
}
