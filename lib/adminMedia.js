/**
 * Classify media paths for admin typed hubs (no DB change).
 */

const IMAGE_EXT = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "svg",
  "avif",
  "bmp",
  "ico",
]);
const VIDEO_EXT = new Set(["mp4", "webm", "mov", "m4v", "avi", "mkv"]);
const DOCUMENT_EXT = new Set([
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "txt",
  "rtf",
  "csv",
  "md",
]);

export const MEDIA_TYPES = ["image", "video", "document", "asset"];

export const MEDIA_TYPE_LABELS = {
  image: "Images",
  video: "Videos",
  document: "Documents",
  asset: "Assets",
};

export function extensionOf(pathOrName = "") {
  const base = String(pathOrName).split("?")[0].split("#")[0];
  const name = base.split("/").pop() || "";
  const i = name.lastIndexOf(".");
  if (i < 0) return "";
  return name.slice(i + 1).toLowerCase();
}

/**
 * @returns {'image'|'video'|'document'|'asset'}
 */
export function classifyMediaType(pathOrName, mimeType) {
  if (mimeType && typeof mimeType === "string") {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    if (
      mimeType.startsWith("application/pdf") ||
      mimeType.includes("document") ||
      mimeType.includes("spreadsheet") ||
      mimeType.includes("presentation") ||
      mimeType.startsWith("text/")
    ) {
      return "document";
    }
  }

  const ext = extensionOf(pathOrName);
  if (IMAGE_EXT.has(ext)) return "image";
  if (VIDEO_EXT.has(ext)) return "video";
  if (DOCUMENT_EXT.has(ext)) return "document";
  return "asset";
}

export function filterMediaByType(files = [], type) {
  if (!type || !MEDIA_TYPES.includes(type)) return files;
  return files.filter((f) => {
    const path = f.path || f.url || f.name || "";
    const mime = f.mimeType || f.type || null;
    return classifyMediaType(path, mime) === type;
  });
}

export function normalizeMediaTypeQuery(raw) {
  if (!raw) return null;
  const t = String(raw).toLowerCase();
  return MEDIA_TYPES.includes(t) ? t : null;
}
