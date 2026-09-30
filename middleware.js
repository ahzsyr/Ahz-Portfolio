import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const { pathname } = req.nextUrl;
      if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
        return true;
      }
      return !!token;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
});

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
