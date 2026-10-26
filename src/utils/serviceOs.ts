import type { Invoice, InvoiceStatus, Job, JobStatus, LineItem, Milestone, Quote, QuoteStatus, ServiceClient, ServiceOsData } from '../types/serviceOs';
import { uid } from './id';
import { seedsSample } from './workspaceStorage';

export const SERVICE_OS_APP_ID = 'service-os';
const key = (workspaceId: string) => `kubicu.serviceos.${workspaceId}`;
export const SERVICE_OS_EVENT = 'kubicu:serviceos';

export const empty = (): ServiceOsData => ({ quotes: [], invoices: [], jobs: [], counters: { quote: 0, invoice: 0 }, milestoneTemplates: [], seeded: false });

export function readServiceOs(workspaceId: string): ServiceOsData {
  try {
    const raw = window.localStorage.getItem(key(workspaceId));
    if (raw) return migrateSample({ ...empty(), ...(JSON.parse(raw) as Partial<ServiceOsData>) });
  } catch {

    /* fall through to a fresh store */}
  // Sample quotes, invoices and jobs only for the demo workspace or one created with demo data (D200).
  const seeded = seedsSample(workspaceId) ? seed() : { ...empty(), seeded: true };
  writeServiceOs(workspaceId, seeded);
  return seeded;
}

export function writeServiceOs(workspaceId: string, data: ServiceOsData): void {
  try {
    window.localStorage.setItem(key(workspaceId), JSON.stringify(data));
  } catch {

    /* storage full — the change lasts for this visit */}
  window.dispatchEvent(new CustomEvent(SERVICE_OS_EVENT));
}

// ——— Money and dates ———

export const lineTotal = (i: LineItem) => Math.max(0, Math.round(i.qty * i.unitNgn));
export const itemsTotal = (items: LineItem[]) => items.reduce((s, i) => s + lineTotal(i), 0);
export const depositOf = (q: Quote) => Math.round(itemsTotal(q.items) * q.depositPct / 100);
export const paidOf = (inv: Invoice) => inv.payments.reduce((s, p) => s + p.amountNgn, 0);
export const balanceOf = (inv: Invoice) => Math.max(0, itemsTotal(inv.items) - paidOf(inv));

export const todayKey = () => new Date().toISOString().slice(0, 10);
export const addDays = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
export const formatDay = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

// ——— Status as people see it ———

export type QuoteView = QuoteStatus | 'expired';
export function quoteView(q: Quote): QuoteView {
  return q.status === 'sent' && q.validUntil < todayKey() ? 'expired' : q.status;
}
export const quoteLabels: Record<QuoteView, string> = { draft: 'Draft', sent: 'Waiting for client', accepted: 'Accepted', declined: 'Declined', expired: 'Expired' };
export const quoteTones = { draft: 'neutral', sent: 'info', accepted: 'success', declined: 'danger', expired: 'warning' } as const;

export type InvoiceView = InvoiceStatus | 'overdue' | 'part_paid';
export function invoiceView(inv: Invoice): InvoiceView {
  if (inv.status !== 'sent') return inv.status;
  if (inv.dueDate < todayKey()) return 'overdue';
  return paidOf(inv) > 0 ? 'part_paid' : 'sent';
}
export const invoiceLabels: Record<InvoiceView, string> = { draft: 'Draft', sent: 'Unpaid', part_paid: 'Part paid', paid: 'Paid', overdue: 'Overdue', void: 'Void' };
export const invoiceTones = { draft: 'neutral', sent: 'info', part_paid: 'warning', paid: 'success', overdue: 'danger', void: 'neutral' } as const;

export const jobLabels: Record<JobStatus, string> = { scheduled: 'Scheduled', in_progress: 'In progress', waiting: 'Waiting on client', done: 'Done' };
export const jobTones = { scheduled: 'neutral', in_progress: 'info', waiting: 'warning', done: 'success' } as const;
export const jobOrder: JobStatus[] = ['scheduled', 'in_progress', 'waiting', 'done'];

export const methodLabels = { transfer: 'Bank transfer', cash: 'Cash', card: 'Card (test)', online: 'Paid online · pay link' } as const;
/** Ways the seller can record a payment by hand (online ones arrive through the pay link). */
export const manualMethods = ['transfer', 'cash', 'card'] as const;

// ——— Creating things ———

export const blankClient = (): ServiceClient => ({ name: '', phone: '', email: '' });
export const blankItem = (): LineItem => ({ id: uid('li'), label: '', qty: 1, unitNgn: 0 });

