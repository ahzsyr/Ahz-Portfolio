import { useState } from "react";
import AdminLayout from "../../../components/admin/AdminLayout";
import { getAdminSession } from "../../../lib/admin";
import { prisma } from "../../../lib/prisma";
import { getSiteSettings } from "../../../lib/content";

export default function AdminCategories({ categories: initial, settings }) {
  const [categories, setCategories] = useState(initial);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const refresh = async () => {
    const res = await fetch("/api/admin/categories");
    setCategories(await res.json());
  };

  const create = async (e) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, sortOrder: categories.length }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed");
      return;
    }
    setName("");
    refresh();
  };

  const remove = async (id) => {
    if (!confirm("Delete category?")) return;
    const res = await fetch("/api/admin/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Delete failed");
      return;
    }
    refresh();
  };

  return (
    <AdminLayout siteName={settings.siteName}>
      <h1 className="text-3xl font-semibold mb-6">Categories</h1>
      <form onSubmit={create} className="flex gap-2 mb-6">
        <input
          className="border rounded px-3 py-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name"
          required
        />
        <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit">
          Add
        </button>
      </form>
      {error && <p className="text-red-600 mb-3">{error}</p>}
      <div className="bg-white border rounded-lg">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center justify-between border-b px-4 py-3"
          >
            <div>
              <p className="font-medium">{cat.name}</p>
              <p className="text-sm text-slate-500">
                {cat._count?.projects || 0} projects · {cat.slug}
              </p>
            </div>
            <button
              type="button"
              className="text-red-600"
              onClick={() => remove(cat.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}

export async function getServerSideProps(context) {
  const auth = await getAdminSession(context);
  if (auth.redirect) return auth;
  const [categories, settings] = await Promise.all([
    prisma.category.findMany({
      include: { _count: { select: { projects: true } } },
      orderBy: { sortOrder: "asc" },
    }),
    getSiteSettings(),
  ]);
  return {
    props: {
      categories: JSON.parse(JSON.stringify(categories)),
      settings,
    },
  };
}
