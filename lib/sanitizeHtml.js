import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "h2",
  "h3",
  "ul",
  "ol",
  "li",
  "a",
  "img",
  "blockquote",
  "code",
  "pre",
  "span",
];

const ALLOWED_ATTR = ["href", "target", "rel", "src", "alt", "title", "class"];

/**
 * Escape plain text and convert newlines to <br> so legacy content still displays.
 */
function plainTextToHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, "<br>");
}

/**
 * Returns sanitized HTML safe for dangerouslySetInnerHTML.
 * Plain text (no tags) is escaped and newlines become <br>.
 */
export function sanitizeHtml(dirty) {
  if (dirty == null || dirty === "") return "";
  const raw = String(dirty);
  const looksLikeHtml = /<[a-z][\s\S]*>/i.test(raw);
  const source = looksLikeHtml ? raw : plainTextToHtml(raw);
  return DOMPurify.sanitize(source, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Sanitize before persisting editor HTML to the database.
 */
export function sanitizeHtmlForStorage(dirty) {
  if (dirty == null || dirty === "") return "";
  return DOMPurify.sanitize(String(dirty), {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  });
}
