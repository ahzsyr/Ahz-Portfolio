import Link from "next/link";
import AdminLayout from "./AdminLayout";
import PageHeader from "./PageHeader";

/**
 * Shared shell for Phase 7 placeholder / hub-lite pages.
 */
export default function PlaceholderPage({
  settings,
  title,
  description,
  purpose,
  availableToday = [],
  plannedNote = "Full capability planned for a later phase — no new data model in Phase 7.",
}) {
  return (
    <AdminLayout siteName={settings?.siteName}>
      <PageHeader title={title} description={description} />
      <div className="bg-white border rounded-lg p-6 max-w-2xl space-y-5">
        {purpose && <p className="text-slate-700">{purpose}</p>}

        {availableToday.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-2">
              Available today
            </h2>
            <ul className="space-y-2">
              {availableToday.map((item) => (
                <li key={item.href || item.label}>
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="text-blue-600 hover:underline"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className="text-slate-700">{item.label}</span>
                  )}
                  {item.note && (
                    <span className="text-slate-500 text-sm"> — {item.note}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-sm text-slate-500 border-t pt-4">{plannedNote}</p>
      </div>
    </AdminLayout>
  );
}
