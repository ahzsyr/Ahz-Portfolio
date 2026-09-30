import AdminLayout from "../../../components/admin/AdminLayout";
import BlockEditor from "../../../components/admin/BlockEditor";
import { getAdminSession } from "../../../lib/admin";
import { prisma } from "../../../lib/prisma";
import {
  getSiteSettings,
  mapStory,
  mapMilestone,
} from "../../../lib/content";

export default function AdminStoryEditor({
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
        backHref="/admin/stories"
        backLabel="All stories"
        showTemplates={story.scope === "project"}
      />
    </AdminLayout>
  );
}

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

export async function getServerSideProps(context) {
  const auth = await getAdminSession(context);
  if (auth.redirect) return auth;

  const id = Number(context.params.id);
  if (!Number.isFinite(id)) return { notFound: true };

  const story = await prisma.story.findUnique({
    where: { id },
    include: {
      project: true,
      blocks: {
        orderBy: { sortOrder: "asc" },
        include: blockInclude,
      },
    },
  });

  if (!story) return { notFound: true };

  const metricWhere =
    story.scope === "project" && story.projectId
      ? {
          OR: [
            { projectId: story.projectId },
            { projectId: null },
            { featured: true },
          ],
        }
      : undefined;

  const [metrics, achievements, milestones, media, settings] =
    await Promise.all([
      prisma.metric.findMany({
        where: metricWhere,
        include: {
          dataPoints: { orderBy: [{ date: "asc" }, { sortOrder: "asc" }] },
        },
        orderBy: { sortOrder: "asc" },
        take: 200,
      }),
      prisma.achievement.findMany({
        where:
          story.scope === "project" && story.projectId
            ? {
                OR: [
                  { projectId: story.projectId },
                  { projectId: null },
                ],
              }
            : undefined,
        orderBy: { sortOrder: "asc" },
      }),
      prisma.milestone.findMany({ orderBy: { sortOrder: "asc" } }),
      story.projectId
        ? prisma.projectMedia.findMany({
            where: { projectId: story.projectId },
            orderBy: { sortOrder: "asc" },
          })
        : Promise.resolve([]),
      getSiteSettings(),
    ]);

  const mappedStory = mapStory(story);
  let project = null;
  if (story.project) {
    const tools = Array.isArray(story.project.tools)
      ? story.project.tools
      : [];
    project = {
      id: story.project.id,
      title: story.project.title,
      slug: story.project.slug,
      client: story.project.client,
      image: story.project.coverPath,
      tags: Array.isArray(story.project.tags) ? story.project.tags : [],
      toolsList: tools,
      tools: tools.join("|"),
      presentationMode: story.project.presentationMode || "minimal",
    };
    if (mappedStory) mappedStory.project = { id: project.id, title: project.title };
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
