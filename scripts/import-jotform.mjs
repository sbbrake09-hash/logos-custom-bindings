// Capture the owner's source form and its assets for the native quote form.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
const sourceResponse = await fetch('https://form.jotform.com/252555711947060');
if (!sourceResponse.ok) throw new Error('Could not read the source form');
const html = await sourceResponse.text();
await mkdir('outputs', {recursive:true});
await writeFile('outputs/jotform-source.html', html);
const decode = s => s.replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16))).replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');
const plain = s => decode(s.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
const attr = (s, key) => decode(s.match(new RegExp(`\\b${key}="([^"]*)"`, 'i'))?.[1] || '');
const sections = [];
const imageNames = {92: 'Standard 1/4-inch yapp', 90: 'Full yapp', 93: 'Tooled spine ribs', 94: 'Raised spine ribs', 95: 'Interior liner tooled lines shown in blue', 84: 'Name personalization fonts: Font 1, Font 2, and Font 3'};
await mkdir('public/quote-examples', {recursive:true});
async function saveImage(tag, id) {
  const url = attr(tag, 'src');
  const extension = new URL(url).pathname.split('.').pop();
  const src = `/quote-examples/${id}.${extension}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Image download failed: ${url}`);
  await writeFile(`public${src}`, Buffer.from(await response.arrayBuffer()));
  return {src, alt: imageNames[id] || 'Logos Custom Bindings logo', width:parseInt(attr(tag,'width')), height:parseInt(attr(tag,'height'))};
}
for (const match of html.matchAll(/<li\b([^>]*)>([\s\S]*?)<\/li>/g)) {
  const [, attrs, body] = match;
  const type = attr(attrs, 'data-type').replace('control_', '');
  const id = attr(attrs, 'id').replace(/^(cid|id)_/, '');
  if (!type || type === 'button') continue;
  if (type === 'head') {
    sections.push({id, type, label:plain(body.match(/<h2[^>]*>([\s\S]*?)<\/h2>/)?.[1] || ''), note:plain(body.match(/<div[^>]*class="form-subHeader"[^>]*>([\s\S]*?)<\/div>/)?.[1] || '')});
  } else if (type === 'image') {
    sections.push({id, type, ...await saveImage(body.match(/<img\b[^>]*>/)[0], id)});
  } else {
    const label = plain(body.match(/<(?:label|span)[^>]*class="form-label[^>]*>([\s\S]*?)<\/(?:label|span)>/)?.[1] || '').replace(/\*$/, '').trim();
    const inputs = [...body.matchAll(/<(input|select|textarea)\b([^>]*)>/g)].map(m => ({tag:m[1], name:attr(m[2], 'name'), type:attr(m[2], 'type'), value:attr(m[2], 'value'), required:/\brequired="/.test(m[2]), autoComplete:attr(m[2],'autoComplete').replace(/section-input_\d+ /,''), label:plain(body.match(new RegExp(`<label[^>]*class="form-sub-label"[^>]*for="${attr(m[2],'id')}"[^>]*>([\\s\\S]*?)<\\/label>`))?.[1] || '')}));
    const options = type === 'dropdown' ? [...body.matchAll(/<option\b[^>]*value="([^"]*)"[^>]*>/g)].map(m=>decode(m[1])).filter(Boolean) : inputs.filter(i=>i.type==='radio'||i.type==='checkbox').map(i=>i.value);
    const notes = [...body.matchAll(/<label[^>]*class="form-sub-label"[^>]*>([\s\S]*?)<\/label>/g)].map(m=>plain(m[1]));
    sections.push({id,type,label,required:/\bjf-required\b/.test(attrs),name:inputs[0]?.name,options,inputs,note:['fullname','address'].includes(type)?'':notes.join(' ')});
  }
}
await writeFile('app/components/quote-fields.json', JSON.stringify(sections,null,2)+'\n');
const contactNames = {'q6_name[first]':'first-name', 'q6_name[last]':'last-name', 'q9_phoneNumber[full]':'phone', 'q8_email':'email'};
const names = [...new Set(sections.flatMap(f => (f.inputs || []).map(i => contactNames[i.name] || i.name)))];
let skeleton = await readFile('public/__forms.html', 'utf8');
const newNames = names.filter(name => !skeleton.includes(`name="${name}"`));
if (!skeleton.includes('name="end-page-artwork"')) newNames.push('end-page-artwork');
skeleton = skeleton.replace('    </form>', newNames.map(name => `      <input name="${name}"${name === 'end-page-artwork' ? ' type="file"' : ''}>`).join('\n') + '\n    </form>');
await writeFile('public/__forms.html', skeleton);
console.log(sections.map(s=>`${s.id}: ${s.type} ${s.label||s.alt}`).join('\n'));

