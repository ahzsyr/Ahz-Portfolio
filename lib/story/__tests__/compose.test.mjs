import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  composeBlocks,
  storyHasBlocks,
  shouldRenderProjectStory,
  STAT_GRID_MAX,
  isStoryBlockType,
  getProjectPageTemplate,
  PROJECT_PAGE_TEMPLATES,
  blockTypesForScope,
} from "../index.js";

function metric(id, overrides = {}) {
  return {
    id,
    name: `Metric ${id}`,
    label: `Metric ${id}`,
    value: String(id),
    valueNumeric: id,
    series: [],
    comparison: { hasComparison: false, current: { display: String(id) } },
    formatted: { display: String(id) },
    ...overrides,
  };
}

describe("composeBlocks", () => {
  it("returns empty for empty story", () => {
    assert.deepEqual(composeBlocks([]), []);
    assert.deepEqual(composeBlocks(null), []);
  });

  it("skips unknown types", () => {
    const out = composeBlocks([{ id: 1, type: "unknown", body: "x" }]);
    assert.equal(out.length, 0);
  });

  it("maps prose and quote", () => {
    const out = composeBlocks([
      { id: 1, type: "prose", title: "What I did", body: "<ul><li>A</li></ul>", sortOrder: 0 },
      { id: 2, type: "quoteCard", body: "Ship it", subtitle: "Client", sortOrder: 1 },
    ]);
    assert.equal(out.length, 2);
    assert.equal(out[0].cardType, "prose");
    assert.equal(out[1].cardType, "quoteCard");
    assert.equal(out[1].props.attribution, "Client");
  });

  it("maps metricCard and chartCard", () => {
    const m = metric(10, {
      series: [
        { label: "Jan", valueNumeric: 1, display: "1" },
        { label: "Feb", valueNumeric: 2, display: "2" },
      ],
    });
    const out = composeBlocks([
      { id: 1, type: "metricCard", metric: metric(9), sortOrder: 0 },
      {
        id: 2,
        type: "chartCard",
        metric: m,
        config: { preferredSeriesType: "line" },
        sortOrder: 1,
      },
    ]);
    assert.equal(out[0].cardType, "metricCard");
    assert.equal(out[1].cardType, "chartCard");
    assert.equal(out[1].props.type, "line");
  });

  it("caps statGrid at STAT_GRID_MAX and requires min 2", () => {
    const metrics = [1, 2, 3, 4, 5].map((id) => metric(id));
    const tooFew = composeBlocks([
      {
        id: 1,
        type: "statGrid",
        metrics: [{ metricId: 1, metric: metrics[0], sortOrder: 0 }],
      },
    ]);
    assert.equal(tooFew.length, 0);

    const many = composeBlocks([
      {
        id: 2,
        type: "statGrid",
        metrics: metrics.map((m, i) => ({
          metricId: m.id,
          metric: m,
          sortOrder: i,
        })),
      },
    ]);
    assert.equal(many.length, 1);
    assert.equal(many[0].props.metrics.length, STAT_GRID_MAX);
  });

  it("maps achievement and media", () => {
    const out = composeBlocks([
      {
        id: 1,
        type: "achievementCard",
        achievement: { id: 1, title: "Won", description: "Big" },
      },
      {
        id: 2,
        type: "mediaCard",
        projectMedia: { id: 3, path: "/uploads/a.jpg", alt: "Shot" },
      },
    ]);
    assert.equal(out.length, 2);
    assert.equal(out[1].props.src, "/uploads/a.jpg");
  });

  it("orders by sortOrder", () => {
    const out = composeBlocks([
      { id: 2, type: "prose", body: "second", sortOrder: 2 },
      { id: 1, type: "prose", body: "first", sortOrder: 1 },
    ]);
    assert.equal(out[0].props.body, "first");
    assert.equal(out[1].props.body, "second");
  });
});

describe("storyHasBlocks", () => {
  it("detects published blocks", () => {
    assert.equal(storyHasBlocks(null), false);
    assert.equal(storyHasBlocks({ blocks: [] }), false);
    assert.equal(storyHasBlocks({ blocks: [{ id: 1 }] }), true);
  });
});

describe("isStoryBlockType", () => {
  it("accepts known types", () => {
    assert.equal(isStoryBlockType("statGrid"), true);
    assert.equal(isStoryBlockType("hero"), true);
    assert.equal(isStoryBlockType("gallery"), true);
    assert.equal(isStoryBlockType("nope"), false);
  });
});

describe("Phase 8 block types", () => {
  const project = {
    title: "Acme Redesign",
    client: "Acme",
    image: "/uploads/cover.jpg",
    tags: ["Design"],
    toolsList: ["Figma", "Next.js"],
  };

  it("composes hero from project defaults", () => {
    const out = composeBlocks(
      [{ id: 1, type: "hero", title: "", config: {}, sortOrder: 0 }],
      { project }
    );
    assert.equal(out.length, 1);
    assert.equal(out[0].cardType, "hero");
    assert.equal(out[0].props.title, "Acme Redesign");
    assert.equal(out[0].props.image, "/uploads/cover.jpg");
  });

  it("composes gallery, video, toolsList, cta", () => {
    const out = composeBlocks(
      [
        {
          id: 1,
          type: "gallery",
          title: "Shots",
          config: { paths: ["/a.jpg", "/b.jpg"] },
          sortOrder: 0,
        },
        {
          id: 2,
          type: "video",
          config: { videoPath: "/clip.mp4" },
          sortOrder: 1,
        },
        { id: 3, type: "toolsList", title: "Stack", config: {}, sortOrder: 2 },
        {
          id: 4,
          type: "cta",
          title: "More",
          config: { href: "/projects", label: "Browse" },
          sortOrder: 3,
        },
      ],
      { project }
    );
    assert.equal(out.length, 4);
    assert.equal(out[0].cardType, "gallery");
    assert.equal(out[0].props.paths.length, 2);
    assert.equal(out[1].cardType, "video");
    assert.equal(out[2].cardType, "toolsList");
    assert.deepEqual(out[2].props.tools, ["Figma", "Next.js"]);
    assert.equal(out[3].props.href, "/projects");
  });

  it("shouldRenderProjectStory requires published blocks", () => {
    assert.equal(shouldRenderProjectStory({ story: null }), false);
    assert.equal(
      shouldRenderProjectStory({
        story: {
          status: "draft",
          blocks: [{ id: 1, type: "prose", body: "Hi" }],
        },
      }),
      false
    );
    assert.equal(
      shouldRenderProjectStory({
        story: {
          status: "published",
          blocks: [{ id: 1, type: "prose", body: "Hi" }],
        },
      }),
      true
    );
    assert.equal(
      shouldRenderProjectStory({
        story: {
          status: "published",
          blocks: [{ id: 1, type: "gallery", config: { paths: [] } }],
        },
      }),
      false
    );
  });

  it("hides project-only types from impact scope list", () => {
    const impact = blockTypesForScope("impact");
    assert.equal(impact.includes("hero"), false);
    assert.equal(impact.includes("prose"), true);
    assert.equal(blockTypesForScope("project").includes("hero"), true);
  });

  it("exposes design/it/ecommerce templates", () => {
    assert.equal(PROJECT_PAGE_TEMPLATES.length, 3);
    assert.ok(getProjectPageTemplate("design").blocks.length >= 3);
    assert.ok(getProjectPageTemplate("it"));
    assert.ok(getProjectPageTemplate("ecommerce"));
  });
});
