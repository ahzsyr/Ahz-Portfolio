import { useEffect, useState } from "react";
import PageNameSection from "../components/PageNameSection";
import { RoughNotationGroup } from "react-rough-notation";
import AnimatedHeadline from "../components/AnimatedHeadline";
import ToolCard from "../components/ToolCard";
import Container from "../components/Container";
import SafeHtml from "../components/SafeHtml";
import MetricChart from "../components/viz/MetricChartLazy";
import StorySection from "../components/story/StorySection";
import CareerTimeline from "../components/career/CareerTimeline";
import ExperienceDetail from "../components/career/ExperienceDetail";
import {
  buildCareerTimeline,
  computeCareerStats,
  selectSkillsVisualization,
} from "../lib/career";
import { toSkillsRadarConfig } from "../lib/viz";
import {
  buildPersonJsonLd,
  buildOrganizationJsonLd,
  buildWebPageJsonLd,
  buildBreadcrumbListJsonLd,
  buildJsonLdGraph,
} from "../lib/seo";

export default function About({
  experience,
  settings,
  tools = [],
  lanes = [],
  stats = [],
  skillsViz,
  skillsRadar,
}) {
  const colors = ["#f59e0b", "#3b82f6", "#f43f5e", "#1d4ed8"];
  const color = colors[Math.floor(Math.random() * colors.length)];

  const [activeId, setActiveId] = useState(null);
  const [showRadar, setShowRadar] = useState(false);

  useEffect(() => {
    if (lanes.length && (activeId == null || !lanes.some((l) => l.id === activeId))) {
      setActiveId(lanes[lanes.length - 1].id);
    }
  }, [lanes, activeId]);

  const activeExp =
    experience.find((e) => e.id === activeId) || experience[0] || null;

  return (
    <Container
      settings={settings}
      title={`About | ${settings.siteName}`}
      description={settings.tagline || settings.aboutBio}
      canonicalPath="/about"
      jsonLd={buildJsonLdGraph([
        buildPersonJsonLd(settings),
        buildOrganizationJsonLd(settings),
        buildWebPageJsonLd({
          name: `About | ${settings.siteName}`,
          description: settings.tagline || settings.aboutBio,
          path: "/about",
          settings,
        }),
        buildBreadcrumbListJsonLd(
          [
            { name: "Home", url: "/" },
            { name: "About", url: "/about" },
          ],
          settings
        ),
      ])}
    >
      <div className="mt-10 max-w-screen-md mx-auto px-4 lg:px-0">
        <PageNameSection title={"Know my journey!"} />

        <section className="my-8">
          <h1 className="font-display text-5xl md:text-7xl text-gray-600">
            Hello! I&apos;m
          </h1>
          <div className="w-2/3 max-w-xl">
            <RoughNotationGroup show={true}>
              <AnimatedHeadline color={color}>
                <h1 className="font-display text-4xl md:text-7xl font-bold text-black my-2">
                  {settings.personName}
                </h1>
              </AnimatedHeadline>
            </RoughNotationGroup>
          </div>

          <div className="mt-8">
            <SafeHtml
              html={settings.aboutBio}
              className="pb-6 text-lg text-gray-700 rich-text"
            />
          </div>

          {(settings.locations || []).length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-2xl font-semibold text-slate-900 mb-3">
                Location
              </h2>
              {(settings.locations || []).map((location) => (
                <p key={location} className="italic text-lg text-gray-700">
                  {location}
                </p>
              ))}
            </div>
          )}
        </section>

        {stats.some((s) => s.valueNumeric > 0) && (
          <StorySection title="Career">
            <div className="career-stats grid grid-cols-2 lg:grid-cols-4 gap-3">
              {stats.map((stat) => (
                <MetricChart
                  key={stat.id}
                  type="kpi"
                  data={stat}
                  config={{
                    title: stat.label,
                    display: stat.display,
                    tone: "neutral",
                    tableFallback: false,
                    textSummary: `${stat.label}: ${stat.display}`,
                    ariaLabel: `${stat.label}: ${stat.display}`,
                  }}
                />
              ))}
            </div>
          </StorySection>
        )}

        {lanes.length > 0 && (
          <StorySection
            title="Timeline"
            subtitle="Select a role to see responsibilities, outcomes, and related work."
          >
            <CareerTimeline
              lanes={lanes}
              activeId={activeId}
              onSelect={setActiveId}
            />
            <ExperienceDetail experience={activeExp} />
          </StorySection>
        )}

        {skillsViz && skillsViz.mode !== "omit" && (
          <StorySection title="Skills">
            <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
              {skillsViz.allowRadar &&
                skillsRadar &&
                !skillsRadar.config.empty && (
                  <button
                    type="button"
                    className="text-sm text-[var(--color-brand)] underline-offset-2 hover:underline ml-auto"
                    onClick={() => setShowRadar((v) => !v)}
                  >
                    {showRadar ? "List view" : "Profile view"}
                  </button>
                )}
            </div>
            {showRadar && skillsRadar && !skillsRadar.config.empty ? (
              <MetricChart
                type={skillsRadar.type}
                data={skillsRadar.data}
                config={skillsRadar.config}
              />
            ) : skillsViz.mode === "grouped" ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {skillsViz.data.map((s) => (
                  <div
                    key={s.name}
                    className="border border-slate-200 rounded-lg px-4 py-3"
                  >
                    <p className="font-medium text-slate-900">{s.name}</p>
                    {s.category && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        {s.category}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <MetricChart
                type="barHorizontal"
                data={skillsViz.data}
                config={{
                  title: "Skills",
                  xKey: "name",
                  seriesKey: "value",
                  height: Math.max(200, skillsViz.data.length * 28),
                  showLegend: false,
                  tableFallback: true,
                  empty: false,
                  textSummary: `Skills across ${skillsViz.data.length} areas.`,
                  ariaLabel: `Skills across ${skillsViz.data.length} areas.`,
                  columns: [{ key: "name", label: "Skill" }],
                }}
              />
            )}
          </StorySection>
        )}

        {tools.length > 0 && (
          <StorySection title="Tech Stack">
            <div className="flex flex-wrap gap-4">
              {tools.map((tool) => (
                <ToolCard key={tool} tool={tool} />
              ))}
            </div>
          </StorySection>
        )}
      </div>
    </Container>
  );
}

export async function getServerSideProps() {
  const {
    getExperience,
    getSiteSettings,
    getSkills,
    getPublishedProjects,
  } = await import("../lib/content");

  const [experience, settings, skills, projects] = await Promise.all([
    getExperience({ includeCareer: true }),
    getSiteSettings(),
    getSkills(),
    getPublishedProjects(),
  ]);

  const tools = settings.tools || [];
  const lanes = buildCareerTimeline(experience);
  const stats = computeCareerStats({
    experiences: experience,
    projects,
    skills,
    tools,
  });
  const skillsViz = selectSkillsVisualization(skills);
  const skillsRadar = skillsViz.allowRadar
    ? toSkillsRadarConfig(skills)
    : null;

  return {
    props: JSON.parse(
      JSON.stringify({
        experience,
        settings,
        tools,
        lanes,
        stats,
        skillsViz,
        skillsRadar,
      })
    ),
  };
}
