import Link from "next/link";
import MetricChart from "../viz/MetricChartLazy";
import ToolCard from "../ToolCard";
import { selectSkillsVisualization } from "../../lib/career";

export default function HomeSkills({ skills = [], tools = [] }) {
  const skillsViz = selectSkillsVisualization(skills);

  const chart =
    skillsViz.mode === "bars" && skillsViz.data?.length
      ? {
          type: "barHorizontal",
          data: skillsViz.data.slice(0, 8),
          config: {
            title: "Skills",
            seriesKey: "value",
            xKey: "name",
            height: Math.max(180, Math.min(skillsViz.data.length, 8) * 32),
            tableFallback: true,
          },
        }
      : null;

  const showGrouped =
    !chart && skillsViz.mode === "grouped" && skillsViz.data?.length;
  const showTools = tools.length > 0;

  if (!chart && !showGrouped && !showTools) return null;

  return (
    <section
      id="skills"
      className="home-section home-skills py-14 md:py-16 bg-slate-50/80"
      aria-label="Skills and technologies"
    >
      <div className="max-w-screen-md mx-auto px-4">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div className="max-w-xl">
            <p className="font-display text-xs tracking-[0.2em] uppercase text-[var(--color-brand)] mb-2">
              Craft
            </p>
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-[var(--color-ink)]">
              Skills &amp; Technologies
            </h2>
          </div>
          <Link
            href="/about"
            className="text-sm text-[var(--color-brand)] hover:underline"
          >
            More on About →
          </Link>
        </header>

        {chart && (
          <MetricChart
            type={chart.type}
            data={chart.data}
            config={chart.config}
          />
        )}

        {showGrouped && (
          <div className="grid sm:grid-cols-2 gap-3 mb-8">
            {skillsViz.data.slice(0, 8).map((s) => (
              <div
                key={s.name}
                className="border border-slate-200 bg-white rounded-lg px-4 py-3"
              >
                <p className="font-medium text-slate-900">{s.name}</p>
                {s.category && (
                  <p className="text-xs text-slate-500 mt-0.5">{s.category}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {showTools && (
          <div className={chart || showGrouped ? "mt-10" : ""}>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-3">
              Tools
            </h3>
            <div className="flex flex-wrap gap-2">
              {tools.map((tool) => (
                <ToolCard key={tool} tool={tool} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
