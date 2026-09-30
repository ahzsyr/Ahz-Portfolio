import Link from "next/link";
import AdminLayout from "../../../components/admin/AdminLayout";
import PageHeader from "../../../components/admin/PageHeader";
import { downloadExport } from "../../../components/admin/ImportWizard";
import { getAdminSession } from "../../../lib/admin";
import { getSiteSettings } from "../../../lib/content";

export default function AdminImportExport({ settings }) {
  return (
    <AdminLayout siteName={settings.siteName}>
      <PageHeader
        title="Import & Export"
        description="Bulk CSV/JSON for metrics and achievements, plus a full professional archive download."
        actions={
          <button
            type="button"
            onClick={() => downloadExport("/api/admin/export/archive")}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Download professional archive
          </button>
        }
      />

      <div className="space-y-6 max-w-3xl">
        <section className="bg-white border rounded-lg p-5">
          <h2 className="font-semibold text-slate-900 text-lg">
            Professional archive
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            One JSON file with metric groups, metrics and data points,
            achievements, experience, education, certifications, milestones,
            skills, and slim project references. Archive re-import is not
            supported in this phase — use entity importers below for metrics and
            achievements.
          </p>
          <button
            type="button"
            onClick={() => downloadExport("/api/admin/export/archive")}
            className="mt-4 px-4 py-2 border border-slate-300 rounded text-sm hover:bg-slate-50"
          >
            Download JSON archive
          </button>
        </section>

        <section className="bg-white border rounded-lg p-5">
          <h2 className="font-semibold text-slate-900 text-lg">
            Entity import &amp; export
          </h2>
          <ul className="mt-3 space-y-3 text-sm">
            <li className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <Link
                  href="/admin/metrics"
                  className="text-blue-700 font-medium hover:underline"
                >
                  Metrics
                </Link>
                <p className="text-slate-500 mt-0.5">
                  Import series CSV/JSON (validate → preview → import). Export
                  points as CSV or full metrics as JSON.
                </p>
              </div>
            </li>
            <li className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <Link
                  href="/admin/achievements"
                  className="text-blue-700 font-medium hover:underline"
                >
                  Achievements
                </Link>
                <p className="text-slate-500 mt-0.5">
                  Import CSV/JSON with upsert by slug. Export CSV or JSON.
                </p>
              </div>
            </li>
          </ul>
        </section>

        <section className="bg-slate-50 border border-slate-200 rounded-lg p-5">
          <h2 className="font-semibold text-slate-900 text-sm uppercase tracking-wide">
            Sample metrics CSV
          </h2>
          <pre className="mt-2 text-xs font-mono text-slate-700 overflow-x-auto">{`date,metric,value
2026-01,Revenue,18200
2026-02,Revenue,21500
2026-03,Revenue,26200`}</pre>
        </section>
      </div>
    </AdminLayout>
  );
}

export async function getServerSideProps(context) {
  const auth = await getAdminSession(context);
  if (auth.redirect) return auth;
  return { props: { settings: await getSiteSettings() } };
}
