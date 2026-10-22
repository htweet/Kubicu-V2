import type { CommerceData, Order, OrderCustomer } from '../../types/commerce';
import type { WorkspacePlan } from '../../types/plan';
import type { SubEvent, SubInterval, SubPayment, SubPlan, SubRules, Subscription, SubStatus } from '../../types/subscriptions';
import { uid } from '../id';
import { formatNgn } from '../format';
import { variantLabel } from './catalog';
import { kubicuFee, providerFee } from './money';
import { moveStock } from './ops';

/** Customer subscriptions: sign-up, renewals, retries and changes (D69). Test mode. */

export const SUB_RETRY_DAYS = [1, 3, 5];
export const SUB_GRACE_DAYS = 7;
const DAY = 86400000;
const EVENT_CAP = 60;

export const intervalWord: Record<SubInterval, string> = { week: 'week', month: 'month', year: 'year' };
export const intervalAdverb: Record<SubInterval, string> = { week: 'Weekly', month: 'Monthly', year: 'Yearly' };

export const subStatusLabels: Record<SubStatus, string> = {
  trialing: 'Trial',
  active: 'Active',
  paused: 'Paused',
  past_due: 'Payment failed',
  cancelling: 'Cancelling',
  ended: 'Ended'
};

export const defaultRules = (): SubRules => ({ pause: true, maxPauseCycles: 2, skip: true, switchPlan: true, cancelAnyTime: true, noticeDays: 0 });

export function emptySubPlan(kind: SubPlan['kind']): SubPlan {
  return {
    id: uid('sp'),
    kind,
    name: '',
    description: '',
    benefits: '',
    priceNgn: 0,
    interval: kind === 'box' ? 'month' : 'month',
    trialDays: 0,
    setupFeeNgn: 0,
    memberCap: null,
    items: [],
    rules: defaultRules(),
    status: 'active',
    createdAt: new Date().toISOString()
  };
}

export function addInterval(iso: string, interval: SubInterval, n = 1): string {
  const d = new Date(iso);
  if (interval === 'week') d.setDate(d.getDate() + 7 * n);else
  if (interval === 'year') d.setFullYear(d.getFullYear() + n);else
  d.setMonth(d.getMonth() + n);
  return d.toISOString();
}

const plusDays = (iso: string, days: number) => new Date(Date.parse(iso) + days * DAY).toISOString();

export const subDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

/** "₦5,000 every month" */
export const priceLine = (p: Pick<SubPlan, 'priceNgn' | 'interval'>) => `${formatNgn(p.priceNgn)} every ${intervalWord[p.interval]}`;

/** What the customer pays at sign-up (delivery included for boxes without a trial). */
export function dueToday(plan: SubPlan, deliveryNgn = 0): number {
  if (plan.trialDays > 0) return plan.setupFeeNgn;
  return plan.priceNgn + plan.setupFeeNgn + (plan.kind === 'box' ? deliveryNgn : 0);
}

/** Plain renewal terms shown before paying. */
export function renewalTerms(plan: SubPlan, deliveryNgn = 0, from = new Date().toISOString()): string {
  const each = plan.priceNgn + (plan.kind === 'box' ? deliveryNgn : 0);
  const first = plan.trialDays > 0 ? plusDays(from, plan.trialDays) : addInterval(from, plan.interval);
  const lead = plan.trialDays > 0 ? `Free for ${plan.trialDays} days, then ` : '';
  const cancel = plan.rules.cancelAnyTime ? 'Cancel any time from your subscription link.' : `Cancel at least ${plan.rules.noticeDays} days before a charge from your subscription link.`;
  return `${lead}${formatNgn(each)} every ${intervalWord[plan.interval]} until you cancel. ${plan.trialDays > 0 ? 'First charge' : 'Next charge'} ${subDate(first)}. ${cancel}`;
}

export const liveSub = (s: Subscription) => s.status !== 'ended';

export function seatsTaken(data: CommerceData, planId: string): number {
  return data.subscriptions.filter((s) => s.planId === planId && liveSub(s)).length;
}

