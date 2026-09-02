import { cp, mkdir, readdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const out = path.join(root, 'www');
const excludedTop = new Set([
  '.git', '.github', 'android', 'ios', 'node_modules', 'www', 'scripts',
  'supabase', 'sql', 'docs', 'release', 'test', 'tests'
]);
const excludedFiles = new Set([
  'package.json', 'package-lock.json', 'capacitor.config.json', '.gitignore'
]);

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

for (const name of await readdir(root)) {
  if (excludedTop.has(name) || excludedFiles.has(name)) continue;
  const src = path.join(root, name);
  const dst = path.join(out, name);
  const s = await stat(src);
  if (s.isDirectory()) await cp(src, dst, { recursive: true });
  else await cp(src, dst);
}

console.log('Prepared Capacitor web bundle at', out);
