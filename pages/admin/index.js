import AdminLayout from "../../components/admin/AdminLayout";
import { getAdminSession } from "../../lib/admin";
import { prisma } from "../../lib/prisma";
import { getSiteSettings } from "../../lib/content";
import Link from "next/link";

export default function AdminDashboard({ stats, settings }) {
  return (
    <AdminLayout siteName={settings.siteName}>
      <h1 className="text-3xl font-semibold mb-6">Dashboard</h1>
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Projects", value: stats.projects },
          { label: "Featured", value: stats.featured },
          { label: "Unread messages", value: stats.unread },
          { label: "Categories", value: stats.categories },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-lg p-5 shadow-sm border">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="text-3xl font-semibold mt-2">{card.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-lg p-5 shadow-sm border">
        <h2 className="font-semibold mb-3">Quick actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link className="px-3 py-2 bg-blue-600 text-white rounded" href="/admin/projects/new">
            New project
          </Link>
          <Link className="px-3 py-2 bg-slate-800 text-white rounded" href="/admin/media">
            Upload media
          </Link>
          <Link className="px-3 py-2 border rounded" href="/admin/settings">
            Rename site / settings
          </Link>
        </div>
        <ul className="mt-6 text-sm text-slate-600 space-y-1">
          <li>• Site name is editable in Settings (default: AZURA Portfolio).</li>
          <li>• Draft projects stay hidden from the public site.</li>
          <li>• Contact form messages appear under Messages.</li>
        </ul>
      </div>
    </AdminLayout>
  );
}

export async function getServerSideProps(context) {
  const auth = await getAdminSession(context);
  if (auth.redirect) return auth;

  const [projects, featured, unread, categories, settings] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { featured: true } }),
    prisma.message.count({ where: { read: false } }),
    prisma.category.count(),
    getSiteSettings(),
  ]);

  return {
    props: {
      stats: { projects, featured, unread, categories },
      settings,
    },
  };
}
