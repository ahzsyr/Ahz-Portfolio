import ProjectForm from "../../../components/admin/ProjectForm";
import { getAdminSession } from "../../../lib/admin";
import { prisma } from "../../../lib/prisma";
import { getSiteSettings } from "../../../lib/content";

export default function EditProjectPage({ project, categories, settings }) {
  return (
    <ProjectForm
      projectId={project.id}
      categories={categories}
      settings={settings}
      initial={{
        title: project.title,
        slug: project.slug,
        description: project.description,
        client: project.client,
        tools: Array.isArray(project.tools)
          ? project.tools.join("|")
          : project.tools,
        coverPath: project.coverPath,
        featured: project.featured,
        featuredOrder: project.featuredOrder,
        status: project.status,
        categoryId: String(project.categoryId),
        seoTitle: project.seoTitle || "",
        seoDescription: project.seoDescription || "",
        mediaText: (project.media || []).map((m) => m.path).join("\n"),
      }}
    />
  );
}

export async function getServerSideProps(context) {
  const auth = await getAdminSession(context);
  if (auth.redirect) return auth;

  const id = Number(context.params.id);
  const [project, categories, settings] = await Promise.all([
    prisma.project.findUnique({
      where: { id },
      include: { media: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    getSiteSettings(),
  ]);

  if (!project) {
    return { notFound: true };
  }

  return {
    props: {
      project: JSON.parse(JSON.stringify(project)),
      categories: JSON.parse(JSON.stringify(categories)),
      settings,
    },
  };
}