export function planFull(data: CommerceData, plan: SubPlan): boolean {
  return plan.memberCap !== null && seatsTaken(data, plan.id) >= plan.memberCap;
}

/** Box items that can't be filled from current stock. */
export function boxShortfall(data: CommerceData, plan: SubPlan): string[] {
  if (plan.kind !== 'box') return [];
  const out: string[] = [];
  for (const it of plan.items) {
    const p = data.products.find((x) => x.id === it.productId);
    const v = p?.variants.find((x) => x.id === it.variantId);
    if (!p || !v || p.status !== 'active') out.push(p?.name ?? 'A removed product');else
    if (p.kind === 'physical' && p.trackStock && v.stock < it.qty) out.push(p.name);
  }
  return out;
}

/** Monthly value of one subscription at its plan's price. */
export function monthlyValue(plan: Pick<SubPlan, 'priceNgn' | 'interval'>): number {
  if (plan.interval === 'week') return Math.round(plan.priceNgn * 52 / 12);
  if (plan.interval === 'year') return Math.round(plan.priceNgn / 12);
  return plan.priceNgn;
}

/** Monthly recurring revenue from paying subscribers (not trials or pauses). */
export function mrr(data: CommerceData): number {
  return data.subscriptions.
  filter((s) => s.status === 'active' || s.status === 'cancelling' || s.status === 'past_due').
  reduce((sum, s) => {
    const plan = data.subPlans.find((p) => p.id === s.planId);
    return sum + (plan ? monthlyValue(plan) : 0);
  }, 0);
}

export function nextDueAt(s: Subscription): string | null {
  if (s.status === 'ended') return null;
  if (s.status === 'trialing') return s.trialEndsAt ?? s.periodEnd;
  if (s.status === 'past_due') {
    if (s.retries < SUB_RETRY_DAYS.length && s.failedAt) return plusDays(s.failedAt, SUB_RETRY_DAYS[s.retries]);
    return s.graceEndsAt;
  }
  return s.periodEnd;
}

const ev = (label: string, by: SubEvent['by'], at = new Date().toISOString()): SubEvent => ({ id: uid('sev'), at, label, by });
const withEv = (s: Subscription, e: SubEvent): Subscription => ({ ...s, events: [e, ...s.events].slice(0, EVENT_CAP) });
const payment = (label: string, amountNgn: number, status: SubPayment['status'], at: string, orderId?: string): SubPayment => ({ id: uid('spay'), at, label, amountNgn, status, orderId });

function replaceSub(data: CommerceData, sub: Subscription): CommerceData {
  return { ...data, subscriptions: data.subscriptions.map((s) => s.id === sub.id ? sub : s) };
}

