import Head from "next/head";
import { useRouter } from "next/router";
import Footer from "./Footer";
import Navigation from "./Navigation";
import { siteConfig } from "../config/site";

const Container = ({ children, settings, ...customMeta }) => {
  const router = useRouter();
  const cfg = settings || siteConfig;
  const meta = {
    title: `${cfg.personName} | ${cfg.siteName}`,
    description: cfg.tagline,
    image: cfg.ogImagePath || "/avatar.png",
    type: "website",
    ...customMeta,
  };
  const canonicalBase = (cfg.canonicalUrl || "").replace(/\/$/, "");

  return (
    <>
      <Head>
        <title>{meta.title}</title>
        <meta name="robots" content="follow, index" />
        <meta content={meta.description} name="description" />
        <meta property="og:url" content={`${canonicalBase}${router.asPath}`} />
        <link rel="canonical" href={`${canonicalBase}${router.asPath}`} />
        <meta property="og:type" content={meta.type} />
        <meta property="og:site_name" content={cfg.siteName} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:title" content={meta.title} />
        <meta property="og:image" content={meta.image} />
        {meta.date && (
          <meta property="project:published_time" content={meta.date} />
        )}
      </Head>

      <main className="flex justify-center items-center min-h-screen bg-[var(--color-surface)]">
        <div className="2xl:mx-auto 2xl:container lg:px-20 lg:py-16 md:py-12 md:px-6 py-9 px-4 w-full sm:w-auto">
          <Navigation settings={cfg} />
          {children}
          <Footer settings={cfg} />
        </div>
      </main>
    </>
  );
};

export default Container;
