import { realAuthConfig } from './realAuth';

/**
 * Real sign-in client (M2.6, D-UI-1). Supabase Auth issues a one-time e-mail code; its access token is
 * exchanged once for a Kubicu session (HttpOnly cookie set by the Platform API) and then dropped. The
 * token is never stored: only the session cookie and the readable CSRF cookie remain.
 */

export interface Me {
  user: { id: string; displayName: string | null; email: string | null; phone: string | null; locale: string | null };
  session: { provider: string; amr: string[]; authTime: string; expiresAt: string };
  memberships: Array<{ workspaceId: string; orgId: string; name: string; type: string; plan: string; role: string }>;
}

export type ApiErrorCode =
  | 'network'
  | 'unauthenticated'
  | 'step_up_required'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'seat_limit_reached'
  | 'validation_failed'
  | 'payload_too_large'
  | 'rate_limited'
  | 'unavailable'
  | 'invalid_code'
  | 'unknown';

/** A failed call, mapped to the error table in m2/16 §E so each one gets a specific message. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: ApiErrorCode,
    readonly title: string,
    readonly detail?: string,
    readonly retryAfterSeconds?: number
  ) {
    super(title);
  }
}

const CODES: Record<string, ApiErrorCode> = {
  unauthenticated: 'unauthenticated',
  step_up_required: 'step_up_required',
  forbidden: 'forbidden',
  not_found: 'not_found',
  conflict: 'conflict',
  idempotency_conflict: 'conflict',
  seat_limit_reached: 'seat_limit_reached',
  validation_failed: 'validation_failed',
  payload_too_large: 'payload_too_large',
  unsupported_media_type: 'validation_failed',
  rate_limited: 'rate_limited',
  upstream_unavailable: 'unavailable',
  ai_unavailable: 'unavailable'
};

function retryAfter(res: Response): number | undefined {
  const v = Number(res.headers.get('retry-after'));
  return Number.isFinite(v) && v > 0 ? v : undefined;
}

async function apiError(res: Response): Promise<ApiError> {
  let body: { type?: string; title?: string; detail?: string } = {};
  try {
    body = (await res.json()) as typeof body;
  } catch {
    // not a problem document
  }
  const slug = body.type?.split('/').pop() ?? '';
  const code: ApiErrorCode = CODES[slug] ?? (res.status === 401 ? 'unauthenticated' : res.status === 429 ? 'rate_limited' : res.status >= 500 ? 'unavailable' : 'unknown');
  return new ApiError(res.status, code, body.title ?? `Request failed (${res.status})`, body.detail, retryAfter(res));
}

async function send(input: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch {
    throw new ApiError(0, 'network', 'No connection');
  }
}

/** The CSRF token the Platform API put in a readable cookie for this site (double submit). */
export function csrfToken(): string {
  const hit = document.cookie.split('; ').find((c) => c.startsWith('kubicu_csrf='));
  return hit ? decodeURIComponent(hit.slice('kubicu_csrf='.length)) : '';
}