/** Creates the box order for one cycle. Null when the box can't be filled. */
function boxOrder(data: CommerceData, sub: Subscription, plan: SubPlan, wsPlan: WorkspacePlan, at: string, note: string): {data: CommerceData;order: Order;} | null {
  if (boxShortfall(data, plan).length > 0 || plan.items.length === 0) return null;
  const lines = plan.items.map((it) => {
    const p = data.products.find((x) => x.id === it.productId)!;
    const v = p.variants.find((x) => x.id === it.variantId)!;
    return { p, v, qty: it.qty, list: (v.priceNgn ?? p.priceNgn) * it.qty };
  });
  // The plan price is shared across the box contents in proportion to their list prices.
  const listTotal = lines.reduce((s, l) => s + l.list, 0) || 1;
  let allocated = 0;
  const items = lines.map((l, i) => {
    const share = i === lines.length - 1 ? plan.priceNgn - allocated : Math.round(plan.priceNgn * l.list / listTotal);
    allocated += share;
    return {
      productId: l.p.id,
      variantId: l.v.id,
      name: l.p.name,
      variantLabel: Object.keys(l.v.options).length ? variantLabel(l.v) : '',
      unitPriceNgn: Math.round(share / l.qty),
      qty: l.qty,
      imageUrl: l.p.images[0]?.url ?? '',
      kind: l.p.kind
    };
  });
  const subtotal = items.reduce((s, i) => s + i.unitPriceNgn * i.qty, 0);
  const deliveryNgn = sub.delivery?.method === 'delivery' ? sub.delivery.feeNgn : 0;
  const gross = subtotal + deliveryNgn;
  const number = data.nextOrderNumber;
  const order: Order = {
    id: uid('ord'),
    number,
    createdAt: at,
    customer: sub.customer,
    items,
    fulfilment:
    sub.delivery?.method === 'delivery' ?
    { method: 'delivery', zoneId: sub.delivery.zoneId, zoneName: sub.delivery.zoneName, address: sub.delivery.address } :
    { method: 'pickup', address: data.fulfilment.pickupAddress },
    subtotalNgn: subtotal,
    discountNgn: 0,
    deliveryNgn,
    providerFeeNgn: providerFee(gross),
    kubicuFeeNgn: kubicuFee(gross, wsPlan),
    status: 'paid',
    paymentStatus: 'paid',
    refunds: [],
    events: [
    { id: uid('ev'), kind: 'paid', label: 'Subscription payment taken (test mode)', at },
    { id: uid('ev'), kind: 'placed', label: `${note} — ${plan.name}`, at }],

    downloads: [],
    note: '',
    sourceHandle: sub.sourceHandle,
    subscriptionId: sub.id
  };
  let next: CommerceData = { ...data, orders: [order, ...data.orders], nextOrderNumber: number + 1 };
  items.forEach((i) => next = moveStock(next, i.productId, i.variantId, -i.qty, 'order', 'Subscription box', number));
  return { data: next, order };
}

export type SignupOutcome = 'success' | 'declined' | 'bank';

export interface SignupInput {
  planId: string;
  customer: OrderCustomer;
  delivery: Subscription['delivery'];
  outcome: SignupOutcome;
  card: Subscription['card'];
  sourceHandle?: string;
  wsPlan: WorkspacePlan;
}

export type SignupResult = {ok: true;data: CommerceData;sub: Subscription;} | {ok: false;reason: 'declined' | 'full' | 'unavailable';message: string;};

/** Starts a subscription. "bank" is a successful payment after the bank confirmation step. */
export function startSubscription(data: CommerceData, input: SignupInput): SignupResult {
  const plan = data.subPlans.find((p) => p.id === input.planId);
  if (!plan || plan.status !== 'active') return { ok: false, reason: 'unavailable', message: 'This plan isn’t available any more.' };
  if (planFull(data, plan)) return { ok: false, reason: 'full', message: `${plan.name} is full right now. The seller limits how many people can join.` };
  if (input.outcome === 'declined') return { ok: false, reason: 'declined', message: 'The test card was declined. No money moved and no subscription was started.' };
  const at = new Date().toISOString();
  const trial = plan.trialDays > 0;
  if (!trial && boxShortfall(data, plan).length > 0) return { ok: false, reason: 'unavailable', message: 'The first box can’t be filled right now — some items are out of stock.' };

  let sub: Subscription = {
    id: uid('sub'),
    token: uid('st').replace('st_', ''),
    planId: plan.id,
    pendingPlanId: null,
    customer: input.customer,
    delivery: plan.kind === 'box' ? input.delivery : null,
    status: trial ? 'trialing' : 'active',
    startedAt: at,
    trialEndsAt: trial ? plusDays(at, plan.trialDays) : null,
    periodEnd: trial ? plusDays(at, plan.trialDays) : addInterval(at, plan.interval),
    pausedUntil: null,
    cancelReason: null,
    endedAt: null,
    failedAt: null,
    retries: 0,
    graceEndsAt: null,
    card: input.card,
    payments: [],
    events: [ev(trial ? `Started a ${plan.trialDays}-day free trial of ${plan.name}` : `Subscribed to ${plan.name}`, 'customer', at)],
    sourceHandle: input.sourceHandle
  };
  let next: CommerceData = { ...data, subscriptions: [sub, ...data.subscriptions] };
  if (plan.setupFeeNgn > 0) sub = { ...sub, payments: [payment('Setup fee', plan.setupFeeNgn, 'paid', at)] };
  if (!trial) {
    let orderId: string | undefined;
    if (plan.kind === 'box') {
      const made = boxOrder(next, sub, plan, input.wsPlan, at, 'First subscription box');
      if (!made) return { ok: false, reason: 'unavailable', message: 'The first box can’t be filled right now.' };
      next = made.data;
      orderId = made.order.id;
    }
    const delivery = plan.kind === 'box' && sub.delivery?.method === 'delivery' ? sub.delivery.feeNgn : 0;
    sub = { ...sub, payments: [payment(`First ${intervalWord[plan.interval]}`, plan.priceNgn + delivery, 'paid', at, orderId), ...sub.payments] };
  }
  if (input.outcome === 'bank') sub = withEv(sub, ev('Bank confirmed the card for future charges', 'customer', at));
  next = replaceSub(next, sub);
  return { ok: true, data: next, sub };
}

