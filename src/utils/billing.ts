import type { WorkspacePlan } from '../types/plan';
import type { BillingCycle, BillingData, BillingEvent, CardOutcome, Invoice, InvoiceLine, InvoiceStatus, PaymentCard } from '../types/billing';
import { testCards, VAT_RATE, YEARLY_MONTHS } from '../data/billing';
import { planOrder, plans } from '../data/plans';
import { uid } from './id';
import { monthlyPrice } from './planCatalogue';

const DAY = 86400000;

export const billingKey = (workspaceId: string) => `kubicu.billing.${workspaceId}`;

export function emptyBilling(): BillingData {
  return {
    cycle: 'monthly',
    periodStart: null,
    periodEnd: null,
    status: 'active',
    pendingPlan: null,
    pendingCycle: null,
    cancelReason: null,
    trial: null,
    trialUsed: false,
    graceEndsAt: null,
    failedCardLast4: null,
    card: null,
    invoices: [],
    history: [],
    sampleSeeded: false
  };
}

const HISTORY_CAP = 300;

/** Prepends one history entry (D68). */
export function withEvent(data: BillingData, e: Omit<BillingEvent, 'id' | 'at'> & {at?: string;}): BillingData {
  const event: BillingEvent = { id: uid('bev'), at: e.at ?? new Date().toISOString(), ...e };
  return { ...data, history: [event, ...data.history].slice(0, HISTORY_CAP) };
}

/** Sample history matching the sample invoices (oldest invoice = when the plan started). */
export function sampleHistory(plan: WorkspacePlan, invoices: Invoice[], card: PaymentCard): BillingEvent[] {
  const sorted = [...invoices].sort((a, b) => a.issuedAt.localeCompare(b.issuedAt));
  const out: BillingEvent[] = [];
  sorted.forEach((inv, i) => {
    if (i === 0) {
      out.push({ id: uid('bev'), at: new Date(Date.parse(inv.issuedAt) - 60000).toISOString(), kind: 'card', text: `Added ${card.brand} •••• ${card.last4}`, actor: card.holder, tone: 'neutral', sample: true });
      out.push({ id: uid('bev'), at: inv.issuedAt, kind: 'plan', text: `Upgraded to ${plans[plan].name} (monthly)`, detail: `Charged ${formatNgnPlain(inv.totalNgn)} incl. VAT`, actor: card.holder, invoiceId: inv.id, tone: 'success', sample: true });
    } else {
      out.push({ id: uid('bev'), at: inv.issuedAt, kind: 'payment', text: `Renewed ${plans[plan].name}`, detail: `Paid ${formatNgnPlain(inv.totalNgn)} incl. VAT`, actor: 'Automatic', invoiceId: inv.id, tone: 'success', sample: true });
    }
  });
  return out.reverse();
}

const formatNgnPlain = (n: number) => `₦${n.toLocaleString('en-NG')}`;

export function readBilling(workspaceId: string): BillingData | null {
  try {
    const raw = window.localStorage.getItem(billingKey(workspaceId));
    if (!raw) return null;
    const parsed = { ...emptyBilling(), ...(JSON.parse(raw) as Partial<BillingData>) };
    return { ...parsed, history: parsed.history ?? [] };
  } catch {
    return null;
  }
}

export function writeBilling(workspaceId: string, data: BillingData): void {
  window.localStorage.setItem(billingKey(workspaceId), JSON.stringify(data));
}

/** Uses the approved catalogue price (D135), so staff changes reach new quotes and renewals. */
export function priceFor(plan: WorkspacePlan, cycle: BillingCycle): number {
  const m = monthlyPrice(plan) ?? 0;
  return cycle === 'yearly' ? m * YEARLY_MONTHS : m;
}

export function yearlySaving(plan: WorkspacePlan): number {
  const m = monthlyPrice(plan) ?? 0;
  return m * 12 - m * YEARLY_MONTHS;
}

export function addCycle(fromIso: string, cycle: BillingCycle): string {
  const d = new Date(fromIso);
  if (cycle === 'yearly') d.setFullYear(d.getFullYear() + 1);else
  d.setMonth(d.getMonth() + 1);
  return d.toISOString();
}

export const addDays = (fromIso: string, days: number) => new Date(Date.parse(fromIso) + days * DAY).toISOString();

export function daysUntil(iso: string, now = Date.now()): number {
  return Math.max(0, Math.ceil((Date.parse(iso) - now) / DAY));
}

export const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export function withVat(subtotal: number) {
  const vat = Math.round(subtotal * VAT_RATE);
  return { subtotal, vat, total: subtotal + vat };
}

export const isPaidPlan = (p: WorkspacePlan) => p !== 'free' && p !== 'enterprise';

/** A downgrade waits for renewal; anything else is charged now (D65). */
export function changeKind(current: WorkspacePlan, cycle: BillingCycle, target: WorkspacePlan, targetCycle: BillingCycle, trialing: boolean): 'same' | 'upgrade' | 'downgrade' {
  if (target === current && targetCycle === cycle && !trialing) return 'same';
  if (trialing) return 'upgrade';
  const a = planOrder.indexOf(current);
  const b = planOrder.indexOf(target);
  if (b < a) return 'downgrade';
  if (b === a) return targetCycle === 'monthly' ? 'downgrade' : 'upgrade';
  return 'upgrade';
}

export interface Quote {
  lines: InvoiceLine[];
  subtotal: number;
  vat: number;
  total: number;
  periodStart: string;
  periodEnd: string;
  /** Days of the current period charged for, when the period is kept. */
  daysCharged: number | null;
  renewTotal: number;
  renewOn: string;
}

