import type { CommerceData } from '../types/commerce';
import type { OpsData } from '../types/ops';
import { orderMoney } from './commerce/money';
import { isSoldOut } from './commerce/catalog';
import type { ServiceOsData } from '../types/serviceOs';
import { bookingBalance } from './ops/balance';
import { dueUnrequested, hasStages } from './milestones';

/** Opportunity Inbox (concept 12, D81): money and customers that still need one small action. */
export type OpportunityKind = 'unpaid' | 'renewal' | 'deposit' | 'balance' | 'stage' | 'noshow' | 'lead' | 'followup' | 'soldout' | 'automation';
export type OpportunityGroup = 'payments' | 'customers' | 'bookings' | 'stock';

export interface Opportunity {
  id: string;
  kind: OpportunityKind;
  group: OpportunityGroup;
  title: string;
  /** Why it's here, in one line. */
  reason: string;
  /** What's at stake when known; null when there's no honest figure. */
  valueNgn: number | null;
  /** When the opportunity started (for "waiting 3 days"). */
  since: string;
  /** Where to handle it in the app. */
  to: string;
  /** Customer to nudge, when we have a phone number. */
  nudge?: {phone: string;message: string;};
  sample?: boolean;
}

export const kindLabels: Record<OpportunityKind, string> = {
  unpaid: 'Unpaid checkout',
  renewal: 'Failed renewal',
  deposit: 'Deposit not paid',
  balance: 'Booking balance due',
  stage: 'Payment stage due',
  noshow: 'No-show',
  lead: 'Unanswered lead',
  followup: 'Follow-up overdue',
  soldout: 'Sold out',
  automation: 'Automation failed'
};

export const groupLabels: Record<OpportunityGroup, string> = {
  payments: 'Payments',
  customers: 'Leads & follow-ups',
  bookings: 'Bookings',
  stock: 'Stock & tools'
};

const HOUR = 3600000;
const DAY = 24 * HOUR;
const first = (name: string) => name.trim().split(/\s+/)[0] || 'there';

