import ProjectForm, { emptyForm } from "../../../components/admin/ProjectForm";
import { getAdminSession } from "../../../lib/admin";
import { prisma } from "../../../lib/prisma";
import { getSiteSettings } from "../../../lib/content";

export default function NewProjectPage({ categories, settings }) {
  return (
    <ProjectForm
      initial={{
        ...emptyForm,
        categoryId: categories[0]?.id ? String(categories[0].id) : "",
      }}
      categories={categories}
      settings={settings}
    />
  );
}

export async function getServerSideProps(context) {
  const auth = await getAdminSession(context);
  if (auth.redirect) return auth;
  const [categories, settings] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    getSiteSettings(),
  ]);
  return {
    props: {
      categories: JSON.parse(JSON.stringify(categories)),
      settings,
    },
  };
}
