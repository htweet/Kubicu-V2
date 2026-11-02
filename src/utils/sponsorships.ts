import type { Deliverable, DisputeOutcome, SponsorApplication, SponsorBrief, SponsorPlatform } from '../types/sponsorship';
import { uid } from './id';
import { readAnalytics } from './analytics/storage';
import { isVerified, readMoney } from './money/store';
import { figure, onOpsSettings } from './opsSettings';

/**
 * Sponsorship marketplace (D441). Money is simulated: accepting a creator holds their fee from the brand,
 * and each approved deliverable releases its share. Nothing moves in a wallet yet.
 */
export const SPONSOR_KEY = 'kubicu.sponsorships';
export const SPONSOR_EVENT = 'kubicu:sponsorships';
// Example figures staff can change in Super admin → Figures & names (D465). Live bindings: importers see new values.
export let SPONSOR_FEE_PCT = 10;
export let MAX_EVIDENCE_PER_SIDE = 5;
export let SPONSOR_DECIDE_DAYS = 3;
export let SPONSOR_REPLY_HOURS = 48;
export let SPONSOR_APPEAL_DAYS = 7;
onOpsSettings(() => {
  SPONSOR_FEE_PCT = figure('sponsor.feePct');
  MAX_EVIDENCE_PER_SIDE = figure('sponsor.evidencePerSide');
  SPONSOR_DECIDE_DAYS = figure('sponsor.decideDays');
  SPONSOR_REPLY_HOURS = figure('sponsor.replyHours');
  SPONSOR_APPEAL_DAYS = figure('sponsor.appealDays');
});

export const platformLabels: Record<SponsorPlatform, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  x: 'X',
  whatsapp: 'WhatsApp Status',
  podcast: 'Podcast'
};

export const sponsorCategories = ['Fashion & beauty', 'Food & drink', 'Tech & gadgets', 'Finance', 'Health & fitness', 'Events & music', 'Education', 'Other'];

const daysFromNow = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10);

function sampleBriefs(): SponsorBrief[] {
  const at = new Date(Date.now() - 2 * 86_400_000).toISOString();
  const base = { brandWorkspaceId: 'sample-brand', status: 'open' as const, createdAt: at, sample: true, applications: [] };
  return [
  { ...base, id: 'brief-sample-1', brandName: 'Zobo & Co. (sample)', title: 'Launch of our sugar-free zobo', description: 'Show your audience how you drink it — at work, after the gym, at a party. Honest takes welcome; we don’t script your words.', category: 'Food & drink', platforms: ['instagram', 'tiktok'], deliverables: ['1 Reel or TikTok (30–60s)', '3 Stories with the link'], budgetNgn: 120_000, slots: 5, applyBy: daysFromNow(9) },
  { ...base, id: 'brief-sample-2', brandName: 'Kola Wallet (sample)', title: 'Explain saving in small amounts', description: 'A short explainer for people new to saving apps. You must say it’s a paid partnership. No promises of returns.', category: 'Finance', platforms: ['youtube', 'x'], deliverables: ['1 video, 3–6 minutes', '1 thread or post with the link'], budgetNgn: 350_000, slots: 3, applyBy: daysFromNow(14) },
  { ...base, id: 'brief-sample-3', brandName: 'Ìlú Fest (sample)', title: 'Countdown to the festival', description: 'Build excitement in the two weeks before the gates open. Free tickets for you and a friend on top of the fee.', category: 'Events & music', platforms: ['instagram', 'whatsapp'], deliverables: ['2 posts', '5 WhatsApp Status updates'], budgetNgn: 80_000, slots: 10, applyBy: daysFromNow(6) }];

}

export function readBriefs(): SponsorBrief[] {
  try {
    const raw = localStorage.getItem(SPONSOR_KEY);
    if (raw) return JSON.parse(raw) as SponsorBrief[];
  } catch {

    // fall through to samples
  }return sampleBriefs();
}

export function writeBriefs(list: SponsorBrief[]): boolean {
  try {
    localStorage.setItem(SPONSOR_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event(SPONSOR_EVENT));
    return true;
  } catch {
    return false;
  }
}

export const acceptedCount = (b: SponsorBrief) => b.applications.filter((a) => a.status === 'accepted' || a.status === 'completed').length;
export const slotsLeft = (b: SponsorBrief) => Math.max(0, b.slots - acceptedCount(b));
export const isOpen = (b: SponsorBrief) => b.status === 'open' && b.applyBy >= new Date().toISOString().slice(0, 10) && slotsLeft(b) > 0;

