/**
 * Admin CMS 2.0 navigation — single source for layout + dashboard.
 */

export const adminNavSections = [
  {
    label: null,
    links: [{ href: "/admin", label: "Dashboard", exact: true }],
  },
  {
    label: "Content",
    links: [
      { href: "/admin/projects", label: "Projects" },
      { href: "/admin/experience", label: "Experience" },
      { href: "/admin/achievements", label: "Achievements" },
      { href: "/admin/education", label: "Education" },
      { href: "/admin/certifications", label: "Certifications" },
      { href: "/admin/milestones", label: "Milestones" },
    ],
  },
  {
    label: "Data",
    links: [
      { href: "/admin/metrics", label: "Metrics" },
      { href: "/admin/data-sets", label: "Import & Export" },
      { href: "/admin/comparisons", label: "Comparisons" },
    ],
  },
  {
    label: "Media",
    links: [{ href: "/admin/media", label: "Library" }],
  },
  {
    label: "Taxonomy",
    links: [
      { href: "/admin/categories", label: "Categories" },
      { href: "/admin/skills", label: "Skills" },
      { href: "/admin/technologies", label: "Technologies" },
      { href: "/admin/tags", label: "Tags" },
    ],
  },
  {
    label: "Presentation",
    links: [
      { href: "/admin/featured", label: "Featured" },
      { href: "/admin/stories", label: "Stories" },
      { href: "/admin/homepage", label: "Homepage" },
      { href: "/admin/sections", label: "Sections" },
      { href: "/admin/visualization", label: "Visualization" },
    ],
  },
  {
    label: null,
    id: "site",
    links: [
      { href: "/admin/messages", label: "Messages" },
      { href: "/admin/settings", label: "Settings" },
    ],
  },
];

/** Section cards for Dashboard composition overview. */
export const adminComposeSections = [
  {
    id: "content",
    label: "Content",
    description: "Projects, roles, and professional records.",
    href: "/admin/projects",
  },
  {
    id: "data",
    label: "Data",
    description: "Metrics and measurable outcomes.",
    href: "/admin/metrics",
  },
  {
    id: "media",
    label: "Media",
    description: "Images, video, documents, and assets.",
    href: "/admin/media",
  },
  {
    id: "taxonomy",
    label: "Taxonomy",
    description: "Categories, skills, and classification.",
    href: "/admin/categories",
  },
  {
    id: "presentation",
    label: "Presentation",
    description: "Featured content, stories, and layout.",
    href: "/admin/featured",
  },
];

export function listAdminNavHrefs() {
  return adminNavSections.flatMap((s) => s.links.map((l) => l.href));
}

/**
 * Active link detection — media matches /admin/media with or without ?type=.
 */
export function isAdminNavActive(pathname, asPath, href, exact) {
  if (exact || href === "/admin") return pathname === "/admin";

  const [pathOnly, query = ""] = href.split("?");
  if (query) {
    const params = new URLSearchParams(query);
    const type = params.get("type");
    if (pathname !== pathOnly && !pathname.startsWith(`${pathOnly}/`)) {
      return false;
    }
    const current = new URLSearchParams(
      asPath.includes("?") ? asPath.split("?")[1] : ""
    );
    return current.get("type") === type;
  }

  return pathname === pathOnly || pathname.startsWith(`${pathOnly}/`);
}
