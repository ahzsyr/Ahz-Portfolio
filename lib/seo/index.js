/**
 * SEO helpers — absolute URLs, JSON-LD builders, project canonical paths.
 * Pure; no Prisma / React.
 */

export function stripHtml(html = "") {
  return String(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Join site base with a path or leave absolute http(s) URLs alone.
 */
export function absoluteUrl(base, pathOrUrl = "") {
  const raw = String(pathOrUrl || "").trim();
  if (!raw) {
    return String(base || "").replace(/\/$/, "") || "";
  }
  if (/^https?:\/\//i.test(raw)) return raw;
  const root = String(base || "").replace(/\/$/, "");
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  return `${root}${path}`;
}

export function projectCanonicalPath(project) {
  const slug = project?.slug || project?.id;
  if (slug == null || slug === "") return "/projects";
  return `/projects/${slug}`;
}

/**
 * True when the route param looks like a numeric id that should redirect to slug.
 */
export function shouldRedirectProjectParamToSlug(param, project) {
  if (!project?.slug) return false;
  const raw = String(param ?? "");
  if (!/^\d+$/.test(raw)) return false;
  return String(project.slug) !== raw;
}

function personId(settings) {
  const base = String(settings?.canonicalUrl || "").replace(/\/$/, "");
  return `${base}/#person`;
}

function orgId(settings) {
  const base = String(settings?.canonicalUrl || "").replace(/\/$/, "");
  return `${base}/#organization`;
}

function websiteId(settings) {
  const base = String(settings?.canonicalUrl || "").replace(/\/$/, "");
  return `${base}/#website`;
}

export function buildPersonJsonLd(settings = {}) {
  const base = String(settings.canonicalUrl || "").replace(/\/$/, "");
  const sameAs = [
    settings.socials?.linkedin,
    settings.socials?.github,
    settings.socials?.facebook,
  ].filter(Boolean);

  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": personId(settings),
    name: settings.personName || undefined,
    url: base || undefined,
    jobTitle: settings.tagline || settings.headline || undefined,
    image: absoluteUrl(base, settings.ogImagePath || "/avatar.png") || undefined,
    email: settings.contact?.email || undefined,
    worksFor: {
      "@id": orgId(settings),
    },
  };
  if (sameAs.length) person.sameAs = sameAs;
  return person;
}

export function buildOrganizationJsonLd(settings = {}) {
  const base = String(settings.canonicalUrl || "").replace(/\/$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": orgId(settings),
    name: settings.siteName || undefined,
    url: base || undefined,
    logo: absoluteUrl(base, settings.ogImagePath || "/avatar.png") || undefined,
  };
}

export function buildWebSiteJsonLd(settings = {}) {
  const base = String(settings.canonicalUrl || "").replace(/\/$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": websiteId(settings),
    name: settings.siteName || undefined,
    url: base || undefined,
    description: settings.tagline || settings.headline || undefined,
    publisher: { "@id": orgId(settings) },
    author: { "@id": personId(settings) },
  };
}

export function buildProjectCreativeWorkJsonLd(project, settings = {}) {
  const base = String(settings.canonicalUrl || "").replace(/\/$/, "");
  const path = projectCanonicalPath(project);
  const description =
    stripHtml(project?.seoDescription || project?.description || "") ||
    undefined;
  const image = absoluteUrl(base, project?.image || project?.coverPath) || undefined;

  return {
    "@context": "https://schema.org",
    "@type": ["CreativeWork", "Project"],
    name: project?.seoTitle || project?.title || undefined,
    url: absoluteUrl(base, path) || undefined,
    description,
    image,
    creator: { "@id": personId(settings) },
    author: { "@id": personId(settings) },
  };
}

/**
 * @param {{ name: string, url: string }[]} items
 */
export function buildBreadcrumbListJsonLd(items = [], settings = {}) {
  const base = String(settings.canonicalUrl || "").replace(/\/$/, "");
  const list = (items || []).filter((i) => i?.name && i?.url);
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: list.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(base, item.url),
    })),
  };
}

/**
 * Featured achievements (or similar) as ItemList — urls point at parent page.
 * @param {{ name: string, url: string, items: { name: string, description?: string }[] }} opts
 */
export function buildItemListJsonLd({ name, url, items = [] } = {}, settings = {}) {
  const base = String(settings.canonicalUrl || "").replace(/\/$/, "");
  const pageUrl = absoluteUrl(base, url || "/");
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: name || "Featured achievements",
    url: pageUrl || undefined,
    numberOfItems: (items || []).length,
    itemListElement: (items || []).map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "CreativeWork",
        name: item.name || item.title,
        description: stripHtml(item.description || "") || undefined,
        url: pageUrl || undefined,
      },
    })),
  };
}

export function buildWebPageJsonLd({
  name,
  description,
  path,
  settings = {},
} = {}) {
  const base = String(settings.canonicalUrl || "").replace(/\/$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    description: stripHtml(description || "") || undefined,
    url: absoluteUrl(base, path || "/") || undefined,
    isPartOf: { "@id": websiteId(settings) },
  };
}

export function buildCollectionPageJsonLd({
  name,
  description,
  path,
  settings = {},
} = {}) {
  const base = String(settings.canonicalUrl || "").replace(/\/$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description: stripHtml(description || "") || undefined,
    url: absoluteUrl(base, path || "/") || undefined,
    isPartOf: { "@id": websiteId(settings) },
  };
}

/** Graph helper — strip @context from nodes when embedding in @graph */
export function buildJsonLdGraph(nodes = []) {
  const graph = (nodes || []).filter(Boolean).map((node) => {
    const copy = { ...node };
    delete copy["@context"];
    return copy;
  });
  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}
