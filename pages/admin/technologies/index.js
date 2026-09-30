import PlaceholderPage from "../../../components/admin/PlaceholderPage";
import { getAdminSession } from "../../../lib/admin";
import { getSiteSettings } from "../../../lib/content";

export default function AdminTechnologies({ settings }) {
  return (
    <PlaceholderPage
      settings={settings}
      title="Technologies"
      description="Canonical technology vocabulary for projects and career."
      purpose="Technologies will be a first-class taxonomy separate from freeform tool strings and Skills. For now, use Skills and project tools."
      availableToday={[
        {
          href: "/admin/skills",
          label: "Skills",
          note: "categorized skill list",
        },
        {
          href: "/admin/projects",
          label: "Projects",
          note: "pipe-separated tools on each project",
        },
        {
          href: "/admin/settings",
          label: "Settings",
          note: "site-wide tech stack chips",
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
