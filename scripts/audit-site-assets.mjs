// Read-only audit of every public route and the exact client/static bundle.
import assert from 'node:assert/strict';
import { join } from 'node:path';
import sharp from 'sharp';
import { filesIn } from './check-deploy-bundle.mjs';

const origin = new URL(process.argv[2] || 'https://logosrebinder.com').origin;
const assets = new Map(), failures = [];
const decode = value => value.replaceAll('&amp;', '&');
function addAsset(value, base, kind = 'asset') {
  if (/^(data:|blob:|#)/.test(value)) return;
  const url = new URL(decode(value), base).href;
  assets.set(url, kind);
}
async function read(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
  assert(response.ok, `${response.status} ${url}`);
  return response;
}
async function pool(items, operation) {
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(6, items.length) }, async () => {
    while (next < items.length) {
      const item = items[next++];
      try { await operation(item); }
      catch (error) { failures.push(error.message); }
    }
  }));
}
const sitemap = await (await read(`${origin}/sitemap.xml`)).text();
const routes = [...new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => new URL(match[1]).pathname))];
assert(routes.includes('/') && routes.includes('/portfolio/') && routes.includes('/request-a-quote/'), 'Public sitemap is incomplete.');
await pool(routes, async route => {
  const page = `${origin}${route}`;
  const html = await (await read(page)).text();
  assert(!html.includes('gallery-unavailable'), `Gallery unavailable on ${route}`);
  for (const tag of html.matchAll(/<(?:img|script|link)\b[^>]*>/gi)) {
    const image = /^<img/i.test(tag[0]);
    for (const attr of tag[0].matchAll(/\b(src|srcset|imagesrcset|href)="([^"]+)"/gi)) {
      if (/srcset/i.test(attr[1])) {
        for (const value of attr[2].split(',')) addAsset(value.trim().split(/\s+/)[0], page, 'image');
      } else if (attr[1].toLowerCase() === 'src' || /\.(?:css|js|png|jpe?g|jfif|svg|ico|woff2?)(?:[?"#]|$)/i.test(attr[2])) {
        addAsset(attr[2], page, image ? 'image' : 'asset');
      }
    }
  }
});
// Include all shipped client chunks, not only scripts in the initial HTML.
for (const file of await filesIn('.netlify/static/_next/static')) addAsset(`/_next/static/${file.replaceAll('\\', '/')}`, origin);
for (const file of await filesIn('public')) {
  if (/\.(png|jpe?g|jfif|webp|gif|svg|ico)$/i.test(file)) addAsset(`/${file.replaceAll('\\', '/')}`, origin, 'image');
}
const feed = await (await read(`${origin}/api/gallery`)).json();
assert(feed.projects.length > 0, 'Gallery is unexpectedly empty.');
for (const project of feed.projects) {
  for (const photo of project.photos) {
    for (const size of ['thumb', 'full']) addAsset(`/api/gallery-media?project=${encodeURIComponent(project.id)}&photo=${encodeURIComponent(photo.id)}&size=${size}`, origin, 'image');
  }
}
let images = 0, styles = 0, scripts = 0;
const checked = new Set();
while (checked.size < assets.size) {
  await pool([...assets].filter(([url]) => !checked.has(url)), async ([url, kind]) => {
    checked.add(url);
    const response = await read(url);
    const type = response.headers.get('content-type') || '';
    if (kind === 'image' || type.startsWith('image/')) {
      assert(type.startsWith('image/'), `Non-image response at ${url}: ${type}`);
      const bytes = Buffer.from(await response.arrayBuffer());
      const info = await sharp(bytes).metadata();
      assert(info.width > 0 && info.height > 0, `Undecodable image at ${url}`);
      await sharp(bytes).stats(); // Decode pixels as well as reading the header.
      images++;
    } else if (new URL(url).pathname.endsWith('.css')) {
      assert(type.includes('text/css'), `Non-CSS response at ${url}: ${type}`);
      styles++;
      const css = await response.text();
      for (const reference of css.matchAll(/url\(\s*["']?([^\s)"']+)["']?\s*\)/g)) addAsset(reference[1], url);
    } else if (new URL(url).pathname.endsWith('.js')) {
      assert(/javascript/.test(type), `Non-JavaScript response at ${url}: ${type}`);
      assert((await response.text()).length > 0, `Empty JavaScript at ${url}`);
      scripts++;
    } else {
      assert(!type.includes('text/html'), `Unexpected HTML for asset ${url}`);
      await response.arrayBuffer();
    }
  });
}
const project = feed.projects[0], photo = project.photos[0];
const privateResponse = await fetch(`${origin}/api/gallery-media?project=${project.id}&photo=${photo.id}&private=1`, { signal: AbortSignal.timeout(20000) });
if (privateResponse.status !== 401) failures.push(`Private image returned ${privateResponse.status}, expected 401.`);
if (failures.length) {
  for (const failure of failures) console.error(`FAIL: ${failure}`);
  throw new Error(`${failures.length} asset checks failed.`);
}
console.log(`PASS ${origin}: ${routes.length} public pages, ${checked.size} asset URLs, ${images} decoded images, ${styles} stylesheets, ${scripts} scripts, ${feed.projects.length} gallery projects; private images protected.`);
