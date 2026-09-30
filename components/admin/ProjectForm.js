import { useState } from "react";
import RichTextEditor from "./RichTextEditor";
import MediaPickerModal from "./MediaPickerModal";
import { sanitizeHtmlForStorage } from "../../lib/sanitizeHtml";
import { normalizeTags, normalizePathList } from "../../lib/case-study";
import {
  PRESENTATION_MODES,
  PRESENTATION_MODE_META,
} from "../../lib/presentation";

export const emptyForm = {
  title: "",
  slug: "",
  description: "",
  overview: "",
  role: "",
  challenge: "",
  approach: "",
  process: "",
  results: "",
  tagsText: "",
  evidenceText: "",
  client: "",
  tools: "Photoshop|Illustrator",
  coverPath: "",
  featured: false,
  featuredOrder: 0,
  status: "published",
  presentationMode: "minimal",
  categoryId: "",
  seoTitle: "",
  seoDescription: "",
  mediaText: "",
  experienceId: "",
};

const CASE_FIELDS = [
  ["overview", "Overview", "Short case intro (falls back to description)"],
  ["role", "Role", "Your role on the project"],
  ["challenge", "Challenge", "Problem / context"],
  ["approach", "Approach", "How you approached it"],
  ["process", "Process", "What you did"],
  ["results", "Results", "Outcome narrative"],
];

