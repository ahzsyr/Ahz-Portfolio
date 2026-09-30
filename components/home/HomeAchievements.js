function yearLabel(achievement) {
  const raw = achievement?.date || achievement?.createdAt;
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return String(d.getFullYear());
}

function stripHtml(html = "") {
  return String(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function HomeAchievements({ achievements = [] }) {
  if (!achievements.length) return null;

  return (
    <section
      id="achievements"
      className="home-section home-achievements py-14 md:py-20"
      aria-label="Selected achievements"
    >
      <div className="max-w-screen-md mx-auto px-4">
        <header className="mb-8 max-w-xl">
          <p className="font-display text-xs tracking-[0.2em] uppercase text-[var(--color-brand)] mb-2">
            Highlights
          </p>
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-[var(--color-ink)]">
            Selected Achievements
          </h2>
        </header>
        <ul className="space-y-6">
          {achievements.map((a) => {
            const year = yearLabel(a);
            const blurb = stripHtml(a.description || "").slice(0, 160);
            return (
              <li
                key={a.id}
                className="border-l-2 border-[var(--color-brand)] pl-4"
              >
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="font-semibold text-[var(--color-ink)]">
                    {a.title}
                  </h3>
                  {year && (
                    <span className="text-xs text-[var(--color-muted)] tabular-nums">
                      {year}
                    </span>
                  )}
                </div>
                {blurb && (
                  <p className="mt-1 text-sm text-[var(--color-muted)] leading-relaxed">
                    {blurb}
                    {stripHtml(a.description || "").length > 160 ? "…" : ""}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