/** A Platform API call with the session cookie; unsafe methods carry the CSRF header. */
export async function api<T>(method: string, path: string, body?: unknown, extraHeaders: Record<string, string> = {}): Promise<T> {
  const headers: Record<string, string> = { ...extraHeaders };
  if (body !== undefined) headers['content-type'] = 'application/json';
  if (method !== 'GET') headers['x-csrf-token'] = csrfToken();
  const res = await send(`${realAuthConfig().apiUrl}${path}`, {
    method,
    credentials: 'include',
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  if (!res.ok) throw await apiError(res);
  return (res.status === 204 ? undefined : await res.json()) as T;
}

async function gotrue(path: string, body: unknown): Promise<Response> {
  const { authUrl, authKey } = realAuthConfig();
  return send(`${authUrl}${path}`, {
    method: 'POST',
    credentials: 'omit',
    // API-4: hosted Supabase Auth requires the publishable key on every call.
    headers: { 'content-type': 'application/json', ...(authKey ? { apikey: authKey } : {}) },
    body: JSON.stringify(body)
  });
}

/**
 * Sends a 6-digit code by e-mail. For sign-in no account is created, and the reply never says whether one
 * exists (the next screen is the same either way).
 */
export async function requestCode(email: string, options: { createUser: boolean; name?: string }): Promise<void> {
  const res = await gotrue('/otp', { email, create_user: options.createUser, ...(options.name ? { data: { name: options.name } } : {}) });
  if (res.ok) return;
  if (res.status === 429) throw new ApiError(429, 'rate_limited', 'Too many codes requested', undefined, retryAfter(res));
  if (res.status >= 500) throw new ApiError(res.status, 'unavailable', 'Sign-in is unavailable');
  // Unknown address on sign-in (sign-ups not allowed for this call): treated as sent, so accounts cannot be probed.
  if (!options.createUser && (res.status === 400 || res.status === 422)) return;
  throw new ApiError(res.status, 'unknown', 'The code could not be sent');
}

/** Checks the code with Supabase Auth, then opens a Kubicu session. The access token is discarded. */
export async function signInWithCode(email: string, code: string): Promise<{ userId: string }> {
  const res = await gotrue('/verify', { type: 'email', email, token: code });
  if (res.status === 429) throw new ApiError(429, 'rate_limited', 'Too many tries', undefined, retryAfter(res));
  if (res.status >= 500) throw new ApiError(res.status, 'unavailable', 'Sign-in is unavailable');
  if (!res.ok) throw new ApiError(res.status, 'invalid_code', 'That code didn’t match or has expired');
  let accessToken = ((await res.json()) as { access_token?: string }).access_token;
  if (!accessToken) throw new ApiError(502, 'unavailable', 'Sign-in is unavailable');
  try {
    const exchanged = await send(`${realAuthConfig().apiUrl}/v1/auth/session`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ idpToken: accessToken })
    });
    if (!exchanged.ok) throw await apiError(exchanged);
    return { userId: ((await exchanged.json()) as { userId: string }).userId };
  } finally {
    accessToken = undefined;
  }
}

/** The signed-in person, or null when there is no valid session. */
export async function fetchMe(): Promise<Me | null> {
  try {
    return await api<Me>('GET', '/v1/me');
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}

export async function signOutSession(): Promise<void> {
  try {
    await api<void>('DELETE', '/v1/auth/session');
  } catch (error) {
    // Already signed out is fine; anything else is reported to the caller.
    if (!(error instanceof ApiError && error.status === 401)) throw error;
  }
}

/** Plain-language message for an error, following the table in m2/16 §E. */
export function describeError(error: unknown): { tone: 'warning' | 'danger'; title: string; body: string } {
  const e = error instanceof ApiError ? error : new ApiError(0, 'unknown', 'Something went wrong');
  switch (e.code) {
    case 'network':
      return { tone: 'danger', title: 'You’re offline', body: 'Check your connection and try again. Your browser workspaces still work.' };
    case 'unavailable':
      return { tone: 'danger', title: 'Can’t reach KUBICU right now', body: 'Please try again in a moment.' };
    case 'rate_limited':
      return { tone: 'warning', title: 'Too many tries', body: e.retryAfterSeconds ? `Wait ${e.retryAfterSeconds} seconds, then try again.` : 'Wait a minute, then try again.' };
    case 'step_up_required':
      return { tone: 'warning', title: 'Confirm it’s you', body: 'For your security, sign in again with a new code, then repeat this.' };
    case 'unauthenticated':
      return { tone: 'warning', title: 'Your session ended', body: 'Sign in again to continue.' };
    case 'forbidden':
      return { tone: 'warning', title: 'You can’t do this', body: e.detail ?? 'Your role doesn’t allow it.' };
    case 'not_found':
      return { tone: 'warning', title: 'Not found', body: 'It may have been removed.' };
    case 'conflict':
    case 'seat_limit_reached':
      return { tone: 'warning', title: e.title, body: e.detail ?? '' };
    case 'payload_too_large':
      return { tone: 'danger', title: 'Too large to upload', body: e.detail ?? 'Remove some media or files, then try again.' };
    case 'validation_failed':
      return { tone: 'danger', title: e.title, body: e.detail ?? '' };
    default:
      return { tone: 'danger', title: 'Something went wrong', body: e.detail ?? 'Please try again.' };
  }
}
