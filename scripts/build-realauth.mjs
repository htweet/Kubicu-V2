#!/usr/bin/env node
// The real-sign-in build (M2.6), the one that is deployed: the same as `vite build` without the prototype
// staff console (G-1), with VITE_KUBICU_REAL_AUTH=true and the
// output in dist-realauth/. Setting the variable here, not in the npm script, makes it work in
// PowerShell and cmd as well as POSIX shells.
//   npm run build:realauth
import { spawnSync } from 'node:child_process';
import { build } from 'vite';

// G-1: a deployable build never contains the prototype staff console.
if (process.env.VITE_KUBICU_STAFF_CONSOLE !== undefined) {
  console.error('build:realauth: VITE_KUBICU_STAFF_CONSOLE must not be set; the real-sign-in build is deployable and excludes the prototype staff console.');
  process.exit(1);
}
// The shell environment outranks .env files in Vite, so this also defeats a stray .env.production or .env.local
// that sets the flag (review finding G-1a).
process.env.VITE_KUBICU_STAFF_CONSOLE = 'off';
process.env.VITE_KUBICU_REAL_AUTH = 'true';
await build({ build: { outDir: 'dist-realauth' } });
// The build itself fails if the staff console ended up in it anyway.
const check = spawnSync(process.execPath, ['scripts/check-staff-console.mjs', 'dist-realauth', 'absent'], { stdio: 'inherit' });
if (check.status !== 0) process.exit(check.status ?? 1);
