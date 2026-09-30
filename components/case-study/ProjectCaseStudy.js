import SafeHtml from "../SafeHtml";
import ToolCard from "../ToolCard";
import MetricChart from "../viz/MetricChartLazy";
import StorySection from "../story/StorySection";
import ProjectHeroMedia from "../motion/ProjectHeroMedia";
import ResponsiveImage from "../ResponsiveImage";
import { projectHeroLayoutId } from "../../lib/motion";
import dynamic from "next/dynamic";
import {
  hasText,
  selectHeroKpis,
  selectPrimaryChartMetric,
  selectCaseAchievements,
} from "../../lib/case-study";
import {
  toKpiConfig,
  selectMetricVisualization,
} from "../../lib/viz";

const SliderSwiper = dynamic(() => import("../SliderSwiper"), {
  ssr: false,
  loading: () => (
    <div
      className="h-48 rounded bg-slate-100 animate-pulse"
      aria-busy="true"
      aria-label="Loading gallery"
    />
  ),
});

function ProseSection({ title, html }) {
  if (!hasText(html)) return null;
  return (
    <StorySection title={title}>
      <SafeHtml html={html} className="rich-text text-slate-700 leading-relaxed" />
    </StorySection>
  );
}

export default function ProjectCaseStudy({
  project,
  relatedExperience = [],
}) {
  const tools = project.toolsList?.length
    ? project.toolsList
    : (project.tools || "").split("|").filter(Boolean);

  const tags =
    Array.isArray(project.tags) && project.tags.length
      ? project.tags
      : project.category
        ? [project.category]
        : [];

  const heroKpis = selectHeroKpis(project.metrics || []);
  const chartMetric = selectPrimaryChartMetric(
    project.metrics || [],
    heroKpis
  );
  const chartViz = chartMetric
    ? selectMetricVisualization(chartMetric, { preferredSeriesType: "area" })
    : null;
  const achievements = selectCaseAchievements(project.achievements || []);
  const evidence = project.evidencePaths || [];
  const overviewHtml = hasText(project.overview)
    ? project.overview
    : project.description;

  return (
    <article className="case-study">
      <ProjectHeroMedia
        image={project.image}
        layoutId={projectHeroLayoutId(project)}
        className="mb-4 md:mb-0"
      >
        {tags.length > 0 && (
          <p className="case-study-tags text-sm text-gray-300 mb-2">
            {tags.join(" · ")}
          </p>
        )}
        <h1 className="font-display text-4xl font-semibold text-gray-100 leading-tight">
          {project.title}
        </h1>
        {project.client && (
          <p className="font-semibold text-gray-200 text-sm mt-3">
            {project.client}
          </p>
        )}
      </ProjectHeroMedia>

      <div className="px-4 lg:px-0 mt-10 text-gray-700 max-w-screen-md mx-auto text-lg leading-relaxed">
        {heroKpis.length > 0 && (
          <div className="case-study-hero-kpis mb-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {heroKpis.map((metric) => (
              <MetricChart
                key={metric.id}
                type="kpi"
                data={metric}
                config={toKpiConfig(metric)}
              />
            ))}
          </div>
        )}

        <ProseSection title="Overview" html={overviewHtml} />
        <ProseSection title="Role" html={project.role} />
        <ProseSection title="Challenge" html={project.challenge} />
        <ProseSection title="Approach" html={project.approach} />
        <ProseSection title="Process" html={project.process} />

        {tools.length > 0 && (
          <StorySection title="Technology & Tools">
            <div className="w-full flex flex-wrap gap-4 items-start">
              {tools.map((tool) => (
                <ToolCard key={tool} tool={tool} />
              ))}
            </div>
          </StorySection>
        )}

        <ProseSection title="Results" html={project.results} />

        {chartViz && chartViz.type !== "kpi" && (
          <StorySection title={chartViz.config?.title || "Performance"}>
            <MetricChart
              type={chartViz.type}
              data={chartViz.data}
              config={chartViz.config}
            />
          </StorySection>
        )}

        {achievements.length > 0 && (
          <StorySection title="Key achievements">
            <ul className="space-y-4">
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

        {evidence.length > 0 && (
          <StorySection title="Visual Evidence">
            <div className="case-study-evidence grid sm:grid-cols-2 gap-4">
              {evidence.map((src) => (
                <div
                  key={src}
                  className="relative w-full aspect-[4/3] overflow-hidden rounded-lg bg-slate-100"
                >
                  <ResponsiveImage
                    src={src}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                </div>
              ))}
            </div>
          </StorySection>
        )}

        {project.media?.length > 0 && (
          <StorySection title="Gallery">
            <SliderSwiper media={project.media} />
          </StorySection>
        )}

        {relatedExperience.length > 0 && (
          <StorySection title="Related Experience">
            <ul className="space-y-6">
              {relatedExperience.map((exp) => (
                <li key={exp.id}>
                  <p className="font-semibold text-slate-900">
                    {exp.position}
                    {exp.company ? ` · ${exp.company}` : ""}
                  </p>
                  {exp.period && (
                    <p className="text-sm text-slate-500 mt-0.5">{exp.period}</p>
                  )}
                  {Array.isArray(exp.desc) && exp.desc.length > 0 && (
                    <ul className="mt-2 list-disc pl-5 text-sm text-slate-600 space-y-1">
                      {exp.desc.slice(0, 4).map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </StorySection>
        )}
      </div>
    </article>
  );
}
