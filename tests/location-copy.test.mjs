import assert from "node:assert/strict";
import test from "node:test";
import { fixture } from "./gallery-fixture.mjs";

const originalFetch = globalThis.fetch;
globalThis.fetch = (input, init) => String(input).endsWith("/api/gallery")
  ? Promise.resolve(Response.json(fixture))
  : originalFetch(input, init);

test("Neosho location is visible without obscuring nationwide service", async () => {
  const { default: worker } = await import("../dist/server/index.js");
  for (const path of ["/", "/about/", "/request-a-quote/", "/portfolio/", "/bible-rebinding/"]) {
    const response = await worker.fetch(new Request("http://localhost" + path), {
      ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
    }, { waitUntil() {}, passThroughOnException() {} });
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert.match(html, /<footer[\s\S]*Based in Neosho, MO[\s\S]*throughout the United States[\s\S]*<\/footer>/, path);
    if (["/", "/about/", "/request-a-quote/"].includes(path)) {
      assert.match(html, /<main[\s\S]*Neosho, (MO|Missouri)[\s\S]*<\/main>/, path);
      assert.match(html, /nationwide|across the United States/i, path);
    }
    if (path === "/" || path === "/about/") {
      const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
      const organization = scripts.flatMap(([, json]) => JSON.parse(json)["@graph"] || []).find(item => item["@type"] === "Organization");
      assert.equal(organization?.address.addressLocality, "Neosho");
      assert.equal(organization?.address.addressRegion, "MO");
    }
  }
});
