import Head from "next/head";
import Container from "../components/Container";
import FeaturedProjects from "../components/FeaturedProjects";
import { Hero } from "../components/Hero";
import ProfessionalSnapshot from "../components/home/ProfessionalSnapshot";
import SelectedImpact from "../components/home/SelectedImpact";
import HomeCareer from "../components/home/HomeCareer";
import HomeSkills from "../components/home/HomeSkills";
import HomeAchievements from "../components/home/HomeAchievements";
import HomeContact from "../components/home/HomeContact";
import {
  selectHomepageProjects,
  selectHomepageImpactKpis,
  selectHomepageAchievements,
  selectHomepageSkills,
  selectHomepageTools,
  buildHomepageSnapshot,
  HOMEPAGE_PROJECT_MAX,
  HOMEPAGE_ACHIEVEMENT_MAX,
} from "../lib/homepage";
import {
  buildWebSiteJsonLd,
  buildPersonJsonLd,
  buildOrganizationJsonLd,
  buildItemListJsonLd,
  buildJsonLdGraph,
} from "../lib/seo";

export default function Home({
  settings,
  projects,
  snapshot,
  impactMetrics,
  experience,
  skills,
  tools,
  achievements,
}) {
  const graphNodes = [
    buildOrganizationJsonLd(settings),
    buildPersonJsonLd(settings),
    buildWebSiteJsonLd(settings),
  ];
  if (achievements?.length) {
    graphNodes.push(
      buildItemListJsonLd(
        {
          name: "Selected achievements",
          url: "/",
          items: achievements,
        },
        settings
      )
    );
  }
  const jsonLd = buildJsonLdGraph(graphNodes);

  return (
    <Container
      settings={settings}
      canonicalPath="/"
      jsonLd={jsonLd}
      description={settings.tagline || settings.headline}
    >
      <Head>
        <link rel="preload" as="image" href="/images/profile.png" />
      </Head>

      <Hero
        settings={settings}
        showWork={projects?.length > 0}
        showCareer={experience?.length > 0}
      />

      {snapshot?.hasData && (
        <ProfessionalSnapshot stats={snapshot.stats} />
      )}

      {impactMetrics?.length > 0 && (
        <SelectedImpact metrics={impactMetrics} />
      )}

      {projects?.length > 0 && (
        <FeaturedProjects
          projects={projects}
          limit={HOMEPAGE_PROJECT_MAX}
          id="work"
          title="Featured Work"
        />
      )}

      {experience?.length > 0 && <HomeCareer experience={experience} />}

      {(skills?.length > 0 || tools?.length > 0) && (
        <HomeSkills skills={skills} tools={tools} />
      )}

      {achievements?.length > 0 && (
        <HomeAchievements achievements={achievements} />
      )}

      <HomeContact settings={settings} />
    </Container>
  );
}

export async function getServerSideProps() {
  const {
    getFeaturedProjects,
    getPublishedProjects,
    getSiteSettings,
    getExperience,
    getSkills,
    getFeaturedMetrics,
    getFeaturedAchievements,
  } = await import("../lib/content");

  const [
    featuredProjects,
    allProjects,
    settings,
    experience,
    allSkills,
    featuredMetrics,
    featuredAchievements,
  ] = await Promise.all([
    getFeaturedProjects(),
    getPublishedProjects(),
    getSiteSettings(),
    getExperience(),
    getSkills(),
    getFeaturedMetrics({ includeSeries: false }),
    getFeaturedAchievements({ take: HOMEPAGE_ACHIEVEMENT_MAX }),
  ]);

  const projects = selectHomepageProjects(featuredProjects);
  const impactMetrics = selectHomepageImpactKpis(featuredMetrics);
  const achievements = selectHomepageAchievements(featuredAchievements);
  const skills = selectHomepageSkills(allSkills);
  const tools = selectHomepageTools(settings.tools || []);
  const snapshot = buildHomepageSnapshot({
    experiences: experience,
    projects: allProjects,
    skills: allSkills,
    tools: settings.tools || [],
  });

  return {
    props: JSON.parse(
      JSON.stringify({
        settings,
        projects,
        snapshot,
        impactMetrics,
        experience,
        skills,
        tools,
        achievements,
      })
    ),
  };
}
