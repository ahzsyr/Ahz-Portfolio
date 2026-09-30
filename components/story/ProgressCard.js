import MetricChart from "../viz/MetricChartLazy";
import StorySection from "./StorySection";

export default function ProgressCard({
  title,
  subtitle,
  metric,
  progressConfig,
}) {
  return (
    <StorySection title={title} subtitle={subtitle}>
      <MetricChart
        type="progress"
        data={metric}
        config={progressConfig || {}}
      />
    </StorySection>
  );
}
