// One-time, non-destructive migration of the existing public portfolio.
// Run locally with the already authenticated Netlify CLI; no tokens are printed or committed.
import { getAPIToken } from '@netlify/dev-utils';
import { getStore } from '@netlify/blobs';
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';

const { siteId } = JSON.parse(await readFile(new URL('../.netlify/state.json', import.meta.url), 'utf8'));
if (siteId !== '1d1b267b-747e-48fd-a16a-3c6e2fe53728') throw new Error('Wrong Netlify project; migration stopped.');
const token = await getAPIToken(); if (!token) throw new Error('Sign in to the Netlify CLI first.');
const records = getStore({ name: 'gallery-projects-v1', siteID: siteId, token, consistency: 'strong' });
const media = getStore({ name: 'gallery-media-v1', siteID: siteId, token, consistency: 'strong' });
if (await records.getMetadata('seed-complete')) { console.log('Gallery has already been imported; no data changed.'); process.exit(0); }
const entries = [
  ['bible-rebinding-imprinting', 'Bible Rebinding & Personalized Imprinting', 'Personalization & Finishes', 'Gold scripture imprinting, a tooled spine, and personalized red ribbons bring individual meaning to this leather Bible.', ['bible-rebinding-imprinting.jpg'], 'Custom rebound Bible with tooled spine, red ribbons, and gold scripture imprinting.'],
  ['leather-bindings-color', 'Leather Bindings in Color', 'Bible Rebinding & Restoration', 'Turquoise and pink covers paired with ribbon markers and personalized gold lettering. A different expression of the same careful craft.', ['hand-bound-journals-color.jpg'], 'Turquoise and pink leather-bound books with personalized gold lettering and ribbon markers.'],
  ['bible-ribbon-details', 'Bible Rebinding & Ribbon Details', 'Bible Rebinding & Restoration', 'A collection of finished Bibles showing different leather grains, gold imprinting, and coordinating ribbon colors.', ['stacked-bibles-imprinting.png', 'stacked-bibles-edited.jpg'], 'Stacked custom Bibles with leather covers, gold imprinting, and colorful ribbon markers.'],
  ['scripture-ribbons', 'Custom Scripture Ribbons', 'Personalization & Finishes', 'Personalized scripture ribbons sit against gilt page edges and a richly colored leather cover.', ['leather-bible-ribbons.png'], 'Close-up of a leather Bible with gilt page edges and red scripture ribbons.'],
  ['textured-leather-personalization', 'Textured Leather & Personalization', 'Personalization & Finishes', 'A deeply textured cover with a personalized inset panel—a distinctive approach to a familiar, much-loved book.', ['textured-leather-personalization.jpg'], 'Black textured leather Bible cover with a personalized inset panel.'],
  ['custom-bible-pair', 'Custom Bible Pair', 'Bible Rebinding & Restoration', 'Two personalized black leather Bibles, each finished with its own name imprint, page edges, and ribbon markers.', ['two-custom-bibles.jpg'], 'Two personalized black leather Bibles with contrasting page edges and ribbon markers.'],
];
const arrayBuffer = buffer => buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
for (const [index, [id, title, category, description, files, alt]] of entries.entries()) {
  if (await records.getMetadata(`projects/${id}`)) continue;
  const photos = [];
  for (const [photoIndex, file] of files.entries()) {
    const photoId = `original-${photoIndex + 1}`;
    const full = await sharp(await readFile(new URL(`../public/portfolio/${file}`, import.meta.url))).rotate().resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true }).webp({ quality: 88 }).toBuffer({ resolveWithObject: true });
    const thumb = await sharp(full.data).resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
    const metadata = { width: full.info.width, height: full.info.height };
    await media.set(`${id}/${photoId}/full`, arrayBuffer(full.data), { onlyIfNew: true, metadata });
    await media.set(`${id}/${photoId}/thumb`, arrayBuffer(thumb), { onlyIfNew: true, metadata });
    photos.push({ id: photoId, ...metadata, caption: photoIndex ? 'Alternate photograph of the same finished bindings.' : '', alt: photoIndex ? `Alternate view: ${alt}` : alt, label: '' });
  }
  const revision = { title, category, description, photos, coverId: photos[0].id, revision: 1 };
  const timestamp = new Date(Date.UTC(2026, 7, 12, 12, 0, 6 - index)).toISOString();
  await records.setJSON(`projects/${id}`, { id, slug: id, draft: revision, published: revision, archived: false, createdAt: timestamp, updatedAt: timestamp, publishedAt: timestamp }, { onlyIfNew: true });
  console.log(`Imported: ${title} (${photos.length} photos)`);
}
await records.setJSON('features', { ids: entries.slice(0, 3).map(e => e[0]) }, { onlyIfNew: true });
await records.setJSON('seed-complete', { at: new Date().toISOString(), projects: 6, photos: 7 }, { onlyIfNew: true });
console.log('Migration complete. Existing files and photographs were preserved.');
