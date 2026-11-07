import type { Invoice, Job, Milestone, MilestoneTemplate, MilestoneTrigger, Quote, ServiceOsData } from '../types/serviceOs';
import { addDays, docNumber, formatDay, itemsTotal, paidOf, serviceSettingsOf, todayKey } from './serviceOs';
import { uid } from './id';

/** Milestone payments for Quotes & jobs (D95): the seller splits a quote into stages, each with its own pay link. */

export const MAX_STAGES = 6;

export const builtInTemplates: MilestoneTemplate[] = [
  {
    id: 'tpl-bridal',
    name: 'Bridal & events — 30 / 20 / 50',
    builtIn: true,
    stages: [
      { label: 'Booking', pct: 30, trigger: 'accept' },
      { label: 'Trial session', pct: 20, trigger: 'step', stepLabel: 'Trial session' },
      { label: 'On the day', pct: 50, trigger: 'step', stepLabel: 'Event day' },
    ],
  },
  {
    id: 'tpl-half',
    name: 'Half now, half when done',
    builtIn: true,
    stages: [
      { label: 'To start', pct: 50, trigger: 'accept' },
      { label: 'On completion', pct: 50, trigger: 'done' },
    ],
  },
  {
    id: 'tpl-thirds',
    name: 'Thirds — start, midway, finish',
    builtIn: true,
    stages: [
      { label: 'To start', pct: 34, trigger: 'accept' },
      { label: 'Midway', pct: 33, trigger: 'step', stepLabel: 'Midway check-in' },
      { label: 'On completion', pct: 33, trigger: 'done' },
    ],
  },
  {
    id: 'tpl-build',
    name: 'Materials, then labour',
    builtIn: true,
    stages: [
      { label: 'Materials', pct: 40, trigger: 'accept' },
      { label: 'Work starts', pct: 30, trigger: 'step', stepLabel: 'Work started' },
      { label: 'Handover', pct: 30, trigger: 'done' },
    ],
  },
];

export const triggerLabels: Record<MilestoneTrigger, string> = {
  accept: 'When the client accepts',
  step: 'When a job step is ticked',
  date: 'On a date',
  done: 'When the job is done',
};

export const stagesFromTemplate = (t: MilestoneTemplate): Milestone[] => t.stages.map((s) => ({ id: uid('ms'), label: s.label, pct: s.pct, trigger: s.trigger, stepLabel: s.stepLabel }));
export const blankStage = (): Milestone => ({ id: uid('ms'), label: '', pct: 0, trigger: 'step', stepLabel: '' });

export const hasStages = (q: Quote) => !!q.milestones && q.milestones.length > 0;
export const pctTotal = (ms: Milestone[]) => ms.reduce((s, m) => s + (Number.isFinite(m.pct) ? m.pct : 0), 0);

/** Each stage's naira amount. The last stage absorbs rounding so stages always add up to the quote total. */
export function stageAmounts(q: Quote): Record<string, number> {
  const ms = q.milestones ?? [];
  const total = itemsTotal(q.items);
  const out: Record<string, number> = {};
  let used = 0;
  ms.forEach((m, i) => {
    const amt = i === ms.length - 1 ? Math.max(0, total - used) : Math.round((total * m.pct) / 100);
    out[m.id] = amt;
    used += amt;
  });
  return out;
}

export function milestoneProblems(ms: Milestone[]): string[] {
  const p: string[] = [];
  if (ms.length < 2) p.push('Add at least two payment stages, or switch back to deposit + balance.');
  if (ms.length > MAX_STAGES) p.push(`Use ${MAX_STAGES} stages or fewer.`);
  if (ms.some((m) => !m.label.trim())) p.push('Name every payment stage.');
  if (ms.some((m) => !Number.isInteger(m.pct) || m.pct < 1)) p.push('Every stage needs a whole percentage of at least 1%.');
  const sum = pctTotal(ms);
  if (sum !== 100) p.push(`Stages add up to ${sum}% — they need to make exactly 100%.`);
  if (ms.some((m) => m.trigger === 'step' && !m.stepLabel?.trim())) p.push('Say which job step makes each “job step” stage due.');
  if (ms.some((m) => m.trigger === 'date' && (!m.date || m.date < todayKey()))) p.push('Dated stages need a date of today or later.');
  return p;
}

// ——— Where each stage is ———

export type StageState = 'upcoming' | 'due' | 'requested' | 'part_paid' | 'paid';
export const stageStateLabels: Record<StageState, string> = { upcoming: 'Not due yet', due: 'Due — not requested', requested: 'Requested', part_paid: 'Part paid', paid: 'Paid' };
export const stageStateTones = { upcoming: 'neutral', due: 'warning', requested: 'info', part_paid: 'warning', paid: 'success' } as const;

function triggered(m: Milestone, q: Quote, job: Job | undefined): boolean {
  if (q.status !== 'accepted') return false;
  if (m.trigger === 'accept') return true;
  if (m.trigger === 'date') return !!m.date && m.date <= todayKey();
  if (m.trigger === 'done') return job?.status === 'done';
  const want = (m.stepLabel ?? '').trim().toLowerCase();
  return !!job?.checklist.some((c) => c.done && c.label.trim().toLowerCase() === want);
}

