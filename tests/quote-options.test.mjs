import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { build } from 'esbuild';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Render the controls without Next's runtime image wrapper; preview audits
// separately verify the actual image component and decoded image assets.
await build({ entryPoints: ['app/components/QuoteOrderFields.tsx', 'app/components/quote-validation.ts', 'app/components/quote-summary.ts'], outdir: '.netlify/quote-option-tests', bundle: true, platform: 'node', format: 'cjs', packages: 'external', outExtension: { '.js': '.cjs' }, plugins: [{ name: 'plain-image', setup(build) {
  build.onResolve({ filter: /^next\/image$/ }, () => ({ path: 'image', namespace: 'test-image' }));
  build.onLoad({ filter: /.*/, namespace: 'test-image' }, () => ({ contents: `import { createElement } from 'react'; export default ({ src, alt, width, height }) => createElement('img', { src, alt, width, height });`, loader: 'js', resolveDir: process.cwd() }));
} }] });
const require = createRequire(import.meta.url);
const { default: Fields } = require('../.netlify/quote-option-tests/QuoteOrderFields.cjs');
const { validateImprinting } = require('../.netlify/quote-option-tests/quote-validation.cjs');
const { quoteSummary } = require('../.netlify/quote-option-tests/quote-summary.cjs');
const render = answers => renderToStaticMarkup(React.createElement(Fields, { answers, onChange() {} }));

test('notification summary groups readable labels, keeps multiple selections and omits blanks', async () => {
  const data = new FormData();
  for (const [name, value] of Object.entries({ 'first-name': 'Sample', 'last-name': 'Customer', email: 'sample@example.com', q73_bibleDescription: 'Family Bible', q74_bibleWidth: '6', q51_namePersonalization: 'Yes', q53_enterYour: 'Sample Name', q54_fontsee: '2', q55_color: 'Gold', q45_imprintingother: 'Yes', 'imprinting-other': 'Inside flap', q57_ribbonMarker: '2', q58_ribbonMarker58: 'Red and gold', 'project-notes': 'Please preserve the handwritten notes.', 'book-title': '' })) data.set(name, value);
  data.append('q46_imprintingOptions[]', 'Spine'); data.append('q46_imprintingOptions[]', 'Other');
  data.set('photo', new File(['sample'], 'cover.jpg', { type: 'image/jpeg' }));
  const summary = quoteSummary(data);
  for (const text of ['CONTACT AND BOOK DETAILS', 'BOOK DETAILS', 'NAME PERSONALIZATION', 'IMPRINTING', 'RIBBON MARKERS', 'First Name: Sample', 'Width (inches): 6', 'Font: 2', 'Imprinting Options: Spine, Other', 'Other imprinting option: Inside flap', 'Photo attachment: cover.jpg']) assert.ok(summary.includes(text), text);
  assert.doesNotMatch(summary, /q\d+_|Book title:|bot-field|subject/);
  assert.equal(data.get('q53_enterYour'), 'Sample Name');
  assert.match(await readFile('public/__forms.html', 'utf8'), /name="order-summary"/);
});

test('end page choices reveal only the matching required options', () => {
  for (const selection of ['', 'Cardstock (standard option)']) {
    assert.doesNotMatch(render({ 96: selection }), /name="q99_smoothAcrylic"|name="q97_photographicEnd"/);
  }
  const acrylic = render({ 96: 'Smooth Acrylic' });
  assert.match(acrylic.match(/<select(?=[^>]*name="q99_smoothAcrylic")[^>]*>/)?.[0] || '', /required/);
  for (const color of ['Black', 'Navy', 'Wine']) assert.ok(acrylic.includes(`<option>${color}</option>`));
  assert.doesNotMatch(acrylic, /name="q97_photographicEnd"/);
  const photo = render({ 96: 'Custom Photographic (Must provide high quality digital PDF image as we cannot be held responsible for lost original prints.)' });
  for (const location of ['Front Only', 'Front and Rear']) assert.match(photo.match(new RegExp(`<input(?=[^>]*value="${location}")[^>]*>`))?.[0] || '', /required/);
  assert.doesNotMatch(photo, /name="q99_smoothAcrylic"/);
});

