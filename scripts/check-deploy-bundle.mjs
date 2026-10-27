import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

export async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(async entry => entry.isDirectory()
    ? (await filesIn(join(directory, entry.name))).map(file => join(entry.name, file))
    : [entry.name]))).flat();
}

export async function checkDeployBundle(directory = '.netlify/static', manifestPath = '.netlify/functions/manifest.json') {
  const staticDirectory = resolve(directory);
  assert.notEqual(staticDirectory, resolve('.next'), 'Deploy the adapter static bundle, not raw .next output.');
  const publicFiles = await filesIn('public');
  const required = publicFiles.filter(file => /\.(png|jpe?g|jfif|webp|gif|svg|ico)$/i.test(file) || ['__forms.html', '_redirects'].includes(file));
  assert(required.includes('logos-bible-rebinder-emblem.png'), 'The source logo is missing.');
  for (const file of required) {
    const [source, output] = await Promise.all([readFile(join('public', file)), readFile(join(staticDirectory, file))]);
    const digest = data => createHash('sha256').update(data).digest('hex');
    assert.equal(digest(output), digest(source), `Missing or outdated static asset: ${file}`);
  }
  const chunks = await filesIn(join(staticDirectory, '_next/static'));
  assert(chunks.some(file => file.endsWith('.css')) && chunks.some(file => file.endsWith('.js')), 'CSS or JavaScript chunks are missing.');
  const redirects = await readFile(join(staticDirectory, '_redirects'), 'utf8');
  assert(/^\/_next\/image\/\s+url=:image\s+w=:width\s+q=:quality\s+\/\.netlify\/images\?url=:image&w=:width&q=:quality\s+200!/m.test(redirects), 'The forced image CDN route with query forwarding is missing.');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const functions = new Map(manifest.functions.map(fn => [fn.name, fn]));
  assert(!functions.has('studio-bootstrap'), 'Remove the temporary account-provisioning function before release.');
  for (const name of ['gallery', 'gallery-media', '___netlify-server-handler']) {
    assert(functions.has(name), `Missing deployed function: ${name}`);
    await access(functions.get(name).path);
  }
  const server = functions.get('___netlify-server-handler');
  for (const [name, path] of [['gallery', '/api/gallery'], ['gallery-media', '/api/gallery-media']]) {
    const fn = functions.get(name);
    assert(fn.routes.some(route => route.literal === path || route.pattern === path), `Missing route: ${path}`);
    assert(fn.priority > server.priority, `${path} must precede the website catch-all.`);
  }
  const media = await readFile(functions.get('gallery-media').path);
  for (const runtime of ['node_modules/@img/sharp-linux-x64/lib/sharp-linux-x64-', 'node_modules/@img/sharp-libvips-linux-x64/lib/libvips-cpp.so']) {
    assert(media.includes(Buffer.from(runtime)), `Missing Linux image runtime: ${runtime}`);
  }
  console.log(`PASS: ${required.length} static assets, ${chunks.length} client files, all three functions, Linux image runtime and route precedence.`);
  return { staticDirectory, manifest, manifestPath };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await checkDeployBundle(process.argv[2]);
}
