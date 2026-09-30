import { getAdminSession } from "../../../lib/admin";

export default function NewProjectPage() {
  return null;
}

export async function getServerSideProps(context) {
  const auth = await getAdminSession(context);
  if (auth.redirect) return auth;
  return {
    redirect: {
      destination: "/admin/projects?new=1",
      permanent: false,
    },
  };
}
