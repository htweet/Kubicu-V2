#!/usr/bin/env node
// Writes the runtime switch /config.js next to a real-sign-in build (M2.6; AI-Engine m2/16 §E).
//   node scripts/write-runtime-config.mjs <dir> off
//   node scripts/write-runtime-config.mjs <dir> on <apiUrl> <authUrl>
// The effective flag is build-time AND this file, so writing "off" rolls back without a rebuild.
// Serve it with Cache-Control: no-store.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [dir, mode, apiUrl = 'https://api.invalid', authUrl = 'https://auth.invalid/auth/v1'] = process.argv.slice(2);
if (!dir || !['on', 'off'].includes(mode)) {
  console.error('usage: write-runtime-config.mjs <dir> on|off [apiUrl authUrl]');
  process.exit(2);
}
const config = { realAuth: mode === 'on', apiUrl, authUrl };
writeFileSync(join(dir, 'config.js'), `window.__KUBICU_CONFIG__ = ${JSON.stringify(config)};\n`);
console.log(`wrote ${join(dir, 'config.js')} (realAuth ${mode})`);
