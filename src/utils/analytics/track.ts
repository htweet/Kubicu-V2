import type { SourceId } from '../../types/analytics';

const SESSION_KEY = 'kubicu.visit';
const SESSION_MS = 30 * 60 * 1000;

export const sourceLabels: Record<SourceId, string> = {
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  facebook: 'Facebook',
  x: 'X (Twitter)',
  google: 'Google',
  qr: 'QR code',
  campaign: 'Campaign link',
  direct: 'Direct',
  other: 'Other sites'
};

/** A random visit id that lasts 30 minutes of inactivity. Nothing personal (D61). */
export function sessionId(): string {
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    const parsed = raw ? JSON.parse(raw) as {id: string;last: number;} : null;
    const now = Date.now();
    const id = parsed && now - parsed.last < SESSION_MS ? parsed.id : Math.random().toString(36).slice(2, 12);
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify({ id, last: now }));
    return id;
  } catch {
    return 'nostorage';
  }
}

/** A random id for this browser, only used to estimate unique visitors. */
export function browserId(): string {
  try {
    let id = window.localStorage.getItem('kubicu.browser');
    if (!id) {
      id = Math.random().toString(36).slice(2, 12);
      window.localStorage.setItem('kubicu.browser', id);
    }
    return id;
  } catch {
    return 'nostorage';
  }
}

const map: [RegExp, SourceId][] = [
[/whatsapp|wa\.me/i, 'whatsapp'],
[/instagram/i, 'instagram'],
[/tiktok/i, 'tiktok'],
[/facebook|fb\.|messenger/i, 'facebook'],
[/twitter|t\.co|x\.com/i, 'x'],
[/google/i, 'google'],
[/^qr$/i, 'qr']];


/**
 * Where a visit came from, in order: `?src=` (QR codes and campaign links set it), `utm_source`,
 * then the referring site. Shown to owners in plain words; no guessing about the person.
 */
export function detectSource(params: URLSearchParams, referrer: string): {source: SourceId;campaign?: string;} {
  const campaign = params.get('c') ?? undefined;
  const explicit = params.get('src') ?? params.get('utm_source');
  if (explicit) {
    const hit = map.find(([re]) => re.test(explicit));
    if (hit) return { source: hit[1], campaign };
    if (explicit === 'campaign') return { source: 'campaign', campaign };
    return { source: 'other', campaign };
  }
  if (campaign) return { source: 'campaign', campaign };
  if (!referrer) return { source: 'direct' };
  try {
    const host = new URL(referrer).hostname;
    if (host === window.location.hostname) return { source: 'direct' };
    const hit = map.find(([re]) => re.test(host));
    return { source: hit ? hit[1] : 'other' };
  } catch {
    return { source: 'direct' };
  }
}

/** First source of this visit, kept so later events in the same visit share it. */
export function visitSource(params: URLSearchParams): {source: SourceId;campaign?: string;} {
  const KEY = 'kubicu.visit.source';
  const fresh = detectSource(params, document.referrer);
  try {
    const stored = window.sessionStorage.getItem(KEY);
    if (fresh.source !== 'direct' || !stored) {
      window.sessionStorage.setItem(KEY, JSON.stringify(fresh));
      return fresh;
    }
    return JSON.parse(stored) as {source: SourceId;campaign?: string;};
  } catch {
    return fresh;
  }
}