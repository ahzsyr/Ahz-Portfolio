import { getPublishedProjects, getSiteSettings } from "../lib/content";
import { projectCanonicalPath } from "../lib/seo";

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default function Sitemap() {
  return null;
}

export async function getServerSideProps({ res }) {
  const [settings, projects] = await Promise.all([
    getSiteSettings(),
    getPublishedProjects(),
  ]);
  const base = (settings.canonicalUrl || "http://localhost:3000").replace(
    /\/$/,
    ""
  );
  const urls = [
    "/",
    "/projects",
    "/about",
    "/contact",
    "/impact",
    ...projects.map((p) => projectCanonicalPath(p)),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (path) => `  <url>
    <loc>${escapeXml(`${base}${path === "/" ? "" : path}`)}</loc>
  </url>`
  )
  .join("\n")}
</urlset>`;

  res.setHeader("Content-Type", "text/xml");
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=3600, stale-while-revalidate=86400"
  );
  res.write(xml);
  res.end();
  return { props: {} };
}
