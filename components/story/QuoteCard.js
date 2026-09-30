import StorySection from "./StorySection";

export default function QuoteCard({ title, body, attribution }) {
  if (!body) return null;
  return (
    <StorySection title={title}>
      <blockquote className="font-display text-xl md:text-2xl text-slate-800 leading-snug border-l-2 border-[var(--color-brand)] pl-5">
        <p>“{body}”</p>
        {attribution && (
          <footer className="mt-3 text-sm text-slate-500 font-sans not-italic">
            — {attribution}
          </footer>
        )}
      </blockquote>
    </StorySection>
  );
}
