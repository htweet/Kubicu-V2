import type { Block, FundraiserSettings } from '../types/page';
import type { LinkPayment, MoneyData, PaymentLink } from '../types/money';
import type { AdminStore } from '../types/admin';
import type { ValidationIssue } from './validation';
import type { Workspace } from '../types/workspace';
import { isVerified } from './money/store';
import { activeExtraSpaces, readSpacePage } from './spaces';

/*
 * Fundraiser spaces (D179). Keep what's raised: every payment goes to the wallet as it arrives and the
 * goal is a target, never a condition. Counters only ever use real, unrefunded payments — no seeding.
 */

export type FundraiserState = 'live' | 'goal_reached' | 'ended' | 'paused' | 'unverified';

export const fundraiserStateLabel: Record<FundraiserState, string> = {
  live: 'Taking payments',
  goal_reached: 'Goal reached',
  ended: 'Ended',
  paused: 'Paused by KUBICU',
  unverified: 'Not taking payments',
};

/** Fixed wording on every fundraiser and its pay page. Not editable by the organiser. */
export const fundraiserTerms = (organiser: string) =>
  `This is a payment to ${organiser || 'the organiser'}, not a tax-deductible donation. ${organiser || 'The organiser'} is responsible for using the money as described. KUBICU checked the organiser’s identity but doesn’t check how money is spent.`;

export const kept = (p: LinkPayment) => p.amountNgn - (p.refundedNgn ?? 0);

/** First name only, and only when the supporter chose to show it. */
export const supporterName = (p: LinkPayment) => (p.showName && p.payerName.trim() ? p.payerName.trim().split(/\s+/)[0] : 'Anonymous');

export function fundraiserEnd(f: FundraiserSettings): string | null {
  return f.closedAt ?? f.endsAt;
}

export interface FundraiserProgress {
  state: FundraiserState;
  raisedNgn: number;
  supporters: number;
  pct: number;
  /** Newest first, refunded payments left out. */
  recent: LinkPayment[];
}

export function fundraiserProgress(f: FundraiserSettings, link: PaymentLink | undefined, opts: { verified: boolean; pausedByStaff: boolean }, now = Date.now()): FundraiserProgress {
  const paid = (link?.payments ?? []).filter((p) => kept(p) > 0);
  const raisedNgn = paid.reduce((s, p) => s + kept(p), 0);
  const end = fundraiserEnd(f);
  const state: FundraiserState = opts.pausedByStaff
    ? 'paused'
    : end && Date.parse(end) <= now
      ? 'ended'
      : !opts.verified
        ? 'unverified'
        : raisedNgn >= f.goalNgn && f.goalNgn > 0
          ? 'goal_reached'
          : 'live';
  return {
    state,
    raisedNgn,
    supporters: paid.length,
    pct: f.goalNgn > 0 ? Math.min(100, Math.floor((raisedNgn / f.goalNgn) * 100)) : 0,
    recent: [...paid].sort((a, b) => Date.parse(b.at) - Date.parse(a.at)),
  };
}

export const takingPayments = (s: FundraiserState) => s === 'live' || s === 'goal_reached';

/** The link's settings follow the fundraiser, so the pay page and the counter always agree. */
export function syncFundraiserLink(link: PaymentLink, f: FundraiserSettings, title: string, handle: string, open: boolean): PaymentLink {
  return {
    ...link,
    kind: 'open',
    title,
    description: f.purpose,
    minNgn: f.minNgn,
    fields: { name: true, phone: false, note: f.askMessage },
    expiresAt: fundraiserEnd(f),
    status: open ? 'active' : 'paused',
    reusable: true,
    maxUses: null,
    fundraiser: { handle, organiser: f.organiser },
  };
}

/** Whether payments are blocked right now for this link — staff pause or lost verification. */
export function fundraiserBlocked(link: PaymentLink, money: MoneyData, admin: Pick<AdminStore, 'pausedFundraisers'>): string | null {
  if (!link.fundraiser) return null;
  if (admin.pausedFundraisers?.[link.fundraiser.handle]) return 'This fundraiser is paused while KUBICU reviews it. No payments can be made right now.';
  if (!isVerified(money)) return 'This fundraiser isn’t taking payments right now because the organiser’s verification needs attention.';
  return null;
}

/** The goal of the fundraiser at this handle in a workspace, from its saved page. */
export function fundraiserGoalFor(w: Workspace, handle: string): number | null {
  for (const s of activeExtraSpaces(w)) {
    if (s.kind !== 'fundraiser') continue;
    const page = readSpacePage(w.id, s.id);
    const doc = page?.published ?? page?.draft;
    if (doc?.fundraiser && (doc.handle === handle || page?.draft.handle === handle)) return doc.fundraiser.goalNgn;
  }
  return null;
}

export function fundraiserIssues(f: FundraiserSettings, link: PaymentLink | undefined, verified: boolean, blocks: Block[]): ValidationIssue[] {
  const out: ValidationIssue[] = [];
  const push = (id: string, severity: ValidationIssue['severity'], message: string) => out.push({ id: `fund:${id}`, blockId: null, severity, message });
  if (!verified) push('verify', 'error', 'Fundraisers need a verified workspace. Finish verification in Commerce → Verification to publish.');
  if (!link) push('link', 'error', 'The payment link behind this fundraiser was deleted. Open Page settings to create a new one.');
  if (!f.purpose.trim()) push('purpose', 'error', 'Say what the money is for (Page settings → Fundraiser).');
  if (!f.organiser.trim()) push('organiser', 'error', 'Add the organiser’s name — supporters need to know who they’re paying.');
  if (!(f.goalNgn > 0)) push('goal', 'error', 'Set a goal amount.');
  if (f.endsAt && Date.parse(f.endsAt) <= Date.now() && !f.closedAt) push('ended', 'warning', 'The end date has passed — visitors will see the final total and can’t pay.');
  if (!blocks.some((b) => !b.visibility.hidden)) push('empty', 'warning', 'Add your story below the progress panel so supporters know more.');
  return out;
}
