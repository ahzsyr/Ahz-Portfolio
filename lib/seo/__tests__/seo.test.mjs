import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  absoluteUrl,
  stripHtml,
  projectCanonicalPath,
  shouldRedirectProjectParamToSlug,
  buildPersonJsonLd,
  buildWebSiteJsonLd,
  buildOrganizationJsonLd,
  buildProjectCreativeWorkJsonLd,
  buildBreadcrumbListJsonLd,
  buildItemListJsonLd,
  buildJsonLdGraph,
} from "../index.js";

const settings = {
  siteName: "AZURA",
  personName: "Ali",
  tagline: "Designer",
  canonicalUrl: "https://example.com",
  ogImagePath: "/avatar.png",
  socials: { linkedin: "https://linkedin.com/in/x", github: "https://github.com/x" },
  contact: { email: "a@b.com" },
};

describe("absoluteUrl", () => {
  it("joins base and path", () => {
    assert.equal(absoluteUrl("https://example.com/", "/img.png"), "https://example.com/img.png");
    assert.equal(absoluteUrl("https://example.com", "img.png"), "https://example.com/img.png");
  });

  it("leaves absolute urls", () => {
    assert.equal(
      absoluteUrl("https://example.com", "https://cdn.example/a.jpg"),
      "https://cdn.example/a.jpg"
    );
  });
});

describe("stripHtml", () => {
  it("removes tags", () => {
    assert.equal(stripHtml("<p>Hello <b>world</b></p>"), "Hello world");
  });
});

describe("projectCanonicalPath", () => {
  it("prefers slug", () => {
    assert.equal(projectCanonicalPath({ slug: "acme", id: 1 }), "/projects/acme");
    assert.equal(projectCanonicalPath({ id: 9 }), "/projects/9");
  });
});

describe("shouldRedirectProjectParamToSlug", () => {
  it("redirects numeric id when slug differs", () => {
    assert.equal(
      shouldRedirectProjectParamToSlug("12", { slug: "acme", id: 12 }),
      true
    );
    assert.equal(
      shouldRedirectProjectParamToSlug("acme", { slug: "acme", id: 12 }),
      false
    );
    assert.equal(
      shouldRedirectProjectParamToSlug("12", { slug: "12", id: 12 }),
      false
    );
  });
});

describe("JSON-LD builders", () => {
  it("builds Person WebSite Organization with absolute image", () => {
    const person = buildPersonJsonLd(settings);
    assert.equal(person["@type"], "Person");
    assert.equal(person.image, "https://example.com/avatar.png");
    assert.ok(person.sameAs.includes("https://linkedin.com/in/x"));

    const site = buildWebSiteJsonLd(settings);
    assert.equal(site["@type"], "WebSite");
    assert.equal(site.url, "https://example.com");

    const org = buildOrganizationJsonLd(settings);
    assert.equal(org["@type"], "Organization");
  });

  it("builds CreativeWork project with absolute urls", () => {
    const ld = buildProjectCreativeWorkJsonLd(
      {
        slug: "acme",
        title: "Acme",
        description: "<p>Grow <em>fast</em></p>",
        image: "/uploads/cover.jpg",
      },
      settings
    );
    assert.deepEqual(ld["@type"], ["CreativeWork", "Project"]);
    assert.equal(ld.url, "https://example.com/projects/acme");
    assert.equal(ld.image, "https://example.com/uploads/cover.jpg");
    assert.equal(ld.description, "Grow fast");
  });

  it("builds breadcrumbs and item list without fake achievement urls", () => {
    const crumbs = buildBreadcrumbListJsonLd(
      [
        { name: "Home", url: "/" },
        { name: "Projects", url: "/projects" },
        { name: "Acme", url: "/projects/acme" },
      ],
      settings
    );
    assert.equal(crumbs["@type"], "BreadcrumbList");
    assert.equal(crumbs.itemListElement[2].item, "https://example.com/projects/acme");

    const list = buildItemListJsonLd(
      {
        name: "Achievements",
        url: "/impact",
        items: [{ name: "Won award", description: "<p>Nice</p>" }],
      },
      settings
    );
    assert.equal(list["@type"], "ItemList");
    assert.equal(list.itemListElement[0].item.url, "https://example.com/impact");
    assert.equal(list.itemListElement[0].item.description, "Nice");
  });

  it("buildJsonLdGraph strips nested contexts", () => {
    const graph = buildJsonLdGraph([
      buildPersonJsonLd(settings),
      buildWebSiteJsonLd(settings),
    ]);
    assert.equal(graph["@context"], "https://schema.org");
    assert.equal(graph["@graph"].length, 2);
    assert.equal(graph["@graph"][0]["@context"], undefined);
  });
});
