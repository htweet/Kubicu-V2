#!/usr/bin/env node
// Fails if a build still loads fonts from a third party, or if the self-hosted fonts are missing or broken
// (owner decision, 6 Nov 2026: fonts are served from our own server).
//   node scripts/check-self-hosted-fonts.mjs <dist dir>
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const dist = process.argv[2];
if (!dist || !existsSync(dist)) {
  console.error('usage: check-self-hosted-fonts.mjs <dist dir>');
  process.exit(2);
}
const problems = [];
const walk = (dir) => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : [join(dir, f)]));
const files = walk(dist);
for (const f of files.filter((x) => /\.(html|js|css|mjs)$/.test(x))) {
  if (/fonts\.(googleapis|gstatic)\.com/.test(readFileSync(f, 'utf8'))) problems.push(`${f} refers to Google Fonts`);
}
const index = readFileSync(join(dist, 'index.html'), 'utf8');
if (!index.includes('href="/fonts/app.css"')) problems.push('index.html does not link /fonts/app.css');
for (const sheet of ['app', 'themes', 'print-kit']) {
  const path = join(dist, 'fonts', `${sheet}.css`);
  if (!existsSync(path)) {
    problems.push(`fonts/${sheet}.css is missing`);
    continue;
  }
  const css = readFileSync(path, 'utf8');
  const urls = [...css.matchAll(/url\(([^)]+)\)/g)].map((m) => m[1]);
  if (urls.length === 0) problems.push(`fonts/${sheet}.css has no font files`);
  for (const u of urls) {
    if (!u.startsWith('/fonts/files/')) problems.push(`fonts/${sheet}.css points outside /fonts/files: ${u}`);
    else if (!existsSync(join(dist, u))) problems.push(`fonts/${sheet}.css: ${u} is missing`);
  }
}
if (!existsSync(join(dist, 'fonts', 'licences'))) problems.push('fonts/licences (OFL) is missing');
if (problems.length) {
  for (const p of problems) console.error(`fonts: ${p}`);
  process.exit(1);
}
console.log(`fonts: ${dist} loads fonts only from its own server (/fonts; ${files.filter((f) => f.includes('/fonts/files/')).length} files)`);
