import assert from "node:assert/strict";
import test from "node:test";
import { readFile, access } from "node:fs/promises";
import { fixture } from "./gallery-fixture.mjs";
const fetchOriginal = globalThis.fetch;
globalThis.fetch = (input, init) => String(input) === "https://logos-custom-bindings.netlify.app/api/gallery" ? Promise.resolve(Response.json(fixture)) : fetchOriginal(input, init);

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
  assert.match(html, /Logos The Bible Rebinder/);
  assert.match(html, /logos-bible-rebinder-emblem\.png/);
  assert.match(html, /<h1[^>]*>.*Custom Bible Rebinding and Restoration/);
  assert.doesNotMatch(html, /Crafted to hold|lcb-circle-logo\.png/);
  assert.match(html, /Bible Rebinding &amp; Restoration|Bible Rebinding & Restoration/i);
  assert.match(html, /Hand-Bound Journals/i);
  assert.match(html, /Customizations/i);
  assert.match(html, /Custom Work/i);
  assert.match(html, /5-star craftsmanship/i);
  assert.match(html, /Brandall Brake/i);
  assert.match(html, /Ashlie Parker Harman/i);
  assert.match(html, /Pastor Steve Epley/i);
  assert.match(html, /application\/ld\+json/i);
  assert.match(html, /OAI-SearchBot|nationwide/i);
  assert.doesNotMatch(html, /Your site is taking shape|react-loading-skeleton|codex-preview/i);
});

test("server-renders a dedicated service page with SEO language", async () => {
  const response = await render("/bible-rebinding/");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Bible Rebinding &amp; Restoration with Real Leather|Bible Rebinding & Restoration with Real Leather/i);
  assert.match(html, /Mail-in service/i);
  assert.match(html, /application\/ld\+json/i);
  assert.match(html, /canonical/i);
});

test("server-renders the custom work service page", async () => {
  const response = await render("/custom-work/");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Custom Bookbinding.*Note Pad Holders/i);
  assert.match(html, /custom note pad holders/i);
  assert.match(html, /Request a Quote/i);
});

test("server-renders the portfolio with real project photography", async () => {
  const response = await render("/portfolio/");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Bible Rebinding &amp; Personalized Imprinting|Bible Rebinding & Personalized Imprinting/i);
  assert.match(html, /Leather Bindings in Color/i);
  assert.match(html, /api\/gallery-media\?project=bible-rebinding-imprinting/i);
  assert.match(html, /api\/gallery-media\?project=textured-leather-personalization/i);
  assert.match(html, /alt="Custom rebound Bible/i);
  assert.doesNotMatch(html, /images\.unsplash\.com/i);
  assert.match(html, /aria-label="Filter portfolio"/);
  assert.match(html, /aria-pressed="true"/);
  assert.match(html, /<dialog[^>]*aria-labelledby="project-title"/);
  assert.match(html, /href="\/portfolio\/bible-rebinding-imprinting\/"/);
  assert.doesNotMatch(html, /class="[^"]*reveal-pending/);
});

test("project pages are crawlable and admin is excluded from indexing", async () => {
  const sitemap = await render('/sitemap.xml');
  assert.equal(sitemap.status, 200);
  assert.match(await sitemap.text(), /portfolio\/bible-rebinding-imprinting\//);
  const robots = await render('/robots.txt');
  assert.equal(robots.status, 200);
  assert.match(await robots.text(), /Disallow: \/admin\//);
  const response = await render('/portfolio/bible-rebinding-imprinting/');
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /A project story describing the leather cover/);
  assert.match(html, /BreadcrumbList/);
  assert.match(html, /ImageObject/);
  assert.match(html, /og:image/);
  const admin = await (await render('/admin/')).text();
  assert.match(admin, /noindex/);
  assert.doesNotMatch(admin, /Private changed title/);
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

test("the complete source intake has registered submission fields and local example photos", async () => {
  const fields = JSON.parse(await readFile(new URL('../app/components/quote-fields.json', import.meta.url), 'utf8'));
  const skeleton = await readFile(new URL('../public/__forms.html', import.meta.url), 'utf8');
  const contacts = { 'q6_name[first]': 'first-name', 'q6_name[last]': 'last-name', 'q9_phoneNumber[full]': 'phone', q8_email: 'email' };
  for (const field of fields) {
    for (const input of field.inputs || []) {
      assert.ok(skeleton.includes(`name="${contacts[input.name] || input.name}"`), `Unregistered field: ${input.name}`);
    }
    if (field.type === 'image') await access(new URL(`../public${field.src}`, import.meta.url));
  }
  assert.equal(fields.filter(field => field.type === 'image').length, 6);
  const html = await (await render('/request-a-quote/')).text();
  for (const name of ['q7_address[addr_line1]', 'q7_address[addr_line2]', 'q7_address[city]', 'q7_address[state]', 'q7_address[postal]', 'q73_bibleDescription', 'q74_bibleWidth', 'q76_bibleHeight', 'q77_spineThickness', 'q89_coverType', 'q56_yappcover', 'q13_typeA', 'q96_endPages', 'q28_spineRibs', 'q48_interiorLiner48', 'q51_namePersonalization', 'q45_imprintingother', 'q57_ribbonMarker', 'q98_specialRequests', 'q80_wedLove']) {
    assert.ok(html.includes(`name="${name}"`), `Missing intake field: ${name}`);
  }
  assert.match(html, /NON-REFUNDABLE deposit of \$75/);
  assert.match(html, /610 Joy St\. Neosho, Mo\. 64850/);
});

test("all pages retain accessible navigation, content, and metadata", async () => {
  for (const path of ["/", "/bible-rebinding/", "/book-restoration/", "/custom-leather-bibles/", "/hand-bound-notebooks/", "/customizations/", "/custom-work/", "/portfolio/", "/about/", "/process/", "/faq/", "/request-a-quote/"]) {
    const response = await render(path);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert.match(html, /<main id="main-content"/, path);
    assert.match(html, /href="#main-content"/, path);
    assert.match(html, /<summary aria-label="Explore the site"/, path);
    assert.match(html, /href="\/request-a-quote\/"/, path);
    assert.match(html, /rel="canonical"/, path);
    assert.equal((html.match(/<h1\b/g) ?? []).length, 1, path);
    assert.doesNotMatch(html, /etsy|href="\/shop\//i, path);
  }
});

test("retired collection redirects to quotes and is absent from the sitemap", async () => {
  const response = await render("/shop/");
  assert.equal(response.status, 308);
  assert.equal(new URL(response.headers.get("location"), "http://localhost").href, "http://localhost/request-a-quote/");
  const sitemap = await (await render("/sitemap.xml")).text();
  assert.doesNotMatch(sitemap, /\/shop\/|etsy/i);
});
