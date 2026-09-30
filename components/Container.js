import Head from "next/head";
import { useRouter } from "next/router";
import Footer from "./Footer";
import Navigation from "./Navigation";
import { siteConfig } from "../config/site";
import { absoluteUrl, stripHtml } from "../lib/seo";

const Container = ({
  children,
  settings,
  canonicalPath,
  jsonLd,
  ...customMeta
}) => {
  const router = useRouter();
  const cfg = settings || siteConfig;
  const base = (cfg.canonicalUrl || "").replace(/\/$/, "");

  const meta = {
    title: `${cfg.personName} | ${cfg.siteName}`,
    description: cfg.tagline,
    image: cfg.ogImagePath || "/avatar.png",
    type: "website",
    ...customMeta,
  };

  const description = stripHtml(meta.description || "") || cfg.tagline;
  const path =
    canonicalPath ||
    (router.asPath || "/").split("?")[0].split("#")[0] ||
    "/";
  const canonical = absoluteUrl(base, path);
  const imageAbs = absoluteUrl(base, meta.image);

  const ldNodes = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [];

  return (
    <>
      <Head>
        <title>{meta.title}</title>
        <meta name="robots" content="follow, index" />
        <meta content={description} name="description" />
        <link rel="canonical" href={canonical} />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content={meta.type || "website"} />
        <meta property="og:site_name" content={cfg.siteName} />
        <meta property="og:description" content={description} />
        <meta property="og:title" content={meta.title} />
        <meta property="og:image" content={imageAbs} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={meta.title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={imageAbs} />
        {meta.date && (
          <meta property="project:published_time" content={meta.date} />
        )}
        {ldNodes.map((node, i) => (
          <script
            // eslint-disable-next-line react/no-danger
            key={`jsonld-${i}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(node),
            }}
          />
        ))}
      </Head>

      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <main
        id="main-content"
        tabIndex={-1}
        className="flex justify-center items-center min-h-screen bg-[var(--color-surface)]"
      >
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
