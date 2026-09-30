import StorySection from "./StorySection";
import ToolCard from "../ToolCard";

export default function ToolsListCard({ title, subtitle, tools = [] }) {
  if (!tools.length) return null;
  return (
    <StorySection title={title || "Tools"} subtitle={subtitle}>
      <div className="flex flex-wrap gap-2">
        {tools.map((tool) => (
          <ToolCard key={tool} tool={tool} />
        ))}
      </div>
    </StorySection>
  );
}
