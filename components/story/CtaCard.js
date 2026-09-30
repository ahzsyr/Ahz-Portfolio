import Link from "next/link";
import StorySection from "./StorySection";

export default function CtaCard({ title, body, href, label }) {
  if (!href && !title) return null;
  return (
    <StorySection title={null}>
      <div className="max-w-2xl border border-slate-200 rounded-lg p-6 md:p-8 bg-slate-50">
        {title && (
          <h2 className="font-display text-2xl font-semibold text-slate-900">
            {title}
          </h2>
        )}
        {body && (
          <p className="mt-2 text-slate-600 leading-relaxed whitespace-pre-wrap">
            {body}
          </p>
        )}
        {href && (
          <Link
            href={href}
            className="inline-block mt-4 px-4 py-2 bg-slate-900 text-white rounded text-sm hover:bg-slate-800"
          >
            {label || "Learn more"}
          </Link>
        )}
      </div>
    </StorySection>
  );
}