export function newQuote(d: ServiceOsData): {data: ServiceOsData;quote: Quote;} {
  const n = d.counters.quote + 1;
  const quote: Quote = {
    id: uid('q'),
    number: `Q-${String(n).padStart(4, '0')}`,
    title: '',
    client: blankClient(),
    items: [blankItem()],
    depositPct: 0,
    validUntil: addDays(14),
    note: '',
    status: 'draft',
    createdAt: new Date().toISOString(),
    invoiceIds: []
  };
  return { data: { ...d, quotes: [quote, ...d.quotes], counters: { ...d.counters, quote: n } }, quote };
}

/** Deposit invoice when the quote asks for one, else the full amount. A second call invoices the balance. */
export function invoiceFromQuote(d: ServiceOsData, q: Quote): {data: ServiceOsData;invoice: Invoice;} {
  const n = d.counters.invoice + 1;
  const total = itemsTotal(q.items);
  const invoiced = d.invoices.filter((i) => i.quoteId === q.id && i.status !== 'void').reduce((s, i) => s + itemsTotal(i.items), 0);
  const first = invoiced === 0;
  const items: LineItem[] =
  first && q.depositPct > 0 ?
  [{ id: uid('li'), label: `Deposit (${q.depositPct}%) — ${q.title}`, qty: 1, unitNgn: depositOf(q) }] :
  first ?
  q.items.map((i) => ({ ...i, id: uid('li') })) :
  [{ id: uid('li'), label: `Balance — ${q.title}`, qty: 1, unitNgn: Math.max(0, total - invoiced) }];
  const invoice: Invoice = {
    id: uid('inv'),
    number: `INV-${String(n).padStart(4, '0')}`,
    title: q.title,
    client: q.client,
    items,
    quoteId: q.id,
    dueDate: addDays(7),
    status: 'draft',
    payments: [],
    createdAt: new Date().toISOString()
  };
  return {
    data: {
      ...d,
      invoices: [invoice, ...d.invoices],
      quotes: d.quotes.map((x) => x.id === q.id ? { ...x, invoiceIds: [...x.invoiceIds, invoice.id] } : x),
      counters: { ...d.counters, invoice: n }
    },
    invoice
  };
}

export function jobFromQuote(d: ServiceOsData, q: Quote): {data: ServiceOsData;job: Job;} {
  const steps = q.items.filter((i) => i.label.trim()).map((i) => i.label.trim());
  // Payment stages that wait on a job step get that step in the checklist (D95).
  for (const m of q.milestones ?? []) {
    const s = m.trigger === 'step' ? m.stepLabel?.trim() : '';
    if (s && !steps.some((x) => x.toLowerCase() === s.toLowerCase())) steps.push(s);
  }
  const job: Job = {
    id: uid('job'),
    title: q.title,
    client: q.client,
    quoteId: q.id,
    status: 'scheduled',
    dueDate: addDays(14),
    checklist: steps.map((label) => ({ id: uid('chk'), label, done: false })),
    updates: [{ id: uid('up'), at: new Date().toISOString(), text: `Started from quote ${q.number}.` }],
    createdAt: new Date().toISOString()
  };
  return { data: { ...d, jobs: [job, ...d.jobs], quotes: d.quotes.map((x) => x.id === q.id ? { ...x, jobId: job.id } : x) }, job };
}

/** Amount still invoiceable on an accepted quote. */
export function uninvoiced(d: ServiceOsData, q: Quote): number {
  const invoiced = d.invoices.filter((i) => i.quoteId === q.id && i.status !== 'void').reduce((s, i) => s + itemsTotal(i.items), 0);
  return Math.max(0, itemsTotal(q.items) - invoiced);
}

export function quoteProblems(q: Quote): string[] {
  const p: string[] = [];
  if (!q.title.trim()) p.push('Add what the quote is for.');
  if (!q.client.name.trim()) p.push('Add the client’s name.');
  if (!q.client.phone.trim() && !q.client.email.trim()) p.push('Add a phone or email so the client can get the link.');
  if (!q.items.some((i) => i.label.trim() && lineTotal(i) > 0)) p.push('Add at least one priced item.');
  if (q.items.some((i) => i.label.trim() && lineTotal(i) === 0)) p.push('Every item needs a price above ₦0.');
  if (q.validUntil < todayKey()) p.push('Valid until must be today or later.');
  return p;
}

/** Client-facing link, under the business's public address. */
export const quotePath = (handle: string, quoteId: string) => `/p/${handle}/quote/${quoteId}`;

