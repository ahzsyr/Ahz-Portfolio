import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import AdminLayout from "../../../components/admin/AdminLayout";
import PageHeader from "../../../components/admin/PageHeader";
import Modal from "../../../components/admin/Modal";
import { getAdminSession } from "../../../lib/admin";
import { getSiteSettings } from "../../../lib/content";
import {
  MEDIA_TYPE_LABELS,
  MEDIA_TYPES,
  classifyMediaType,
  filterMediaByType,
  normalizeMediaTypeQuery,
} from "../../../lib/adminMedia";

export default function AdminMedia({ settings }) {
  const router = useRouter();
  // Default in memory — do not router.replace(?type=image). Shallow rewrites
  // during outbound navigations were canceling sidebar Links.
  const mediaType = normalizeMediaTypeQuery(router.query.type) || "image";
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [copied, setCopied] = useState("");

  const filtered = useMemo(
    () => filterMediaByType(files, mediaType),
    [files, mediaType]
  );

  const load = async () => {
    try {
      const res = await fetch("/api/admin/media");
      if (!res.ok) throw new Error("Failed to load media");
      setFiles(await res.json());
    } catch {
      setFiles([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (router.query.upload === "1") {
      setUploadOpen(true);
    }
  }, [router.query.upload]);

  const mediaHref = (type, extra = {}) => ({
    pathname: "/admin/media",
    query: { type, ...extra },
  });

  const closeUpload = () => {
    setUploadOpen(false);
    // Only touch the URL when clearing ?upload= — never rewrite on every close.
    if (router.query.upload == null) return;
    router.replace(mediaHref(mediaType), undefined, { shallow: true });
  };

  const onUpload = async (e) => {
    const selected = e.target.files;
    if (!selected?.length) return;
    setUploading(true);
    setError("");
    const body = new FormData();
    Array.from(selected).forEach((file) => body.append("file", file));
    const res = await fetch("/api/admin/media", { method: "POST", body });
    setUploading(false);
    if (!res.ok) {
      setError("Upload failed");
      return;
    }
    e.target.value = "";
    await load();
    closeUpload();
  };

  const copyPath = async (path) => {
    await navigator.clipboard.writeText(path);
    setCopied(path);
    setTimeout(() => setCopied(""), 1500);
  };

  const title = MEDIA_TYPE_LABELS[mediaType] || "Media";
  const emptyCopy = {
    image: "No images yet. Upload JPG, PNG, WebP, GIF, or SVG.",
    video: "No videos yet. Upload MP4 or WebM when ready.",
    document: "No documents yet. Upload PDF or office files.",
    asset: "No other assets yet. Untyped files appear here.",
  };

  return (
    <AdminLayout siteName={settings.siteName}>
      <PageHeader
        title={title}
        description="Upload files and copy paths into projects, stories, and settings."
        actions={
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Upload files
          </button>
        }
      />

      <div className="flex flex-wrap gap-2 mb-4 border-b border-slate-200 pb-3">
        {MEDIA_TYPES.map((t) => (
          <Link
            key={t}
            href={mediaHref(t)}
            className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
              mediaType === t
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            {MEDIA_TYPE_LABELS[t]}
          </Link>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 && (
          <p className="text-slate-500 text-sm col-span-full">
            {emptyCopy[mediaType] || "No media files yet."}
          </p>
        )}
        {filtered.map((file) => {
          const kind = classifyMediaType(file.path, file.mimeType);
          return (
            <div key={file.path} className="bg-white border rounded-lg p-3">
              {kind === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={file.path}
                  alt={file.name}
                  className="w-full h-40 object-cover rounded mb-2"
                />
              ) : (
                <div className="h-40 flex items-center justify-center bg-slate-100 rounded mb-2 text-sm text-slate-500 uppercase tracking-wide">
                  {kind}
                </div>
              )}
              <p className="text-xs break-all">{file.path}</p>
              <button
                type="button"
                className="text-blue-600 text-sm mt-2"
                onClick={() => copyPath(file.path)}
              >
                {copied === file.path ? "Copied!" : "Copy path"}
              </button>
            </div>
          );
        })}
      </div>

      <Modal
        open={uploadOpen}
        onClose={closeUpload}
        title="Upload media"
        size="md"
        footer={
          <div className="flex justify-end">
            <button
              type="button"
              onClick={closeUpload}
              className="px-4 py-2 rounded border border-slate-300 hover:bg-slate-100"
            >
              Close
            </button>
          </div>
        }
      >
        <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-300 rounded-lg p-8 cursor-pointer hover:border-blue-400 hover:bg-blue-50/40">
          <span className="text-sm text-slate-600">
            {uploading
              ? "Uploading…"
              : "Click to choose images, video, or documents"}
          </span>
          <input
            type="file"
            className="hidden"
            multiple
            accept="image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
            onChange={onUpload}
            disabled={uploading}
          />
        </label>
        {error && <p className="text-red-600 mt-3 text-sm">{error}</p>}
      </Modal>
    </AdminLayout>
  );
}

export async function getServerSideProps(context) {
  const auth = await getAdminSession(context);
  if (auth.redirect) return auth;
  const settings = await getSiteSettings();
  return { props: { settings } };
}
