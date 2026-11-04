#!/usr/bin/env node
// The real-sign-in build (M2.6): the same as `vite build`, with VITE_KUBICU_REAL_AUTH=true and the
// output in dist-realauth/. Setting the variable here, not in the npm script, makes it work in
// PowerShell and cmd as well as POSIX shells.
//   npm run build:realauth
import { build } from 'vite';

process.env.VITE_KUBICU_REAL_AUTH = 'true';
await build({ build: { outDir: 'dist-realauth' } });