/** Takes one cycle's payment. Failure starts the retry and grace schedule. */
function charge(data: CommerceData, sub: Subscription, outcome: 'succeeds' | 'fails', wsPlan: WorkspacePlan, at: string, isRetry: boolean): CommerceData {
  const planId = sub.pendingPlanId ?? sub.planId;
  const plan = data.subPlans.find((p) => p.id === planId);
  if (!plan) return replaceSub(data, withEv({ ...sub, status: 'ended', endedAt: at }, ev('Ended — the plan no longer exists', 'automatic', at)));
  let s: Subscription = sub.pendingPlanId ? withEv({ ...sub, planId, pendingPlanId: null }, ev(`Switched to ${plan.name}`, 'automatic', at)) : sub;
  const delivery = plan.kind === 'box' && s.delivery?.method === 'delivery' ? s.delivery.feeNgn : 0;
  const amount = plan.priceNgn + delivery;

  if (outcome === 'fails') {
    if (isRetry) {
      const retries = s.retries + 1;
      s = withEv({ ...s, retries, payments: [payment(`Retry ${retries} of ${SUB_RETRY_DAYS.length}`, amount, 'failed', at), ...s.payments] }, ev(`Retry ${retries} failed — card declined`, 'automatic', at));
    } else {
      s = withEv(
        { ...s, status: 'past_due', failedAt: at, retries: 0, graceEndsAt: plusDays(at, SUB_GRACE_DAYS), payments: [payment(`${intervalAdverb[plan.interval]} renewal`, amount, 'failed', at), ...s.payments] },
        ev(`Renewal failed — retrying on days ${SUB_RETRY_DAYS.join(', ')}; ends ${subDate(plusDays(at, SUB_GRACE_DAYS))} if not paid`, 'automatic', at)
      );
    }
    return replaceSub(data, s);
  }

  let next = data;
  let orderId: string | undefined;
  if (plan.kind === 'box') {
    const made = boxOrder(next, s, plan, wsPlan, at, 'Subscription box');
    if (!made) {
      // Can't fill the box: skip this cycle without charging.
      s = withEv({ ...s, status: 'active', failedAt: null, retries: 0, graceEndsAt: null, pausedUntil: null, periodEnd: addInterval(at, plan.interval) }, ev('Skipped this cycle — not enough stock for the box. Not charged.', 'automatic', at));
      return replaceSub(next, s);
    }
    next = made.data;
    orderId = made.order.id;
  }
  s = withEv(
    {
      ...s,
      status: 'active',
      failedAt: null,
      retries: 0,
      graceEndsAt: null,
      pausedUntil: null,
      pausedFrom: null,
      trialEndsAt: s.status === 'trialing' ? null : s.trialEndsAt,
      periodEnd: addInterval(at, plan.interval),
      payments: [payment(isRetry ? 'Renewal (paid on retry)' : sub.status === 'trialing' ? 'First charge after trial' : `${intervalAdverb[plan.interval]} renewal`, amount, 'paid', at, orderId), ...s.payments]
    },
    ev(`${isRetry ? 'Retry succeeded' : 'Renewed'} — ${formatNgn(amount)} paid`, 'automatic', at)
  );
  return replaceSub(next, s);
}

