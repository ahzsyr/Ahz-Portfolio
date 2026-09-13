import { getSiteSettings } from "../lib/content";

export default function Robots() {
  return null;
}

export async function getServerSideProps({ res }) {
  const settings = await getSiteSettings();
  const base = (settings.canonicalUrl || "http://localhost:3000").replace(
    /\/$/,
    ""
  );
  const body = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api

Sitemap: ${base}/sitemap.xml
`;
  res.setHeader("Content-Type", "text/plain");
  res.write(body);
  res.end();
  return { props: {} };
}
