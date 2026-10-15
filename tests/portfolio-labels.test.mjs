import assert from "node:assert/strict";
import test from "node:test";
import { fixture } from "./gallery-fixture.mjs";

const originalFetch = globalThis.fetch;
globalThis.fetch = (input, init) => String(input).endsWith("/api/gallery")
  ? Promise.resolve(Response.json(fixture))
  : originalFetch(input, init);

test("portfolio links consistently use Portfolio or Our Work across the site", async () => {
  const { default: worker } = await import("../dist/server/index.js");
  for (const path of ["/", "/bible-rebinding/", "/book-restoration/", "/custom-leather-bibles/", "/hand-bound-notebooks/", "/customizations/", "/custom-work/", "/portfolio/", "/about/", "/process/", "/faq/", "/request-a-quote/", "/admin/", "/portfolio/bible-rebinding-imprinting/"]) {
    const response = await worker.fetch(new Request("http://localhost" + path), {
      ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
    }, { waitUntil() {}, passThroughOnException() {} });
    assert.equal(response.status, 200, path);
    const html = await response.text();
    const links = [...html.matchAll(/<a\b[^>]*href="\/portfolio\/"[^>]*>([\s\S]*?)<\/a>/g)];
    assert.ok(links.length > 0, path);
    for (const [, markup] of links) {
      const label = markup.replace(/<[^>]*>/g, "").replace(/^0\d/, "").replace(/↗/g, "").trim();
      assert.ok(["Portfolio", "Our Work"].includes(label), path + ": " + label);
    }
    assert.doesNotMatch(html, />Past work<|>Selected work<|>View past work</);
  }
});
