/**
 * Typographic professional snapshot — Years / Projects / Tools / Domains.
 * Intentionally not MetricChart cards (keeps homepage lighter).
 */
export default function ProfessionalSnapshot({ stats = [] }) {
  if (!stats.length) return null;

  return (
    <section
      id="snapshot"
      className="home-section home-snapshot py-14 md:py-20"
      aria-label="Professional snapshot"
    >
      <div className="max-w-screen-md mx-auto px-4">
        <header className="mb-8 max-w-xl">
          <p className="font-display text-xs tracking-[0.2em] uppercase text-[var(--color-brand)] mb-2">
            Overview
          </p>
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-[var(--color-ink)]">
            Professional Snapshot
          </h2>
        </header>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat) => (
            <div key={stat.id} className="text-center md:text-left">
              <p className="font-display text-4xl md:text-5xl font-semibold text-[var(--color-ink)] tabular-nums">
                {stat.display}
              </p>
              <p className="mt-1 text-sm text-[var(--color-muted)] tracking-wide">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
