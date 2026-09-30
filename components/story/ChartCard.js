import MetricChart from "../viz/MetricChartLazy";
import StorySection from "./StorySection";

export default function ChartCard({ title, subtitle, type, data, config }) {
  return (
    <StorySection title={title} subtitle={subtitle}>
      <MetricChart type={type} data={data} config={config || {}} />
    </StorySection>
  );
}
