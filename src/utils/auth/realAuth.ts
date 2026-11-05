/**
 * Real sign-in flag (M2.6, decisions D-UI-1..3; rollout plan in AI-Engine m2/16 §E).
 *
 * On only when BOTH are true:
 *   - the build was made with VITE_KUBICU_REAL_AUTH=true, and
 *   - /config.js (served next to the app, never cached) sets
 *     window.__KUBICU_CONFIG__ = {"realAuth": true, "apiUrl": "...", "authUrl": "..."}.
 * Production can therefore switch it off without a rebuild. There is no URL or localStorage override.
 * When it is off, or /config.js is missing or invalid, every screen behaves exactly as the prototype.
 * (A static script rather than a fetch keeps start-up synchronous and free of network calls.)
 */
export const REAL_AUTH_BUILD = import.meta.env.VITE_KUBICU_REAL_AUTH === 'true';

export interface RealAuthConfig {
  /** Kubicu Platform API origin, e.g. https://api.kubicu.com */
  readonly apiUrl: string;
  /** Supabase Auth base URL, e.g. https://<project>.supabase.co/auth/v1 */
  readonly authUrl: string;
  /**
   * The Supabase project's publishable key, sent as the `apikey` header on every Supabase Auth call (API-4).
   * Hosted Supabase requires it; the local open-source server does not. Never a secret or service_role key.
   */
  readonly authKey?: string;
}

/**
 * Why a value cannot be used as the `apikey` header, or null for a publishable key: `sb_publishable_…`, or a
 * legacy JWT-format key with role "anon". Secret (`sb_secret_…`) and service_role keys bypass Row Level
 * Security, so a configuration carrying one is refused as a whole.
 */
export function publishableKeyProblem(key: string): string | null {
  if (!/^[A-Za-z0-9._-]{20,2048}$/.test(key)) return 'not a Supabase publishable key';
  if (key.startsWith('sb_secret_')) return 'a Supabase secret key';
  if (key.startsWith('sb_publishable_')) return null;
  const parts = key.split('.');
  if (parts.length === 3) {
    try {
      const role = (JSON.parse(atob(parts[1]!.replace(/-/g, '+').replace(/_/g, '/'))) as { role?: unknown }).role;
      if (role === 'anon') return null;
      if (role === 'service_role') return 'a service_role key';
    } catch {
      // not a JWT
    }
  }
  return 'not a Supabase publishable key';
}

let config: RealAuthConfig | null = null;

function httpUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  try {
    const u = new URL(value);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
    if (u.username || u.password || u.search || u.hash) return null;
    return u.toString().replace(/\/+$/, '');
  } catch {
    return null;
  }
}

declare global {
  interface Window {
    __KUBICU_CONFIG__?: unknown;
  }
}

/** Reads window.__KUBICU_CONFIG__ (set by /config.js) once, before the first render. */
export function initRealAuthConfig(): void {
  if (!REAL_AUTH_BUILD) return;
  const json = window.__KUBICU_CONFIG__ as { realAuth?: unknown; apiUrl?: unknown; authUrl?: unknown; authKey?: unknown } | undefined;
  if (!json || typeof json !== 'object') return;
  const apiUrl = httpUrl(json.apiUrl);
  const authUrl = httpUrl(json.authUrl);
  let authKey: string | undefined;
  if (json.authKey !== undefined) {
    const problem = typeof json.authKey === 'string' ? publishableKeyProblem(json.authKey) : 'not a string';
    if (problem) {
      // Never send a secret key from a browser: stay in prototype mode instead.
      console.error(`Real sign-in is off: /config.js authKey is ${problem}.`);
      return;
    }
    authKey = json.authKey as string;
  }
  if (json.realAuth === true && apiUrl && authUrl) config = { apiUrl, authUrl, ...(authKey ? { authKey } : {}) };
}

/** True when real sign-in is on for this page load. Constant after start-up. */
export function realAuthEnabled(): boolean {
  return config !== null;
}

export function realAuthConfig(): RealAuthConfig {
  if (!config) throw new Error('Real sign-in is not enabled');
  return config;
}

/**
 * Where to go after signing in: only paths inside the workspace (/app...), on this origin. Anything else
 * (another origin, protocol-relative, backslashes, encoded tricks) falls back, so `next` is never an open redirect.
 */
export function safeNext(next: string | null | undefined, fallback = '/app'): string {
  if (!next || next.length > 2000) return fallback;
  if (!/^\/app(?:[/?#]|$)/.test(next)) return fallback;
  if (next.includes('\\') || next.includes('//') || [...next].some((c) => c.charCodeAt(0) < 0x20)) return fallback;
  try {
    const u = new URL(next, 'https://kubicu.invalid');
    if (u.origin !== 'https://kubicu.invalid' || !/^\/app(?:\/|$)/.test(u.pathname)) return fallback;
    return `${u.pathname}${u.search}${u.hash}`;
  } catch {
    return fallback;
  }
}
