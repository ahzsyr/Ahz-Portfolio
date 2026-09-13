import fs from "fs";
import path from "path";
import { IncomingForm } from "formidable";

export const uploadDir = path.join(process.cwd(), "public", "uploads");

export function ensureUploadDir() {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
}

export function parseForm(req) {
  ensureUploadDir();
  const form = new IncomingForm({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 8 * 1024 * 1024,
    multiples: true,
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export function publicPathForFile(filePath) {
  const base = path.basename(filePath);
  return `/uploads/${base}`;
}

export function fieldValue(fields, key) {
  const value = fields[key];
  return Array.isArray(value) ? value[0] : value;
}