export default function ProjectForm({
  initial,
  categories,
  experienceOptions = [],
  projectId,
  onSuccess,
  onCancel,
  embedded = false,
}) {
  const [form, setForm] = useState({ ...emptyForm, ...initial });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [pickerTarget, setPickerTarget] = useState(null);
  const [imagePickResolve, setImagePickResolve] = useState(null);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const openPicker = (target) => setPickerTarget(target);

  const onPickPath = (path) => {
    if (pickerTarget === "cover") {
      setForm((prev) => ({ ...prev, coverPath: path }));
    } else if (pickerTarget === "gallery") {
      setForm((prev) => ({
        ...prev,
        mediaText: prev.mediaText
          ? `${prev.mediaText.trimEnd()}\n${path}`
          : path,
      }));
    } else if (pickerTarget === "evidence") {
      setForm((prev) => ({
        ...prev,
        evidenceText: prev.evidenceText
          ? `${prev.evidenceText.trimEnd()}\n${path}`
          : path,
      }));
    } else if (pickerTarget === "editor" && imagePickResolve) {
      imagePickResolve(path);
      setImagePickResolve(null);
    }
    setPickerTarget(null);
  };

  const requestEditorImage = () =>
    new Promise((resolve) => {
      setImagePickResolve(() => resolve);
      setPickerTarget("editor");
    });

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const description = sanitizeHtmlForStorage(form.description);
    if (!description || description === "<p></p>") {
      setSaving(false);
      setError("Description is required");
      return;
    }

    const sanitizeOpt = (html) => {
      if (!html || !String(html).trim()) return null;
      const s = sanitizeHtmlForStorage(html);
      return s && s !== "<p></p>" ? s : null;
    };

    const payload = {
      ...form,
      description,
      overview: sanitizeOpt(form.overview),
      role: sanitizeOpt(form.role),
      challenge: sanitizeOpt(form.challenge),
      approach: sanitizeOpt(form.approach),
      process: sanitizeOpt(form.process),
      results: sanitizeOpt(form.results),
      tags: normalizeTags(form.tagsText),
      evidencePaths: normalizePathList(form.evidenceText),
      experienceId: form.experienceId === "" ? null : Number(form.experienceId),
      categoryId: Number(form.categoryId),
      featuredOrder: Number(form.featuredOrder) || 0,
      media: form.mediaText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    };
    delete payload.mediaText;
    delete payload.tagsText;
    delete payload.evidenceText;

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
    onSuccess?.(data);
  };

  const fields = (
    <>
      <p className="text-xs text-slate-500 bg-slate-50 border rounded px-3 py-2">
        Metadata and presentation mode live here. Compose the public page with
        blocks via Edit page — presentation mode only changes how those blocks
        look, not the data.
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        {[
          ["title", "Title", true],
          ["slug", "Slug (optional)", false],
          ["client", "Client", true],
          ["tools", "Tools (pipe-separated)", false],
          ["seoTitle", "SEO title", false],
        ].map(([name, label, required]) => (
          <div key={name} className={name === "tools" ? "sm:col-span-2" : ""}>
            <label className="block text-sm mb-1">{label}</label>
            <input
              className="w-full border rounded px-3 py-2"
              name={name}
              value={form[name]}
              onChange={onChange}
              required={required}
            />
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-500 -mt-2">
        SEO title, description, and cover image drive social previews. Public
        canonical URL is{" "}
        <code className="text-[11px]">/projects/&#123;slug&#125;</code>.
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm mb-1">
            Tags (comma-separated, hero line)
          </label>
          <input
            className="w-full border rounded px-3 py-2"
            name="tagsText"
            value={form.tagsText}
            onChange={onChange}
            placeholder="E-commerce, Operations, Marketing"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Related experience</label>
          <select
            className="w-full border rounded px-3 py-2"
            name="experienceId"
            value={form.experienceId}
            onChange={onChange}
          >
            <option value="">None</option>
            {experienceOptions.map((e) => (
              <option key={e.id} value={e.id}>
                {e.position} · {e.company}
              </option>
            ))}
          </select>
        </div>
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
          <label className="block text-sm mb-1">Cover path</label>
          <div className="flex gap-2">
            <input
              className="w-full border rounded px-3 py-2"
              name="coverPath"
              value={form.coverPath}
              onChange={onChange}
              required
              placeholder="/images/... or /uploads/..."
            />
            <button
              type="button"
              className="shrink-0 px-3 py-2 border rounded text-sm hover:bg-slate-50"
              onClick={() => openPicker("cover")}
            >
              Pick
            </button>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm mb-1">Description</label>
        <RichTextEditor
          value={form.description}
          onChange={(html) =>
            setForm((prev) => ({ ...prev, description: html }))
          }
          placeholder="Project description…"
          onRequestImage={requestEditorImage}
          minHeight="180px"
        />
      </div>

      <div className="space-y-4 border-t pt-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Case study
        </h3>
        {CASE_FIELDS.map(([name, label, hint]) => (
          <div key={name}>
            <label className="block text-sm mb-1">
              {label}
              <span className="text-slate-400 font-normal"> — {hint}</span>
            </label>
            <RichTextEditor
              value={form[name] || ""}
              onChange={(html) =>
                setForm((prev) => ({ ...prev, [name]: html }))
              }
              placeholder={label}
              onRequestImage={requestEditorImage}
              minHeight="120px"
            />
          </div>
        ))}
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
          Visual evidence paths (one per line)
        </label>
        <div className="flex gap-2 mb-2">
          <button
            type="button"
            className="px-3 py-1.5 border rounded text-sm hover:bg-slate-50"
            onClick={() => openPicker("evidence")}
          >
            Add from media
          </button>
        </div>
        <textarea
          className="w-full border rounded px-3 py-2 min-h-[80px] font-mono text-sm"
          name="evidenceText"
          value={form.evidenceText}
          onChange={onChange}
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Gallery paths (one per line)</label>
        <div className="flex gap-2 mb-2">
          <button
            type="button"
            className="px-3 py-1.5 border rounded text-sm hover:bg-slate-50"
            onClick={() => openPicker("gallery")}
          >
            Add from media
          </button>
        </div>
        <textarea
          className="w-full border rounded px-3 py-2 min-h-[100px] font-mono text-sm"
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

      <div>
        <label className="block text-sm mb-1">Presentation mode</label>
        <select
          className="w-full border rounded px-3 py-2"
          name="presentationMode"
          value={form.presentationMode || "minimal"}
          onChange={onChange}
        >
          {PRESENTATION_MODES.map((mode) => (
            <option key={mode} value={mode}>
              {PRESENTATION_MODE_META[mode]?.label || mode}
            </option>
          ))}
        </select>
        <p className="text-xs text-slate-500 mt-1">
          {PRESENTATION_MODE_META[form.presentationMode || "minimal"]
            ?.description || ""}
        </p>
      </div>

      {error && <p className="text-red-600">{error}</p>}

      <div
        className={
          embedded
            ? "sticky bottom-0 -mx-5 px-5 py-3 mt-4 bg-slate-50 border-t flex justify-end gap-2"
            : "flex justify-end gap-2 pt-2"
        }
      >
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded border border-slate-300 hover:bg-slate-100"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save project"}
        </button>
      </div>
    </>
  );

  return (
    <>
      <form
        id="project-form"
        onSubmit={onSubmit}
        className={
          embedded
            ? "space-y-4"
            : "bg-white border rounded-lg p-6 space-y-4 max-w-3xl"
        }
      >
        {fields}
      </form>
      <MediaPickerModal
        open={Boolean(pickerTarget)}
        onClose={() => {
          if (pickerTarget === "editor" && imagePickResolve) {
            imagePickResolve(null);
            setImagePickResolve(null);
          }
          setPickerTarget(null);
        }}
        onSelect={onPickPath}
        title={
          pickerTarget === "cover"
            ? "Pick cover image"
            : pickerTarget === "gallery"
              ? "Add gallery image"
              : pickerTarget === "evidence"
                ? "Add evidence image"
                : "Insert image"
        }
      />
    </>
  );
}
