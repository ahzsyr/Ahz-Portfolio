import MetricChart from "../viz/MetricChartLazy";
import { toKpiConfig } from "../../lib/viz";

export default function SelectedImpact({ metrics = [] }) {
  if (!metrics.length) return null;

  return (
    <section
      id="impact"
      className="home-section home-impact py-14 md:py-16 bg-slate-50/80"
      aria-label="Selected impact"
    >
      <div className="max-w-screen-md mx-auto px-4">
        <header className="mb-8 max-w-xl">
          <p className="font-display text-xs tracking-[0.2em] uppercase text-[var(--color-brand)] mb-2">
            Outcomes
          </p>
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-[var(--color-ink)]">
            Selected Impact
          </h2>
          <p className="mt-2 text-[var(--color-muted)] text-base">
            A few measures that matter — not the full archive.
          </p>
        </header>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric) => (
            <MetricChart
              key={metric.id}
              type="kpi"
              data={metric}
              config={toKpiConfig(metric)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
