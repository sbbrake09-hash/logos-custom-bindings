import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { checkDeployBundle } from '../scripts/check-deploy-bundle.mjs';

test('release check accepts the full bundle and rejects the asset and routing regressions', async t => {
  await checkDeployBundle();
  await assert.rejects(checkDeployBundle('.next'), /not raw .next/);
  const directory = await mkdtemp(join(tmpdir(), 'logos-deploy-check-'));
  try {
    const assets = join(directory, 'static');
    await cp('.netlify/static', assets, { recursive: true });
    const logo = join(assets, 'logos-bible-rebinder-emblem.png');
    const originalLogo = await readFile(logo);
    await t.test('missing or replaced logo blocks release', async () => {
      await rm(logo);
      await assert.rejects(checkDeployBundle(assets), /ENOENT/);
      await writeFile(logo, 'not the existing logo');
      await assert.rejects(checkDeployBundle(assets), /outdated static asset/);
      await writeFile(logo, originalLogo);
    });
    await t.test('missing image routing blocks release', async () => {
      const redirects = join(assets, '_redirects');
      const original = await readFile(redirects);
      await rm(redirects);
      await assert.rejects(checkDeployBundle(assets), /ENOENT/);
      await writeFile(redirects, original);
    });
    const original = JSON.parse(await readFile('.netlify/functions/manifest.json', 'utf8'));
    const manifest = join(directory, 'manifest.json');
    await t.test('temporary account provisioning blocks release', async () => {
      await writeFile(manifest, JSON.stringify({ ...original, functions: [...original.functions, { name: 'studio-bootstrap' }] }));
      await assert.rejects(checkDeployBundle(assets, manifest), /temporary account-provisioning/);
    });
    await t.test('omitted gallery function blocks release', async () => {
      await writeFile(manifest, JSON.stringify({ ...original, functions: original.functions.filter(fn => fn.name !== 'gallery') }));
      await assert.rejects(checkDeployBundle(assets, manifest), /Missing deployed function: gallery/);
    });
    await t.test('catch-all route cannot override gallery functions', async () => {
      const broken = structuredClone(original);
      broken.functions.find(fn => fn.name === '___netlify-server-handler').priority = 10;
      await writeFile(manifest, JSON.stringify(broken));
      await assert.rejects(checkDeployBundle(assets, manifest), /precede the website catch-all/);
    });
    await t.test('omitted client bundle blocks release', async () => {
      await rm(join(assets, '_next'), { recursive: true });
      await assert.rejects(checkDeployBundle(assets), /ENOENT/);
    });
  } finally {
    // Only remove the exact temporary fixture created in this test.
    await rm(directory, { recursive: true, force: true });
  }
});
