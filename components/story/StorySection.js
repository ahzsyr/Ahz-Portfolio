/**
 * Shared editorial chrome for story blocks — one job per section.
 */

import RevealSection from "../motion/Reveal";

export default function StorySection({
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
}) {
  return (
    <RevealSection
      className={`story-section mb-12 md:mb-14 ${className}`.trim()}
    >
      {(eyebrow || title || subtitle) && (
        <header className="mb-5 max-w-2xl">
          {eyebrow && (
            <p className="font-display text-xs tracking-[0.2em] uppercase text-[var(--color-brand)] mb-2">
              {eyebrow}
            </p>
          )}
          {title && (
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-[var(--story-fg,#0f172a)] leading-tight">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-2 text-[var(--story-muted,#64748b)] text-base">
              {subtitle}
            </p>
          )}
        </header>
      )}
      {children}
    </RevealSection>
  );
}
