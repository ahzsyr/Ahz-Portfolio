import { getAdminSession } from "../../../lib/admin";

export default function EditProjectPage() {
  return null;
}

export async function getServerSideProps(context) {
  const auth = await getAdminSession(context);
  if (auth.redirect) return auth;
  const id = context.params?.id;
  return {
    redirect: {
      destination: `/admin/projects?edit=${id}`,
      permanent: false,
    },
  };
}
