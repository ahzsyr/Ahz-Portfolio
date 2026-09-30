import { useEffect, useState } from "react";
import Modal from "./Modal";

/**
 * Upload → Validate → Preview → Import wizard for CSV/JSON admin imports.
 */
export default function ImportWizard({
  open,
  onClose,
  title = "Import",
  endpoint,
  onImported,
  sampleHint = "",
}) {
  const [format, setFormat] = useState("csv");
  const [content, setContent] = useState("");
  const [step, setStep] = useState("upload"); // upload | preview | done
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!open) {
      setFormat("csv");
      setContent("");
      setStep("upload");
      setPreview(null);
      setBusy(false);
      setError("");
      setResult(null);
    }
  }, [open]);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setContent(text);
    const name = file.name.toLowerCase();
    if (name.endsWith(".json")) setFormat("json");
    else if (name.endsWith(".csv")) setFormat("csv");
  };

  const validate = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "preview", format, content }),
      });
      const data = await res.json();
      if (!res.ok && !data.rows) {
        setError(data.error || "Validation failed");
        setBusy(false);
        return;
      }
      setPreview(data);
      setStep("preview");
    } catch (err) {
      setError(err.message || "Validation failed");
    }
    setBusy(false);
  };

  const commit = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "commit",
          format,
          content,
          options: { createMissingMetrics: true, upsert: true },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Import failed");
        setBusy(false);
        return;
      }
      setResult(data);
      setStep("done");
      onImported?.(data);
    } catch (err) {
      setError(err.message || "Import failed");
    }
    setBusy(false);
  };

  const footer =
    step === "upload" ? (
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-2 text-sm border rounded"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={busy || !content.trim()}
          onClick={validate}
          className="px-3 py-2 text-sm bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {busy ? "Validating…" : "Validate"}
        </button>
      </div>
    ) : step === "preview" ? (
      <div className="flex justify-between gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setStep("upload")}
          className="px-3 py-2 text-sm border rounded"
        >
          Back
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 text-sm border rounded"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy || !(preview?.summary?.valid > 0)}
            onClick={commit}
            className="px-3 py-2 text-sm bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {busy ? "Importing…" : "Import"}
          </button>
        </div>
      </div>
    ) : (
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-2 text-sm bg-blue-600 text-white rounded"
        >
          Done
        </button>
      </div>
    );

  return (
    <Modal open={open} onClose={onClose} title={title} size="xl" footer={footer}>
      {error && (
        <p className="mb-3 text-sm text-red-700 bg-red-50 border border-red-100 rounded px-3 py-2">
          {error}
        </p>
      )}

      {step === "upload" && (
        <div className="space-y-4">
          <div className="flex gap-3 items-center flex-wrap">
            <label className="text-sm text-slate-600">Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
            <input
              type="file"
              accept=".csv,.json,text/csv,application/json"
              onChange={onFile}
              className="text-sm"
            />
          </div>
          {sampleHint && (
            <p className="text-xs text-slate-500 whitespace-pre-wrap font-mono bg-slate-50 border rounded p-2">
              {sampleHint}
            </p>
          )}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            placeholder="Paste CSV or JSON here…"
            className="w-full border rounded px-3 py-2 text-sm font-mono"
          />
        </div>
      )}

      {step === "preview" && preview && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-3 text-sm text-slate-700">
            <span>Total: {preview.summary?.total ?? 0}</span>
            <span>Valid: {preview.summary?.valid ?? 0}</span>
            <span>Errors: {preview.summary?.errors ?? 0}</span>
            <span>Creates: {preview.summary?.creates ?? 0}</span>
            <span>Updates: {preview.summary?.updates ?? 0}</span>
            {preview.summary?.metricCreates != null && (
              <span>New metrics: {preview.summary.metricCreates}</span>
            )}
          </div>
          <div className="overflow-x-auto max-h-80 border rounded">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 sticky top-0">
                <tr>
                  <th className="px-2 py-1.5">#</th>
                  <th className="px-2 py-1.5">Action</th>
                  <th className="px-2 py-1.5">Status</th>
                  <th className="px-2 py-1.5">Detail</th>
                </tr>
              </thead>
              <tbody>
                {(preview.rows || []).map((r) => (
                  <tr
                    key={r.row}
                    className={
                      r.status === "error" ? "bg-red-50 text-red-800" : ""
                    }
                  >
                    <td className="px-2 py-1.5 align-top">{r.row}</td>
                    <td className="px-2 py-1.5 align-top">{r.action}</td>
                    <td className="px-2 py-1.5 align-top">{r.status}</td>
                    <td className="px-2 py-1.5 align-top font-mono text-xs">
                      {r.error ||
                        r.metricName ||
                        r.data?.title ||
                        r.data?.metricName ||
                        "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="text-sm text-slate-700 space-y-2">
          <p className="font-medium text-green-800">Import complete.</p>
          <pre className="bg-slate-50 border rounded p-3 text-xs overflow-x-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </Modal>
  );
}

export function downloadExport(url) {
  window.location.href = url;
}
