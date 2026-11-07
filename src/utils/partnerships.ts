import type { Agreement, AgreementSide, DeliveryRule, Partnership, PartnershipData, PartnershipEvent, PartnershipStatus, SupportRule, TrustLevel } from '../types/partnership';
import { partnerDirectory } from '../data/partnerDirectory';
import { uid } from './id';

/**
 * Business partnerships (D120): the connection two businesses make before running a
 * co-branded space or selling a partner bundle together.
 */
export const PARTNERSHIP_PLAN = 'pro' as const;
export const INVITE_DAYS = 7;
export const NOTICE_DAYS = 14;
const DAY = 86_400_000;

export const partnershipKey = (workspaceId: string) => `kubicu.partnerships.${workspaceId}`;
export const emptyPartnerships = (): PartnershipData => ({ partnerships: [], sampleSeeded: false });

export const statusLabels: Record<PartnershipStatus, string> = { invited: 'Invited', active: 'Working together', ending: 'Ending', ended: 'Ended', declined: 'Declined' };
export const statusTones: Record<PartnershipStatus, 'info' | 'success' | 'warning' | 'neutral' | 'danger'> = { invited: 'info', active: 'success', ending: 'warning', ended: 'neutral', declined: 'danger' };
export const trustLabels: Record<TrustLevel, string> = { new: 'New', building: 'Building trust', trusted: 'Trusted', top: 'Top seller' };
export const deliveryLabels: Record<DeliveryRule, string> = { each: 'Each of us delivers our own part', lead: 'We deliver everything', partner: 'They deliver everything' };
export const supportLabels: Record<SupportRule, string> = { each: 'Each of us answers about our own part', lead: 'We answer all customer questions', partner: 'They answer all customer questions' };

