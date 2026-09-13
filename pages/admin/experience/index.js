import { useState } from "react";
import AdminLayout from "../../../components/admin/AdminLayout";
import { getAdminSession } from "../../../lib/admin";
import { prisma } from "../../../lib/prisma";
import { getSiteSettings } from "../../../lib/content";

const blank = {
  position: "",
  company: "",
  period: "",
  bulletsText: "",
  sortOrder: 0,
};

export default function AdminExperience({ experience: initial, settings }) {
  const [items, setItems] = useState(initial);
  const [form, setForm] = useState(blank);

  const refresh = async () => {
    const res = await fetch("/api/admin/experience");
    setItems(await res.json());
  };

  const save = async (e) => {
    e.preventDefault();
    await fetch("/api/admin/experience", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        bullets: form.bulletsText
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean),
      }),
    });
    setForm(blank);
    refresh();
  };

  const remove = async (id) => {
    if (!confirm("Delete experience item?")) return;
    await fetch("/api/admin/experience", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    refresh();
  };

  return (
    <AdminLayout siteName={settings.siteName}>
      <h1 className="text-3xl font-semibold mb-6">Experience</h1>
      <form onSubmit={save} className="bg-white border rounded-lg p-5 mb-6 space-y-3 max-w-2xl">
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
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Period"
          value={form.period}
          onChange={(e) => setForm({ ...form, period: e.target.value })}
          required
        />
        <textarea
          className="w-full border rounded px-3 py-2 min-h-[100px]"
          placeholder="Bullets (one per line)"
          value={form.bulletsText}
          onChange={(e) => setForm({ ...form, bulletsText: e.target.value })}
        />
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
          Add experience
        </button>
      </form>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="bg-white border rounded-lg p-4">
            <div className="flex justify-between gap-3">
              <div>
                <h2 className="font-semibold">
                  {item.position} · {item.company}
                </h2>
                <p className="text-sm text-slate-500">{item.period}</p>
                <ul className="list-disc ml-5 mt-2 text-sm">
                  {(item.bullets || []).map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                className="text-red-600"
                onClick={() => remove(item.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
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