/** Builds the inbox from real records only — nothing here is estimated or invented. */
export function buildOpportunities(commerce: CommerceData, ops: OpsData, business: string, now = Date.now(), serviceOs?: ServiceOsData | null): Opportunity[] {
  const out: Opportunity[] = [];

  // D95: booking balances asked for online that are due or overdue.
  ops.bookings.forEach((b) => {
    if (b.status !== 'confirmed' && b.status !== 'pending_deposit') return;
    const service = ops.services.find((s) => s.id === b.serviceId);
    const bal = bookingBalance(b, service, now);
    if (bal.state !== 'due' && bal.state !== 'overdue') return;
    out.push({
      id: `balance:${b.id}`,
      kind: 'balance',
      group: 'bookings',
      title: `${b.customer.name} · ${b.serviceName}`,
      reason: bal.state === 'overdue' ? 'Balance overdue — the appointment is coming up' : 'Balance due before the appointment',
      valueNgn: bal.amount,
      since: b.start,
      to: `/app/bookings?booking=${b.id}`,
      nudge: b.customer.phone ? { phone: b.customer.phone, message: `Hi ${first(b.customer.name)}, it's ${business}. Your ${b.serviceName} balance of ₦${bal.amount.toLocaleString('en-NG')} is due before your appointment — you can pay it from your booking link. See you soon!` } : undefined,
      sample: b.sample
    });
  });

  // D95: made-to-order balances still to collect before dispatch.
  commerce.orders.forEach((o) => {
    if (!o.balance || o.balance.paidAt || o.status === 'cancelled' || o.status === 'refunded' || o.paymentStatus === 'pending' || o.paymentStatus === 'cancelled') return;
    out.push({
      id: `mto:${o.id}`,
      kind: 'balance',
      group: 'payments',
      title: `${o.customer.name || 'Customer'} · order #${o.number}`,
      reason: o.balance.requestedAt ? 'Made-to-order balance requested — not paid yet' : 'Made-to-order balance not requested yet',
      valueNgn: o.balance.dueNgn,
      since: o.balance.requestedAt ?? o.createdAt,
      to: `/app/commerce/orders?order=${o.id}`,
      nudge: o.customer.phone ? { phone: o.customer.phone, message: `Hi ${first(o.customer.name)}, it's ${business}. Your order #${o.number} is nearly ready! The balance is ₦${o.balance.dueNgn.toLocaleString('en-NG')} — pay it from your order page and we'll send it out.` } : undefined,
      sample: o.sample
    });
  });

  // D95: quote payment stages that are due but not yet requested.
  serviceOs?.quotes.forEach((q) => {
    if (!hasStages(q)) return;
    dueUnrequested(serviceOs, q).forEach((r) => {
      out.push({
        id: `stage:${q.id}:${r.m.id}`,
        kind: 'stage',
        group: 'payments',
        title: `${q.client.name} · ${r.m.label}`,
        reason: `Stage is due on ${q.title} — send the pay link`,
        valueNgn: r.amount,
        since: q.decidedAt ?? q.createdAt,
        to: '/app/services',
        sample: q.sample
      });
    });
  });

  // Checkouts with details but no payment: older than an hour, newer than two weeks.
  commerce.orders.forEach((o) => {
    const age = now - Date.parse(o.createdAt);
    if (o.status !== 'new' || o.paymentStatus !== 'pending' || age < HOUR || age > 14 * DAY) return;
    out.push({
      id: `unpaid:${o.id}`,
      kind: 'unpaid',
      group: 'payments',
      title: `${o.customer.name || 'A customer'} · order #${o.number}`,
      reason: 'Entered their details but hasn’t paid',
      valueNgn: orderMoney(o).gross,
      since: o.createdAt,
      to: '/app/commerce/orders?status=new',
      nudge: o.customer.phone ? { phone: o.customer.phone, message: `Hi ${first(o.customer.name)}, it’s ${business}. Your order #${o.number} is saved but not paid yet — can I help you finish it?` } : undefined,
      sample: o.sample
    });
  });

  // Subscriptions whose renewal failed and are inside the grace period.
  commerce.subscriptions.forEach((s) => {
    if (s.status !== 'past_due') return;
    const plan = commerce.subPlans.find((p) => p.id === s.planId);
    out.push({
      id: `renewal:${s.id}`,
      kind: 'renewal',
      group: 'payments',
      title: `${s.customer.name} · ${plan?.name ?? 'Subscription'}`,
      reason: s.graceEndsAt ? `Card failed · ends ${new Date(s.graceEndsAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} unless updated` : 'Card failed on renewal',
      valueNgn: plan?.priceNgn ?? null,
      since: s.failedAt ?? s.periodEnd,
      to: '/app/commerce/subscriptions',
      nudge: s.customer.phone ? { phone: s.customer.phone, message: `Hi ${first(s.customer.name)}, it’s ${business}. Your ${plan?.name ?? 'subscription'} payment didn’t go through. You can update your card from your subscription link — want me to resend it?` } : undefined,
      sample: s.sample
    });
  });

  ops.bookings.forEach((b) => {
    const start = Date.parse(b.start);
    if (b.status === 'pending_deposit' && start > now) {
      out.push({
        id: `deposit:${b.id}`,
        kind: 'deposit',
        group: 'bookings',
        title: `${b.customer.name} · ${new Date(b.start).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}`,
        reason: 'Booked a time but the deposit isn’t paid',
        valueNgn: b.priceNgn,
        since: b.events[0]?.at ?? b.start,
        to: '/app/bookings',
        nudge: b.customer.phone ? { phone: b.customer.phone, message: `Hi ${first(b.customer.name)}, it’s ${business}. Your booking is held but the deposit isn’t paid yet — shall I send the link again?` } : undefined,
        sample: b.sample
      });
    }
    if (b.status === 'no_show' && now - start < 30 * DAY) {
      out.push({
        id: `noshow:${b.id}`,
        kind: 'noshow',
        group: 'bookings',
        title: `${b.customer.name} missed their booking`,
        reason: 'Offer a new time while they still remember',
        valueNgn: b.priceNgn,
        since: b.start,
        to: '/app/bookings',
        nudge: b.customer.phone ? { phone: b.customer.phone, message: `Hi ${first(b.customer.name)}, it’s ${business}. We missed you on ${new Date(b.start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} — would you like to pick a new time?` } : undefined,
        sample: b.sample
      });
    }
  });

  ops.contacts.forEach((c) => {
    if (c.stage === 'new' && c.sources.includes('form') && now - Date.parse(c.createdAt) > DAY) {
      out.push({
        id: `lead:${c.id}`,
        kind: 'lead',
        group: 'customers',
        title: c.name || c.email || 'New enquiry',
        reason: 'Sent an enquiry and hasn’t heard back',
        valueNgn: null,
        since: c.createdAt,
        to: '/app/audience',
        nudge: c.phone ? { phone: c.phone, message: `Hi ${first(c.name)}, it’s ${business} — thanks for your enquiry. How can I help?` } : undefined,
        sample: c.sample
      });
    }
    c.tasks.forEach((t) => {
      if (t.done || !t.due || Date.parse(t.due) > now) return;
      out.push({
        id: `followup:${c.id}:${t.id}`,
        kind: 'followup',
        group: 'customers',
        title: `${t.text} — ${c.name || 'contact'}`,
        reason: `Was due ${new Date(t.due).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`,
        valueNgn: null,
        since: t.due,
        to: '/app/audience',
        nudge: c.phone ? { phone: c.phone, message: `Hi ${first(c.name)}, it’s ${business}. ` } : undefined,
        sample: c.sample
      });
    });
  });

  commerce.products.forEach((p) => {
    if (p.status !== 'active' || p.kind === 'ticket' || !isSoldOut(p)) return;
    out.push({
      id: `soldout:${p.id}`,
      kind: 'soldout',
      group: 'stock',
      title: p.name,
      reason: 'Sold out but still on your page — restock or hide it',
      valueNgn: null,
      since: p.updatedAt ?? p.createdAt,
      to: '/app/commerce/inventory',
      sample: p.sample
    });
  });

  ops.automations.forEach((a) => {
    const failed = a.runs.filter((r) => r.status === 'failed' && now - Date.parse(r.at) < 7 * DAY);
    if (!failed.length) return;
    out.push({
      id: `automation:${a.id}:${failed[0].id}`,
      kind: 'automation',
      group: 'stock',
      title: a.name,
      reason: `${failed.length} run${failed.length === 1 ? '' : 's'} failed this week — customers may have missed a message`,
      valueNgn: null,
      since: failed[0].at,
      to: '/app/automations',
      sample: a.sample
    });
  });

  // Biggest known value first, then the longest waiting.
  return out.sort((a, b) => (b.valueNgn ?? -1) - (a.valueNgn ?? -1) || Date.parse(a.since) - Date.parse(b.since));
}