// ——— Labelled sample data so the screens aren't empty ———

const sampleStages = (): Milestone[] => [
{ id: 'ms-s1', label: 'Booking', pct: 30, trigger: 'accept', invoiceId: 'inv-sample-1' },
{ id: 'ms-s2', label: 'Trial session', pct: 20, trigger: 'step', stepLabel: 'Trial session' },
{ id: 'ms-s3', label: 'Wedding day', pct: 50, trigger: 'step', stepLabel: 'Wedding day' }];


/** Older saved samples used deposit + balance; move the bridal sample onto payment stages (D95). */
function migrateSample(d: ServiceOsData): ServiceOsData {
  const q = d.quotes.find((x) => x.id === 'q-sample-1');
  if (!q || !q.sample || q.milestones) return d;
  const extra = d.invoices.some((i) => i.quoteId === q.id && i.id !== 'inv-sample-1' && i.status !== 'void');
  if (extra) return d;
  return {
    ...d,
    quotes: d.quotes.map((x) => x.id === q.id ? { ...x, depositPct: 0, milestones: sampleStages() } : x),
    invoices: d.invoices.map((i) => i.id === 'inv-sample-1' ? { ...i, milestoneId: 'ms-s1', items: i.items.map((li) => ({ ...li, label: 'Stage 1 of 3: Booking (30%)' })) } : i)
  };
}

function seed(): ServiceOsData {
  const now = new Date().toISOString();
  const tola: ServiceClient = { name: 'Tola Adeyemi', phone: '0803 555 0142', email: 'tola@example.com' };
  const obi: ServiceClient = { name: 'Obinna Eze', phone: '0812 555 0199', email: '' };
  const accepted: Quote = {
    id: 'q-sample-1',
    number: 'Q-0001',
    title: 'Wedding day makeup — bride + 3 bridesmaids',
    client: tola,
    items: [
    { id: 'li-s1', label: 'Bridal makeup with trial', qty: 1, unitNgn: 120000 },
    { id: 'li-s2', label: 'Bridesmaid makeup', qty: 3, unitNgn: 35000 },
    { id: 'li-s3', label: 'Travel to venue (Lekki)', qty: 1, unitNgn: 15000 }],

    depositPct: 0,
    milestones: sampleStages(),
    validUntil: addDays(10),
    note: 'Trial session the week before. Paid in three stages: booking, trial, and on the day.',
    status: 'accepted',
    createdAt: now,
    sentAt: now,
    decidedAt: now,
    acceptedBy: 'Tola Adeyemi',
    invoiceIds: ['inv-sample-1'],
    jobId: 'job-sample-1',
    sample: true
  };
  const waiting: Quote = {
    id: 'q-sample-2',
    number: 'Q-0002',
    title: 'Birthday shoot — family portraits',
    client: obi,
    items: [{ id: 'li-s4', label: '2-hour shoot, 30 edited photos', qty: 1, unitNgn: 85000 }],
    depositPct: 50,
    validUntil: addDays(5),
    note: '',
    status: 'sent',
    createdAt: now,
    sentAt: now,
    invoiceIds: [],
    sample: true
  };
  const invoice: Invoice = {
    id: 'inv-sample-1',
    number: 'INV-0001',
    title: accepted.title,
    client: tola,
    items: [{ id: 'li-s5', label: 'Stage 1 of 3: Booking (30%)', qty: 1, unitNgn: 72000 }],
    quoteId: accepted.id,
    milestoneId: 'ms-s1',
    dueDate: addDays(3),
    status: 'sent',
    payments: [{ id: 'pay-s1', amountNgn: 40000, method: 'transfer', at: now }],
    createdAt: now,
    sample: true
  };
  const job: Job = {
    id: 'job-sample-1',
    title: accepted.title,
    client: tola,
    quoteId: accepted.id,
    status: 'in_progress',
    dueDate: addDays(9),
    checklist: [
    { id: 'chk-s1', label: 'Trial session', done: true },
    { id: 'chk-s2', label: 'Confirm skin tones and looks', done: false },
    { id: 'chk-s3', label: 'Wedding day', done: false }],

    updates: [{ id: 'up-s1', at: now, text: 'Trial done — client chose the soft glam look.' }],
    createdAt: now,
    sample: true
  };
  return { quotes: [waiting, accepted], invoices: [invoice], jobs: [job], counters: { quote: 2, invoice: 1 }, milestoneTemplates: [], seeded: true };
}