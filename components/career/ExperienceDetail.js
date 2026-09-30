import Link from "next/link";
import MetricChart from "../viz/MetricChartLazy";
import StorySection from "../story/StorySection";
import { Reveal } from "../motion/Reveal";
import {
  selectExperienceMetrics,
} from "../../lib/career";
import { selectMetricVisualization, toKpiConfig } from "../../lib/viz";

/**
 * Expanded experience detail: responsibilities, achievements, metrics, projects.
 * `compact` — homepage: header + short bullets only.
 */
export default function ExperienceDetail({ experience, compact = false }) {
  if (!experience) return null;

  const metrics = selectExperienceMetrics(experience.metrics || []);
  const achievements = experience.achievements || [];
  const projects = experience.projects || [];
  const tools = new Set();
  for (const p of projects) {
    for (const t of p.toolsList || []) tools.add(t);
  }

  const bullets = (experience.desc || []).slice(0, compact ? 3 : undefined);

  return (
    <Reveal className="space-y-8 mt-6 border-t border-slate-100 pt-8" y={8}>
      <header>
        <h3 className="font-display text-2xl font-semibold text-slate-900">
          {experience.position}
        </h3>
        <p className="text-slate-600 mt-1">
          {experience.company}
          {experience.period ? ` · ${experience.period}` : ""}
        </p>
      </header>

      {bullets.length > 0 && (
        <StorySection title={compact ? null : "Responsibilities"}>
          <ul className="list-disc pl-5 space-y-1 text-slate-700">
            {bullets.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </StorySection>
      )}

      {compact ? null : (
        <>
          {tools.size > 0 && (
            <StorySection title="Technologies">
              <p className="text-slate-700">{[...tools].join(" · ")}</p>
            </StorySection>
          )}

          {achievements.length > 0 && (
            <StorySection title="Achievements">
              <ul className="space-y-3">
                {achievements.map((a) => (
                  <li
                    key={a.id}
                    className="border-l-2 border-[var(--color-brand)] pl-4"
                  >
                    <p className="font-semibold text-slate-900">{a.title}</p>
                    {a.description && (
                      <p className="text-sm text-slate-600 mt-1">
                        {a.description}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </StorySection>
          )}

          {metrics.length > 0 && (
            <StorySection title="Metrics">
              <div className="space-y-4">
                {metrics.map((metric) => {
                  const viz = selectMetricVisualization(metric);
                  if (viz.type === "kpi") {
                    return (
                      <MetricChart
                        key={metric.id}
                        type="kpi"
                        data={metric}
                        config={toKpiConfig(metric)}
                      />
                    );
                  }
                  return (
                    <MetricChart
                      key={metric.id}
                      type={viz.type}
                      data={viz.data}
                      config={viz.config}
                    />
                  );
                })}
              </div>
            </StorySection>
          )}

          {projects.length > 0 && (
            <StorySection title="Related projects">
              <ul className="space-y-2">
                {projects.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/projects/${p.slug || p.id}`}
                      className="text-[var(--color-brand)] font-medium hover:underline"
                    >
                      {p.title}
                    </Link>
                    {p.category && (
                      <span className="text-sm text-slate-500 ml-2">
                        {p.category}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </StorySection>
          )}
        </>
      )}
    </Reveal>
  );
}
