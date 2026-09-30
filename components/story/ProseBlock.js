import SafeHtml from "../SafeHtml";
import StorySection from "./StorySection";

export default function ProseBlock({ title, subtitle, body }) {
  if (!body && !title) return null;
  return (
    <StorySection title={title} subtitle={subtitle}>
      {body && (
        <SafeHtml html={body} className="rich-text text-slate-700 leading-relaxed" />
      )}
    </StorySection>
  );
}
