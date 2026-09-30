import Link from "next/link";
import AdminLayout from "../../../components/admin/AdminLayout";
import PageHeader from "../../../components/admin/PageHeader";
import { getAdminSession } from "../../../lib/admin";
import { prisma } from "../../../lib/prisma";
import { getSiteSettings } from "../../../lib/content";

export default function AdminFeatured({ settings, counts }) {
  const cards = [
    {
      label: "Projects",
      count: counts.projects,
      href: "/admin/projects",
      hint: "Toggle Featured on a project",
    },
    {
      label: "Achievements",
      count: counts.achievements,
      href: "/admin/achievements",
      hint: "Mark outcomes as featured",
    },
    {
      label: "Skills",
      count: counts.skills,
      href: "/admin/skills",
      hint: "Feature skills for About / Impact",
    },
    {
      label: "Milestones",
      count: counts.milestones,
      href: "/admin/milestones",
      hint: "Highlight career milestones",
    },
    {
      label: "Certifications",
      count: counts.certifications,
      href: "/admin/certifications",
      hint: "Feature key credentials",
    },
  ];

  return (
    <AdminLayout siteName={settings.siteName}>
      <PageHeader
        title="Featured"
        description="Compose what surfaces as featured across the public archive — toggle Featured on each entity."
      />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="bg-white border rounded-lg p-5 hover:border-blue-300 transition"
          >
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="text-3xl font-semibold mt-2">{card.count}</p>
            <p className="text-xs text-slate-400 mt-3">{card.hint}</p>
          </Link>
        ))}
      </div>
      <p className="text-sm text-slate-500 mt-6 max-w-xl">
        Featured is a flag on each record — there is no separate Featured entity
        in Phase 7. Use this hub to jump to the lists that matter for homepage,
        Impact, and About composition.
      </p>
    </AdminLayout>
  );
}

export async function getServerSideProps(context) {
  const auth = await getAdminSession(context);
  if (auth.redirect) return auth;

  const [
    projects,
    achievements,
    skills,
    milestones,
    certifications,
    settings,
  ] = await Promise.all([
    prisma.project.count({ where: { featured: true } }),
    prisma.achievement.count({ where: { featured: true } }),
    prisma.skill.count({ where: { featured: true } }),
    prisma.milestone.count({ where: { featured: true } }),
    prisma.certification.count({ where: { featured: true } }),
    getSiteSettings(),
  ]);

  return {
    props: {
      settings,
      counts: {
        projects,
        achievements,
        skills,
        milestones,
        certifications,
      },
    },
  };
}
