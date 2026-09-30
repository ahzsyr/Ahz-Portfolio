import AdminLayout from "../../../../components/admin/AdminLayout";
import BlockEditor from "../../../../components/admin/BlockEditor";
import { getAdminSession } from "../../../../lib/admin";
import { prisma } from "../../../../lib/prisma";
import {
  getSiteSettings,
  mapStory,
  mapMilestone,
} from "../../../../lib/content";

const blockInclude = {
  metric: {
    include: {
      dataPoints: {
        orderBy: [{ date: "asc" }, { sortOrder: "asc" }],
      },
    },
  },
  achievement: true,
  projectMedia: true,
  milestone: true,
  metrics: {
    orderBy: { sortOrder: "asc" },
    include: {
      metric: {
        include: {
          dataPoints: {
            orderBy: [{ date: "asc" }, { sortOrder: "asc" }],
          },
        },
      },
    },
  },
};

export default function AdminProjectPageEditor({
  story,
  mappedStory,
  metrics,
  achievements,
  milestones,
  media,
  project,
  settings,
}) {
  return (
    <AdminLayout siteName={settings.siteName}>
      <BlockEditor
        story={story}
        mappedStory={mappedStory}
        metrics={metrics}
        achievements={achievements}
        milestones={milestones}
        media={media}
        project={project}
        backHref="/admin/projects"
        backLabel="Projects"
        showTemplates
      />
    </AdminLayout>
  );
}

export async function getServerSideProps(context) {
  const auth = await getAdminSession(context);
  if (auth.redirect) return auth;

  const projectId = Number(context.params.id);
  if (!Number.isFinite(projectId)) return { notFound: true };

  const projectRow = await prisma.project.findUnique({
    where: { id: projectId },
    include: { category: true },
  });
  if (!projectRow) return { notFound: true };

  let story = await prisma.story.findFirst({
    where: { scope: "project", projectId },
    include: {
      project: true,
      blocks: {
        orderBy: { sortOrder: "asc" },
        include: blockInclude,
      },
    },
  });

  if (!story) {
    const slugBase = `project-${projectRow.slug || projectId}`;
    story = await prisma.story.create({
      data: {
        slug: slugBase,
        scope: "project",
        projectId,
        title: projectRow.title,
        status: "draft",
      },
      include: {
        project: true,
        blocks: {
          orderBy: { sortOrder: "asc" },
          include: blockInclude,
        },
      },
    });
  }

  const [metrics, achievements, milestones, media, settings] =
    await Promise.all([
      prisma.metric.findMany({
        where: {
          OR: [
            { projectId },
            { projectId: null },
            { featured: true },
          ],
        },
        include: {
          dataPoints: { orderBy: [{ date: "asc" }, { sortOrder: "asc" }] },
        },
        orderBy: { sortOrder: "asc" },
        take: 200,
      }),
      prisma.achievement.findMany({
        where: {
          OR: [{ projectId }, { projectId: null }],
        },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.milestone.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.projectMedia.findMany({
        where: { projectId },
        orderBy: { sortOrder: "asc" },
      }),
      getSiteSettings(),
    ]);

  const tools = Array.isArray(projectRow.tools) ? projectRow.tools : [];
  const project = {
    id: projectRow.id,
    title: projectRow.title,
    slug: projectRow.slug,
    client: projectRow.client,
    image: projectRow.coverPath,
    tags: Array.isArray(projectRow.tags)
      ? projectRow.tags
      : projectRow.category?.name
        ? [projectRow.category.name]
        : [],
    toolsList: tools,
    tools: tools.join("|"),
    presentationMode: projectRow.presentationMode || "minimal",
  };

  const mappedStory = mapStory(story);
  if (mappedStory) {
    mappedStory.project = { id: project.id, title: project.title };
  }

  return {
    props: JSON.parse(
      JSON.stringify({
        story,
        mappedStory,
        metrics: metrics.map((m) => ({
          id: m.id,
          name: m.name,
          label: m.label,
        })),
        achievements: achievements.map((a) => ({
          id: a.id,
          title: a.title,
        })),
        milestones: milestones.map(mapMilestone),
        media,
        project,
        settings,
      })
    ),
  };
}
