// Release the already built, matching adapter bundles. Never publish raw .next.
import { readFile, writeFile, access } from 'node:fs/promises';
import { join, dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { checkDeployBundle } from './check-deploy-bundle.mjs';

const args = process.argv.slice(2);
if (args.some(arg => arg !== '--prod')) throw new Error('Usage: node scripts/deploy-verified.mjs [--prod]');
const { staticDirectory, manifest, manifestPath } = await checkDeployBundle();
// Netlify CLI discards manifests older than two minutes and may rebundle the
// catch-all as a user function, losing its lower route priority. The bundle was
// validated above; retain its exact functions and priority for this release.
manifest.timestamp = Date.now();
await writeFile(manifestPath, JSON.stringify(manifest));
const require = createRequire(import.meta.url);
let cliPackage;
try { cliPackage = require.resolve('netlify-cli/package.json'); }
catch {
  cliPackage = join(process.platform === 'win32' ? process.env.APPDATA : join(dirname(process.execPath), '../lib'), 'npm/node_modules/netlify-cli/package.json');
  // Unix global npm installs omit the extra npm directory.
  try { await access(cliPackage); }
  catch { cliPackage = resolve(dirname(process.execPath), '../lib/node_modules/netlify-cli/package.json'); }
}
const cli = JSON.parse(await readFile(cliPackage, 'utf8'));
const result = spawnSync(process.execPath, [join(dirname(cliPackage), cli.bin.netlify), 'deploy', '--no-build',
  '--dir', staticDirectory, '--json', '--message', 'Restore complete website assets and gallery runtime', ...args], { stdio: 'inherit' });
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
