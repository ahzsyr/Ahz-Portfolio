import StorySection from "./StorySection";

export default function AchievementCard({ title, subtitle, achievement }) {
  if (!achievement) return null;
  return (
    <StorySection title={title} subtitle={subtitle}>
      <div className="border-l-2 border-[var(--color-brand)] pl-4 py-1">
        <p className="font-semibold text-slate-900">{achievement.title}</p>
        {achievement.description && (
          <p className="text-sm text-slate-600 mt-1">{achievement.description}</p>
        )}
      </div>
    </StorySection>
  );
}
