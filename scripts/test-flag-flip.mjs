#!/usr/bin/env node
// The eight journeys, unchanged, against the real-sign-in build switched off in /config.js (M2.6).
// Works in PowerShell and cmd as well as POSIX shells.
//   npm run test:e2e:flag-flip [-- <playwright args>]
import { spawnSync } from 'node:child_process';

const step = (cmd, args, env = {}) => {
  const r = spawnSync(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32', env: { ...process.env, ...env } });
  if (r.status !== 0) process.exit(r.status ?? 1);
};

step(process.execPath, ['scripts/build-realauth.mjs']);
step(process.execPath, ['scripts/write-runtime-config.mjs', 'dist-realauth', 'off']);
step('npx', ['playwright', 'test', ...process.argv.slice(2)], { KUBICU_PREVIEW_DIR: 'dist-realauth' });