export interface StageRow {
  m: Milestone;
  amount: number;
  state: StageState;
  invoice?: Invoice;
  paid: number;
  /** "When the client accepts", "When “Trial session” is ticked", "On 12 Dec 2026"… */
  when: string;
}

export function stageWhen(m: Milestone): string {
  if (m.trigger === 'step') return `When “${m.stepLabel || 'a step'}” is ticked`;
  if (m.trigger === 'date') return m.date ? `On ${formatDay(m.date)}` : 'On a date';
  return triggerLabels[m.trigger];
}

export function stageRows(d: ServiceOsData, q: Quote): StageRow[] {
  const job = q.jobId ? d.jobs.find((j) => j.id === q.jobId) : undefined;
  const amounts = stageAmounts(q);
  return (q.milestones ?? []).map((m) => {
    const invoice = m.invoiceId ? d.invoices.find((i) => i.id === m.invoiceId && i.status !== 'void') : undefined;
    const paid = invoice ? paidOf(invoice) : 0;
    const state: StageState = invoice ? (invoice.status === 'paid' ? 'paid' : paid > 0 ? 'part_paid' : 'requested') : triggered(m, q, job) ? 'due' : 'upcoming';
    return { m, amount: amounts[m.id] ?? 0, state, invoice, paid, when: stageWhen(m) };
  });
}

/** Stages that are due but haven't been requested yet. */
export const dueUnrequested = (d: ServiceOsData, q: Quote) => stageRows(d, q).filter((r) => r.state === 'due');

// ——— Requesting a stage ———

/** Creates the stage's invoice, already sent so its pay link works straight away. */
export function requestStage(d: ServiceOsData, quoteId: string, stageId: string): { data: ServiceOsData; invoice: Invoice } | null {
  const q = d.quotes.find((x) => x.id === quoteId);
  const m = q?.milestones?.find((x) => x.id === stageId);
  if (!q || !m || q.status !== 'accepted') return null;
  const live = m.invoiceId ? d.invoices.find((i) => i.id === m.invoiceId && i.status !== 'void') : undefined;
  if (live) return null;
  const amount = stageAmounts(q)[m.id] ?? 0;
  if (amount <= 0) return null;
  const n = d.counters.invoice + 1;
  const idx = (q.milestones ?? []).findIndex((x) => x.id === m.id) + 1;
  const s = serviceSettingsOf(d);
  const invoice: Invoice = {
    id: uid('inv'),
    number: docNumber(s.invoicePrefix, n),
    title: q.title,
    client: q.client,
    items: [{ id: uid('li'), label: `Stage ${idx} of ${q.milestones!.length}: ${m.label} (${m.pct}%)`, qty: 1, unitNgn: amount }],
    quoteId: q.id,
    milestoneId: m.id,
    vat: q.vat,
    note: s.invoiceNote || undefined,
    dueDate: m.trigger === 'date' && m.date && m.date > todayKey() ? m.date : addDays(s.dueDays),
    status: 'sent',
    payments: [],
    createdAt: new Date().toISOString(),
  };
  return {
    data: {
      ...d,
      counters: { ...d.counters, invoice: n },
      invoices: [invoice, ...d.invoices],
      quotes: d.quotes.map((x) => (x.id === q.id ? { ...x, invoiceIds: [...x.invoiceIds, invoice.id], milestones: x.milestones!.map((s) => (s.id === m.id ? { ...s, invoiceId: invoice.id } : s)) } : x)),
    },
    invoice,
  };
}

/** Requests every stage that's due now (used when the client accepts, so the first pay link exists immediately). */
export function requestDueStages(d: ServiceOsData, quoteId: string): { data: ServiceOsData; invoices: Invoice[] } {
  let data = d;
  const invoices: Invoice[] = [];
  const q = d.quotes.find((x) => x.id === quoteId);
  if (!q) return { data, invoices };
  for (const r of dueUnrequested(d, q)) {
    const res = requestStage(data, quoteId, r.m.id);
    if (res) {
      data = res.data;
      invoices.push(res.invoice);
    }
  }
  return { data, invoices };
}

/** Stages that a job change has just made due — for the "now due" prompt. */
export function newlyDue(before: ServiceOsData, after: ServiceOsData, quoteId: string): StageRow[] {
  const qb = before.quotes.find((x) => x.id === quoteId);
  const qa = after.quotes.find((x) => x.id === quoteId);
  if (!qb || !qa || !hasStages(qa)) return [];
  const was = new Set(dueUnrequested(before, qb).map((r) => r.m.id));
  return dueUnrequested(after, qa).filter((r) => !was.has(r.m.id));
}

export const invoicePayPath = (handle: string, invoiceId: string) => `/p/${handle}/invoice/${invoiceId}`;

/** Saved template from the stages on a quote (dates become "job done" since dates don't repeat). */
export function templateFrom(name: string, ms: Milestone[]): MilestoneTemplate {
  return {
    id: uid('tpl'),
    name: name.trim(),
    stages: ms.map((m) => ({ label: m.label.trim(), pct: m.pct, trigger: m.trigger === 'date' ? 'done' : m.trigger, stepLabel: m.trigger === 'step' ? m.stepLabel?.trim() : undefined })),
  };
}
