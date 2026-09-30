import { useState } from "react";
import Link from "next/link";
import Container from "../components/Container";
import MetricChart from "../components/viz/MetricChartLazy";
import StoryRenderer from "../components/story/StoryRenderer";
import RevealSection from "../components/motion/Reveal";
import { storyHasBlocks } from "../lib/story";
import {
  selectFeaturedKpis,
  selectGroupVisualizations,
  toKpiConfig,
  toCategoryDonutConfig,
  toSkillsBarConfig,
  toSkillsRadarConfig,
  toTimelineConfig,
} from "../lib/viz";
import {
  buildCollectionPageJsonLd,
  buildItemListJsonLd,
  buildPersonJsonLd,
  buildOrganizationJsonLd,
  buildBreadcrumbListJsonLd,
  buildJsonLdGraph,
  stripHtml,
} from "../lib/seo";

function ImpactFallback({
  featuredKpis,
  groupVisualizations,
  skillsViz,
  skillsRadar,
  categoryViz,
  timelineViz,
}) {
  const [showRadar, setShowRadar] = useState(false);

  const hasContent =
    featuredKpis.length > 0 ||
    groupVisualizations.length > 0 ||
    (skillsViz && !skillsViz.config?.empty) ||
    (categoryViz && !categoryViz.config?.empty) ||
    (timelineViz && !timelineViz.config?.empty);

  if (!hasContent) {
    return (
      <section
        className="mb-20 max-w-xl"
        aria-label="Impact content coming soon"
      >
        <p className="text-slate-600 text-base leading-relaxed">
          Outcome metrics and stories will appear here as they are published.
          Meanwhile, explore selected work and experience.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/projects"
            className="bg-[var(--color-brand)] text-white px-5 py-3 hover:brightness-110 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)]"
          >
            Projects
          </Link>
          <Link
            href="/about"
            className="border border-[var(--color-brand)] text-[var(--color-brand)] px-5 py-3 hover:bg-blue-50 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)]"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="border border-slate-300 text-slate-700 px-5 py-3 hover:bg-slate-50 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)]"
          >
            Contact
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      {featuredKpis.length > 0 && (
        <RevealSection className="mb-16">
          <h2 className="font-display text-2xl font-semibold mb-6">
            Highlights
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredKpis.map(({ metric, config }) => (
              <MetricChart
                key={metric.id}
                type="kpi"
                data={metric}
                config={config}
              />
            ))}
          </div>
        </RevealSection>
      )}

      {groupVisualizations.length > 0 && (
        <RevealSection className="mb-16 space-y-10">
          <h2 className="font-display text-2xl font-semibold">Performance</h2>
          {groupVisualizations.map(({ group, visualization }) => (
            <div key={group.id}>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">
                {group.name}
              </h3>
              {group.description && (
                <p className="text-sm text-slate-500 mb-4">
                  {group.description}
                </p>
              )}
              <MetricChart
                type={visualization.type}
                data={visualization.data}
                config={visualization.config}
              />
            </div>
          ))}
        </RevealSection>
      )}

      {skillsViz && !skillsViz.config.empty && (
        <RevealSection className="mb-16">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
            <h2 className="font-display text-2xl font-semibold">Skills</h2>
            {skillsRadar && !skillsRadar.config.empty && (
              <button
                type="button"
                className="text-sm text-[var(--color-brand)] underline-offset-2 hover:underline"
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
          ) : (
            <MetricChart
              type={skillsViz.type}
              data={skillsViz.data}
              config={skillsViz.config}
            />
          )}
        </RevealSection>
      )}

      {categoryViz && !categoryViz.config.empty && (
        <RevealSection className="mb-16">
          <h2 className="font-display text-2xl font-semibold mb-4">
            Project mix
          </h2>
          <MetricChart
            type={categoryViz.type}
            data={categoryViz.data}
            config={categoryViz.config}
          />
        </RevealSection>
      )}

      {timelineViz && !timelineViz.config.empty && (
        <RevealSection className="mb-20">
          <h2 className="font-display text-2xl font-semibold mb-4">
            Milestones
          </h2>
          <MetricChart
            type={timelineViz.type}
            data={timelineViz.data}
            config={timelineViz.config}
          />
        </RevealSection>
      )}
    </>
  );
}

export default function ImpactPage({
  settings,
  story,
  milestones,
  achievements = [],
  featured,
  fallback,
}) {
  const useStory = storyHasBlocks(story);
  const description =
    stripHtml(settings.heroSupporting || "") ||
    "Measurable outcomes across design, commerce, and operations.";

  const listItems = [
    ...(achievements || []).map((a) => ({
      name: a.title,
      description: a.description,
    })),
    ...(featured || []).slice(0, 4).map((m) => ({
      name: m.label || m.name,
      description: m.description || m.formatted?.display || "",
    })),
  ];

  const graphNodes = [
    buildOrganizationJsonLd(settings),
    buildPersonJsonLd(settings),
    buildCollectionPageJsonLd({
      name: story?.title || "Impact",
      description,
      path: "/impact",
      settings,
    }),
    buildBreadcrumbListJsonLd(
      [
        { name: "Home", url: "/" },
        { name: "Impact", url: "/impact" },
      ],
      settings
    ),
  ];
  if (listItems.length) {
    graphNodes.push(
      buildItemListJsonLd(
        {
          name: "Featured outcomes",
          url: "/impact",
          items: listItems,
        },
        settings
      )
    );
  }

  return (
    <Container
      settings={settings}
      title={`Impact | ${settings.siteName}`}
      description={description}
      canonicalPath="/impact"
      jsonLd={buildJsonLdGraph(graphNodes)}
    >
      <section className="mt-28 mb-12 max-w-3xl">
        <p className="font-display text-sm tracking-[0.2em] uppercase text-[var(--color-brand)] mb-3">
          Impact
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-semibold text-slate-900 leading-tight">
          {story?.title || settings.headline || "Outcomes worth showing"}
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          {settings.heroSupporting ||
            "A curated view of career signals—not a dashboard of every number."}
        </p>
      </section>

      {useStory ? (
        <StoryRenderer story={story} milestones={milestones} />
      ) : (
        <ImpactFallback {...fallback} />
      )}
    </Container>
  );
}

export async function getServerSideProps() {
  const {
    getSiteSettings,
    getImpactStory,
    getFeaturedMetrics,
    getMetricGroups,
    getSkills,
    getMilestones,
    getCategoryProjectCounts,
    getFeaturedAchievements,
  } = await import("../lib/content");

  const [
    settings,
    story,
    featured,
    groups,
    skills,
    milestones,
    categoryCounts,
    achievements,
  ] = await Promise.all([
    getSiteSettings(),
    getImpactStory(),
    getFeaturedMetrics({ includeSeries: true }),
    getMetricGroups({ includeMetrics: true }),
    getSkills(),
    getMilestones(),
    getCategoryProjectCounts(),
    getFeaturedAchievements({ take: 6 }),
  ]);

  const featuredMetrics = selectFeaturedKpis(featured, 4);
  const fallback = {
    featuredKpis: featuredMetrics.map((metric) => ({
      metric,
      config: toKpiConfig(metric),
    })),
    groupVisualizations: selectGroupVisualizations(groups, 3),
    skillsViz: toSkillsBarConfig(skills),
    skillsRadar: toSkillsRadarConfig(skills),
    categoryViz: toCategoryDonutConfig(categoryCounts),
    timelineViz: toTimelineConfig(milestones),
  };

  return {
    props: JSON.parse(
      JSON.stringify({
        settings,
        story,
        milestones,
        achievements,
        featured,
        fallback,
      })
    ),
  };
}
