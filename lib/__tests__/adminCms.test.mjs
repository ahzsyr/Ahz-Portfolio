import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  adminNavSections,
  adminComposeSections,
  listAdminNavHrefs,
  isAdminNavActive,
} from "../adminNav.js";
import {
  MEDIA_TYPES,
  classifyMediaType,
  filterMediaByType,
  normalizeMediaTypeQuery,
} from "../adminMedia.js";

describe("adminNav", () => {
  it("exports expected section labels", () => {
    const labels = adminNavSections.map((s) => s.label).filter(Boolean);
    assert.deepEqual(labels, [
      "Content",
      "Data",
      "Media",
      "Taxonomy",
      "Presentation",
    ]);
  });

  it("includes locked hrefs", () => {
    const hrefs = listAdminNavHrefs();
    for (const href of [
      "/admin",
      "/admin/projects",
      "/admin/metrics",
      "/admin/data-sets",
      "/admin/comparisons",
      "/admin/media",
      "/admin/categories",
      "/admin/skills",
      "/admin/technologies",
      "/admin/tags",
      "/admin/featured",
      "/admin/stories",
      "/admin/homepage",
      "/admin/sections",
      "/admin/visualization",
      "/admin/messages",
      "/admin/settings",
    ]) {
      assert.ok(hrefs.includes(href), `missing ${href}`);
    }
    assert.equal(
      hrefs.filter((h) => h.startsWith("/admin/media")).length,
      1,
      "media should be a single library link"
    );
  });

  it("has five compose section cards", () => {
    assert.equal(adminComposeSections.length, 5);
    assert.deepEqual(
      adminComposeSections.map((s) => s.id),
      ["content", "data", "media", "taxonomy", "presentation"]
    );
  });

  it("activates media library for any media type query", () => {
    assert.equal(
      isAdminNavActive("/admin/media", "/admin/media?type=image", "/admin/media"),
      true
    );
    assert.equal(
      isAdminNavActive("/admin/media", "/admin/media?type=video", "/admin/media"),
      true
    );
    assert.equal(
      isAdminNavActive("/admin/metrics", "/admin/metrics", "/admin/media"),
      false
    );
  });

  it("exact dashboard match", () => {
    assert.equal(isAdminNavActive("/admin", "/admin", "/admin", true), true);
    assert.equal(
      isAdminNavActive("/admin/projects", "/admin/projects", "/admin", true),
      false
    );
  });
});

describe("adminMedia classifier", () => {
  it("classifies by extension", () => {
    assert.equal(classifyMediaType("/uploads/a.png"), "image");
    assert.equal(classifyMediaType("clip.mp4"), "video");
    assert.equal(classifyMediaType("report.pdf"), "document");
    assert.equal(classifyMediaType("blob.bin"), "asset");
  });

  it("prefers mime type", () => {
    assert.equal(classifyMediaType("x.bin", "image/webp"), "image");
    assert.equal(classifyMediaType("x.bin", "video/mp4"), "video");
    assert.equal(classifyMediaType("x.bin", "application/pdf"), "document");
  });

  it("filters files by type", () => {
    const files = [
      { path: "/a.jpg" },
      { path: "/b.mp4" },
      { path: "/c.pdf" },
      { path: "/d.zip" },
    ];
    assert.deepEqual(
      filterMediaByType(files, "image").map((f) => f.path),
      ["/a.jpg"]
    );
    assert.deepEqual(
      filterMediaByType(files, "asset").map((f) => f.path),
      ["/d.zip"]
    );
  });

  it("normalizes type query", () => {
    assert.equal(normalizeMediaTypeQuery("IMAGE"), "image");
    assert.equal(normalizeMediaTypeQuery("nope"), null);
    assert.ok(MEDIA_TYPES.includes("document"));
  });
});
