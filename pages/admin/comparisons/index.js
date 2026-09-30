import PlaceholderPage from "../../../components/admin/PlaceholderPage";
import { getAdminSession } from "../../../lib/admin";
import { getSiteSettings } from "../../../lib/content";

export default function AdminComparisons({ settings }) {
  return (
    <PlaceholderPage
      settings={settings}
      title="Comparisons"
      description="Before/after and period comparisons for storytelling."
      purpose="A dedicated Comparisons surface will curate before/after pairs and change narratives. Today, comparison fields live on each metric."
      availableToday={[
        {
          href: "/admin/metrics",
          label: "Metrics",
          note: "previous/target values and admin chart preview",
        },
        {
          href: "/admin/visualization",
          label: "Visualization",
          note: "presentation overview",
        },
      ]}
    />
  );
}

export async function getServerSideProps(context) {
  const auth = await getAdminSession(context);
  if (auth.redirect) return auth;
  return { props: { settings: await getSiteSettings() } };
}
