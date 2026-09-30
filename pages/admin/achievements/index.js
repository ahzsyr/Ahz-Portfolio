import { useState } from "react";
import AdminLayout from "../../../components/admin/AdminLayout";
import PageHeader from "../../../components/admin/PageHeader";
import Modal from "../../../components/admin/Modal";
import ConfirmDialog from "../../../components/admin/ConfirmDialog";
import ImportWizard, {
  downloadExport,
} from "../../../components/admin/ImportWizard";
import { getAdminSession } from "../../../lib/admin";
import { prisma } from "../../../lib/prisma";
import { getSiteSettings } from "../../../lib/content";

function toDateInput(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

const blank = {
  title: "",
  description: "",
  type: "design",
  date: "",
  category: "",
  featured: false,
  sortOrder: 0,
  status: "published",
  projectId: "",
  experienceId: "",
};

function toForm(item) {
  return {
    title: item.title || "",
    description: item.description || "",
    type: item.type || "design",
    date: toDateInput(item.date),
    category: item.category || "",
    featured: Boolean(item.featured),
    sortOrder: item.sortOrder ?? 0,
    status: item.status || "published",
    projectId: item.projectId ?? "",
    experienceId: item.experienceId ?? "",
  };
}

export default function AdminAchievements({
  achievements: initial,
  projects,
  experience,
  settings,
}) {
  const [items, setItems] = useState(initial);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const refresh = async () => {
    const res = await fetch("/api/admin/achievements");
    setItems(await res.json());
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...blank, sortOrder: items.length });
    setError("");
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm(toForm(item));
    setError("");
    setModalOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      ...(editingId ? { id: editingId } : {}),
      ...form,
      projectId: form.projectId || null,
      experienceId: form.experienceId || null,
      date: form.date || null,
    };
    const res = await fetch("/api/admin/achievements", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!res.ok) {
      setError("Save failed");
      return;
    }
    setModalOpen(false);
    refresh();
  };

  const remove = async () => {
    if (!deleteId) return;
    setDeleting(true);
    await fetch("/api/admin/achievements", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deleteId }),
    });
    setDeleting(false);
    setDeleteId(null);
    refresh();
  };

  return (
    <AdminLayout siteName={settings.siteName}>
      <PageHeader
        title="Achievements"
        description="Outcome narratives tied to projects or experience — not raw metrics."
        actions={
          <>
            <button
              type="button"
              onClick={() => setImportOpen(true)}
              className="px-3 py-2 border border-slate-300 bg-white rounded text-sm"
            >
              Import
            </button>
            <button
              type="button"
              onClick={() =>
                downloadExport("/api/admin/export/achievements?format=csv")
              }
              className="px-3 py-2 border border-slate-300 bg-white rounded text-sm"
            >
              Export CSV
            </button>
            <button
              type="button"
              onClick={() =>
                downloadExport("/api/admin/export/achievements?format=json")
              }
              className="px-3 py-2 border border-slate-300 bg-white rounded text-sm"
            >
              Export JSON
            </button>
            <button
              type="button"
              onClick={openCreate}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Add achievement
            </button>
          </>
        }
      />
      <div className="space-y-3">
        {items.length === 0 && (
          <p className="text-slate-500 text-sm">No achievements yet.</p>
        )}
        {items.map((item) => (
          <div key={item.id} className="bg-white border rounded-lg p-4">
            <div className="flex justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold">{item.title}</h2>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-100">
                    {item.type}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      item.status === "published"
                        ? "bg-green-100 text-green-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {item.status}
                  </span>
                  {item.featured && (
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      featured
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                  {item.description}
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Sort {item.sortOrder}
                  {item.project?.title ? ` · Project: ${item.project.title}` : ""}
                  {item.experience
                    ? ` · Experience: ${item.experience.position}`
                    : ""}
                </p>
              </div>
              <div className="flex gap-3 shrink-0">
                <button
                  type="button"
                  className="text-blue-600"
                  onClick={() => openEdit(item)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="text-red-600"
                  onClick={() => setDeleteId(item.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit achievement" : "Add achievement"}
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded border border-slate-300 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="achievement-form"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        }
      >
        <form id="achievement-form" onSubmit={save} className="space-y-3">
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <textarea
            className="w-full border rounded px-3 py-2 min-h-[100px]"
            placeholder="Description (outcome narrative)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
          <div className="grid sm:grid-cols-2 gap-3">
            <select
              className="w-full border rounded px-3 py-2"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              {["design", "sales", "technical", "operations", "launch", "general"].map(
                (t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                )
              )}
            </select>
            <select
              className="w-full border rounded px-3 py-2"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="published">published</option>
              <option value="draft">draft</option>
            </select>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              className="w-full border rounded px-3 py-2"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <select
              className="w-full border rounded px-3 py-2"
              value={form.projectId}
              onChange={(e) => setForm({ ...form, projectId: e.target.value })}
            >
              <option value="">No project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
            <select
              className="w-full border rounded px-3 py-2"
              value={form.experienceId}
              onChange={(e) =>
                setForm({ ...form, experienceId: e.target.value })
              }
            >
              <option value="">No experience</option>
              {experience.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.position} · {ex.company}
                </option>
              ))}
            </select>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 items-center">
            <input
              className="w-full border rounded px-3 py-2"
              type="number"
              placeholder="Sort order"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) =>
                  setForm({ ...form, featured: e.target.checked })
                }
              />
              Featured
            </label>
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={remove}
        title="Delete achievement"
        message="Delete this achievement? Linked metrics will keep their values and become unlinked."
        confirmLabel="Delete"
        danger
        loading={deleting}
      />

      <ImportWizard
        open={importOpen}
        onClose={() => setImportOpen(false)}
        title="Import achievements"
        endpoint="/api/admin/import/achievements"
        onImported={() => refresh()}
        sampleHint={`title,description,type,date,category,featured,status\nShip Launch,Shipped v1,launch,2026-01-15,product,true,published`}
      />
    </AdminLayout>
  );
}

export async function getServerSideProps(context) {
  const auth = await getAdminSession(context);
  if (auth.redirect) return auth;
  const [achievements, projects, experience, settings] = await Promise.all([
    prisma.achievement.findMany({
      include: {
        project: { select: { id: true, title: true } },
        experience: { select: { id: true, position: true, company: true } },
      },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.project.findMany({
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
    prisma.experience.findMany({
      select: { id: true, position: true, company: true },
      orderBy: { sortOrder: "asc" },
    }),
    getSiteSettings(),
  ]);
  return {
    props: {
      achievements: JSON.parse(JSON.stringify(achievements)),
      projects: JSON.parse(JSON.stringify(projects)),
      experience: JSON.parse(JSON.stringify(experience)),
      settings,
    },
  };
}
