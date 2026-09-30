/**
 * Visual career timeline — year axis + domain/role lanes.
 */

import { Reveal } from "../motion/Reveal";
import { Parallax } from "react-scroll-parallax";
import useMotionAllowed from "../motion/useMotionAllowed";

export default function CareerTimeline({
  lanes = [],
  activeId,
  onSelect,
}) {
  const motionOk = useMotionAllowed();

  if (!lanes.length) return null;

  return (
    <div className="career-timeline">
      {lanes.map((lane, index) => {
        const active = activeId === lane.id;
        const yearLabel =
          lane.startYear != null
            ? lane.endYear != null && lane.endYear !== lane.startYear
              ? `${lane.startYear} ── ${lane.endYear}`
              : String(lane.startYear)
            : lane.period || "";

        const dot = (
          <span className="career-timeline-dot" aria-hidden="true" />
        );

        return (
          <Reveal
            key={lane.id}
            as="div"
            className="career-timeline-reveal"
            delay={motionOk ? Math.min(index * 0.04, 0.2) : 0}
            y={8}
          >
            <button
              type="button"
              className={`career-timeline-lane${active ? " is-active" : ""}`}
              onClick={() => onSelect?.(lane.id)}
              aria-pressed={active}
            >
              <div className="career-timeline-years">{yearLabel}</div>
              <div className="career-timeline-bar">
                {motionOk ? (
                  <Parallax speed={-4} className="career-timeline-dot-parallax">
                    {dot}
                  </Parallax>
                ) : (
                  dot
                )}
                <p className="career-timeline-domain">{lane.domain}</p>
                <p className="career-timeline-meta">
                  {lane.position}
                  {lane.company ? ` · ${lane.company}` : ""}
                </p>
              </div>
            </button>
          </Reveal>
        );
      })}
    </div>
  );
}
