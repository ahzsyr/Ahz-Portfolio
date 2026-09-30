import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import PageHeader from "./PageHeader";
import Modal from "./Modal";
import ConfirmDialog from "./ConfirmDialog";
import RichTextEditor from "./RichTextEditor";
import MediaPickerModal from "./MediaPickerModal";
import StoryRenderer from "../story/StoryRenderer";
import {
  STORY_BLOCK_TYPE_LABELS,
  blockTypesForScope,
  PROJECT_PAGE_TEMPLATES,
  getProjectPageTemplate,
} from "../../lib/story";
import {
  getPresentationTheme,
  normalizePresentationMode,
} from "../../lib/presentation";

const blankBlock = {
  type: "prose",
  title: "",
  subtitle: "",
  body: "",
  metricId: "",
  achievementId: "",
  projectMediaId: "",
  milestoneId: "",
  metricIds: [],
  preferredSeriesType: "area",
  imagePath: "",
  videoPath: "",
  galleryPaths: [],
  toolsText: "",
  ctaHref: "",
  ctaLabel: "",
};

function toBlockForm(block) {
  const config = block.config || {};
  return {
    type: block.type || "prose",
    title: block.title || "",
    subtitle: block.subtitle || "",
    body: block.body || "",
    metricId: block.metricId ?? "",
    achievementId: block.achievementId ?? "",
    projectMediaId: block.projectMediaId ?? "",
    milestoneId: block.milestoneId ?? "",
    metricIds: (block.metrics || []).map((m) => m.metricId ?? m.metric?.id),
    preferredSeriesType: config.preferredSeriesType || "area",
    imagePath: config.imagePath || "",
    videoPath: config.videoPath || config.url || "",
    galleryPaths: Array.isArray(config.paths) ? config.paths : [],
    toolsText: Array.isArray(config.tools) ? config.tools.join(" | ") : "",
    ctaHref: config.href || "",
    ctaLabel: config.label || "",
  };
}

/**
 * Shared visual block editor for Impact + project Stories.
 */
