import { sanitizeHtml } from "../lib/sanitizeHtml";

export default function SafeHtml({ html, className, as: Tag = "div" }) {
  const clean = sanitizeHtml(html);
  if (!clean) return null;
  return (
    <Tag
      className={className}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