test('rib choices show the matching dropdown and optional raised shapes', () => {
  for (const selection of ['', 'None']) assert.doesNotMatch(render({ 28: selection }), /name="q39_tooledRib"|name="q40_raisedRib"|name="q42_spinecoverRaised"/);
  const tooled = render({ 28: 'Tooled Ribs (spine width only)' });
  for (const color of ['Blind (imprint w/o color)', 'Gold', 'Silver', 'Blue', 'Red', 'Black', 'Copper']) assert.ok(tooled.includes(`<option>${color}</option>`));
  assert.doesNotMatch(tooled, /name="q40_raisedRib"|name="q42_spinecoverRaised"/);
  const raised = render({ 28: 'Raised Ribs' });
  for (const option of ['Spine Width (shown in example)', 'Wrap Around (extends onto front and rear cover)']) assert.ok(raised.includes(`<option>${option}</option>`));
  assert.doesNotMatch(raised, /name="q39_tooledRib"/);
  const shape = raised.match(/<input(?=[^>]*name="q42_spinecoverRaised")[^>]*>/)?.[0] || '';
  assert.ok(shape); assert.doesNotMatch(shape, /required/);
  assert.ok(raised.indexOf('e.g. Curved spines, sword, etc.') > raised.indexOf('name="q42_spinecoverRaised"'));
});

test('personalization requires exact name, numbered fonts and color only when enabled', () => {
  for (const answers of [{}, { 51: 'No' }]) {
    const html = render(answers);
    assert.doesNotMatch(html, /name="q53_enterYour"|name="q54_fontsee"|name="q55_color"|quote-examples\/personalization-fonts-5.jfif/);
  }
  const html = render({ 51: 'Yes' });
  assert.match(html, /Enter your name exactly how you want it to appear on lower left front cover:/);
  for (const name of ['q53_enterYour', 'q54_fontsee', 'q55_color']) assert.match(html.match(new RegExp(`<(?:input|select)(?=[^>]*name="${name}")[^>]*>`))?.[0] || '', /required/);
  for (const font of ['1', '2', '3', '4', '5']) assert.ok(html.includes(`<option>${font}</option>`));
  for (const color of ['Blind (imprint w/o color)', 'Gold', 'Silver', 'Blue', 'Red', 'Black', 'Copper']) assert.ok(html.includes(`<option>${color}</option>`));
  assert.match(html, /quote-examples\/personalization-fonts-5.jfif/);
});

test('custom imprinting can be used alone or with other selected locations', () => {
  assert.doesNotMatch(render({ 45: 'No', 46: ['Other'] }), /name="imprinting-other"|name="q46_imprintingOptions\[\]"/);
  const html = render({ 45: 'Yes', 46: ['Spine', 'Cover', 'Other'] });
  for (const location of ['Spine', 'Cover', 'Front Interior Liner', 'Rear Interior Liner', 'Other']) assert.ok(html.includes(`value="${location}"`));
  assert.match(html.match(/<input(?=[^>]*name="imprinting-other")[^>]*>/)?.[0] || '', /required/);
  assert.doesNotMatch(render({ 45: 'Yes', 46: ['Spine'] }), /name="imprinting-other"/);
  const data = new FormData(); data.set('q45_imprintingother', 'Yes');
  assert.equal(validateImprinting(data)?.field, 'q46_imprintingOptions[]');
  data.append('q46_imprintingOptions[]', 'Other');
  for (const text of ['', '   ']) { data.set('imprinting-other', text); assert.equal(validateImprinting(data)?.field, 'imprinting-other'); }
  data.set('imprinting-other', 'Inside the flap'); assert.equal(validateImprinting(data), null);
  data.append('q46_imprintingOptions[]', 'Spine'); assert.equal(validateImprinting(data), null);
  data.set('q45_imprintingother', 'No'); data.delete('imprinting-other'); assert.equal(validateImprinting(data), null);
});

test('ribbon colors appear only for a positive quantity, with the note after the input', () => {
  for (const quantity of ['', '0']) assert.doesNotMatch(render({ 57: quantity }), /name="q58_ribbonMarker58"/);
  const html = render({ 57: '3' });
  assert.match(html, /Ribbon Marker Colors \(all the same or mix and match\):/);
  const input = html.indexOf('name="q58_ribbonMarker58"');
  assert.ok(input > 0 && html.indexOf('Multiple in same color, or mix and match various colors.') > input);
  assert.match(html, /aria-describedby="order-58-note"/);
});

test('Netlify registers the custom field and the new font reference is present', async () => {
  const skeleton = await readFile('public/__forms.html', 'utf8');
  assert.match(skeleton, /name="imprinting-other"/);
  const reference = await readFile('public/quote-examples/personalization-fonts-5.jfif');
  assert.ok(reference.length > 0);
});
