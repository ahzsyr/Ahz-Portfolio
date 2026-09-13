import { getServerSession } from "next-auth/next";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { authOptions } from "../../lib/auth";
import { siteConfig } from "../../config/site";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl: "/admin",
    });
    setLoading(false);
    if (result?.error) {
      setError("Invalid email or password");
      return;
    }
    window.location.href = "/admin";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md bg-slate-900 border border-slate-700 p-8 rounded-lg shadow-xl"
      >
        <p className="text-xs tracking-[0.25em] uppercase text-blue-300">
          {siteConfig.siteName}
        </p>
        <h1 className="text-3xl font-semibold mt-2 mb-6">Admin Login</h1>
        <label className="block text-sm mb-1">Email</label>
        <input
          className="w-full mb-4 px-3 py-2 rounded bg-slate-800 border border-slate-600"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label className="block text-sm mb-1">Password</label>
        <input
          className="w-full mb-4 px-3 py-2 rounded bg-slate-800 border border-slate-600"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-red-400 mb-3">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 py-2 rounded font-medium disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (session) {
    return { redirect: { destination: "/admin", permanent: false } };
  }
  return { props: {} };
}
