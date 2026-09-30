import Link from "next/link";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { adminNavSections, isAdminNavActive } from "../../lib/adminNav";

export default function AdminLayout({ children, siteName = "AZURA Portfolio" }) {
  const router = useRouter();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    setNavOpen(false);
  }, [router.asPath]);

  const go = (href) => (e) => {
    // Force a real transition when leaving query-heavy pages (e.g. /admin/media?type=…).
    // Soft client nav can no-op if a shallow replace raced the click.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      return;
    }
    e.preventDefault();
    setNavOpen(false);
    if (router.asPath === href) return;
    router.push(href);
  };

  const nav = (
    <>
      <div className="mb-5 shrink-0">
        <p className="text-xs uppercase tracking-widest text-slate-400">
          CMS 2.0
        </p>
        <h1 className="font-semibold text-lg mt-1 truncate">{siteName}</h1>
      </div>
      <nav className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto overscroll-contain pr-1 -mr-1">
        {adminNavSections.map((section) => (
          <div key={section.id || section.label || "top"} className="shrink-0">
            {section.label && (
              <p className="px-3 mb-1 text-[10px] uppercase tracking-widest text-slate-500">
                {section.label}
              </p>
            )}
            <div className="flex flex-col gap-0.5">
              {section.links.map((link) => {
                const active = isAdminNavActive(
                  router.pathname,
                  router.asPath,
                  link.href,
                  link.exact
                );
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={go(link.href)}
                    className={`px-3 py-2 rounded text-sm transition-colors ${
                      active
                        ? "bg-blue-600 text-white"
                        : "text-slate-200 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="shrink-0 pt-3 mt-2 border-t border-slate-800 space-y-1">
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="w-full text-left px-3 py-2 rounded text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          Sign out
        </button>
        <Link
          href="/"
          className="block text-sm text-slate-400 hover:text-white px-3 py-2 rounded hover:bg-slate-800"
        >
          View site
        </Link>
      </div>
    </>
  );

  return (
    <div className="admin-app h-screen overflow-hidden bg-slate-100 text-slate-900 flex">
      <aside className="hidden md:flex w-64 shrink-0 bg-slate-900 text-white p-5 flex-col h-full min-h-0 overflow-hidden">
        {nav}
      </aside>

      {navOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/50"
            aria-label="Close navigation"
            onClick={() => setNavOpen(false)}
          />
          <aside className="relative z-10 w-64 max-w-[80vw] bg-slate-900 text-white p-5 flex flex-col h-full min-h-0 overflow-hidden shadow-xl">
            <div className="flex justify-end mb-2 shrink-0">
              <button
                type="button"
                className="text-slate-300 hover:text-white px-2"
                onClick={() => setNavOpen(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            {nav}
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 min-h-0 h-full">
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-slate-900 text-white shrink-0">
          <button
            type="button"
            className="px-2 py-1 rounded hover:bg-slate-800"
            onClick={() => setNavOpen(true)}
            aria-label="Open navigation"
          >
            ☰
          </button>
          <span className="font-medium truncate">{siteName}</span>
        </div>
        <main className="flex-1 min-h-0 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