/** What the brand pays on top of the creator's fee. */
export const brandFee = (rateNgn: number) => Math.round(rateNgn * SPONSOR_FEE_PCT / 100);

export function briefErrors(b: Pick<SponsorBrief, 'title' | 'description' | 'platforms' | 'deliverables' | 'budgetNgn' | 'slots' | 'applyBy'>) {
  const e: Partial<Record<'title' | 'description' | 'platforms' | 'deliverables' | 'budget' | 'slots' | 'applyBy', string>> = {};
  if (b.title.trim().length < 6) e.title = 'Give the brief a clear title';
  if (b.description.trim().length < 30) e.description = 'Say what you want in a sentence or two (30 characters or more)';
  if (!b.platforms.length) e.platforms = 'Choose at least one platform';
  if (!b.deliverables.some((d) => d.trim())) e.deliverables = 'List at least one thing the creator delivers';
  if (!(b.budgetNgn >= 5_000)) e.budget = 'At least 5,000';
  if (!(b.slots >= 1 && b.slots <= 50)) e.slots = 'Between 1 and 50';
  if (!b.applyBy || b.applyBy < new Date().toISOString().slice(0, 10)) e.applyBy = 'Choose a date from today';
  return e;
}

export function newApplication(brief: SponsorBrief, a: Pick<SponsorApplication, 'creatorWorkspaceId' | 'creatorName' | 'handle' | 'audience' | 'pitch' | 'rateNgn'>): SponsorApplication {
  return { ...a, id: uid('app'), status: 'applied', appliedAt: new Date().toISOString(), deliverables: [], heldNgn: 0, releasedNgn: 0 };
}

const patchApp = (list: SponsorBrief[], briefId: string, appId: string, fn: (a: SponsorApplication, b: SponsorBrief) => SponsorApplication) =>
list.map((b) => b.id !== briefId ? b : { ...b, applications: b.applications.map((a) => a.id === appId ? fn(a, b) : a) });

export const accept = (list: SponsorBrief[], briefId: string, appId: string) =>
patchApp(list, briefId, appId, (a, b) => ({
  ...a,
  status: 'accepted',
  acceptedAt: new Date().toISOString(),
  heldNgn: a.rateNgn,
  trackingCode: Math.random().toString(36).slice(2, 8),
  deliverables: b.deliverables.filter((d) => d.trim()).map((label): Deliverable => ({ id: uid('dlv'), label, status: 'todo' }))
}));

export const setAppStatus = (list: SponsorBrief[], briefId: string, appId: string, status: SponsorApplication['status']) => patchApp(list, briefId, appId, (a) => ({ ...a, status }));

export const submitDeliverable = (list: SponsorBrief[], briefId: string, appId: string, dId: string, link: string) =>
patchApp(list, briefId, appId, (a) => ({ ...a, deliverables: a.deliverables.map((d) => d.id === dId ? { ...d, status: 'submitted', link: link.trim(), note: undefined, submittedAt: new Date().toISOString() } : d) }));

export const requestChanges = (list: SponsorBrief[], briefId: string, appId: string, dId: string, note: string) =>
patchApp(list, briefId, appId, (a) => ({ ...a, deliverables: a.deliverables.map((d) => d.id === dId ? { ...d, status: 'changes', note: note.trim() } : d) }));

/** Approving releases this deliverable's share; the last one releases what's left and completes the deal. */
export const approve = (list: SponsorBrief[], briefId: string, appId: string, dId: string) =>
patchApp(list, briefId, appId, (a) => {
  const deliverables = a.deliverables.map((d) => d.id === dId ? { ...d, status: 'approved' as const, approvedAt: new Date().toISOString() } : d);
  const done = deliverables.every((d) => d.status === 'approved');
  const share = done ? a.heldNgn : Math.round(a.rateNgn / a.deliverables.length);
  return { ...a, deliverables, heldNgn: Math.max(0, a.heldNgn - share), releasedNgn: a.releasedNgn + share, status: done ? 'completed' : a.status };
});

// ——— Problems and KUBICU's decision (D453) ———

export const disputeReasons = {
  brand: ['Work wasn’t delivered', 'Work doesn’t match the brief', 'Post isn’t labelled as a paid partnership', 'Something else'],
  creator: ['The brand isn’t reviewing my work', 'The brand wants work outside the brief', 'Something else']
} as const;

