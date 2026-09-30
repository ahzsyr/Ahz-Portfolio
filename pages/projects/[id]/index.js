import ProjectDetails from "../../../components/ProjectDetails";
import Container from "../../../components/Container";
import {
  absoluteUrl,
  stripHtml,
  projectCanonicalPath,
  shouldRedirectProjectParamToSlug,
  buildProjectCreativeWorkJsonLd,
  buildBreadcrumbListJsonLd,
  buildPersonJsonLd,
  buildOrganizationJsonLd,
  buildJsonLdGraph,
} from "../../../lib/seo";

const ProjectPage = ({ project, settings, relatedExperience }) => {
  if (!project) {
    return (
      <Container settings={settings}>
        <div className="mt-28 text-center">Project not found.</div>
      </Container>
    );
  }

  const path = projectCanonicalPath(project);
  const title =
    project.seoTitle || `${project.title} | ${settings.siteName}`;
  const description =
    stripHtml(project.seoDescription || project.description || "") ||
    settings.tagline;
  const image = absoluteUrl(
    settings.canonicalUrl,
    project.image || settings.ogImagePath
  );

  const jsonLd = buildJsonLdGraph([
    buildOrganizationJsonLd(settings),
    buildPersonJsonLd(settings),
    buildProjectCreativeWorkJsonLd(project, settings),
    buildBreadcrumbListJsonLd(
      [
        { name: "Home", url: "/" },
        { name: "Projects", url: "/projects" },
        { name: project.title, url: path },
      ],
      settings
    ),
  ]);

  return (
    <Container
      settings={settings}
      title={title}
      description={description}
      image={image}
      type="website"
      canonicalPath={path}
      jsonLd={jsonLd}
    >
      <div className="mt-28">
        <ProjectDetails
          project={project}
          relatedExperience={relatedExperience}
        />
      </div>
    </Container>
  );
};

export async function getServerSideProps(context) {
  const {
    getProjectByParam,
    getSiteSettings,
    getRelatedExperienceForProject,
  } = await import("../../../lib/content");

  const param = context.params.id;
  const [project, settings] = await Promise.all([
    getProjectByParam(param, {
      includeImpact: true,
      includeStory: true,
    }),
    getSiteSettings(),
  ]);

  if (!project) {
    return { notFound: true };
  }

  if (shouldRedirectProjectParamToSlug(param, project)) {
    return {
      redirect: {
        destination: projectCanonicalPath(project),
        permanent: true,
      },
    };
  }

  const relatedExperience = await getRelatedExperienceForProject(project);

  return {
    props: JSON.parse(
      JSON.stringify({ project, settings, relatedExperience })
    ),
  };
}

export default ProjectPage;
