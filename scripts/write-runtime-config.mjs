#!/usr/bin/env node
// Writes the runtime switch /config.js next to a real-sign-in build (M2.6; AI-Engine m2/16 §E).
//   node scripts/write-runtime-config.mjs <dir> off
//   node scripts/write-runtime-config.mjs <dir> on <apiUrl> <authUrl> [<publishableKey>]
// The effective flag is build-time AND this file, so writing "off" rolls back without a rebuild.
// Serve it with Cache-Control: no-store.
// <publishableKey>: the Supabase project's publishable key, sent as `apikey` to Supabase Auth (API-4);
// required for hosted Supabase. This file is public, so a secret or service_role key is refused.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [dir, mode, apiUrl = 'https://api.invalid', authUrl = 'https://auth.invalid/auth/v1', authKey] = process.argv.slice(2);
if (!dir || !['on', 'off'].includes(mode)) {
  console.error('usage: write-runtime-config.mjs <dir> on|off [apiUrl authUrl [publishableKey]]');
  process.exit(2);
}
if (authKey !== undefined) {
  const role = (() => {
    const p = authKey.split('.');
    try {
      return p.length === 3 ? JSON.parse(Buffer.from(p[1], 'base64url').toString('utf8')).role : undefined;
    } catch {
      return undefined;
    }
  })();
  const ok = /^[A-Za-z0-9._-]{20,2048}$/.test(authKey) && (authKey.startsWith('sb_publishable_') || role === 'anon');
  if (!ok) {
    console.error('write-runtime-config: the key must be the Supabase publishable key (sb_publishable_…, or a legacy key with role "anon"); refusing to publish any other key.');
    process.exit(2);
  }
}
const config = { realAuth: mode === 'on', apiUrl, authUrl, ...(authKey ? { authKey } : {}) };
writeFileSync(join(dir, 'config.js'), `window.__KUBICU_CONFIG__ = ${JSON.stringify(config)};\n`);
console.log(`wrote ${join(dir, 'config.js')} (realAuth ${mode}${authKey ? ', with the publishable key' : ''})`);
