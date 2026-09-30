import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  ensureUniqueProjectSlug,
  ensurePresentationMode,
  slugify,
} from "../index.js";
import {
  shouldRedirectProjectParamToSlug,
  projectCanonicalPath,
} from "../../seo/index.js";
import { shouldRenderProjectStory } from "../../story/index.js";
import { normalizePresentationMode } from "../../presentation/index.js";

describe("ensureUniqueProjectSlug", () => {
  it("keeps existing slug when free", () => {
    assert.equal(
      ensureUniqueProjectSlug({ slug: "acme", title: "Acme", id: 1 }, new Set()),
      "acme"
    );
  });

  it("resolves collisions with id suffix", () => {
    const taken = new Set(["acme"]);
    assert.equal(
      ensureUniqueProjectSlug({ slug: "acme", title: "Acme", id: 7 }, taken),
      "acme-7"
    );
  });

  it("is idempotent when called again with claimed own slug freed", () => {
    const taken = new Set();
    const first = ensureUniqueProjectSlug(
      { slug: "", title: "Hello World", id: 3 },
      taken
    );
    taken.add(first);
    const second = ensureUniqueProjectSlug(
      { slug: first, title: "Hello World", id: 3 },
      new Set([...taken].filter((s) => s !== first))
    );
    assert.equal(second, first);
  });

  it("slugify produces kebab", () => {
    assert.equal(slugify("Hello World!"), "hello-world");
  });
});

describe("ensurePresentationMode", () => {
  it("defaults empty to minimal", () => {
    assert.equal(ensurePresentationMode(null), "minimal");
    assert.equal(ensurePresentationMode(""), "minimal");
    assert.equal(ensurePresentationMode("business"), "business");
  });
});

describe("compat URL guarantees", () => {
  it("redirects numeric id to slug", () => {
    assert.equal(
      shouldRedirectProjectParamToSlug("12", { slug: "acme", id: 12 }),
      true
    );
    assert.equal(projectCanonicalPath({ slug: "acme", id: 12 }), "/projects/acme");
  });

  it("keeps id path when no slug", () => {
    assert.equal(
      shouldRedirectProjectParamToSlug("12", { slug: null, id: 12 }),
      false
    );
    assert.equal(projectCanonicalPath({ id: 12 }), "/projects/12");
  });
});

describe("compat presentation / story gates", () => {
  it("normalizePresentationMode null → minimal", () => {
    assert.equal(normalizePresentationMode(null), "minimal");
    assert.equal(normalizePresentationMode(""), "minimal");
  });

  it("shouldRenderProjectStory false without blocks", () => {
    assert.equal(shouldRenderProjectStory({}), false);
    assert.equal(shouldRenderProjectStory({ story: null }), false);
    assert.equal(
      shouldRenderProjectStory({
        story: { status: "published", blocks: [] },
      }),
      false
    );
  });
});
