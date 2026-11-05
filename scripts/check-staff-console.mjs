#!/usr/bin/env node
// Release gate G-1: proves whether a built bundle contains the prototype staff console (/admin).
//   node scripts/check-staff-console.mjs dist-realauth absent   fails if any marker is found (deployable build)
//   node scripts/check-staff-console.mjs dist present           fails unless every marker is found (prototype
//                                                               build; keeps the markers honest)
// The markers are code only the console has: its route, its lazily loaded chunk, and its sign-in and
// two-step screens. (Translation tables and the staff seed data the app shell reads are not the console.)
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const MARKERS = [
  { name: 'the /admin/* route', test: (file, text) => text.includes('"/admin/*"') },
  { name: 'the StaffConsoleRoutes chunk', test: (file) => /StaffConsoleRoutes-[\w-]+\.js$/.test(file) },
  { name: 'the staff sign-in check', test: (file, text) => text.includes('match a staff account') },
  { name: 'the staff two-step enrolment', test: (file, text) => text.includes('Set up two-step') }
];

const [dir, mode] = process.argv.slice(2);
if (!dir || !['absent', 'present'].includes(mode)) {
  console.error('usage: check-staff-console.mjs <dir> absent|present');
  process.exit(2);
}
const files = [];
const walk = (d) => {
  for (const name of readdirSync(d)) {
    const p = join(d, name);
    if (statSync(p).isDirectory()) walk(p);
    else files.push(p);
  }
};
walk(dir);
if (!files.some((f) => f.endsWith('index.html'))) {
  console.error(`${dir} has no index.html; build it first`);
  process.exit(2);
}
const found = MARKERS.filter((m) => files.some((f) => m.test(f, /\.(js|html|mjs)$/.test(f) ? readFileSync(f, 'utf8') : '')));
if (mode === 'absent' && found.length) {
  console.error(`G-1 FAILED: ${dir} contains the prototype staff console: ${found.map((m) => m.name).join(', ')}`);
  process.exit(1);
}
if (mode === 'present' && found.length !== MARKERS.length) {
  const missing = MARKERS.filter((m) => !found.includes(m)).map((m) => m.name);
  console.error(`G-1 marker check is stale: the prototype build ${dir} lacks ${missing.join(', ')}; update the markers`);
  process.exit(1);
}
console.log(`G-1: ${dir} ${mode === 'absent' ? 'contains no' : 'contains all'} staff-console markers (${MARKERS.length} checked, ${files.length} files)`);
