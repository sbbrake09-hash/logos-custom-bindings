import assert from "node:assert/strict";
import test from "node:test";

const workerUrl = new URL("../dist/server/index.js", import.meta.url);

async function render(pathname = "/") {
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the premium homepage without starter content", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /Custom Bible rebinding and beautifully made books/i);
  assert.match(html, /Crafted to hold what matters/i);
  assert.match(html, /application\/ld\+json/i);
  assert.match(html, /OAI-SearchBot|nationwide/i);
  assert.doesNotMatch(html, /Your site is taking shape|react-loading-skeleton|codex-preview/i);
});

test("server-renders a dedicated service page with SEO language", async () => {
  const response = await render("/bible-rebinding/");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Custom Bible rebinding, made to be lived in/i);
  assert.match(html, /Mail-in service/i);
  assert.match(html, /application\/ld\+json/i);
  assert.match(html, /canonical/i);
});

test("server-renders the quote page and crawlable navigation", async () => {
  const response = await render("/request-a-quote/");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Let’s make a plan for the book you love/i);
  assert.match(html, /custom-binding-quote/i);
  assert.match(html, /name="email"/i);
  assert.match(html, /Your answers go directly to logoscustombindings@yahoo\.com/i);
  assert.match(html, /How it works/i);
});