export default function BlockEditor({
  story: initialStory,
  mappedStory: initialMapped,
  metrics = [],
  achievements = [],
  milestones = [],
  media = [],
  project = null,
  backHref = "/admin/stories",
  backLabel = "All stories",
  showTemplates = false,
}) {
  const router = useRouter();
  const scope = initialStory.scope || "impact";
  const allowedTypes = useMemo(() => blockTypesForScope(scope), [scope]);
  const presentationMode = normalizePresentationMode(
    project?.presentationMode
  );
  const presentationTheme = getPresentationTheme(presentationMode);

  const [story, setStory] = useState(initialStory);
  const [mapped, setMapped] = useState(initialMapped);
  const [blocks, setBlocks] = useState(initialStory.blocks || []);
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(blankBlock);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [mediaPicker, setMediaPicker] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);
  const [templateConfirm, setTemplateConfirm] = useState(null);
  const [templateApplying, setTemplateApplying] = useState(false);

  useEffect(() => {
    setStory(initialStory);
    setMapped(initialMapped);
    setBlocks(initialStory.blocks || []);
  }, [initialStory, initialMapped]);

  const refreshBlocks = async () => {
    await router.replace(router.asPath);
  };

  const payloadFromForm = () => {
    const config = {};
    if (form.type === "chartCard") {
      config.preferredSeriesType = form.preferredSeriesType || "area";
    }
    if (
      (form.type === "mediaCard" || form.type === "hero") &&
      form.imagePath
    ) {
      config.imagePath = form.imagePath;
    }
    if (form.type === "gallery") {
      config.paths = form.galleryPaths.filter(Boolean);
    }
    if (form.type === "video" && form.videoPath) {
      config.videoPath = form.videoPath;
    }
    if (form.type === "toolsList") {
      config.tools = form.toolsText
        .split("|")
        .map((t) => t.trim())
        .filter(Boolean);
    }
    if (form.type === "cta") {
      if (form.ctaHref) config.href = form.ctaHref;
      if (form.ctaLabel) config.label = form.ctaLabel;
    }
    return {
      type: form.type,
      title: form.title,
      subtitle: form.subtitle,
      body: form.body,
      metricId: form.metricId || null,
      achievementId: form.achievementId || null,
      projectMediaId: form.projectMediaId || null,
      milestoneId: form.milestoneId || null,
      metricIds: form.metricIds,
      config,
    };
  };

  const saveBlock = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = payloadFromForm();
    const res = await fetch(`/api/admin/stories/${story.id}/blocks`, {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        editingId ? { id: editingId, ...payload } : payload
      ),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Save failed");
      return;
    }
    setModal(false);
    await refreshBlocks();
  };

  const removeBlock = async () => {
    if (!deleteId) return;
    setDeleting(true);
    await fetch(`/api/admin/stories/${story.id}/blocks`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deleteId }),
    });
    setDeleting(false);
    setDeleteId(null);
    await refreshBlocks();
  };

  const persistOrder = async (next) => {
    const orderedIds = next.map((b) => b.id);
    setBlocks(next);
    await fetch(`/api/admin/stories/${story.id}/blocks`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds }),
    });
    await refreshBlocks();
  };

  const moveBlock = async (index, dir) => {
    const next = [...blocks];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    await persistOrder(next);
  };

  const onDropReorder = async (toIndex) => {
    if (dragIndex == null || dragIndex === toIndex) {
      setDragIndex(null);
      return;
    }
    const next = [...blocks];
    const [item] = next.splice(dragIndex, 1);
    next.splice(toIndex, 0, item);
    setDragIndex(null);
    await persistOrder(next);
  };

  const toggleStatus = async () => {
    setStatusSaving(true);
    const next = story.status === "published" ? "draft" : "published";
    const res = await fetch("/api/admin/stories", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: story.id, status: next }),
    });
    setStatusSaving(false);
    if (res.ok) {
      const row = await res.json();
      setStory({ ...story, status: row.status });
      setMapped({ ...mapped, status: row.status });
    }
  };

  const toggleMetricId = (id) => {
    const n = Number(id);
    setForm((f) => {
      const has = f.metricIds.includes(n);
      let metricIds = has
        ? f.metricIds.filter((x) => x !== n)
        : [...f.metricIds, n];
      if (metricIds.length > 4) metricIds = metricIds.slice(0, 4);
      return { ...f, metricIds };
    });
  };

  const applyTemplate = async () => {
    const tpl = getProjectPageTemplate(templateConfirm);
    if (!tpl) {
      setTemplateConfirm(null);
      return;
    }
    setTemplateApplying(true);
    setError("");
    for (const block of tpl.blocks) {
      const payload = {
        type: block.type,
        title: block.title || "",
        subtitle: block.subtitle || "",
        body: block.body || "",
        metricId: block.metricId || null,
        metricIds: block.metricIds || [],
        config: block.config || {},
      };
      // Skip types that need metrics until user fills them — still create shell
      const res = await fetch(`/api/admin/stories/${story.id}/blocks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        // Soft-fail incomplete blocks (metrics, empty gallery, etc.)
        continue;
      }
    }
    setTemplateApplying(false);
    setTemplateConfirm(null);
    await refreshBlocks();
  };

  const previewStory = useMemo(
    () => ({
      ...mapped,
      blocks: mapped.blocks || [],
    }),
    [mapped]
  );

  const openAdd = (type = "prose") => {
    setEditingId(null);
    setForm({ ...blankBlock, type });
    setError("");
    setModal(true);
  };

  return (
    <>
      <PageHeader
        title={story.title || (project ? `${project.title} page` : "Story")}
        description={`${story.scope}${
          project ? ` · ${project.title}` : ""
        } · ${story.status} — drag blocks to reorder`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href={backHref}
              className="px-3 py-2 rounded border text-sm"
            >
              {backLabel}
            </Link>
            <button
              type="button"
              onClick={toggleStatus}
              disabled={statusSaving}
              className="px-3 py-2 rounded border text-sm disabled:opacity-60"
            >
              {story.status === "published" ? "Unpublish" : "Publish"}
            </button>
            <button
              type="button"
              onClick={() => openAdd()}
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm"
            >
              Add block
            </button>
          </div>
        }
      />

      {project && (
        <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
          <span className="px-2.5 py-1 rounded border bg-white text-slate-700">
            Presentation:{" "}
            <strong>{presentationTheme.label}</strong>
          </span>
          <Link
            href={`/admin/projects?edit=${project.id}`}
            className="text-blue-600 hover:underline"
          >
            Change mode in project metadata →
          </Link>
        </div>
      )}

      {showTemplates && (
        <div className="mb-6 bg-white border rounded-lg p-4">
          <p className="text-sm font-medium mb-2">Insert template</p>
          <p className="text-xs text-slate-500 mb-3">
            Appends a starter layout. Existing blocks are kept — confirm first.
          </p>
          <div className="flex flex-wrap gap-2">
            {PROJECT_PAGE_TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                className="px-3 py-1.5 text-sm border rounded hover:bg-slate-50"
                onClick={() => setTemplateConfirm(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-2">
            Blocks
          </h2>
          {blocks.length === 0 && (
            <p className="text-sm text-slate-500">
              No blocks yet. Add a hero, prose, gallery, metrics, and more —
              or insert a template.
            </p>
          )}
          {blocks.map((b, i) => (
            <div
              key={b.id}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDropReorder(i)}
              className={`bg-white border rounded-lg p-3 flex justify-between gap-2 cursor-grab active:cursor-grabbing ${
                dragIndex === i ? "opacity-60 border-blue-400" : ""
              }`}
            >
              <div className="min-w-0">
                <p className="font-medium text-sm">
                  {STORY_BLOCK_TYPE_LABELS[b.type] || b.type}
                  {b.title ? ` · ${b.title}` : ""}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  #{b.sortOrder} · drag to reorder
                </p>
              </div>
              <div className="flex gap-2 shrink-0 text-sm">
                <button type="button" aria-label="Move up" onClick={() => moveBlock(i, -1)}>
                  ↑
                </button>
                <button type="button" aria-label="Move down" onClick={() => moveBlock(i, 1)}>
                  ↓
                </button>
                <button
                  type="button"
                  className="text-blue-600"
                  onClick={() => {
                    setEditingId(b.id);
                    setForm(toBlockForm(b));
                    setError("");
                    setModal(true);
                  }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="text-red-600"
                  onClick={() => setDeleteId(b.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-2">
            Preview
          </h2>
          <div className="bg-white border rounded-lg p-4 max-h-[70vh] overflow-y-auto scale-[0.92] origin-top-left">
            {previewStory.blocks?.length ? (
              <StoryRenderer
                story={previewStory}
                project={project}
                presentationMode={presentationMode}
                milestones={milestones}
                warn
              />
            ) : (
              <p className="text-sm text-slate-500">Nothing to preview.</p>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editingId ? "Edit block" : "Add block"}
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setModal(false)}
              className="px-4 py-2 rounded border"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="block-form"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        }
      >
        <form id="block-form" onSubmit={saveBlock} className="space-y-3">
          <select
            className="w-full border rounded px-3 py-2"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            {allowedTypes.map((t) => (
              <option key={t} value={t}>
                {STORY_BLOCK_TYPE_LABELS[t] || t}
              </option>
            ))}
          </select>
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Subtitle / attribution"
            value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
          />

          {form.type === "prose" ? (
            <RichTextEditor
              value={form.body}
              onChange={(html) => setForm({ ...form, body: html })}
            />
          ) : form.type !== "hero" &&
            form.type !== "gallery" &&
            form.type !== "toolsList" &&
            form.type !== "cta" ? (
            <textarea
              className="w-full border rounded px-3 py-2"
              rows={3}
              placeholder="Body (optional)"
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
            />
          ) : null}

          {form.type === "cta" && (
            <>
              <textarea
                className="w-full border rounded px-3 py-2"
                rows={2}
                placeholder="Supporting text"
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
              />
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="Link href (/projects or https://…)"
                value={form.ctaHref}
                onChange={(e) =>
                  setForm({ ...form, ctaHref: e.target.value })
                }
              />
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="Button label"
                value={form.ctaLabel}
                onChange={(e) =>
                  setForm({ ...form, ctaLabel: e.target.value })
                }
              />
            </>
          )}

          {form.type === "toolsList" && (
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Tools (pipe-separated). Leave empty to use project tools."
              value={form.toolsText}
              onChange={(e) =>
                setForm({ ...form, toolsText: e.target.value })
              }
            />
          )}

          {(form.type === "hero" || form.type === "mediaCard") && (
            <div className="flex gap-2">
              <input
                className="flex-1 border rounded px-3 py-2"
                placeholder={
                  form.type === "hero"
                    ? "Cover image path (defaults to project cover)"
                    : "Image path / URL"
                }
                value={form.imagePath}
                onChange={(e) =>
                  setForm({ ...form, imagePath: e.target.value })
                }
              />
              <button
                type="button"
                className="px-3 py-2 border rounded text-sm"
                onClick={() => setMediaPicker("image")}
              >
                Browse
              </button>
            </div>
          )}

          {form.type === "mediaCard" && media.length > 0 && (
            <select
              className="w-full border rounded px-3 py-2"
              value={form.projectMediaId}
              onChange={(e) =>
                setForm({ ...form, projectMediaId: e.target.value })
              }
            >
              <option value="">Project media…</option>
              {media.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.alt || m.path}
                </option>
              ))}
            </select>
          )}

          {form.type === "gallery" && (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {form.galleryPaths.map((p) => (
                  <span
                    key={p}
                    className="inline-flex items-center gap-1 text-xs bg-slate-100 px-2 py-1 rounded"
                  >
                    {p}
                    <button
                      type="button"
                      className="text-red-600"
                      onClick={() =>
                        setForm({
                          ...form,
                          galleryPaths: form.galleryPaths.filter(
                            (x) => x !== p
                          ),
                        })
                      }
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <button
                type="button"
                className="px-3 py-2 border rounded text-sm"
                onClick={() => setMediaPicker("gallery")}
              >
                Add image
              </button>
            </div>
          )}

          {form.type === "video" && (
            <div className="flex gap-2">
              <input
                className="flex-1 border rounded px-3 py-2"
                placeholder="Video path or embed URL"
                value={form.videoPath}
                onChange={(e) =>
                  setForm({ ...form, videoPath: e.target.value })
                }
              />
              <button
                type="button"
                className="px-3 py-2 border rounded text-sm"
                onClick={() => setMediaPicker("video")}
              >
                Browse
              </button>
            </div>
          )}

          {[
            "metricCard",
            "chartCard",
            "comparisonCard",
            "progressCard",
          ].includes(form.type) && (
            <select
              className="w-full border rounded px-3 py-2"
              value={form.metricId}
              onChange={(e) => setForm({ ...form, metricId: e.target.value })}
            >
              <option value="">Select metric…</option>
              {metrics.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label || m.name}
                </option>
              ))}
            </select>
          )}

          {form.type === "chartCard" && (
            <select
              className="w-full border rounded px-3 py-2"
              value={form.preferredSeriesType}
              onChange={(e) =>
                setForm({ ...form, preferredSeriesType: e.target.value })
              }
            >
              <option value="area">Area</option>
              <option value="line">Line</option>
              <option value="bar">Bar</option>
            </select>
          )}

          {form.type === "statGrid" && (
            <div className="border rounded p-3 max-h-40 overflow-y-auto space-y-1">
              <p className="text-xs text-slate-500 mb-2">Pick 2–4 metrics</p>
              {metrics.map((m) => (
                <label key={m.id} className="flex gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.metricIds.includes(m.id)}
                    onChange={() => toggleMetricId(m.id)}
                  />
                  {m.label || m.name}
                </label>
              ))}
            </div>
          )}

          {form.type === "achievementCard" && (
            <select
              className="w-full border rounded px-3 py-2"
              value={form.achievementId}
              onChange={(e) =>
                setForm({ ...form, achievementId: e.target.value })
              }
            >
              <option value="">Select achievement…</option>
              {achievements.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title}
                </option>
              ))}
            </select>
          )}

          {form.type === "timelineCard" && (
            <select
              className="w-full border rounded px-3 py-2"
              value={form.milestoneId}
              onChange={(e) =>
                setForm({ ...form, milestoneId: e.target.value })
              }
            >
              <option value="">All milestones (context)</option>
              {milestones.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          )}

          {error && <p className="text-red-600 text-sm">{error}</p>}
        </form>
      </Modal>

      <MediaPickerModal
        open={Boolean(mediaPicker)}
        onClose={() => setMediaPicker(null)}
        title={
          mediaPicker === "gallery"
            ? "Add gallery image"
            : mediaPicker === "video"
              ? "Pick video"
              : "Pick image"
        }
        onSelect={(path) => {
          if (mediaPicker === "gallery") {
            setForm((f) => ({
              ...f,
              galleryPaths: [...f.galleryPaths, path],
            }));
          } else if (mediaPicker === "video") {
            setForm((f) => ({ ...f, videoPath: path }));
          } else {
            setForm((f) => ({ ...f, imagePath: path }));
          }
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={removeBlock}
        title="Delete block"
        message="Remove this block from the story?"
        confirmLabel="Delete"
        danger
        loading={deleting}
      />

      <ConfirmDialog
        open={Boolean(templateConfirm)}
        onClose={() => setTemplateConfirm(null)}
        onConfirm={applyTemplate}
        title="Insert template"
        message={`${
          getProjectPageTemplate(templateConfirm)?.description ||
          "Append template blocks"
        }. Existing blocks stay; new blocks are added at the end.`}
        confirmLabel="Insert"
        loading={templateApplying}
      />
    </>
  );
}
