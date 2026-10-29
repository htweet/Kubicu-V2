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

/** "Expires in 6 days", "Expires today". */
export function expiryLabel(d: CopilotDraft, now = Date.now()): string {
  const ms = new Date(d.expiresAt).getTime() - now;
  const days = Math.ceil(ms / 86_400_000);
  if (days <= 0) return 'Expired';
  if (days === 1) return 'Expires within a day';
  return `Expires in ${days} days`;
}

/** The chat that made a draft, as a route on this device. */
export function chatPathFor(channel: 'whatsapp' | 'web'): string {
  return channel === 'whatsapp' ? '/copilot/whatsapp' : '/copilot/chat';
}