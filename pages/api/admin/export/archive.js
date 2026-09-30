import { requireAdmin } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { buildProfessionalArchive } from "../../../../lib/export";

export default async function handler(req, res) {
  const session = await requireAdmin(req, res);
  if (!session) return;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const [
    metricGroups,
    metrics,
    achievements,
    experience,
    education,
    certifications,
    milestones,
    skills,
    projects,
  ] = await Promise.all([
    prisma.metricGroup.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.metric.findMany({
      include: { dataPoints: { orderBy: { date: "asc" } } },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.achievement.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.experience.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.education.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.certification.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.milestone.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.skill.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.project.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        client: true,
        category: { select: { name: true } },
      },
      orderBy: { featuredOrder: "asc" },
    }),
  ]);

  const archive = buildProfessionalArchive({
    metricGroups,
    metrics,
    achievements,
    experience,
    education,
    certifications,
    milestones,
    skills,
    projects,
  });

  const stamp = new Date().toISOString().slice(0, 10);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="professional-archive-${stamp}.json"`
  );
  return res.status(200).send(JSON.stringify(archive, null, 2));
}
