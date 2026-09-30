import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

const WEAK_SECRETS = new Set([
  "",
  "change-me-in-production",
  "replace-with-a-long-random-string",
]);

export function assertProductionAuthSecret() {
  if (process.env.NODE_ENV !== "production") return;
  // Skip during `next build` page data collection
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  const secret = process.env.NEXTAUTH_SECRET || "";
  if (WEAK_SECRETS.has(secret) || secret.length < 16) {
    throw new Error(
      "NEXTAUTH_SECRET must be a strong unique value in production (not the example placeholder)."
    );
  }
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        assertProductionAuthSecret();
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword || !credentials?.email || !credentials?.password) {
          return null;
        }

        if (credentials.email.toLowerCase() !== adminEmail.toLowerCase()) {
          return null;
        }

        const passwordOk = adminPassword.startsWith("$2")
          ? await bcrypt.compare(credentials.password, adminPassword)
          : credentials.password === adminPassword;

        if (!passwordOk) {
          return null;
        }

        return {
          id: "1",
          email: adminEmail,
          name: "Admin",
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/admin/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export async function requireAdmin(req, res) {
  assertProductionAuthSecret();
  const { getServerSession } = await import("next-auth/next");
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
  return session;
}
