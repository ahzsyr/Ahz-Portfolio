import PlaceholderPage from "../../../components/admin/PlaceholderPage";
import { getAdminSession } from "../../../lib/admin";
import { getSiteSettings } from "../../../lib/content";

export default function AdminTags({ settings }) {
  return (
    <PlaceholderPage
      settings={settings}
      title="Tags"
      description="Shared tags for discovery and case-study hero lines."
      purpose="A global Tags taxonomy will replace per-project freeform tag lists. Today, tags are edited on each project’s case study fields."
      availableToday={[
        {
          href: "/admin/projects",
          label: "Projects",
          note: "comma-separated tags on the project editor",
        },
        {
          href: "/admin/categories",
          label: "Categories",
          note: "primary project classification",
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
