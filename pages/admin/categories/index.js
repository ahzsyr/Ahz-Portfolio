import { useState } from "react";
import AdminLayout from "../../../components/admin/AdminLayout";
import PageHeader from "../../../components/admin/PageHeader";
import Modal from "../../../components/admin/Modal";
import ConfirmDialog from "../../../components/admin/ConfirmDialog";
import { getAdminSession } from "../../../lib/admin";
import { prisma } from "../../../lib/prisma";
import { getSiteSettings } from "../../../lib/content";

export default function AdminCategories({ categories: initial, settings }) {
  const [categories, setCategories] = useState(initial);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const refresh = async () => {
    const res = await fetch("/api/admin/categories");
    setCategories(await res.json());
  };

  const openCreate = () => {
    setEditing(null);
    setName("");
    setError("");
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setName(cat.name);
    setError("");
    setModalOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/categories", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        editing
          ? { id: editing.id, name, sortOrder: editing.sortOrder }
          : { name, sortOrder: categories.length }
      ),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Failed");
      return;
    }
    setModalOpen(false);
    refresh();
  };

  const remove = async () => {
    if (!deleteId) return;
    setDeleting(true);
    setDeleteError("");
    const res = await fetch("/api/admin/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deleteId }),
    });
    const data = await res.json();
    setDeleting(false);
    if (!res.ok) {
      setDeleteError(data.error || "Delete failed");
      return;
    }
    setDeleteId(null);
    refresh();
  };

  return (
    <AdminLayout siteName={settings.siteName}>
      <PageHeader
        title="Categories"
        description="Organize projects by category."
        actions={
          <button
            type="button"
            onClick={openCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Add category
          </button>
        }
      />
      <div className="bg-white border rounded-lg">
        {categories.length === 0 && (
          <p className="px-4 py-6 text-slate-500 text-sm">No categories yet.</p>
        )}
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center justify-between border-b last:border-b-0 px-4 py-3 gap-3"
          >
            <div>
              <p className="font-medium">{cat.name}</p>
              <p className="text-sm text-slate-500">
                {cat._count?.projects || 0} projects · {cat.slug}
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <button
                type="button"
                className="text-blue-600"
                onClick={() => openEdit(cat)}
              >
                Edit
              </button>
              <button
                type="button"
                className="text-red-600"
                onClick={() => {
                  setDeleteError("");
                  setDeleteId(cat.id);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit category" : "Add category"}
        size="md"
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
              form="category-form"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        }
      >
        <form id="category-form" onSubmit={save} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={remove}
        title="Delete category"
        message={
          deleteError ||
          "Delete this category? Projects must be reassigned first if any use it."
        }
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
