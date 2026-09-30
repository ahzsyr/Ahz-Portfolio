import MetricChart from "../viz/MetricChartLazy";
import StorySection from "./StorySection";

export default function TimelineCard({ title, subtitle, type, data, config }) {
  return (
    <StorySection title={title} subtitle={subtitle}>
      <MetricChart type={type || "timeline"} data={data} config={config || {}} />
    </StorySection>
  );
}
