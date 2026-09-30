import MetricChart from "./viz/MetricChartLazy";
import {
  selectProjectMetrics,
  selectMetricVisualization,
} from "../lib/viz";

/**
 * Contextual project impact — featured metrics only (max 3),
 * fallback top 2 by sortOrder; renders nothing if empty.
 */
export default function ProjectImpact({ metrics = [], achievements = [] }) {
  const selected = selectProjectMetrics(metrics);
  const shownAchievements = (achievements || [])
    .slice()
    .sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    })
    .slice(0, 3);

  if (selected.length === 0 && shownAchievements.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 mb-8">
      <h2 className="text-2xl text-gray-800 font-semibold mb-4">Impact</h2>

      {shownAchievements.length > 0 && (
        <ul className="space-y-3 mb-8">
          {shownAchievements.map((a) => (
            <li key={a.id} className="border-l-2 border-[var(--color-brand)] pl-4">
              <p className="font-semibold text-slate-900">{a.title}</p>
              {a.description && (
                <p className="text-sm text-slate-600 mt-1 line-clamp-3">
                  {a.description}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      {selected.length > 0 && (
        <div className="space-y-6">
          {selected.map((metric) => {
            const viz = selectMetricVisualization(metric);
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
      )}
    </section>
  );
}
