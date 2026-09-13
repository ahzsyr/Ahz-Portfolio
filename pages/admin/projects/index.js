import Link from "next/link";
import { useState } from "react";
import AdminLayout from "../../../components/admin/AdminLayout";
import { getAdminSession } from "../../../lib/admin";
import { prisma } from "../../../lib/prisma";
import { getSiteSettings } from "../../../lib/content";

export default function AdminProjects({ projects: initial, settings }) {
  const [projects, setProjects] = useState(initial);
  const [query, setQuery] = useState("");

  const filtered = projects.filter((p) =>
    `${p.title} ${p.client} ${p.category?.name || ""}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  const remove = async (id) => {
    if (!confirm("Delete this project?")) return;
    const res = await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
    if (res.ok) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <AdminLayout siteName={settings.siteName}>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="text-3xl font-semibold">Projects</h1>
        <Link
          href="/admin/projects/new"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          New project
        </Link>
      </div>
      <input
        className="w-full max-w-md mb-4 px-3 py-2 border rounded"
        placeholder="Search projects..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="bg-white border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">Category</th>
              <th className="p-3">Status</th>
              <th className="p-3">Featured</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((project) => (
              <tr key={project.id} className="border-t">
                <td className="p-3 font-medium">{project.title}</td>
                <td className="p-3">{project.category?.name}</td>
                <td className="p-3">{project.status}</td>
                <td className="p-3">
                  {project.featured ? `Yes (#${project.featuredOrder})` : "No"}
                </td>
                <td className="p-3 space-x-2">
                  <Link
                    className="text-blue-600"
                    href={`/admin/projects/${project.id}`}
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    className="text-red-600"
                    onClick={() => remove(project.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

export async function getServerSideProps(context) {
  const auth = await getAdminSession(context);
  if (auth.redirect) return auth;
  const [projects, settings] = await Promise.all([
    prisma.project.findMany({
      include: { category: true },
      orderBy: { updatedAt: "desc" },
    }),
    getSiteSettings(),
  ]);
  return {
    props: {
      projects: JSON.parse(JSON.stringify(projects)),
      settings,
    },
  };
}