/** A problem can be reported while money is held and none is open yet. */
export const canDispute = (a: SponsorApplication) => a.status === 'accepted' && a.heldNgn > 0 && (!a.dispute || !!a.dispute.outcome);
export const disputeOpen = (a: SponsorApplication) => !!a.dispute && !a.dispute.outcome;

export const openDispute = (list: SponsorBrief[], briefId: string, appId: string, by: 'brand' | 'creator', reason: string, note: string) =>
patchApp(list, briefId, appId, (a) => canDispute(a) ? { ...a, dispute: { by, reason, note: note.trim(), openedAt: new Date().toISOString() } } : a);


export const addEvidence = (list: SponsorBrief[], briefId: string, appId: string, by: 'brand' | 'creator', name: string) =>
patchApp(list, briefId, appId, (a) => {
  if (!disputeOpen(a) || !a.dispute) return a;
  const mine = (a.dispute.evidence ?? []).filter((e) => e.by === by);
  if (mine.length >= MAX_EVIDENCE_PER_SIDE) return a;
  return { ...a, dispute: { ...a.dispute, evidence: [...(a.dispute.evidence ?? []), { id: uid('evd'), by, name: name.slice(0, 120), at: new Date().toISOString() }] } };
});

export const replyDispute = (list: SponsorBrief[], briefId: string, appId: string, reply: string) =>
patchApp(list, briefId, appId, (a) => disputeOpen(a) && a.dispute ? { ...a, dispute: { ...a.dispute, reply: reply.trim() } } : a);

// SPONSOR_DECIDE_DAYS (D454) and SPONSOR_REPLY_HOURS (D455) are set at the top of this file.
export const replyDueAt = (openedAt: string) => new Date(Date.parse(openedAt) + SPONSOR_REPLY_HOURS * 3_600_000).toISOString();
export const replyMissed = (d: {openedAt: string;reply?: string;}) => !d.reply && Date.now() > Date.parse(replyDueAt(d.openedAt));

/**
 * KUBICU's decision, made in the staff console (D454). Whatever is still held goes to the creator, back to the brand,
 * or half each; the deal then ends. `note` is shown word for word to both sides.
 */
export const decideDispute = (list: SponsorBrief[], briefId: string, appId: string, outcome: DisputeOutcome, note: string, by: string) =>
patchApp(list, briefId, appId, (a) => {
  if (!disputeOpen(a) || !a.dispute) return a;
  const toCreatorNgn = outcome === 'creator' ? a.heldNgn : outcome === 'split' ? Math.round(a.heldNgn / 2) : 0;
  const toBrandNgn = a.heldNgn - toCreatorNgn;
  return { ...a, status: 'completed', heldNgn: 0, releasedNgn: a.releasedNgn + toCreatorNgn, dispute: { ...a.dispute, outcome, toCreatorNgn, toBrandNgn, decidedAt: new Date().toISOString(), decisionNote: note.trim(), decidedBy: by } };
});


/** A side can appeal once, within the window, unless the decision went fully its way. */
export function canAppeal(a: SponsorApplication, side: 'brand' | 'creator'): boolean {
  const d = a.dispute;
  if (!d?.outcome || !d.decidedAt || d.appeal) return false;
  if (d.outcome === side) return false;
  return Date.now() - Date.parse(d.decidedAt) < SPONSOR_APPEAL_DAYS * 86_400_000;
}

export const appealOpen = (a: SponsorApplication) => !!a.dispute?.appeal && !a.dispute.appeal.result;

export const openAppeal = (list: SponsorBrief[], briefId: string, appId: string, by: 'brand' | 'creator', reason: string) =>
patchApp(list, briefId, appId, (a) => canAppeal(a, by) && a.dispute ? { ...a, dispute: { ...a.dispute, appeal: { by, reason: reason.trim(), at: new Date().toISOString() } } } : a);

/**
 * A second staff member decides the appeal (D464): keep the decision, or change it. Changing moves the same total
 * (what was held at the first decision) to the new split, and updates what the creator has been paid.
 */
