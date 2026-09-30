import { useEffect, useState } from "react";
import Modal from "./Modal";

export default function MediaPickerModal({
  open,
  onClose,
  onSelect,
  allowUpload = true,
  title = "Pick media",
}) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/media");
      if (!res.ok) throw new Error("Failed to load media");
      setFiles(await res.json());
    } catch (err) {
      setError(err.message || "Failed to load media");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) load();
  }, [open]);

  const onUpload = async (e) => {
    const selected = e.target.files;
    if (!selected?.length) return;
    setUploading(true);
    setError("");
    const body = new FormData();
    Array.from(selected).forEach((file) => body.append("file", file));
    const res = await fetch("/api/admin/media", { method: "POST", body });
    setUploading(false);
    e.target.value = "";
    if (!res.ok) {
      setError("Upload failed");
      return;
    }
    load();
  };

  const select = (path) => {
    onSelect?.(path);
    onClose?.();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="xl"
      footer={
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded border border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {allowUpload && (
          <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded cursor-pointer text-sm">
            {uploading ? "Uploading…" : "Upload files"}
            <input
              type="file"
              className="hidden"
              multiple
              accept="image/*,application/pdf"
              onChange={onUpload}
              disabled={uploading}
            />
          </label>
        )}
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {loading ? (
          <p className="text-slate-500 text-sm">Loading…</p>
        ) : files.length === 0 ? (
          <p className="text-slate-500 text-sm">No media files yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {files.map((file) => (
              <button
                key={file.path}
                type="button"
                onClick={() => select(file.path)}
                className="text-left bg-slate-50 border rounded-lg p-2 hover:border-blue-500 hover:bg-blue-50 transition"
              >
                {file.path.match(/\.(png|jpe?g|webp|gif)$/i) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={file.path}
                    alt={file.name}
                    className="w-full h-28 object-cover rounded mb-2"
                  />
                ) : (
                  <div className="h-28 flex items-center justify-center bg-slate-200 rounded mb-2 text-sm text-slate-600">
                    File
                  </div>
                )}
                <p className="text-xs break-all text-slate-700">{file.path}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
