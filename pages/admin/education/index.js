import { useState } from "react";
import AdminLayout from "../../../components/admin/AdminLayout";
import PageHeader from "../../../components/admin/PageHeader";
import Modal from "../../../components/admin/Modal";
import ConfirmDialog from "../../../components/admin/ConfirmDialog";
import { getAdminSession } from "../../../lib/admin";
import { prisma } from "../../../lib/prisma";
import { getSiteSettings } from "../../../lib/content";

const blank = {
  institution: "",
  degree: "",
  field: "",
  period: "",
  description: "",
  sortOrder: 0,
};

function toForm(item) {
  return {
    institution: item.institution || "",
    degree: item.degree || "",
    field: item.field || "",
    period: item.period || "",
    description: item.description || "",
    sortOrder: item.sortOrder ?? 0,
  };
}

export default function AdminEducation({ education: initial, settings }) {
  const [items, setItems] = useState(initial);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const refresh = async () => {
    const res = await fetch("/api/admin/education");
    setItems(await res.json());
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      ...(editingId ? { id: editingId } : {}),
      ...form,
    };
    const res = await fetch("/api/admin/education", {
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
    await fetch("/api/admin/education", {
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
        title="Education"
        description="Academic background and formal education."
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
            Add education
          </button>
        }
      />
      <div className="space-y-3">
        {items.length === 0 && (
          <p className="text-slate-500 text-sm">No education entries yet.</p>
        )}
        {items.map((item) => (
          <div key={item.id} className="bg-white border rounded-lg p-4">
            <div className="flex justify-between gap-3">
              <div>
                <h2 className="font-semibold">
                  {item.degree}
                  {item.field ? ` · ${item.field}` : ""}
                </h2>
                <p className="text-sm text-slate-500">
                  {item.institution} · {item.period}
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
        title={editingId ? "Edit education" : "Add education"}
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
              form="edu-form"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        }
      >
        <form id="edu-form" onSubmit={save} className="space-y-3">
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Institution"
            value={form.institution}
            onChange={(e) =>
              setForm({ ...form, institution: e.target.value })
            }
            required
          />
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Degree"
              value={form.degree}
              onChange={(e) => setForm({ ...form, degree: e.target.value })}
              required
            />
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Field"
              value={form.field}
              onChange={(e) => setForm({ ...form, field: e.target.value })}
            />
          </div>
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Period"
            value={form.period}
            onChange={(e) => setForm({ ...form, period: e.target.value })}
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
          <input
            className="w-full border rounded px-3 py-2"
            type="number"
            placeholder="Sort order"
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={remove}
        title="Delete education"
        message="Delete this education entry?"
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
  const [education, settings] = await Promise.all([
    prisma.education.findMany({ orderBy: { sortOrder: "asc" } }),
    getSiteSettings(),
  ]);
  return {
    props: {
      education: JSON.parse(JSON.stringify(education)),
      settings,
    },
  };
}
