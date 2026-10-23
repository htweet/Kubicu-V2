import type { Order } from '../types/commerce';
import type { MoneyData } from '../types/money';
import type { ProofData } from '../types/proof';

/** Trust Passport (D99): a score built only from records KUBICU can check. Nothing is self-declared. */

export const TRUST_APP_ID = 'trust-passport';

export type SignalId = 'verified' | 'reviews' | 'orders' | 'escrow' | 'issues' | 'tenure';

export interface TrustSignal {
  id: SignalId;
  title: string;
  points: number;
  met: boolean;
  /** Plain evidence, e.g. "4 of 10 completed orders". */
  evidence: string;
  /** What to do next when not met. */
  next: string;
  to: string;
}

export type TrustLevel = 'starting' | 'building' | 'established' | 'trusted';

export const levelLabels: Record<TrustLevel, string> = {
  starting: 'Just starting',
  building: 'Building trust',
  established: 'Established',
  trusted: 'Trusted seller'
};

export const levelTones: Record<TrustLevel, 'neutral' | 'info' | 'success' | 'warning'> = {
  starting: 'neutral',
  building: 'info',
  established: 'info',
  trusted: 'success'
};

export function levelFor(score: number): TrustLevel {
  if (score >= 85) return 'trusted';
  if (score >= 55) return 'established';
  if (score >= 25) return 'building';
  return 'starting';
}

// Thresholds are example figures (D99).
export const MIN_REVIEWS = 3;
export const MIN_RATING = 4;
export const MIN_ORDERS = 10;
export const MIN_ESCROW = 3;
export const MAX_ISSUE_RATE = 0.05;
export const MIN_DAYS = 90;

const entityLabels = { individual: 'Individual', business_name: 'Registered business name', company: 'Limited company' } as const;

export function computePassport(orders: Order[], money: MoneyData, proof: ProofData | null, now = Date.now()) {
  const real = orders.filter((o) => !o.sample);
  const completed = real.filter((o) => o.status === 'completed');
  const issues = real.filter((o) => o.refunds.length > 0 || !!o.dispute).length;
  const reviews = (proof?.reviews ?? []).filter((r) => !r.sample);
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const escrowClosed = money.escrow.filter((c) => c.stage === 'closed');
  const escrowReleased = escrowClosed.filter((c) => c.outcome === 'released').length;
  const escrowLost = escrowClosed.filter((c) => c.outcome === 'refunded' && !!c.dispute).length;
  const first = real.reduce<string | null>((m, o) => !m || o.createdAt < m ? o.createdAt : m, null);
  const days = first ? Math.floor((now - new Date(first).getTime()) / 86_400_000) : 0;
  const kyc = money.kyc;
  const rate = completed.length ? issues / completed.length : 0;

  const signals: TrustSignal[] = [
  {
    id: 'verified',
    title: 'Business verified',
    points: 30,
    met: kyc.status === 'approved',
    evidence: kyc.status === 'approved' ? `${kyc.entity ? entityLabels[kyc.entity] : 'Verified'} · checked by KUBICU` : kyc.status === 'in_review' ? 'In review' : 'Not verified yet',
    next: 'Complete business verification.',
    to: '/app/commerce/verification'
  },
  {
    id: 'reviews',
    title: 'Verified reviews',
    points: 20,
    met: reviews.length >= MIN_REVIEWS && avg >= MIN_RATING,
    evidence: reviews.length ? `${reviews.length} review${reviews.length === 1 ? '' : 's'} · ${avg.toFixed(1)} average` : 'No verified reviews yet',
    next: `Ask customers for reviews: at least ${MIN_REVIEWS}, averaging ${MIN_RATING}+.`,
    to: '/app/proof'
  },
  {
    id: 'orders',
    title: 'Completed orders',
    points: 15,
    met: completed.length >= MIN_ORDERS,
    evidence: `${Math.min(completed.length, MIN_ORDERS)} of ${MIN_ORDERS} completed orders`,
    next: 'Mark delivered orders as completed.',
    to: '/app/commerce/orders'
  },
  {
    id: 'escrow',
    title: 'Escrow track record',
    points: 15,
    met: escrowReleased >= MIN_ESCROW && escrowLost === 0,
    evidence: escrowClosed.length ? `${escrowReleased} released to you${escrowLost ? ` · ${escrowLost} dispute${escrowLost === 1 ? '' : 's'} refunded` : ''}` : 'No escrow orders yet',
    next: escrowLost ? 'Disputes decided against you hold this back for now.' : `Complete ${MIN_ESCROW} escrow orders without a lost dispute.`,
    to: '/app/commerce/payments'
  },
  {
    id: 'issues',
    title: 'Few refunds and disputes',
    points: 10,
    met: completed.length >= 5 && rate <= MAX_ISSUE_RATE,
    evidence: completed.length >= 5 ? `${Math.round(rate * 100)}% of completed orders` : 'Needs 5 completed orders to measure',
    next: `Keep refunds and disputes under ${MAX_ISSUE_RATE * 100}% of orders.`,
    to: '/app/commerce/orders'
  },
  {
    id: 'tenure',
    title: `Selling for ${MIN_DAYS} days`,
    points: 10,
    met: days >= MIN_DAYS,
    evidence: first ? `First order ${days} day${days === 1 ? '' : 's'} ago` : 'No orders yet',
    next: 'Time on KUBICU builds this on its own.',
    to: '/app/commerce/orders'
  }];


  const score = signals.reduce((s, x) => s + (x.met ? x.points : 0), 0);
  return { signals, score, level: levelFor(score), stats: { completed: completed.length, reviews: reviews.length, avg, escrowReleased, days } };
}

/**
 * Met signals in words safe to show buyers on a public page (D111): counts and checks only —
 * never revenue, refund amounts or anything still in progress.
 */
export function publicSignals(p: ReturnType<typeof computePassport>): {id: SignalId;title: string;evidence: string;}[] {
  const s = p.stats;
  const words: Record<SignalId, string> = {
    verified: 'Identity and business details checked by KUBICU',
    reviews: `${s.reviews} verified review${s.reviews === 1 ? '' : 's'} · ${s.avg.toFixed(1)} average`,
    orders: `${s.completed}+ orders completed`,
    escrow: `${s.escrowReleased} protected (escrow) order${s.escrowReleased === 1 ? '' : 's'} completed without a lost dispute`,
    issues: 'Few refunds and disputes',
    tenure: `Selling on KUBICU for ${s.days}+ days`
  };
  return p.signals.filter((x) => x.met).map((x) => ({ id: x.id, title: x.title, evidence: words[x.id] }));
}

export function passportSummary(business: string, url: string, p: ReturnType<typeof computePassport>): string {
  const lines = p.signals.filter((s) => s.met).map((s) => `✓ ${s.title} — ${s.evidence}`);
  return [`${business} · KUBICU Trust Passport: ${levelLabels[p.level]} (${p.score}/100)`, ...lines, url].join('\n');
}