import fs from "fs";
import path from "path";
import { IncomingForm } from "formidable";

export const uploadDir = path.join(process.cwd(), "public", "uploads");

export function ensureUploadDir() {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
}

/**
 * True when `name` is a safe single-segment filename (no traversal).
 */
export function isSafeUploadBasename(name) {
  if (!name || typeof name !== "string") return false;
  if (name !== path.basename(name)) return false;
  if (name === "." || name === "..") return false;
  if (name.includes("\0")) return false;
  return true;
}

/**
 * Resolve a path under uploadDir; returns null if outside.
 */
export function resolveUploadPath(name) {
  if (!isSafeUploadBasename(name)) return null;
  const resolved = path.resolve(uploadDir, name);
  const root = path.resolve(uploadDir);
  if (resolved !== root && !resolved.startsWith(root + path.sep)) {
    return null;
  }
  return resolved;
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

export function listUploadFiles() {
  ensureUploadDir();
  return fs
    .readdirSync(uploadDir)
    .filter((name) => isSafeUploadBasename(name) && !name.startsWith("."))
    .filter((name) => {
      const full = resolveUploadPath(name);
      if (!full) return false;
      try {
        return fs.statSync(full).isFile();
      } catch {
        return false;
      }
    })
    .map((name) => ({
      name,
      path: `/uploads/${name}`,
    }));
}