export const newToken = () => `${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
export const inviteUrl = (token: string) => `${window.location.origin}/partner/${token}`;

export function defaultAgreement(): Agreement {
  return {
    version: 1,
    purpose: 'Run a page together and sell packages made of both our products and services.',
    leadSharePct: 60,
    delivery: 'each',
    support: 'each',
    noticeDays: NOTICE_DAYS,
    acceptedBy: {},
  };
}

export const isExpired = (p: Partnership, now = Date.now()) => p.status === 'invited' && new Date(p.expiresAt).getTime() < now;
export const fullyAccepted = (a: Agreement) => !!a.acceptedBy.lead && !!a.acceptedBy.partner;
export const sideName = (p: Partnership, side: AgreementSide, leadName: string) => (side === 'lead' ? leadName : p.partner.name);

/** The agreement as short sentences — the same words both sides see and tick. */
export function agreementLines(a: Agreement, leadName: string, partnerName: string): string[] {
  const rel = (r: DeliveryRule | SupportRule, verbOwn: string, verbAll: string) => (r === 'each' ? `Each business ${verbOwn}.` : `${r === 'lead' ? leadName : partnerName} ${verbAll}.`);
  return [
    a.purpose.trim() || 'Work together on KUBICU.',
    `Money from things we sell together is split ${a.leadSharePct}% to ${leadName} and ${100 - a.leadSharePct}% to ${partnerName}, as both of us agreed, at the moment the customer pays. It’s worked out on what the customer pays after discounts and before delivery fees. Each business pays its own KUBICU fee on its share, and refunds come back from each share in the same proportion.`,
    rel(a.delivery, 'delivers its own part of an order', 'delivers whole orders'),
    rel(a.support, 'answers customers and handles refunds for its own part', 'answers customers and handles refunds'),
    `Either business can end this with ${a.noticeDays} days’ notice, or straight away if there’s a safety problem. Money already paid still settles normally.`,
    'Changing the split, prices or these terms needs both businesses to agree again.',
  ];
}

export const ev = (by: PartnershipEvent['by'], text: string): PartnershipEvent => ({ id: uid('pev'), at: new Date().toISOString(), by, text });

export function invite(input: { kind: Partnership['kind']; partner: Partnership['partner']; contactName: string; phone: string; agreement: Agreement; referralPartnerId?: string }): Partnership {
  const now = Date.now();
  return {
    id: uid('pns'),
    kind: input.kind,
    partner: input.partner,
    contactName: input.contactName,
    phone: input.phone,
    token: newToken(),
    invitedAt: new Date(now).toISOString(),
    expiresAt: new Date(now + INVITE_DAYS * DAY).toISOString(),
    status: 'invited',
    agreement: { ...input.agreement, acceptedBy: { lead: new Date(now).toISOString() } },
    referralPartnerId: input.referralPartnerId,
    events: [ev('lead', input.kind === 'guest' ? `Invited ${input.contactName} by link` : `Invited ${input.partner.name} on KUBICU`)],
  };
}

/** The partner accepts the invite (and with it, the agreement). */
export function acceptInvite(p: Partnership): Partnership {
  const at = new Date().toISOString();
  return { ...p, status: 'active', acceptedAt: at, agreement: { ...p.agreement, acceptedBy: { ...p.agreement.acceptedBy, partner: at } }, events: [ev('partner', 'Accepted the invite and the agreement'), ...p.events] };
}

export function declineInvite(p: Partnership): Partnership {
  return { ...p, status: 'declined', events: [ev('partner', 'Declined the invite'), ...p.events] };
}

export function resendInvite(p: Partnership): Partnership {
  const now = Date.now();
  return { ...p, token: newToken(), invitedAt: new Date(now).toISOString(), expiresAt: new Date(now + INVITE_DAYS * DAY).toISOString(), events: [ev('lead', 'Sent a new invite link — the old one no longer works'), ...p.events] };
}

/** One side proposes new terms; the current agreement stays in force until the other side accepts. */
export function proposeChange(p: Partnership, next: Agreement, by: AgreementSide): Partnership {
  const at = new Date().toISOString();
  return { ...p, pending: { agreement: { ...next, version: p.agreement.version + 1, acceptedBy: { [by]: at } }, by, at }, events: [ev(by, `Proposed new terms (version ${p.agreement.version + 1})`), ...p.events] };
}

export function answerChange(p: Partnership, by: AgreementSide, accept: boolean): Partnership {
  if (!p.pending) return p;
  if (!accept) return { ...p, pending: undefined, events: [ev(by, `Turned down the proposed terms — version ${p.agreement.version} still applies`), ...p.events] };
  const at = new Date().toISOString();
  return { ...p, agreement: { ...p.pending.agreement, acceptedBy: { ...p.pending.agreement.acceptedBy, [by]: at } }, pending: undefined, events: [ev(by, `Accepted the new terms — version ${p.pending.agreement.version} now applies`), ...p.events] };
}

export function withdrawChange(p: Partnership, by: AgreementSide): Partnership {
  return p.pending ? { ...p, pending: undefined, events: [ev(by, 'Withdrew the proposed terms'), ...p.events] } : p;
}

/** Ending: 14 days' notice, or immediately for a safety problem. */
export function endPartnership(p: Partnership, by: AgreementSide, reason: string, immediate: boolean): Partnership {
  const now = Date.now();
  if (immediate || p.status === 'invited') return { ...p, status: 'ended', endsAt: new Date(now).toISOString(), endReason: reason, pending: undefined, events: [ev(by, `Ended the partnership${immediate ? ' straight away (safety)' : ''} — ${reason}`), ...p.events] };
  return { ...p, status: 'ending', endsAt: new Date(now + p.agreement.noticeDays * DAY).toISOString(), endReason: reason, events: [ev(by, `Gave ${p.agreement.noticeDays} days’ notice — ${reason}`), ...p.events] };
}

export function cancelEnding(p: Partnership, by: AgreementSide): Partnership {
  return { ...p, status: 'active', endsAt: undefined, endReason: undefined, events: [ev(by, 'Cancelled the notice — still working together'), ...p.events] };
}

/** Time-driven changes: notice periods run out. */
export function syncPartnerships(d: PartnershipData, now = Date.now()): PartnershipData {
  let changed = false;
  const partnerships = d.partnerships.map((p) => {
    if (p.status === 'ending' && p.endsAt && new Date(p.endsAt).getTime() <= now) {
      changed = true;
      return { ...p, status: 'ended' as const, events: [ev('system', 'Notice period ended'), ...p.events] };
    }
    return p;
  });
  return changed ? { ...d, partnerships } : d;
}

/** A guest who has made their own KUBICU page becomes a connected partner, keeping all history. */
export function upgradeGuest(p: Partnership, handle: string): Partnership {
  const biz = partnerDirectory.find((b) => b.handle === handle);
  if (!biz) return p;
  return { ...p, kind: 'connected', partner: { ...biz }, events: [ev('partner', `Joined KUBICU as @${handle} — now a connected partner`), ...p.events] };
}

export const guestReady = (p: Partnership) => p.kind === 'connected' || (!!p.guest?.phoneVerifiedAt && !!p.guest?.bank);

export function seedPartnerships(d: PartnershipData): PartnershipData {
  if (d.sampleSeeded) return d;
  const ago = (days: number) => new Date(Date.now() - days * DAY).toISOString();
  const halima = partnerDirectory[0];
  const connected: Partnership = {
    id: uid('pns'),
    kind: 'connected',
    partner: { ...halima },
    contactName: 'Halima Yusuf',
    phone: '+234 806 555 0142',
    token: newToken(),
    invitedAt: ago(20),
    expiresAt: ago(13),
    acceptedAt: ago(19),
    status: 'active',
    agreement: { ...defaultAgreement(), purpose: 'Sell bridal packages together: makeup by us, gele by Halima.', leadSharePct: 60, acceptedBy: { lead: ago(20), partner: ago(19) } },
    events: [
      { id: uid('pev'), at: ago(19), by: 'partner', text: 'Accepted the invite and the agreement' },
      { id: uid('pev'), at: ago(20), by: 'lead', text: 'Invited Halima Gele Studio on KUBICU' },
    ],
    sample: true,
  };
  const guest: Partnership = {
    id: uid('pns'),
    kind: 'guest',
    partner: { name: 'Bayo Small Chops', verified: false },
    contactName: 'Bayo Adeyemi',
    phone: '+234 809 555 0177',
    token: newToken(),
    invitedAt: ago(1),
    expiresAt: new Date(Date.now() + 6 * DAY).toISOString(),
    status: 'invited',
    agreement: { ...defaultAgreement(), purpose: 'Offer small chops trays with our bridal shower packages.', leadSharePct: 70, delivery: 'each', acceptedBy: { lead: ago(1) } },
    events: [{ id: uid('pev'), at: ago(1), by: 'lead', text: 'Invited Bayo Adeyemi by link' }],
    sample: true,
  };
  return { partnerships: [connected, guest, ...d.partnerships], sampleSeeded: true };
}

/** Finds a partnership from its invite token across workspaces on this device (guest partner page). */
export function findByToken(token: string): { workspaceId: string; partnership: Partnership } | null {
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (!key || !key.startsWith('kubicu.partnerships.')) continue;
      const data = JSON.parse(window.localStorage.getItem(key) ?? 'null') as PartnershipData | null;
      const hit = data?.partnerships?.find((p) => p.token === token);
      if (hit) return { workspaceId: key.slice('kubicu.partnerships.'.length), partnership: hit };
    }
  } catch {
    /* unreadable storage — treat as not found */
  }
  return null;
}
