/**
 * Preset block streams for project page templates.
 * Each item is a create payload (no ids) — inserted in order after confirm.
 */

export const PROJECT_PAGE_TEMPLATES = [
  {
    id: "design",
    label: "Design project",
    description: "Hero, gallery, process, tools, deliverables",
    blocks: [
      { type: "hero", title: "", subtitle: "" },
      { type: "gallery", title: "Gallery", config: { paths: [] } },
      {
        type: "prose",
        title: "Design process",
        body: "<p>Describe discovery, iteration, and decisions.</p>",
      },
      { type: "toolsList", title: "Tools", config: { tools: [] } },
      {
        type: "prose",
        title: "Deliverables",
        body: "<p>What shipped and what the client received.</p>",
      },
    ],
  },
  {
    id: "it",
    label: "IT / engineering",
    description: "Hero, challenge, architecture, tech, metrics, before/after",
    blocks: [
      { type: "hero", title: "", subtitle: "" },
      {
        type: "prose",
        title: "Challenge",
        body: "<p>What problem needed solving.</p>",
      },
      {
        type: "prose",
        title: "Architecture",
        body: "<p>How the system was structured.</p>",
      },
      { type: "toolsList", title: "Technology", config: { tools: [] } },
      { type: "statGrid", title: "Metrics", metricIds: [] },
      {
        type: "comparisonCard",
        title: "Before / after",
      },
    ],
  },
  {
    id: "ecommerce",
    label: "E-commerce",
    description: "Hero, revenue KPIs, growth chart, strategy, results",
    blocks: [
      { type: "hero", title: "", subtitle: "" },
      { type: "statGrid", title: "Revenue & orders", metricIds: [] },
      { type: "chartCard", title: "Growth" },
      { type: "metricCard", title: "ROAS" },
      {
        type: "prose",
        title: "Strategy",
        body: "<p>Channels, offers, and optimization approach.</p>",
      },
      {
        type: "prose",
        title: "Results",
        body: "<p>Outcomes and learnings.</p>",
      },
      {
        type: "cta",
        title: "See related work",
        body: "",
        config: { href: "/projects", label: "All projects" },
      },
    ],
  },
];

export function getProjectPageTemplate(id) {
  return PROJECT_PAGE_TEMPLATES.find((t) => t.id === id) || null;
}
