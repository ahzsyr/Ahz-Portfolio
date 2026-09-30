import { requireAdmin } from "../../../../lib/auth";
import { buildMetricsImportPreview } from "../../../../lib/import";
import {
  loadMetricsImportContext,
  commitMetricsImport,
} from "../../../../lib/import/commit";

export default async function handler(req, res) {
  const session = await requireAdmin(req, res);
  if (!session) return;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    mode = "preview",
    format = "csv",
    content = "",
    options = {},
  } = req.body || {};

  if (!["csv", "json"].includes(format)) {
    return res.status(400).json({ error: "format must be csv or json" });
  }
  if (!["preview", "commit"].includes(mode)) {
    return res.status(400).json({ error: "mode must be preview or commit" });
  }

  const ctx = await loadMetricsImportContext();
  const preview = buildMetricsImportPreview(content, format, {
    metricsByName: ctx.metricsByName,
    existingDatesByMetricId: ctx.existingDatesByMetricId,
  });

  if (preview.error && !preview.rows?.length) {
    return res.status(400).json(preview);
  }

  if (mode === "preview") {
    return res.status(200).json(preview);
  }

  const validRows = (preview.rows || []).filter((r) => r.status === "valid");
  if (!validRows.length) {
    return res.status(400).json({
      error: "no valid rows to import",
      ...preview,
    });
  }

  const committed = await commitMetricsImport(validRows, options);
  if (!committed.ok) {
    return res.status(400).json(committed);
  }

  return res.status(200).json({
    ok: true,
    summary: preview.summary,
    ...committed.result,
  });
}
