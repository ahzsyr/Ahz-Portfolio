import { useEffect, useState } from "react";
import Link from "next/link";
import CareerTimeline from "../career/CareerTimeline";
import ExperienceDetail from "../career/ExperienceDetail";
import { buildCareerTimeline } from "../../lib/career";

/**
 * Condensed career strip — timeline + one active role; deep-link to About.
 */
export default function HomeCareer({ experience = [] }) {
  const lanes = buildCareerTimeline(experience);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    if (
      lanes.length &&
      (activeId == null || !lanes.some((l) => l.id === activeId))
    ) {
      setActiveId(lanes[lanes.length - 1].id);
    }
  }, [lanes, activeId]);

  if (!lanes.length) return null;

  const activeExp =
    experience.find((e) => e.id === activeId) || experience[0] || null;

  return (
    <section
      id="career"
      className="home-section home-career py-14 md:py-20"
      aria-label="Career timeline"
    >
      <div className="max-w-screen-md mx-auto px-4">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div className="max-w-xl">
            <p className="font-display text-xs tracking-[0.2em] uppercase text-[var(--color-brand)] mb-2">
              Path
            </p>
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-[var(--color-ink)]">
              Career Timeline
            </h2>
          </div>
          <Link
            href="/about"
            className="text-sm text-[var(--color-brand)] hover:underline"
          >
            Full experience →
          </Link>
        </header>
        <CareerTimeline
          lanes={lanes}
          activeId={activeId}
          onSelect={setActiveId}
        />
        {activeExp && (
          <div className="mt-6">
            <ExperienceDetail experience={activeExp} compact />
          </div>
        )}
      </div>
    </section>
  );
}