/** Runs whatever is due for one subscription at `at`. */
function step(data: CommerceData, sub: Subscription, outcome: 'succeeds' | 'fails', wsPlan: WorkspacePlan, at: string): CommerceData {
  if (sub.status === 'cancelling') return replaceSub(data, withEv({ ...sub, status: 'ended', endedAt: at }, ev('Ended at the end of the paid period', 'automatic', at)));
  if (sub.status === 'past_due') {
    if (sub.retries < SUB_RETRY_DAYS.length) return charge(data, sub, outcome, wsPlan, at, true);
    return replaceSub(data, withEv({ ...sub, status: 'ended', endedAt: at, graceEndsAt: null }, ev(`Ended — payment wasn’t fixed within ${SUB_GRACE_DAYS} days`, 'automatic', at)));
  }
  return charge(data, sub, outcome, wsPlan, at, false);
}

/** Settles everything due by now (renewals, trial ends, retries, cancellations). */
export function renewDue(data: CommerceData, outcome: 'succeeds' | 'fails', wsPlan: WorkspacePlan, now = Date.now()): CommerceData {
  let next = data;
  for (const original of data.subscriptions) {
    for (let guard = 0; guard < 6; guard++) {
      const sub = next.subscriptions.find((s) => s.id === original.id);
      const due = sub ? nextDueAt(sub) : null;
      if (!sub || !due || Date.parse(due) > now) break;
      next = step(next, sub, outcome, wsPlan, due);
    }
  }
  return next;
}

/** Prototype: runs each live subscription's next step now. */
export function runNextNow(data: CommerceData, outcome: 'succeeds' | 'fails', wsPlan: WorkspacePlan): {data: CommerceData;count: number;} {
  let next = data;
  let count = 0;
  const at = new Date().toISOString();
  for (const s of data.subscriptions) {
    if (!liveSub(s) || s.sample) continue;
    next = step(next, s, outcome, wsPlan, at);
    count++;
  }
  return { data: next, count };
}

// ——— Changes by the subscriber or the seller ———

type By = SubEvent['by'];

function edit(data: CommerceData, id: string, fn: (s: Subscription, plan: SubPlan | undefined) => Subscription): CommerceData {
  const sub = data.subscriptions.find((s) => s.id === id);
  if (!sub) return data;
  return replaceSub(data, fn(sub, data.subPlans.find((p) => p.id === sub.planId)));
}

export const pauseSub = (data: CommerceData, id: string, cycles: number, by: By) =>
edit(data, id, (s, plan) => {
  const until = addInterval(s.periodEnd, plan?.interval ?? 'month', cycles);
  return withEv({ ...s, status: 'paused', pausedFrom: s.periodEnd, pausedUntil: until, periodEnd: until }, ev(`Paused for ${cycles} ${plan ? intervalWord[plan.interval] : 'cycle'}${cycles === 1 ? '' : 's'} — charges resume ${subDate(until)}`, by));
});

export const resumeSub = (data: CommerceData, id: string, by: By) =>
edit(data, id, (s) => {
  // Resuming early charges on the date the pause began (or tomorrow if that has passed).
  const from = s.pausedFrom ?? s.periodEnd;
  const periodEnd = Date.parse(from) > Date.now() ? from : new Date(Date.now() + DAY).toISOString();
  return withEv({ ...s, status: 'active', pausedUntil: null, pausedFrom: null, periodEnd }, ev(`Resumed — next charge ${subDate(periodEnd)}`, by));
});

export const skipNextCycle = (data: CommerceData, id: string, by: By) =>
edit(data, id, (s, plan) => {
  const periodEnd = addInterval(s.periodEnd, plan?.interval ?? 'month');
  return withEv({ ...s, periodEnd }, ev(`Skipped the next ${plan ? intervalWord[plan.interval] : 'cycle'} — next charge ${subDate(periodEnd)}`, by));
});

