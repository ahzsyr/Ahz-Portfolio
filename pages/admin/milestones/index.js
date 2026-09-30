import { useState } from "react";
import AdminLayout from "../../../components/admin/AdminLayout";
import PageHeader from "../../../components/admin/PageHeader";
import Modal from "../../../components/admin/Modal";
import ConfirmDialog from "../../../components/admin/ConfirmDialog";
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
  date: "",
  description: "",
  type: "",
  sortOrder: 0,
  featured: false,
};

function toForm(item) {
  return {
    title: item.title || "",
    date: toDateInput(item.date),
    description: item.description || "",
    type: item.type || "",
    sortOrder: item.sortOrder ?? 0,
    featured: Boolean(item.featured),
  };
}

export default function AdminMilestones({ milestones: initial, settings }) {
  const [items, setItems] = useState(initial);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const refresh = async () => {
    const res = await fetch("/api/admin/milestones");
    setItems(await res.json());
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      ...(editingId ? { id: editingId } : {}),
      ...form,
      date: form.date || null,
    };
    const res = await fetch("/api/admin/milestones", {
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
    await fetch("/api/admin/milestones", {
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
        title="Milestones"
        description="Career and life markers in the professional archive."
        actions={
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm({ ...blank, sortOrder: items.length });
              setError("");
              setModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Add milestone
          </button>
        }
      />
      <div className="space-y-3">
        {items.length === 0 && (
          <p className="text-slate-500 text-sm">No milestones yet.</p>
        )}
        {items.map((item) => (
          <div key={item.id} className="bg-white border rounded-lg p-4">
            <div className="flex justify-between gap-3">
              <div>
                <h2 className="font-semibold">{item.title}</h2>
                <p className="text-sm text-slate-500 line-clamp-2">
                  {item.description}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {[toDateInput(item.date), item.type, `sort ${item.sortOrder}`]
                    .filter(Boolean)
                    .join(" · ")}
                  {item.featured ? " · featured" : ""}
                </p>
              </div>
              <div className="flex gap-3 shrink-0">
                <button
                  type="button"
                  className="text-blue-600"
                  onClick={() => {
                    setEditingId(item.id);
                    setForm(toForm(item));
                    setError("");
                    setModalOpen(true);
                  }}
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
        title={editingId ? "Edit milestone" : "Add milestone"}
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded border"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="milestone-form"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        }
      >
        <form id="milestone-form" onSubmit={save} className="space-y-3">
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <textarea
            className="w-full border rounded px-3 py-2"
            placeholder="Description"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              className="w-full border rounded px-3 py-2"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Type"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            />
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
        title="Delete milestone"
        message="Delete this milestone?"
        confirmLabel="Delete"
        danger
        loading={deleting}
      />
    </AdminLayout>
  );
}

export async function getServerSideProps(context) {
  const auth = await getAdminSession(context);
  if (auth.redirect) return auth;
  const [milestones, settings] = await Promise.all([
    prisma.milestone.findMany({ orderBy: { sortOrder: "asc" } }),
    getSiteSettings(),
  ]);
  return {
    props: {
      milestones: JSON.parse(JSON.stringify(milestones)),
      settings,
    },
  };
}
