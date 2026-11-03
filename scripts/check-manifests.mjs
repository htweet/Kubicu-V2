#!/usr/bin/env node
// Fails when the root manifest (used for local and CI builds) and src/package.json
// (used by the Magic Patterns editor) disagree, or when any dependency is not pinned
// to an exact version. Keeps installs reproducible and both environments identical.
import { readFileSync } from 'node:fs';

const root = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const platform = JSON.parse(readFileSync(new URL('../src/package.json', import.meta.url), 'utf8'));
const exact = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;
const problems = [];

for (const section of ['dependencies', 'devDependencies']) {
  for (const [name, version] of Object.entries(root[section] ?? {})) {
    if (!exact.test(version)) problems.push(`package.json ${section}.${name} is "${version}" (must be an exact version)`);
  }
}
for (const [name, version] of Object.entries(platform.dependencies ?? {})) {
  const rootVersion = root.dependencies?.[name];
  if (rootVersion === undefined) problems.push(`src/package.json has ${name}@${version} but package.json does not`);
  else if (rootVersion !== version) problems.push(`${name}: package.json has ${rootVersion}, src/package.json has ${version}`);
}

if (problems.length) {
  console.error(`Manifest check failed (${problems.length}):\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log('Manifest check passed: all versions exact; src/package.json matches package.json.');
