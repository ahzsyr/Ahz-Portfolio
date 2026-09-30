import Link from "next/link";
import AdminLayout from "../../components/admin/AdminLayout";
import PageHeader from "../../components/admin/PageHeader";
import MetricChart from "../../components/viz/MetricChart";
import { getAdminSession } from "../../lib/admin";
import { prisma } from "../../lib/prisma";
import { getSiteSettings } from "../../lib/content";
import { adminComposeSections } from "../../lib/adminNav";
import { fetchAdminPortfolioOverview } from "../../lib/adminAnalytics";

function ChartPanel({ title, viz }) {
  const empty = !viz?.data?.length || viz?.config?.empty;
  return (
    <div className="bg-white rounded-lg p-5 shadow-sm border">
      <h2 className="font-semibold mb-3">{title}</h2>
      {empty ? (
        <p className="text-sm text-slate-500 py-8 text-center">
          {viz?.config?.textSummary || "No data yet."}
        </p>
      ) : (
        <MetricChart
          type={viz.type}
          data={viz.data}
          config={viz.config}
          title={null}
        />
      )}
    </div>
  );
}

export default function AdminDashboard({ overview, settings }) {
  const { counts, charts } = overview;

  return (
    <AdminLayout siteName={settings.siteName}>
      <PageHeader
        title="Portfolio Overview"
        description="Internal archive analytics — counts and trends across your professional work."
        actions={
          counts.unread > 0 ? (
            <Link
              href="/admin/messages"
              className="px-3 py-1.5 text-sm rounded border border-amber-300 bg-amber-50 text-amber-900"
            >
              {counts.unread} unread message{counts.unread === 1 ? "" : "s"}
            </Link>
          ) : null
        }
      />

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Projects", value: counts.projects, href: "/admin/projects" },
          {
            label: "Experience",
            value: counts.experience,
            href: "/admin/experience",
          },
          {
            label: "Achievements",
            value: counts.achievements,
            href: "/admin/achievements",
          },
          { label: "Metrics", value: counts.metrics, href: "/admin/metrics" },
          {
            label: "Categories",
            value: counts.categories,
            href: "/admin/categories",
          },
        ].map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-white rounded-lg p-5 shadow-sm border hover:border-blue-300 transition"
          >
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="text-3xl font-semibold mt-2">{card.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <ChartPanel title="Projects by Year" viz={charts.projectsByYear} />
        <ChartPanel title="Projects by Domain" viz={charts.projectsByDomain} />
        <div className="lg:col-span-2">
          <ChartPanel
            title="Achievements by Year"
            viz={charts.achievementsByYear}
          />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="font-semibold mb-3">Compose by area</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {adminComposeSections.map((section) => (
            <Link
              key={section.id}
              href={section.href}
              className="bg-white border rounded-lg p-4 hover:border-blue-300 transition"
            >
              <p className="font-medium text-slate-900">{section.label}</p>
              <p className="text-sm text-slate-500 mt-1">{section.description}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg p-5 shadow-sm border">
        <h2 className="font-semibold mb-3">Quick actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            className="px-3 py-2 bg-blue-600 text-white rounded"
            href="/admin/projects?new=1"
          >
            New project
          </Link>
          <Link
            className="px-3 py-2 bg-slate-800 text-white rounded"
            href="/admin/stories"
          >
            Open Stories
          </Link>
          <Link
            className="px-3 py-2 bg-slate-800 text-white rounded"
            href="/admin/featured"
          >
            Featured hub
          </Link>
          <Link
            className="px-3 py-2 bg-slate-800 text-white rounded"
            href="/admin/metrics"
          >
            Metrics
          </Link>
          <Link className="px-3 py-2 border rounded" href="/admin/messages">
            Messages
            {counts.unread > 0 ? ` (${counts.unread})` : ""}
          </Link>
        </div>
        <ul className="mt-6 text-sm text-slate-600 space-y-1">
          <li>
            • Year and domain come from linked Experience (with Category /
            created-at fallbacks).
          </li>
          <li>
            • Achievements bucket by outcome date, then created date.
          </li>
          <li>
            • Compose archive content below — analytics does not replace CMS.
          </li>
        </ul>
      </div>
    </AdminLayout>
  );
}

export async function getServerSideProps(context) {
  const auth = await getAdminSession(context);
  if (auth.redirect) return auth;

  const [overview, settings] = await Promise.all([
    fetchAdminPortfolioOverview(prisma),
    getSiteSettings(),
  ]);

  return {
    props: JSON.parse(JSON.stringify({ overview, settings })),
  };
}
