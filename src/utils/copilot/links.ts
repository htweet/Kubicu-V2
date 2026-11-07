import type { CopilotDraft } from '../../types/copilot';

/**
 * Copilot preview links (D263). The link only lets someone *view* a draft — claiming it needs the separate
 * one-time code held by the chat that made it (Pass C). In production the id is an unguessable server token.
 */

export const PREVIEW_HOST = 'kub.icu';

export function previewPath(draftId: string): string {
  return `/d/${draftId}`;
}

/** What the link looks like when shared (the prototype opens it on this site). */
export function previewDisplayUrl(draftId: string): string {
  return `${PREVIEW_HOST}${previewPath(draftId)}`;
}

export function previewHref(draftId: string): string {
  return typeof window === 'undefined' ? previewPath(draftId) : `${window.location.origin}${previewPath(draftId)}`;
}

type Translate = (key: string, vars?: Record<string, string | number>) => string;
const plain: Translate = (key, vars) => (vars ? key.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? '')) : key);

/** "Expires in 6 days", "Expires within a day". Pass the translator to get it in the chosen language (D339). */
export function expiryLabel(d: CopilotDraft, now = Date.now(), t: Translate = plain): string {
  const ms = new Date(d.expiresAt).getTime() - now;
  const days = Math.ceil(ms / 86_400_000);
  if (days <= 0) return t('Expired');
  if (days === 1) return t('Expires within a day');
  return t('Expires in {n} days', { n: days });
}

/** The chat that made a draft, as a route on this device. */
export function chatPathFor(channel: 'whatsapp' | 'web'): string {
  return channel === 'whatsapp' ? '/copilot/whatsapp' : '/copilot/chat';
}
