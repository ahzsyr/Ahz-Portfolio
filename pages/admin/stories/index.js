import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import AdminLayout from "../../../components/admin/AdminLayout";
import PageHeader from "../../../components/admin/PageHeader";
import ConfirmDialog from "../../../components/admin/ConfirmDialog";
import { getAdminSession } from "../../../lib/admin";
import { prisma } from "../../../lib/prisma";
import { getSiteSettings } from "../../../lib/content";

export default function AdminStories({
  stories: initial,
  projects,
  settings,
}) {
  const router = useRouter();
  const [stories, setStories] = useState(initial);
  const [creating, setCreating] = useState(false);
  const [projectId, setProjectId] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const refresh = async () => {
    const res = await fetch("/api/admin/stories");
    setStories(await res.json());
  };

  const ensureImpact = async () => {
    setError("");
    setCreating(true);
    const res = await fetch("/api/admin/stories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scope: "impact", title: "Impact" }),
    });
    setCreating(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not create Impact story");
      return;
    }
    const row = await res.json();
    router.push(`/admin/stories/${row.id}`);
  };

  const createProjectStory = async (e) => {
    e.preventDefault();
    setError("");
    if (!projectId) return;
    setCreating(true);
    const res = await fetch("/api/admin/stories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scope: "project", projectId }),
    });
    setCreating(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not create project story");
      return;
    }
    const row = await res.json();
    router.push(`/admin/stories/${row.id}`);
  };

  const remove = async () => {
    if (!deleteId) return;
    setDeleting(true);
    await fetch("/api/admin/stories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deleteId }),
    });
    setDeleting(false);
    setDeleteId(null);
    refresh();
  };

  const impactStory = stories.find((s) => s.scope === "impact");
  const projectStories = stories.filter((s) => s.scope === "project");
  const projectsWithoutStory = projects.filter(
    (p) => !stories.some((s) => s.projectId === p.id)
  );

  return (
    <AdminLayout siteName={settings.siteName}>
      <PageHeader
        title="Stories"
        description="Compose Impact narrative blocks. Project pages use Edit page on each project (Presentation composition)."
        actions={
          !impactStory ? (
            <button
              type="button"
              onClick={ensureImpact}
              disabled={creating}
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm disabled:opacity-60"
            >
              Create Impact story
            </button>
          ) : null
        }
      />

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <div className="space-y-6">
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-2">
            Impact
          </h2>
          {impactStory ? (
            <div className="bg-white border rounded-lg p-4 flex justify-between gap-3 items-center">
              <div>
                <p className="font-semibold">{impactStory.title || "Impact"}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {impactStory.status} · {impactStory._count?.blocks ?? 0}{" "}
                  blocks
                </p>
              </div>
              <div className="flex gap-3">
                <Link
                  href={`/admin/stories/${impactStory.id}`}
                  className="text-blue-600 text-sm"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  className="text-red-600 text-sm"
                  onClick={() => setDeleteId(impactStory.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              No Impact story yet — public page uses Phase 3 fallback.
            </p>
          )}
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-2">
            Projects
          </h2>
          <p className="text-xs text-slate-500 mb-3">
            Project stories are not shown on the public case study page —
            author narrative in the project editor instead.
          </p>
          <form
            onSubmit={createProjectStory}
            className="flex flex-wrap gap-2 mb-4 items-end"
          >
            <select
              className="border rounded px-3 py-2 text-sm min-w-[200px]"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            >
              <option value="">Select project…</option>
              {projectsWithoutStory.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={creating || !projectId}
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm disabled:opacity-60"
            >
              Add project story
            </button>
          </form>

          <div className="space-y-2">
            {projectStories.length === 0 && (
              <p className="text-sm text-slate-500">No project stories yet.</p>
            )}
            {projectStories.map((s) => (
              <div
                key={s.id}
                className="bg-white border rounded-lg p-4 flex justify-between gap-3 items-center"
              >
                <div>
                  <p className="font-semibold">
                    {s.project?.title || s.title || `Project #${s.projectId}`}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {s.status} · {s._count?.blocks ?? 0} blocks
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link
                    href={
                      s.projectId
                        ? `/admin/projects/${s.projectId}/story`
                        : `/admin/stories/${s.id}`
                    }
                    className="text-blue-600 text-sm"
                  >
                    Edit page
                  </Link>
                  <button
                    type="button"
                    className="text-red-600 text-sm"
                    onClick={() => setDeleteId(s.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={remove}
        title="Delete story"
        message="Delete this story and all its blocks? Public pages will fall back to Phase 3 layout."
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

  const [stories, projects, settings] = await Promise.all([
    prisma.story.findMany({
      include: {
        project: { select: { id: true, title: true, slug: true } },
        _count: { select: { blocks: true } },
      },
      orderBy: [{ scope: "asc" }, { updatedAt: "desc" }],
    }),
    prisma.project.findMany({
      select: { id: true, title: true, slug: true },
      orderBy: { title: "asc" },
    }),
    getSiteSettings(),
  ]);

  return {
    props: {
      stories: JSON.parse(JSON.stringify(stories)),
      projects: JSON.parse(JSON.stringify(projects)),
      settings,
    },
  };
}
