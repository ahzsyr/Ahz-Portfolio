import Link from "next/link";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/experience", label: "Experience" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminLayout({ children, siteName = "AZURA Portfolio" }) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex">
      <aside className="w-64 bg-slate-900 text-white p-5 flex flex-col">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-slate-400">Admin</p>
          <h1 className="font-semibold text-lg mt-1">{siteName}</h1>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {links.map((link) => {
            const active =
              link.href === "/admin"
                ? router.pathname === "/admin"
                : router.pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded ${
                  active ? "bg-blue-600" : "hover:bg-slate-800"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="mt-4 text-left px-3 py-2 rounded hover:bg-slate-800"
        >
          Sign out
        </button>
        <Link href="/" className="mt-2 text-sm text-slate-400 hover:text-white px-3">
          View site
        </Link>
      </aside>
      <main className="flex-1 p-6 md:p-8 overflow-auto">{children}</main>
    </div>
  );
}
