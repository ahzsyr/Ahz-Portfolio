import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import AdminLayout from "../../../components/admin/AdminLayout";
import PageHeader from "../../../components/admin/PageHeader";
import Modal from "../../../components/admin/Modal";
import ConfirmDialog from "../../../components/admin/ConfirmDialog";
import ProjectForm, { emptyForm } from "../../../components/admin/ProjectForm";
import { getAdminSession } from "../../../lib/admin";
import { prisma } from "../../../lib/prisma";
import { getSiteSettings } from "../../../lib/content";

function projectToForm(project) {
  const tags = Array.isArray(project.tags)
    ? project.tags.join(", ")
    : "";
  const evidence = Array.isArray(project.evidencePaths)
    ? project.evidencePaths.join("\n")
    : "";
  return {
    title: project.title,
    slug: project.slug,
    description: project.description,
    overview: project.overview || "",
    role: project.role || "",
    challenge: project.challenge || "",
    approach: project.approach || "",
    process: project.process || "",
    results: project.results || "",
    tagsText: tags,
    evidenceText: evidence,
    client: project.client,
    tools: Array.isArray(project.tools)
      ? project.tools.join("|")
      : project.tools || "",
    coverPath: project.coverPath,
    featured: project.featured,
    featuredOrder: project.featuredOrder,
    status: project.status,
    presentationMode: project.presentationMode || "minimal",
    categoryId: String(project.categoryId),
    seoTitle: project.seoTitle || "",
    seoDescription: project.seoDescription || "",
    mediaText: (project.media || []).map((m) => m.path).join("\n"),
    experienceId: project.experienceId != null ? String(project.experienceId) : "",
  };
}

export default function AdminProjects({
  projects: initial,
  categories,
  experienceOptions,
  settings,
}) {
  const router = useRouter();
  const [projects, setProjects] = useState(initial);
  const [query, setQuery] = useState("");
  const [modalMode, setModalMode] = useState(null);
  const [editing, setEditing] = useState(null);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = projects.filter((p) =>
    `${p.title} ${p.client} ${p.category?.name || ""}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  const openNew = () => {
    setEditing(null);
    setModalMode("create");
    router.replace("/admin/projects?new=1", undefined, { shallow: true });
  };

  const openEdit = async (id) => {
    setModalMode("edit");
    setLoadingEdit(true);
    setEditing(null);
    router.replace(`/admin/projects?edit=${id}`, undefined, { shallow: true });
    try {
      const res = await fetch(`/api/admin/projects/${id}`);
      if (!res.ok) throw new Error("Failed to load project");
      const project = await res.json();
      setEditing(project);
    } catch {
      setModalMode(null);
    } finally {
      setLoadingEdit(false);
    }
  };

  const closeModal = () => {
    setModalMode(null);
    setEditing(null);
    router.replace("/admin/projects", undefined, { shallow: true });
  };

  useEffect(() => {
    const { edit, new: isNew } = router.query;
    if (isNew === "1" || isNew === "true") {
      setEditing(null);
      setModalMode("create");
      return;
    }
    if (edit) {
      const id = Number(edit);
      if (id) openEdit(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.edit, router.query.new]);

  const refreshList = async () => {
    const res = await fetch("/api/admin/projects");
    if (res.ok) setProjects(await res.json());
  };

  const onFormSuccess = async () => {
    closeModal();
    await refreshList();
  };

  const remove = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/projects/${deleteId}`, {
      method: "DELETE",
    });
    setDeleting(false);
    if (res.ok) {
      setProjects((prev) => prev.filter((p) => p.id !== deleteId));
      setDeleteId(null);
    }
  };

  const formInitial = useMemo(() => {
    if (modalMode === "create") {
      return {
        ...emptyForm,
        categoryId: categories[0]?.id ? String(categories[0].id) : "",
      };
    }
    if (editing) return projectToForm(editing);
    return null;
  }, [modalMode, editing, categories]);

  return (
    <AdminLayout siteName={settings.siteName}>
      <PageHeader
        title="Projects"
        description="Metadata in the modal; Edit page composes the public case study with blocks."
        actions={
          <button
            type="button"
            onClick={openNew}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            New project
          </button>
        }
      />
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
                  <button
                    type="button"
                    className="text-blue-600"
                    onClick={() => openEdit(project.id)}
                  >
                    Edit
                  </button>
                  <Link
                    href={`/admin/projects/${project.id}/story`}
                    className="text-blue-600 font-medium"
                  >
                    Edit page
                  </Link>
                  <button
                    type="button"
                    className="text-red-600"
                    onClick={() => setDeleteId(project.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={Boolean(modalMode)}
        onClose={closeModal}
        title={modalMode === "create" ? "New project" : "Edit project"}
        size="xl"
        footer={null}
      >
        {loadingEdit || (modalMode === "edit" && !formInitial) ? (
          <p className="text-slate-500">Loading…</p>
        ) : formInitial ? (
          <ProjectForm
            key={editing?.id || "new"}
            embedded
            initial={formInitial}
            categories={categories}
            experienceOptions={experienceOptions}
            projectId={editing?.id}
            onSuccess={onFormSuccess}
            onCancel={closeModal}
          />
        ) : null}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={remove}
        title="Delete project"
        message="Delete this project? This cannot be undone."
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
  const [projects, categories, experienceOptions, settings] = await Promise.all([
    prisma.project.findMany({
      include: {
        category: true,
        story: { select: { id: true, status: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.experience.findMany({
      select: { id: true, position: true, company: true },
      orderBy: { sortOrder: "asc" },
    }),
    getSiteSettings(),
  ]);
  return {
    props: {
      projects: JSON.parse(JSON.stringify(projects)),
      categories: JSON.parse(JSON.stringify(categories)),
      experienceOptions: JSON.parse(JSON.stringify(experienceOptions)),
      settings,
    },
  };
}
