import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import sharp from 'sharp';
import { BlobsServer } from '@netlify/blobs/server';
import { setEnvironmentContext, getStore } from '@netlify/blobs';

// Real local Blobs service and real Identity library, with a controlled upstream
// Identity response. Never creates an account or touches production storage.
const directory = await mkdtemp(join(tmpdir(), 'logos-gallery-test-'));
process.env.NODE_ENV = 'test';
const server = new BlobsServer({ directory, token: 'local-test-only', logger: () => {} });
const { port } = await server.start();
setEnvironmentContext({ siteID: 'local-test', token: 'local-test-only', edgeURL: `http://localhost:${port}`, uncachedEdgeURL: `http://localhost:${port}` });
await build({ entryPoints: ['netlify/functions/gallery.ts', 'netlify/functions/gallery-media.ts'], outdir: '.netlify/gallery-tests', bundle: true, platform: 'node', format: 'esm', packages: 'external', outExtension: { '.js': '.mjs' } });
const { default: gallery } = await import(pathToFileURL(join(process.cwd(), '.netlify/gallery-tests/gallery.mjs')));
const { default: media } = await import(pathToFileURL(join(process.cwd(), '.netlify/gallery-tests/gallery-media.mjs')));
const realFetch = globalThis.fetch;
let auth = 'editor';
const localEtags = new Map();
globalThis.netlifyIdentityContext = { url: 'https://identity.test', token: 'local-test-only' };
globalThis.fetch = async (input, init) => {
  if (String(input) === 'https://identity.test/user') {
    if (auth === 'expired') return new Response('{}', { status: 401 });
    const user = { id: 'local-editor', email: 'logoscustombindings@yahoo.com', confirmed_at: new Date().toISOString(), invited_at: new Date().toISOString(), app_metadata: { roles: auth === 'wrong-role' ? [] : ['gallery-editor'] }, user_metadata: { roles: ['gallery-editor'] } };
    if (auth === 'wrong-email') user.email = 'nobody@example.test';
    if (auth === 'unconfirmed') delete user.confirmed_at;
    return Response.json(user);
  }
  const response = await realFetch(input, init);
  // BlobsServer 11.1 omits GET/HEAD ETags despite returning them on PUT.
  // Preserve its real conditional-write ETag to match the production protocol.
  const key = String(input);
  if (init?.method?.toUpperCase() === 'PUT' && response.headers.has('etag')) localEtags.set(key, response.headers.get('etag'));
  if (response.ok && !response.headers.has('etag') && localEtags.has(key)) {
    const headers = new Headers(response.headers); headers.set('etag', localEtags.get(key));
    return new Response(response.body, { status: response.status, headers });
  }
  return response;
};
const origin = 'https://studio.test';
const request = (path, body, headers = {}) => new Request(origin + path, { method: body === undefined ? 'GET' : 'POST', headers: { ...(body === undefined ? {} : { Origin: origin, 'Content-Type': 'application/json' }), ...headers }, body: body === undefined ? undefined : JSON.stringify(body) });
const action = async (body, status = 200, headers) => { const r = await gallery(request('/api/gallery?private=1', body, headers)); const data = await r.json(); assert.equal(r.status, status, JSON.stringify(data)); return data; };
const feed = async () => { const r = await gallery(request('/api/gallery')); assert.equal(r.status, 200); return r.json(); };
try {
  const store = getStore({ name: 'gallery-projects-v1', consistency: 'strong' });
  assert.equal((await gallery(request('/api/gallery'))).status, 503, 'uninitialized storage is not a successful empty gallery');
  await store.setJSON('seed-complete', { test: true });
  for (const [state, expected] of [['expired', 401], ['wrong-role', 403], ['wrong-email', 403], ['unconfirmed', 401]]) { auth = state; await action({ action: 'create' }, expected); assert.equal((await gallery(request('/api/gallery?private=1'))).status, expected); }
  auth = 'editor';
  await action({ action: 'create' }, 403, { Origin: 'https://attacker.test' });
  await action({ action: 'create' }, 403, { Origin: '' });
  let p = await action({ action: 'create' }, 201);
  assert.equal((await feed()).projects.length, 0);
  p = await action({ action: 'save', id: p.id, etag: p.etag, draft: { ...p.draft, title: 'Test book', description: 'A locally tested project story with no customer data.' } });
  const stale = p.etag;
  await action({ action: 'publish', id: p.id, etag: p.etag, draft: p.draft }, 400);
  const photoId = 'photo-local-0001';
  const mediaPath = `/api/gallery-media?project=${p.id}&photo=${photoId}`;
  const upload = data => media(new Request(origin + mediaPath, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'image/jpeg' }, body: data }));
  assert.equal((await upload(Buffer.from('<svg onload="alert(1)"/>'))).status, 415);
  assert.equal((await upload(Buffer.alloc(3 * 1024 * 1024 + 1))).status, 413);
  const original = await sharp({ create: { width: 180, height: 100, channels: 3, background: '#9a684a' } }).withMetadata({ orientation: 6 }).jpeg().toBuffer();
  let response = await upload(original); assert.equal(response.status, 201); const dimensions = await response.json();
  assert.equal(dimensions.width, 100); assert.equal(dimensions.height, 180);
  assert.equal((await upload(original)).status, 200, 'safe idempotent upload retry');
  assert.equal((await media(request(mediaPath))).status, 404, 'unpublished photo is private');
  const privateResponse = await media(request(mediaPath + '&private=1'));
  const decoded = await sharp(Buffer.from(await privateResponse.arrayBuffer())).metadata();
  assert.equal(decoded.exif, undefined, 'EXIF/GPS removed');
  assert.equal(decoded.format, 'webp');
  auth = 'expired'; assert.equal((await media(request(mediaPath + '&private=1'))).status, 401); auth = 'editor';
  const photo = { ...dimensions, alt: 'Brown test image', caption: '', label: 'Before' };
  p = await action({ action: 'save', id: p.id, etag: p.etag, draft: { ...p.draft, photos: [photo], coverId: photoId } });
  await action({ action: 'save', id: p.id, etag: stale, draft: p.draft }, 409);
  await action({ action: 'publish', id: p.id, etag: p.etag, draft: { ...p.draft, photos: [{ ...photo, alt: '' }] } }, 400);
  await action({ action: 'save', id: p.id, etag: p.etag, draft: { ...p.draft, photos: Array(21).fill(photo) } }, 400);
  p = await action({ action: 'publish', id: p.id, etag: p.etag, draft: p.draft });
  assert.equal((await feed()).projects[0].title, 'Test book');
  assert.equal((await media(request(mediaPath))).status, 200);
  p = await action({ action: 'save', id: p.id, etag: p.etag, draft: { ...p.draft, title: 'Private changed title' } });
  assert.equal((await feed()).projects[0].title, 'Test book', 'draft does not replace published version');
  assert.equal(JSON.stringify(await feed()).includes('Private changed title'), false);
  const placement = await action({ action: 'features', etag: 'new', ids: [p.id] });
  await action({ action: 'features', etag: 'new', ids: [] }, 409);
  await action({ action: 'features', etag: placement.etag, ids: [p.id, p.id, p.id, p.id] }, 400);
  p = await action({ action: 'unpublish', id: p.id, etag: p.etag });
  assert.deepEqual(await feed(), { projects: [], featuredIds: [] });
  assert.equal((await media(request(mediaPath))).status, 404);
  p = await action({ action: 'archive', id: p.id, etag: p.etag });
  await action({ action: 'save', id: p.id, etag: p.etag, draft: p.draft }, 400);
  p = await action({ action: 'restore', id: p.id, etag: p.etag });
  assert.equal(p.draft.title, 'Private changed title'); assert.equal(p.published, null);
  const beforeRestart = p.etag;
  const reread = await gallery(request(`/api/gallery?private=1&id=${p.id}`));
  assert.equal((await reread.json()).etag, beforeRestart);
  console.log('PASS: authorization, CSRF, draft privacy, publish/unpublish, image validation, orientation, EXIF removal, retries, stale writes, features, archive/restore.');
} finally { globalThis.fetch = realFetch; delete globalThis.netlifyIdentityContext; await server.stop(); }
