import PlaceholderPage from "../../../components/admin/PlaceholderPage";
import { getAdminSession } from "../../../lib/admin";
import { getSiteSettings } from "../../../lib/content";

export default function AdminHomepage({ settings }) {
  return (
    <PlaceholderPage
      settings={settings}
      title="Homepage"
      description="The public homepage is composed selectively from featured archive content."
      purpose="Homepage layout is fixed as a professional introduction. Control what appears by managing featured flags and Settings copy — there is no separate Homepage block builder in this phase."
      availableToday={[
        {
          href: "/admin/settings",
          label: "Settings",
          note: "person name, headline (role line), hero supporting, resume",
        },
        {
          href: "/admin/featured",
          label: "Featured hub",
          note: "projects, achievements, skills featured for Home",
        },
        {
          href: "/admin/metrics",
          label: "Metrics",
          note: "mark up to a few as Featured for Selected Impact",
        },
        {
          href: "/admin/projects",
          label: "Projects",
          note: "featured + featuredOrder (homepage shows max 3)",
        },
      ]}
      plannedNote="A visual Homepage composer is not in scope — keep selectivity via Featured flags."
    />
  );
}

export async function getServerSideProps(context) {
  const auth = await getAdminSession(context);
  if (auth.redirect) return auth;
  return { props: { settings: await getSiteSettings() } };
}
