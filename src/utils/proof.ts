import type { HideReason, ProofData, ProofReview, ProofSource, ProofSourceKind, ReviewRequest } from '../types/proof';
import type { Order } from '../types/commerce';
import type { Booking } from '../types/ops';
import type { Job } from '../types/serviceOs';
import { uid } from './id';

export const PROOF_APP_ID = 'proof';
export const PROOF_EVENT = 'kubicu:proof';
const key = (workspaceId: string) => `kubicu.proof.${workspaceId}`;

const empty = (): ProofData => ({ requests: [], reviews: [], work: [], seeded: false });

export function readProof(workspaceId: string): ProofData {
  try {
    const raw = window.localStorage.getItem(key(workspaceId));
    if (raw) return { ...empty(), ...(JSON.parse(raw) as Partial<ProofData>) };
  } catch {

    /* fresh store */}
  const seeded = seed();
  writeProof(workspaceId, seeded);
  return seeded;
}

export function writeProof(workspaceId: string, data: ProofData): void {
  try {
    window.localStorage.setItem(key(workspaceId), JSON.stringify(data));
  } catch {

    /* storage full — lasts for this visit */}
  window.dispatchEvent(new CustomEvent(PROOF_EVENT));
}

export const reviewPath = (handle: string, token: string) => `/p/${handle}/review/${token}`;

export const sourceBadge: Record<ProofSourceKind, string> = { order: 'Verified order', booking: 'Verified booking', job: 'Verified job' };
export const matchedLabel: Record<ProofSourceKind, string> = { order: 'Matched to a completed order', booking: 'Matched to a completed booking', job: 'Matched to a finished job' };

export const hideReasons: {value: HideReason;label: string;}[] = [
{ value: 'personal', label: 'It shares personal details' },
{ value: 'abusive', label: 'Abusive or offensive' },
{ value: 'unrelated', label: 'Not about my business' },
{ value: 'other', label: 'Something else' }];


/** Every review counts towards the rating — hidden ones too — so hiding can't inflate the score. */
export function ratingSummary(reviews: ProofReview[]) {
  const count = reviews.length;
  const average = count ? Math.round(reviews.reduce((s, r) => s + r.rating, 0) / count * 10) / 10 : 0;
  return { count, average };
}

export const showable = (r: ProofReview) => r.permission && !r.hidden && r.text.trim().length > 0;

export const monthYear = (iso: string) => new Date(iso).toLocaleDateString('en-NG', { month: 'short', year: 'numeric' });
export const shortDay = (iso: string) => new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

export interface EligibleSource {
  source: ProofSource;
  customerName: string;
  phone: string;
}

const WINDOW_DAYS = 120;

/** Completed orders, completed bookings and finished jobs from the last 120 days that haven't been asked yet. */
export function eligibleSources(orders: Order[], bookings: Booking[], jobs: Job[], requests: ReviewRequest[]): EligibleSource[] {
  const asked = new Set(requests.map((r) => `${r.source.kind}:${r.source.id}`));
  const since = Date.now() - WINDOW_DAYS * 86_400_000;
  const out: EligibleSource[] = [];
  orders.
  filter((o) => o.status === 'completed' && new Date(o.createdAt).getTime() >= since).
  forEach((o) => out.push({ source: { kind: 'order', id: o.id, label: `Order #${o.number}`, date: o.createdAt }, customerName: o.customer.name, phone: o.customer.phone }));
  bookings.
  filter((b) => b.status === 'completed' && new Date(b.start).getTime() >= since).
  forEach((b) => out.push({ source: { kind: 'booking', id: b.id, label: `${b.serviceName} · ${shortDay(b.start)}`, date: b.start }, customerName: b.customer.name, phone: b.customer.phone }));
  jobs.
  filter((j) => j.status === 'done').
  forEach((j) => out.push({ source: { kind: 'job', id: j.id, label: j.title, date: j.updates[j.updates.length - 1]?.at ?? j.createdAt }, customerName: j.client.name, phone: j.client.phone }));
  return out.filter((e) => !asked.has(`${e.source.kind}:${e.source.id}`)).sort((a, b) => b.source.date.localeCompare(a.source.date));
}

export function newRequest(e: EligibleSource): ReviewRequest {
  return { id: uid('rrq'), token: Math.random().toString(36).slice(2, 10), source: e.source, customerName: e.customerName, phone: e.phone, createdAt: new Date().toISOString() };
}

export const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? '';

function seed(): ProofData {
  const day = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();
  const s1: ProofSource = { kind: 'booking', id: 'sample-bk-1', label: 'Bridal makeup · sample', date: day(21) };
  const s2: ProofSource = { kind: 'order', id: 'sample-ord-1', label: 'Order #1038 · sample', date: day(9) };
  const s3: ProofSource = { kind: 'job', id: 'sample-job-1', label: 'Studio portraits · sample', date: day(34) };
  const r1: ReviewRequest = { id: 'sample-rrq-1', token: 'sample01', source: s1, customerName: 'Chiamaka Obi', phone: '', createdAt: day(20), reviewId: 'sample-rev-1', sample: true };
  const r2: ReviewRequest = { id: 'sample-rrq-2', token: 'sample02', source: s2, customerName: 'Bayo Adeyemi', phone: '', createdAt: day(8), reviewId: 'sample-rev-2', sample: true };
  return {
    seeded: true,
    requests: [r1, r2],
    reviews: [
    { id: 'sample-rev-1', requestId: r1.id, source: s1, rating: 5, text: 'Arrived early, kept everyone calm and the makeup lasted through the whole reception.', displayName: 'Chiamaka', permission: true, hidden: false, createdAt: day(19), sample: true },
    { id: 'sample-rev-2', requestId: r2.id, source: s2, rating: 4, text: 'Lovely fabric and well packed. Delivery took a day longer than I hoped.', displayName: 'Bayo A.', permission: true, hidden: false, reply: 'Thank you Bayo — we’ve changed delivery partner for your area.', createdAt: day(6), sample: true }],

    work: [
    { id: 'sample-work-1', title: 'Family portrait session', date: s3.date.slice(0, 10), description: 'Outdoor shoot for three generations, 40 edited photos delivered in a week.', imageUrl: '', imageAlt: '', source: s3, clientName: '', published: true, createdAt: day(33), sample: true },
    { id: 'sample-work-2', title: 'Bridal party of six', date: s1.date.slice(0, 10), description: 'Bride, mother and four bridesmaids, done on location before a 10am ceremony.', imageUrl: '', imageAlt: '', source: s1, clientName: 'Chiamaka', published: true, createdAt: day(20), sample: true }]

  };
}