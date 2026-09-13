import { useEffect, useState } from "react";
import AdminLayout from "../../../components/admin/AdminLayout";
import { getAdminSession } from "../../../lib/admin";
import { getSiteSettings } from "../../../lib/content";

export default function AdminMedia({ settings }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    const res = await fetch("/api/admin/media");
    setFiles(await res.json());
  };

  useEffect(() => {
    load();
  }, []);

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
    load();
  };

  return (
    <AdminLayout siteName={settings.siteName}>
      <h1 className="text-3xl font-semibold mb-6">Media</h1>
      <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded cursor-pointer">
        {uploading ? "Uploading..." : "Upload files"}
        <input
          type="file"
          className="hidden"
          multiple
          accept="image/*,application/pdf"
          onChange={onUpload}
          disabled={uploading}
        />
      </label>
      {error && <p className="text-red-600 mt-3">{error}</p>}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {files.map((file) => (
          <div key={file.path} className="bg-white border rounded-lg p-3">
            {file.path.match(/\.(png|jpe?g|webp|gif)$/i) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={file.path}
                alt={file.name}
                className="w-full h-40 object-cover rounded mb-2"
              />
            ) : (
              <div className="h-40 flex items-center justify-center bg-slate-100 rounded mb-2">
                File
              </div>
            )}
            <p className="text-xs break-all">{file.path}</p>
            <button
              type="button"
              className="text-blue-600 text-sm mt-2"
              onClick={() => navigator.clipboard.writeText(file.path)}
            >
              Copy path
            </button>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}

export async function getServerSideProps(context) {
  const auth = await getAdminSession(context);
  if (auth.redirect) return auth;
  const settings = await getSiteSettings();
  return { props: { settings } };
}
