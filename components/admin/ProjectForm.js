import { useRouter } from "next/router";
import { useState } from "react";
import AdminLayout from "./AdminLayout";

export const emptyForm = {
  title: "",
  slug: "",
  description: "",
  client: "",
  tools: "Photoshop|Illustrator",
  coverPath: "",
  featured: false,
  featuredOrder: 0,
  status: "published",
  categoryId: "",
  seoTitle: "",
  seoDescription: "",
  mediaText: "",
};

export default function ProjectForm({
  initial,
  categories,
  settings,
  projectId,
}) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      ...form,
      categoryId: Number(form.categoryId),
      featuredOrder: Number(form.featuredOrder) || 0,
      media: form.mediaText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    };
    delete payload.mediaText;

    const res = await fetch(
      projectId ? `/api/admin/projects/${projectId}` : "/api/admin/projects",
      {
        method: projectId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Save failed");
      return;
    }
    router.push("/admin/projects");
  };

  return (
    <AdminLayout siteName={settings.siteName}>
      <h1 className="text-3xl font-semibold mb-6">
        {projectId ? "Edit project" : "New project"}
      </h1>
      <form
        onSubmit={onSubmit}
        className="bg-white border rounded-lg p-6 space-y-4 max-w-3xl"
      >
        {[
          ["title", "Title"],
          ["slug", "Slug (optional)"],
          ["client", "Client"],
          ["coverPath", "Cover path (/images/... or /uploads/...)"],
          ["tools", "Tools (pipe-separated)"],
          ["seoTitle", "SEO title"],
        ].map(([name, label]) => (
          <div key={name}>
            <label className="block text-sm mb-1">{label}</label>
            <input
              className="w-full border rounded px-3 py-2"
              name={name}
              value={form[name]}
              onChange={onChange}
              required={["title", "client", "coverPath"].includes(name)}
            />
          </div>
        ))}
        <div>
          <label className="block text-sm mb-1">Category</label>
          <select
            className="w-full border rounded px-3 py-2"
            name="categoryId"
            value={form.categoryId}
            onChange={onChange}
            required
          >
            <option value="">Select...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Description</label>
          <textarea
            className="w-full border rounded px-3 py-2 min-h-[120px]"
            name="description"
            value={form.description}
            onChange={onChange}
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">SEO description</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            name="seoDescription"
            value={form.seoDescription}
            onChange={onChange}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">
            Gallery paths (one per line)
          </label>
          <textarea
            className="w-full border rounded px-3 py-2 min-h-[100px]"
            name="mediaText"
            value={form.mediaText}
            onChange={onChange}
          />
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="featured"
              checked={form.featured}
              onChange={onChange}
            />
            Featured
          </label>
          <label className="flex items-center gap-2">
            Order
            <input
              className="border rounded px-2 py-1 w-20"
              type="number"
              name="featuredOrder"
              value={form.featuredOrder}
              onChange={onChange}
            />
          </label>
          <label className="flex items-center gap-2">
            Status
            <select
              className="border rounded px-2 py-1"
              name="status"
              value={form.status}
              onChange={onChange}
            >
              <option value="published">published</option>
              <option value="draft">draft</option>
            </select>
          </label>
        </div>
        {error && <p className="text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save project"}
        </button>
      </form>
    </AdminLayout>
  );
}
