import type { CommerceData } from '../types/commerce';
import type { Subscription } from '../types/subscriptions';
import type { Block, MemberRule, SitePage } from '../types/page';
import { countries } from '../data/countries';
import { activeCountry, countryInfo } from './country';
import { phoneIssue } from './phone';

/**
 * Members-only content (D110). Members sign in with a one-time code sent to the phone or email
 * they subscribed with — no passwords. Access is worked out again on every view from the
 * subscription's current status, so pausing or ending a membership takes effect straight away.
 * Prototype: the session lives in this browser and content is only hidden in the browser.
 */

export const MEMBER_SESSION_DAYS = 30;
const KEY = 'kubicu.members.v1';
const DAY = 86_400_000;

export interface MemberSession {
  /** Normalised phone (0803…) or lower-cased email. */
  contact: string;
  channel: 'phone' | 'email';
  signedInAt: string;
  expiresAt: string;
}

export type AccessReason = 'signed_out' | 'no_membership' | 'paused' | 'ended' | 'other_plan';

export interface AccessResult {
  ok: boolean;
  reason?: AccessReason;
  /** The subscription that grants (or best explains) access. */
  sub?: Subscription;
}

/**
 * Numbers from any of our four countries, in any common shape (0712…, 712…, +254 712…, 254712…), become the
 * local form with a leading 0 so a subscriber can sign in however they type it (D403). Nigerian numbers come out
 * exactly as before (0803…). Numbers from elsewhere keep their digits.
 */
export function normalisePhone(raw: string): string {
  const v = raw.trim();
  const d = v.replace(/\D/g, '');
  if (!d) return '';
  const intl = v.startsWith('00') ? d.slice(2) : d;
  for (const c of countries) {
    if (intl.startsWith(c.dialCode) && intl.length === c.dialCode.length + c.nationalLength) return `0${intl.slice(c.dialCode.length)}`;
  }
  if (d.length === countryInfo(activeCountry()).nationalLength && !d.startsWith('0')) return `0${d}`;
  return d;
}

/** A complete mobile number for its country (the workspace's country when no code is given). Was Nigeria-only before D403. */
export function isMobileNumber(raw: string): boolean {
  const v = raw.trim();
  if (v.replace(/\D/g, '').length < 9) return false;
  return phoneIssue(v) === null;
}

export function normaliseContact(raw: string, channel: 'phone' | 'email'): string {
  return channel === 'phone' ? normalisePhone(raw) : raw.trim().toLowerCase();
}

/** "0803 ••• ••21" or "ng•••@gmail.com" — enough to recognise, not enough to copy. */
export function maskContact(contact: string, channel: 'phone' | 'email'): string {
  if (channel === 'phone') return contact.length >= 6 ? `${contact.slice(0, 4)} ••• ••${contact.slice(-2)}` : contact;
  const [name, domain] = contact.split('@');
  return domain ? `${name.slice(0, 2)}•••@${domain}` : contact;
}

function readAll(): Record<string, MemberSession> {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, MemberSession>) : {};
  } catch {
    return {};
  }
}

export function readSession(workspaceId: string): MemberSession | null {
  const s = readAll()[workspaceId];
  if (!s || Date.parse(s.expiresAt) <= Date.now()) return null;
  return s;
}

export function writeSession(workspaceId: string, session: MemberSession | null): void {
  const all = readAll();
  if (session) all[workspaceId] = session;
  else delete all[workspaceId];
  window.localStorage.setItem(KEY, JSON.stringify(all));
}

export function newSession(contact: string, channel: 'phone' | 'email'): MemberSession {
  const now = Date.now();
  return { contact, channel, signedInAt: new Date(now).toISOString(), expiresAt: new Date(now + MEMBER_SESSION_DAYS * DAY).toISOString() };
}

/** Subscriptions bought with this phone or email. */
export function membershipsFor(data: CommerceData | null, contact: string, channel: 'phone' | 'email'): Subscription[] {
  if (!data || !contact) return [];
  return data.subscriptions.filter((s) => (channel === 'phone' ? !!s.customer.phone && normalisePhone(s.customer.phone) === contact : s.customer.email.trim().toLowerCase() === contact));
}

/** Whether one subscription currently grants access, ignoring which plan it is. */
export function subGrants(sub: Subscription, now = Date.now()): boolean {
  if (sub.status === 'trialing' || sub.status === 'active') return true;
  if (sub.status === 'cancelling') return Date.parse(sub.periodEnd) > now;
  if (sub.status === 'past_due') return !!sub.graceEndsAt && Date.parse(sub.graceEndsAt) > now;
  return false;
}

const reasonRank: Record<AccessReason, number> = { other_plan: 0, paused: 1, ended: 2, no_membership: 3, signed_out: 4 };

/** Checks a rule against the signed-in member's subscriptions. */
export function checkAccess(data: CommerceData | null, session: MemberSession | null, rule: MemberRule, now = Date.now()): AccessResult {
  if (!session) return { ok: false, reason: 'signed_out' };
  const subs = membershipsFor(data, session.contact, session.channel);
  if (subs.length === 0) return { ok: false, reason: 'no_membership' };
  const fits = (s: Subscription) => rule.access === 'any' || rule.planIds.includes(s.planId);
  const granting = subs.find((s) => fits(s) && subGrants(s, now));
  if (granting) return { ok: true, sub: granting };
  // Explain the closest miss: a live plan that doesn't include this beats a paused one, then an ended one.
  let best: AccessResult = { ok: false, reason: 'no_membership' };
  subs.forEach((s) => {
    const r: AccessReason = subGrants(s, now) ? 'other_plan' : s.status === 'paused' ? 'paused' : 'ended';
    if (reasonRank[r] < reasonRank[best.reason as AccessReason]) best = { ok: false, reason: r, sub: s };
  });
  return best;
}

/** Plan names a rule allows, for teaser copy ("Atelier Circle members"). */
export function ruleLabel(data: CommerceData | null, rule: MemberRule): string {
  if (rule.access === 'any') return 'Any subscriber';
  const names = rule.planIds.map((id) => data?.subPlans.find((p) => p.id === id)?.name).filter((n): n is string => !!n);
  return names.length ? names.join(' or ') : 'Chosen plans';
}

/** How many blocks after the members-only block at `index` it hides. */
export function coveredCount(blocks: Block[], index: number): number {
  const gate = blocks[index];
  if (!gate || gate.type !== 'membersOnly') return 0;
  const rest = blocks.length - index - 1;
  return gate.content.covers === 0 ? rest : Math.min(gate.content.covers, rest);
}

/** Everything on a site that is members-only, for the Subscriptions screen and publish checks. */
export function memberAreas(pages: { id: string | null; title: string; blocks: Block[]; rule?: SitePage['membersOnly'] }[]) {
  const out: { pageId: string | null; pageTitle: string; kind: 'page' | 'section'; label: string; rule: MemberRule; blockId?: string }[] = [];
  pages.forEach((p) => {
    if (p.rule) out.push({ pageId: p.id, pageTitle: p.title, kind: 'page', label: `${p.title} page`, rule: p.rule });
    p.blocks.forEach((b) => {
      if (b.type === 'membersOnly' && !b.visibility.hidden) out.push({ pageId: p.id, pageTitle: p.title, kind: 'section', label: b.content.title || 'Members-only section', rule: b.content, blockId: b.id });
    });
  });
  return out;
}