export const decideAppeal = (list: SponsorBrief[], briefId: string, appId: string, outcome: DisputeOutcome | 'keep', note: string, by: string) =>
patchApp(list, briefId, appId, (a) => {
  const d = a.dispute;
  if (!d?.appeal || d.appeal.result || !d.outcome) return a;
  const at = new Date().toISOString();
  if (outcome === 'keep' || outcome === d.outcome) return { ...a, dispute: { ...d, appeal: { ...d.appeal, result: 'upheld', note: note.trim(), decidedBy: by, decidedAt: at } } };
  const total = (d.toCreatorNgn ?? 0) + (d.toBrandNgn ?? 0);
  const toCreatorNgn = outcome === 'creator' ? total : outcome === 'split' ? Math.round(total / 2) : 0;
  const toBrandNgn = total - toCreatorNgn;
  return {
    ...a,
    releasedNgn: a.releasedNgn - (d.toCreatorNgn ?? 0) + toCreatorNgn,
    dispute: { ...d, outcome, toCreatorNgn, toBrandNgn, appeal: { ...d.appeal, result: 'changed', note: note.trim(), decidedBy: by, decidedAt: at } }
  };
});

/** Every sponsorship problem across all workspaces, for the staff console (D454). */
export function disputeRows(briefs: SponsorBrief[]): {id: string;brief: SponsorBrief;app: SponsorApplication;}[] {
  return briefs.flatMap((brief) => brief.applications.filter((a) => a.dispute).map((app) => ({ id: `${brief.id}:${app.id}`, brief, app })));
}

// ——— What a brand can see about a creator before accepting (D461) ———

export interface CreatorRecord {
  /** The creator's workspace passed KUBICU's identity checks. */
  verified: boolean;
  /** Deals finished across every brief on KUBICU. */
  completed: number;
  /** Problems KUBICU decided fully for the brand. */
  lostProblems: number;
}

export function creatorRecord(briefs: SponsorBrief[], creatorWorkspaceId: string): CreatorRecord {
  const apps = briefs.flatMap((b) => b.applications.filter((a) => a.creatorWorkspaceId === creatorWorkspaceId));
  return {
    verified: isVerified(readMoney(creatorWorkspaceId)),
    completed: apps.filter((a) => a.status === 'completed' && a.dispute?.outcome !== 'brand').length,
    lostProblems: apps.filter((a) => a.dispute?.outcome === 'brand').length
  };
}

// ——— Staff review of new briefs (D459) ———

/** What staff check before a brief is shown to creators. */
export const briefRules = ['Says the posts will be labelled as a paid partnership, or doesn’t ask creators to hide it', 'No banned products (weapons, drugs, adult content, gambling for under-18s, unlicensed financial promises)', 'No fake reviews, follower buying or misleading health or money claims', 'Budget is real money for real work — no “exposure only” briefs'] as const;

export const reviewBrief = (list: SponsorBrief[], briefId: string, approve: boolean, note: string) =>
list.map((b) => b.id === briefId && b.status === 'review' ? { ...b, status: approve ? 'open' as const : 'rejected' as const, reviewNote: note.trim() || undefined, reviewedAt: new Date().toISOString() } : b);

/** Campaign name a creator's tracked link carries into the brand's Analytics (D457). */
export const sponsorCampaign = (code: string) => `sp-${code}`;
/** Where the tracked link lives: `/sp/{code}` forwards to the brand's main page with the campaign attached (D457). */
export const trackedPath = (code: string) => `/sp/${code}`;

export function findTracked(code: string): {brief: SponsorBrief;app: SponsorApplication;} | null {
  for (const brief of readBriefs()) {
    const app = brief.applications.find((a) => a.trackingCode === code);
    if (app) return { brief, app };
  }
  return null;
}

/**
 * Results for a creator's tracked link, read from the brand's own Analytics (D457): visitors (unique browsers that
 * viewed the page), taps on the page, and paid orders — all from visits that arrived through the link. Sample data never counts.
 */
export function trackedResults(brief: SponsorBrief, a: SponsorApplication): {visits: number;clicks: number;sales: number;} {
  if (!a.trackingCode) return { visits: 0, clicks: 0, sales: 0 };
  const campaign = sponsorCampaign(a.trackingCode);
  const events = (readAnalytics(brief.brandWorkspaceId)?.events ?? []).filter((e) => !e.sample && e.campaign === campaign);
  const visits = new Set(events.filter((e) => e.type === 'view').map((e) => e.browser ?? e.session)).size;
  return { visits, clicks: events.filter((e) => e.type === 'tap').length, sales: events.filter((e) => e.type === 'order_paid').length };
}