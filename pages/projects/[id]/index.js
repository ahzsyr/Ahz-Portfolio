import ProjectDetails from "../../../components/ProjectDetails";
import Container from "../../../components/Container";

const ProjectPage = ({ project, settings }) => {
  if (!project) {
    return (
      <Container settings={settings}>
        <div className="mt-28 text-center">Project not found.</div>
      </Container>
    );
  }

  return (
    <Container
      settings={settings}
      title={project.seoTitle || `${project.title} | ${settings.siteName}`}
      description={project.seoDescription || project.description}
      image={project.image}
    >
      <div className="mt-28">
        <ProjectDetails project={project} />
      </div>
    </Container>
  );
};

export async function getServerSideProps(context) {
  const { getProjectByParam, getSiteSettings } = await import("../../../lib/content");
  const [project, settings] = await Promise.all([
    getProjectByParam(context.params.id),
    getSiteSettings(),
  ]);

  if (!project) {
    return { notFound: true };
  }

  return { props: { project, settings } };
}

export default ProjectPage;