/** What an immediate change costs: the rest of the period at the new price, less unused time (D65). */
export function quoteChange(data: BillingData, current: WorkspacePlan, target: WorkspacePlan, targetCycle: BillingCycle, now = Date.now()): Quote {
  const nowIso = new Date(now).toISOString();
  const newPrice = priceFor(target, targetCycle);
  const name = plans[target].name;
  const cycleLabel = targetCycle === 'yearly' ? 'yearly' : 'monthly';
  const lines: InvoiceLine[] = [];
  let periodStart = nowIso;
  let periodEnd = addCycle(nowIso, targetCycle);
  let daysCharged: number | null = null;

  const hasPaidPeriod = !!data.periodStart && !!data.periodEnd && isPaidPlan(current) && !data.trial;
  if (hasPaidPeriod && targetCycle === data.cycle) {
    const start = Date.parse(data.periodStart!);
    const end = Date.parse(data.periodEnd!);
    const f = Math.min(1, Math.max(0, (end - now) / (end - start)));
    daysCharged = Math.max(1, Math.ceil((end - now) / DAY));
    lines.push({ label: `${name} (${cycleLabel}) for the rest of this period — ${daysCharged} day${daysCharged === 1 ? '' : 's'}`, amountNgn: Math.round(newPrice * f) });
    lines.push({ label: `Unused ${plans[current].name} time`, amountNgn: -Math.round(priceFor(current, data.cycle) * f) });
    periodStart = data.periodStart!;
    periodEnd = data.periodEnd!;
  } else {
    lines.push({ label: `${name} (${cycleLabel})`, amountNgn: newPrice });
    if (hasPaidPeriod) {
      const start = Date.parse(data.periodStart!);
      const end = Date.parse(data.periodEnd!);
      const f = Math.min(1, Math.max(0, (end - now) / (end - start)));
      const credit = Math.round(priceFor(current, data.cycle) * f);
      if (credit > 0) lines.push({ label: `Unused ${plans[current].name} time`, amountNgn: -credit });
    }
  }
  const subtotal = Math.max(0, lines.reduce((s, l) => s + l.amountNgn, 0));
  const { vat, total } = withVat(subtotal);
  return { lines, subtotal, vat, total, periodStart, periodEnd, daysCharged, renewTotal: withVat(newPrice).total, renewOn: periodEnd };
}

/** Replaces a quote's lines (after a coupon or credit) and recomputes its totals. */
export function requote(q: Quote, lines: InvoiceLine[], renewTotal = q.renewTotal): Quote {
  const subtotal = Math.max(0, lines.reduce((s, l) => s + l.amountNgn, 0));
  const { vat, total } = withVat(subtotal);
  return { ...q, lines, subtotal, vat, total, renewTotal };
}

/** Fires when staff change a workspace's billing from Super admin, so an open app picks it up. */
export const BILLING_EXTERNAL_EVENT = 'kubicu:billing-external';
export function notifyBillingChanged(workspaceId: string) {
  window.dispatchEvent(new CustomEvent(BILLING_EXTERNAL_EVENT, { detail: workspaceId }));
}

export function makeInvoice(data: BillingData, lines: InvoiceLine[], status: InvoiceStatus, card: PaymentCard | null, note?: string, at = new Date().toISOString()): Invoice {
  const subtotal = Math.max(0, lines.reduce((s, l) => s + l.amountNgn, 0));
  const { vat, total } = withVat(subtotal);
  const year = new Date(at).getFullYear();
  const seq = data.invoices.length + 1;
  return {
    id: uid('inv'),
    number: `KUB-${year}-${String(seq).padStart(4, '0')}`,
    issuedAt: at,
    status,
    lines,
    subtotalNgn: subtotal,
    vatNgn: vat,
    totalNgn: total,
    cardLast4: card?.last4 ?? null,
    note
  };
}

export const digitsOnly = (s: string) => s.replace(/\D/g, '');

export function cardOutcome(number: string): CardOutcome | null {
  const n = digitsOnly(number);
  return testCards.find((c) => digitsOnly(c.number) === n)?.outcome ?? null;
}

export function cardBrand(number: string): PaymentCard['brand'] {
  const n = digitsOnly(number);
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return 'Mastercard';
  if (/^(506|507|650)/.test(n)) return 'Verve';
  return 'Visa';
}

export function expiryError(expiry: string, now = new Date()): string | undefined {
  const m = /^(\d{2})\s*\/\s*(\d{2})$/.exec(expiry.trim());
  if (!m) return 'Use MM/YY, like 08/28.';
  const month = Number(m[1]);
  const year = 2000 + Number(m[2]);
  if (month < 1 || month > 12) return 'Month must be 01–12.';
  const end = new Date(year, month, 1);
  if (end <= now) return 'This card has expired.';
  return undefined;
}

/** Sample history for the demo workspace once it's on a paid plan. */
export function sampleInvoices(data: BillingData, plan: WorkspacePlan, card: PaymentCard): BillingData['invoices'] {
  const price = priceFor(plan, 'monthly');
  const out: Invoice[] = [];
  let d = { ...data, invoices: [] as Invoice[] };
  for (let i = 2; i >= 1; i--) {
    const at = new Date();
    at.setMonth(at.getMonth() - i);
    at.setDate(Math.max(1, at.getDate() - 18));
    const inv = { ...makeInvoice(d, [{ label: `${plans[plan].name} (monthly)`, amountNgn: price }], 'paid', card, undefined, at.toISOString()), sample: true };
    out.push(inv);
    d = { ...d, invoices: [...d.invoices, inv] };
  }
  return out;
}