export const switchPlan = (data: CommerceData, id: string, planId: string, by: By) =>
edit(data, id, (s) => {
  const target = data.subPlans.find((p) => p.id === planId);
  if (!target) return s;
  if (planId === s.planId) return withEv({ ...s, pendingPlanId: null }, ev('Kept the current plan', by));
  return withEv({ ...s, pendingPlanId: planId }, ev(`Switching to ${target.name} from ${subDate(s.periodEnd)} (${priceLine(target)})`, by));
});

export const cancelSub = (data: CommerceData, id: string, reason: string, by: By, immediately = false) =>
edit(data, id, (s) => {
  const at = new Date().toISOString();
  if (immediately || s.status === 'trialing' || s.status === 'past_due') return withEv({ ...s, status: 'ended', endedAt: at, cancelReason: reason || null, pendingPlanId: null }, ev(`Cancelled${reason ? ` — “${reason}”` : ''}. Ended straight away.`, by, at));
  return withEv({ ...s, status: 'cancelling', cancelReason: reason || null, pendingPlanId: null, pausedUntil: null }, ev(`Cancelled${reason ? ` — “${reason}”` : ''}. Ends ${subDate(s.periodEnd)}.`, by, at));
});

export const undoCancel = (data: CommerceData, id: string, by: By) => edit(data, id, (s) => withEv({ ...s, status: 'active', cancelReason: null }, ev(`Resumed — next charge ${subDate(s.periodEnd)}`, by)));

export function updateCard(data: CommerceData, id: string, card: Subscription['card'], outcome: 'succeeds' | 'fails', wsPlan: WorkspacePlan, by: By): CommerceData {
  let next = edit(data, id, (s) => withEv({ ...s, card }, ev(`Card updated to ${card.brand} •••• ${card.last4}`, by)));
  const sub = next.subscriptions.find((s) => s.id === id);
  // A new card settles a failed payment straight away (a different card always works in test mode).
  if (sub?.status === 'past_due') next = charge(next, sub, outcome === 'fails' && card.last4 === data.subscriptions.find((s) => s.id === id)?.card.last4 ? 'fails' : 'succeeds', wsPlan, new Date().toISOString(), true);
  return next;
}

export const giveFreeCycle = (data: CommerceData, id: string) =>
edit(data, id, (s, plan) => {
  const periodEnd = addInterval(s.periodEnd, plan?.interval ?? 'month');
  return withEv({ ...s, periodEnd }, ev(`Given a free ${plan ? intervalWord[plan.interval] : 'cycle'} — next charge ${subDate(periodEnd)}`, 'seller'));
});

export function refundLastPayment(data: CommerceData, id: string): CommerceData {
  return edit(data, id, (s) => {
    const idx = s.payments.findIndex((p) => p.status === 'paid');
    if (idx < 0) return s;
    const p = s.payments[idx];
    return withEv({ ...s, payments: s.payments.map((x, i) => i === idx ? { ...x, status: 'refunded' as const } : x) }, ev(`Refunded ${formatNgn(p.amountNgn)} (${p.label.toLowerCase()})`, 'seller'));
  });
}

export function lastPaid(s: Subscription): SubPayment | undefined {
  return s.payments.find((p) => p.status === 'paid');
}

/** Can the subscriber cancel themselves right now under the plan's notice rule? */
export function canSelfCancel(s: Subscription, plan: SubPlan | undefined, now = Date.now()): {ok: boolean;reason?: string;} {
  if (!plan || plan.rules.cancelAnyTime || s.status === 'trialing') return { ok: true };
  const cutoff = Date.parse(s.periodEnd) - plan.rules.noticeDays * DAY;
  return now <= cutoff ? { ok: true } : { ok: false, reason: `Cancelling needs ${plan.rules.noticeDays} days’ notice before a charge. You can cancel after ${subDate(s.periodEnd)}, before the following one.` };
}

/** Removes sample subscription records. */
export function clearSampleSubs(data: CommerceData): Pick<CommerceData, 'subPlans' | 'subscriptions'> {
  return { subPlans: data.subPlans.filter((p) => !p.sample), subscriptions: data.subscriptions.filter((s) => !s.sample) };
}