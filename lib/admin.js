import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";

export async function getAdminSession(context) {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session) {
    return {
      redirect: {
        destination: "/admin/login",
        permanent: false,
      },
    };
  }
  return { session };
}
