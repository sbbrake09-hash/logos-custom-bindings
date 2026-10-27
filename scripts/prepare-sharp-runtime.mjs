// Local Windows deploys still execute on Linux. Install the target runtime in
// isolation so npm does not replace the developer's native Sharp installation.
import { cp, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';

const sharp = JSON.parse(await readFile(new URL('../node_modules/sharp/package.json', import.meta.url)));
if (process.platform === 'linux' && process.arch === 'x64') {
  // Linux CI installs these optional dependencies natively.
  await import('sharp');
  process.exit(0);
}
const directory = await mkdtemp(join(tmpdir(), 'logos-sharp-linux-'));
try {
  const result = spawnSync(process.execPath, [process.env.npm_execpath || join(dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js'),
    'install', '--prefix', directory, '--os=linux', '--cpu=x64', '--libc=glibc',
    '--include=optional', '--ignore-scripts', '--no-audit', '--no-fund', '--package-lock=false', `sharp@${sharp.version}`], { stdio: 'inherit' });
  if (result.status !== 0) throw new Error('Could not prepare the Linux image runtime.');
  for (const name of ['sharp-linux-x64', 'sharp-libvips-linux-x64']) {
    await cp(join(directory, 'node_modules/@img', name), new URL(`../node_modules/@img/${name}`, import.meta.url), { recursive: true });
  }
  console.log(`Prepared Sharp ${sharp.version} for Netlify Linux functions.`);
} finally {
  // The directory is always the exact temporary directory created above.
  await rm(directory, { recursive: true, force: true });
}
