import PlaceholderPage from "../../../components/admin/PlaceholderPage";
import { getAdminSession } from "../../../lib/admin";
import { getSiteSettings } from "../../../lib/content";

export default function AdminSections({ settings }) {
  return (
    <PlaceholderPage
      settings={settings}
      title="Sections"
      description="Reusable page sections for About, Impact, and landing layouts."
      purpose="Sections will let you order and toggle page building blocks without redeploying. Case study and career sections are still defined in code and content fields."
      availableToday={[
        {
          href: "/admin/stories",
          label: "Stories",
          note: "ordered narrative blocks for Impact",
        },
        {
          href: "/admin/projects",
          label: "Projects",
          note: "case-study narrative fields",
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
