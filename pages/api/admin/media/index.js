import fs from "fs";
import path from "path";
import { requireAdmin } from "../../../../lib/auth";
import {
  ensureUploadDir,
  parseForm,
  publicPathForFile,
  listUploadFiles,
  resolveUploadPath,
} from "../../../../lib/uploads";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const session = await requireAdmin(req, res);
  if (!session) return;

  if (req.method === "GET") {
    return res.status(200).json(listUploadFiles());
  }

  if (req.method === "POST") {
    try {
      const { files } = await parseForm(req);
      const uploaded = files.file
        ? Array.isArray(files.file)
          ? files.file
          : [files.file]
        : [];

      const allowed = new Set([
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "application/pdf",
      ]);

      const saved = [];
      for (const file of uploaded) {
        if (!allowed.has(file.mimetype)) {
          try {
            fs.unlinkSync(file.filepath);
          } catch {
            /* ignore */
          }
          continue;
        }
        const ext = path.extname(file.originalFilename || file.filepath);
        const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
        const target = resolveUploadPath(safeName);
        if (!target) {
          try {
            fs.unlinkSync(file.filepath);
          } catch {
            /* ignore */
          }
          continue;
        }
        ensureUploadDir();
        fs.renameSync(file.filepath, target);
        saved.push(publicPathForFile(target));
      }

      return res.status(201).json({ files: saved });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Upload failed" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
