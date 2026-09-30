import PlaceholderPage from "../../../components/admin/PlaceholderPage";
import { getAdminSession } from "../../../lib/admin";
import { getSiteSettings } from "../../../lib/content";

export default function AdminVisualization({ settings }) {
  return (
    <PlaceholderPage
      settings={settings}
      title="Visualization"
      description="How metrics and stories appear on public surfaces."
      purpose="A Visualization control center will configure chart defaults and Impact composition. Today, adapters choose charts from metric series; Stories and Metrics admin previews show results."
      availableToday={[
        {
          href: "/admin",
          label: "Portfolio Overview",
          note: "archive counts + year/domain charts",
        },
        {
          href: "/admin/metrics",
          label: "Metrics",
          note: "data points + live preview",
        },
        {
          href: "/admin/stories",
          label: "Stories",
          note: "Impact narrative blocks",
        },
        {
          href: "/admin/projects",
          label: "Projects",
          note: "per-project presentation mode (Creative / Business / …)",
        },
        {
          href: "/impact",
          label: "Public Impact page",
          note: "see published outcomes",
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
