#!/usr/bin/env node
// TypeScript error ratchet.
//
// The codebase has a known backlog of type errors (recorded in typecheck-baseline.json).
// This is NOT a clean type-check. It guarantees only that no NEW errors are introduced:
// every error is keyed by file + error code + message (line numbers are kept for reference
// but ignored, so unrelated edits that shift lines don't fail the check). For each key the
// current count must not exceed the baseline count.
//
//   node scripts/typecheck-ratchet.mjs                   # check (CI)
//   node scripts/typecheck-ratchet.mjs --write-baseline  # re-record after errors are FIXED
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const baselinePath = path.join(repoRoot, 'typecheck-baseline.json');
const write = process.argv.includes('--write-baseline');

const tscBin = path.join(repoRoot, 'node_modules', 'typescript', 'bin', 'tsc');
const run = spawnSync(process.execPath, [tscBin, '--noEmit', '--pretty', 'false', '-p', repoRoot], {
  cwd: repoRoot, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024
});
const output = `${run.stdout}${run.stderr}`;
const line = /^(.+?)\((\d+),(\d+)\): error (TS\d+): (.*)$/;
const errors = output.split(/\r?\n/).map((l) => l.match(line)).filter(Boolean).map((m) => ({
  file: m[1].replace(/\\/g, '/'), line: Number(m[2]), code: m[4], message: m[5].trim()
}));
if (run.status !== 0 && errors.length === 0) {
  console.error('tsc failed without reporting type errors (configuration or crash):\n' + output);
  process.exit(2);
}
const keyOf = (e) => `${e.file}|${e.code}|${e.message}`;
const countBy = (list) => list.reduce((m, e) => m.set(keyOf(e), (m.get(keyOf(e)) ?? 0) + 1), new Map());

if (write) {
  const entries = [...errors].sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.code.localeCompare(b.code));
  writeFileSync(baselinePath, JSON.stringify({
    description: 'Known TypeScript errors accepted at the time of recording. CI fails on any error not in this list. Re-record only after fixing errors.',
    typescript: JSON.parse(readFileSync(path.join(repoRoot, 'node_modules', 'typescript', 'package.json'), 'utf8')).version,
    total: entries.length,
    errors: entries
  }, null, 2) + '\n');
  console.log(`Baseline written: ${entries.length} errors -> typecheck-baseline.json`);
  process.exit(0);
}

if (!existsSync(baselinePath)) {
  console.error('typecheck-baseline.json is missing. Run with --write-baseline to record it.');
  process.exit(2);
}
const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
const allowed = countBy(baseline.errors);
const current = countBy(errors);
const added = [];
for (const [key, count] of current) {
  const extra = count - (allowed.get(key) ?? 0);
  if (extra > 0) added.push(...errors.filter((e) => keyOf(e) === key).slice(-extra));
}
const fixed = baseline.total - (errors.length - added.length);

console.log(`TypeScript errors: ${errors.length} now, ${baseline.total} in baseline (known backlog, not a clean type-check).`);
if (added.length) {
  console.error(`\n${added.length} NEW type error(s) not in the baseline:`);
  for (const e of added) console.error(`  ${e.file}(${e.line}): ${e.code} ${e.message}`);
  process.exit(1);
}
if (fixed > 0) console.log(`${fixed} baseline error(s) no longer occur. Run "npm run typecheck:baseline" to lower the baseline.`);
console.log('Ratchet passed: no new type errors.');
