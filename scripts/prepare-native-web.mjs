import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
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

async function patchHtml(fileName) {
  const file = path.join(out, fileName);
  let html = await readFile(file, 'utf8');

  if (fileName === 'index.html') {
    html = html
      .replace(/<script src="https:\/\/cdn\.onesignal\.com\/sdks\/web\/v16\/OneSignalSDK\.page\.js" defer><\/script>/g, '')
      .replace(/<script>window\.OneSignalDeferred = window\.OneSignalDeferred \|\| \[\];<\/script>/g, '');
  }

  if (!html.includes('js/native-shell-v100.js')) {
    html = html.replace('</body>', '<script src="js/native-shell-v100.js?v=100"></script></body>');
  }
  await writeFile(file, html, 'utf8');
}

await patchHtml('index.html');
await patchHtml('admin.html');

console.log('Prepared Capacitor web bundle at', out);
console.log('Native bundle uses OneSignal native SDK and includes secure Staff/Admin route.');
