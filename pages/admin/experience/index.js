import { useState } from "react";
import AdminLayout from "../../../components/admin/AdminLayout";
import PageHeader from "../../../components/admin/PageHeader";
import Modal from "../../../components/admin/Modal";
import ConfirmDialog from "../../../components/admin/ConfirmDialog";
import { getAdminSession } from "../../../lib/admin";
import { prisma } from "../../../lib/prisma";
import { getSiteSettings } from "../../../lib/content";

const blank = {
  position: "",
  company: "",
  period: "",
  bulletsText: "",
  sortOrder: 0,
  startYear: "",
  endYear: "",
  domain: "",
};

function toForm(item) {
  return {
    position: item.position,
    company: item.company,
    period: item.period,
    bulletsText: (item.bullets || []).join("\n"),
    sortOrder: item.sortOrder ?? 0,
    startYear: item.startYear ?? "",
    endYear: item.endYear ?? "",
    domain: item.domain || "",
  };
}

export default function AdminExperience({ experience: initial, settings }) {
  const [items, setItems] = useState(initial);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const refresh = async () => {
    const res = await fetch("/api/admin/experience");
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
      position: form.position,
      company: form.company,
      period: form.period,
      sortOrder: Number(form.sortOrder) || 0,
      startYear: form.startYear === "" ? null : Number(form.startYear),
      endYear: form.endYear === "" ? null : Number(form.endYear),
      domain: form.domain || null,
      bullets: form.bulletsText
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean),
    };
    const res = await fetch("/api/admin/experience", {
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
    await fetch("/api/admin/experience", {
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
        title="Experience"
        description="Timeline entries on the About career page. Link achievements and metrics to an experience from those admin screens; link projects from the project editor."
        actions={
          <button
            type="button"
            onClick={openCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Add experience
          </button>
        }
      />
      <div className="space-y-3">
        {items.length === 0 && (
          <p className="text-slate-500 text-sm">No experience entries yet.</p>
        )}
        {items.map((item) => (
          <div key={item.id} className="bg-white border rounded-lg p-4">
            <div className="flex justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-semibold">
                  {item.position} · {item.company}
                </h2>
                <p className="text-sm text-slate-500">
                  {item.period}
                  {item.domain ? ` · ${item.domain}` : ""}
                  {item.startYear
                    ? ` · ${item.startYear}${item.endYear ? `–${item.endYear}` : ""}`
                    : ""}
                </p>
                <ul className="list-disc ml-5 mt-2 text-sm">
                  {(item.bullets || []).slice(0, 3).map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                  {(item.bullets || []).length > 3 && (
                    <li className="list-none -ml-5 text-slate-400">
                      +{(item.bullets || []).length - 3} more
                    </li>
                  )}
                </ul>
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
        title={editingId ? "Edit experience" : "Add experience"}
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
              form="experience-form"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        }
      >
        <form id="experience-form" onSubmit={save} className="space-y-3">
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Position"
            value={form.position}
            onChange={(e) => setForm({ ...form, position: e.target.value })}
            required
          />
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Company"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            required
          />
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Period (e.g. 2021 – 2023)"
              value={form.period}
              onChange={(e) => setForm({ ...form, period: e.target.value })}
              required
            />
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Domain (e.g. E-commerce)"
              value={form.domain}
              onChange={(e) => setForm({ ...form, domain: e.target.value })}
            />
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <input
              className="w-full border rounded px-3 py-2"
              type="number"
              placeholder="Start year"
              value={form.startYear}
              onChange={(e) => setForm({ ...form, startYear: e.target.value })}
            />
            <input
              className="w-full border rounded px-3 py-2"
              type="number"
              placeholder="End year"
              value={form.endYear}
              onChange={(e) => setForm({ ...form, endYear: e.target.value })}
            />
            <input
              className="w-full border rounded px-3 py-2"
              type="number"
              placeholder="Sort order"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
            />
          </div>
          <textarea
            className="w-full border rounded px-3 py-2 min-h-[120px]"
            placeholder="Bullets (one per line)"
            value={form.bulletsText}
            onChange={(e) => setForm({ ...form, bulletsText: e.target.value })}
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={remove}
        title="Delete experience"
        message="Delete this experience item?"
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
  const [experience, settings] = await Promise.all([
    prisma.experience.findMany({ orderBy: { sortOrder: "asc" } }),
    getSiteSettings(),
  ]);
  return {
    props: {
      experience: JSON.parse(JSON.stringify(experience)),
      settings,
    },
  };
}
