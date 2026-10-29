import type { CampaignLink, DomainsData, LinkHealth } from '../../types/domains';
import type { Workspace } from '../../types/workspace';
import type { CommerceData } from '../../types/commerce';
import { checkDestination } from '../linkSafety';
import { isValidPhone } from '../validation';
import { whatsappLink } from '../format';
import { destinationExists, destinationLabel, linkEnded } from './links';

/*
 * Short-link rules added with D271: scheduling, WhatsApp chat links, creation limits and health checks.
 */

export type LinkStatus = 'live' | 'scheduled' | 'paused' | 'ended' | 'archived';

export const linkStatusLabels: Record<LinkStatus, string> = {
  live: 'Live',
  scheduled: 'Scheduled',
  paused: 'Paused',
  ended: 'Ended',
  archived: 'Archived'
};

export function linkScheduled(link: CampaignLink, now = Date.now()): boolean {
  return !!link.startsAt && Date.parse(link.startsAt) > now;
}

export function linkStatus(link: CampaignLink, now = Date.now()): LinkStatus {
  if (link.archivedAt) return 'archived';
  if (link.pausedAt) return 'paused';
  if (linkEnded(link, now)) return 'ended';
  if (linkScheduled(link, now)) return 'scheduled';
  return 'live';
}

/** Leaves the page (another website or WhatsApp), so what happens next can't be tracked. */
export function linkOffsite(link: CampaignLink): boolean {
  return !!(link.externalUrl || link.whatsapp);
}

/* ---------- WhatsApp chat links ---------- */

export const WA_MESSAGE_MAX = 500;

/** Digits in international form. Nigerian numbers written 080… become 23480…. */
export function waNumber(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, '');
  if (digits.length === 11 && digits.startsWith('0')) return `234${digits.slice(1)}`;
  return digits;
}

export function waPhoneError(raw: string): string | undefined {
  if (!raw.trim()) return 'Add the WhatsApp number people should message.';
  if (!isValidPhone(raw) || waNumber(raw).length < 10) return 'Use a full number, e.g. 0803 000 0000 or +234 803 000 0000.';
  return undefined;
}

export function waDisplay(phone: string): string {
  return `+${waNumber(phone)}`;
}

export function waHref(w: {phone: string;message: string;}): string {
  return whatsappLink(waNumber(w.phone), w.message);
}

/* ---------- Where a link goes, in words ---------- */

export function linkGoesTo(workspace: Workspace, commerce: CommerceData | null, link: CampaignLink): string {
  if (link.whatsapp) return `WhatsApp chat with ${waDisplay(link.whatsapp.phone)}`;
  if (link.externalUrl) return link.externalUrl.replace(/^https:\/\//, '');
  return destinationLabel(workspace, commerce, link.destination);
}

/** Stable key for destination history: a change of this means the link goes somewhere new. */
export function destinationKey(link: Pick<CampaignLink, 'externalUrl' | 'whatsapp' | 'destination'>): string {
  if (link.whatsapp) return `wa:${waNumber(link.whatsapp.phone)}|${link.whatsapp.message.trim()}`;
  if (link.externalUrl) return link.externalUrl;
  return `${link.destination.spaceId}|${link.destination.path}#${link.destination.anchor ?? ''}`;
}

/* ---------- Creation limit ---------- */

/** Example figure: new short links per workspace per hour. Stops runaway scripts and spam bursts. */
export const LINKS_PER_HOUR = 30;
const HOUR = 3_600_000;

export type CreationCheck = {ok: true;left: number;} | {ok: false;message: string;resetAt: number;};

export function linkCreationCheck(data: DomainsData, now = Date.now()): CreationCheck {
  const recent = data.links.map((l) => Date.parse(l.createdAt)).filter((t) => now - t < HOUR).sort((a, b) => a - b);
  if (recent.length < LINKS_PER_HOUR) return { ok: true, left: LINKS_PER_HOUR - recent.length };
  const resetAt = recent[recent.length - LINKS_PER_HOUR] + HOUR;
  const at = new Date(resetAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return { ok: false, resetAt, message: `You’ve made ${LINKS_PER_HOUR} links in the last hour, the most allowed. You can make more from ${at}.` };
}

/* ---------- Health checks ---------- */

export const HEALTH_INTERVAL_MS = 24 * HOUR;

/**
 * What can be checked without a server: website addresses still pass the safety check, WhatsApp numbers are still
 * valid, and pages, products and blocks still exist. Whether a website is down needs the live service.
 */
export function checkLinkHealth(workspace: Workspace, commerce: CommerceData | null, link: CampaignLink, now = Date.now()): LinkHealth {
  const checkedAt = new Date(now).toISOString();
  if (link.whatsapp) {
    const err = waPhoneError(link.whatsapp.phone);
    return err ? { ok: false, reason: 'Its WhatsApp number isn’t valid any more.', checkedAt } : { ok: true, checkedAt };
  }
  if (link.externalUrl) {
    const c = checkDestination(link.externalUrl);
    return c.ok ? { ok: true, checkedAt } : { ok: false, reason: 'Its website address no longer passes the safety check, so visitors see a warning instead.', checkedAt };
  }
  return destinationExists(workspace, commerce, link.destination) ?
  { ok: true, checkedAt } :
  { ok: false, reason: 'Its page, product or block was removed. Visitors go to the nearest page that still exists.', checkedAt };
}

/** Runs every active link's check. Returns the updated data and the links that newly failed. */
export function runHealthChecks(data: DomainsData, workspace: Workspace, commerce: CommerceData | null, now = Date.now()): {data: DomainsData;newlyBroken: CampaignLink[];} {
  const newlyBroken: CampaignLink[] = [];
  const links = data.links.map((l) => {
    if (l.archivedAt) return l;
    const health = checkLinkHealth(workspace, commerce, l, now);
    if (!health.ok && l.health?.ok !== false) newlyBroken.push(l);
    return { ...l, health };
  });
  return { data: { ...data, links, linkHealthCheckedAt: new Date(now).toISOString() }, newlyBroken };
}

export function healthDue(data: DomainsData, now = Date.now()): boolean {
  return !data.linkHealthCheckedAt || now - Date.parse(data.linkHealthCheckedAt) >= HEALTH_INTERVAL_MS;
}