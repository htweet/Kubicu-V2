import type { CommerceData, InstalmentEvery, InstalmentPart, Order, OrderEvent, OrderEventKind, PayOptions, PodFailReason, Product, ProductInstalments } from '../../types/commerce';
import type { WorkspacePlan } from '../../types/plan';
import { uid } from '../id';
import { formatNgn } from '../format';
import { isNaira } from '../currency';
import { kubicuFee, providerFee } from './money';
import { normalisePhone } from '../members';

/**
 * Pay on delivery and instalments (D112).
 * - Pay on delivery: very common for Nigerian online buying, where trust is still being built. Nothing is
 *   charged online; the rider or seller collects cash or a transfer at the door. Refusals are remembered by
 *   phone number so a seller can ask repeat refusers to pay online.
 * - Instalments: run by the seller, not a lender. No interest or fees are added; the first part is paid at
 *   checkout and the rest charged to the same card, with the subscription retry rules.
 */

export const POD_MAX_DEFAULT = 100_000;
export const INSTALMENT_MIN_NGN = 20_000;
export const INSTALMENT_RETRY_DAYS = [1, 3, 5];
const DAY = 86_400_000;

export const everyLabels: Record<InstalmentEvery, string> = { week: 'weekly', fortnight: 'every 2 weeks', month: 'monthly' };
export const everyWords: Record<InstalmentEvery, string> = { week: 'week', fortnight: '2 weeks', month: 'month' };
export const podFailLabels: Record<PodFailReason, string> = {
  refused: 'Customer refused to pay or take it',
  not_home: 'Customer wasn’t there',
  unreachable: 'Couldn’t reach the customer',
  wrong_address: 'Wrong or incomplete address',
  other: 'Something else'
};
export const acceptLabels: Record<PayOptions['pod']['accept'], string> = { cash: 'Cash', transfer: 'Transfer at the door', both: 'Cash or transfer' };

export function defaultPayOptions(): PayOptions {
  return { pod: { enabled: false, maxOrderNgn: POD_MAX_DEFAULT, zoneIds: null, accept: 'both', blockAfterRefusal: true }, instalments: { enabled: false } };
}

export function payOptionsOf(data: CommerceData | null): PayOptions {
  const d = defaultPayOptions();
  const p = data?.payOptions;
  return p ? { pod: { ...d.pod, ...p.pod }, instalments: { ...d.instalments, ...p.instalments } } : d;
}

function stamp(o: Order, kind: OrderEventKind, label: string, at = new Date().toISOString()): OrderEvent[] {
  return [{ id: uid('ev'), kind, label, at }, ...o.events];
}

// ——— Pay on delivery ———

/** Earlier pay-on-delivery orders this phone refused. */
export function refusalsFor(data: CommerceData | null, phone: string): number {
  const p = normalisePhone(phone);
  if (!data || p.length < 10) return 0;
  return data.orders.filter((o) => normalisePhone(o.customer.phone) === p && o.pod?.failed?.some((f) => f.reason === 'refused')).length;
}

export type OptionCheck = {ok: true;} | {ok: false;reason: string;hidden?: boolean;};

export function podCheck(
data: CommerceData | null,
ctx: {total: number;zoneId: string | null;zoneName?: string;onlyPhysical: boolean;balanceLater: number;dealRoom: boolean;phone: string;bundle?: boolean;})
: OptionCheck {
  const o = payOptionsOf(data).pod;
  // Pay on delivery is a Nigeria-only option (D136).
  if (!isNaira()) return { ok: false, reason: '', hidden: true };
  if (!o.enabled || !ctx.onlyPhysical || ctx.dealRoom || ctx.balanceLater > 0) return { ok: false, reason: '', hidden: true };
  // Cash at the door can't be split between two businesses (D122).
  if (ctx.bundle) return { ok: false, reason: 'Not for things sold with a partner — pay online so each business gets its share.' };
  if (!ctx.zoneId) return { ok: false, reason: 'Only for delivery — pay online for pickup.' };
  if (o.zoneIds && !o.zoneIds.includes(ctx.zoneId)) return { ok: false, reason: `Not offered for delivery to ${ctx.zoneName ?? 'this area'}.` };
  if (ctx.total > o.maxOrderNgn) return { ok: false, reason: `Only for orders up to ${formatNgn(o.maxOrderNgn)}.` };
  if (o.blockAfterRefusal && refusalsFor(data, ctx.phone) > 0) return { ok: false, reason: 'Not available for this phone number — please pay online.' };
  return { ok: true };
}

export function podAwaiting(o: Order): boolean {
  return !!o.pod && !o.pod.collected && o.status !== 'cancelled' && o.status !== 'refunded';
}

/** Collected at the door. Cash and transfers go to the seller directly, so there's no provider fee. */
export function collectPod(data: CommerceData, orderId: string, how: 'cash' | 'transfer', plan: WorkspacePlan, label?: string): CommerceData {
  return {
    ...data,
    orders: data.orders.map((o) => {
      if (o.id !== orderId || !o.pod || o.pod.collected) return o;
      const at = new Date().toISOString();
      return {
        ...o,
        status: 'completed',
        paymentStatus: 'paid',
        providerFeeNgn: 0,
        kubicuFeeNgn: kubicuFee(o.pod.amountNgn, plan),
        pod: { ...o.pod, collected: { how, at } },
        events: stamp(o, 'completed', label ?? `Delivered — ${formatNgn(o.pod.amountNgn)} collected by ${how === 'cash' ? 'cash' : 'transfer'}`, at)
      };
    })
  };
}

/** The delivery didn't go through. The order comes back to packing so it can be rebooked or cancelled. */
export function failPod(data: CommerceData, orderId: string, reason: PodFailReason, note: string): CommerceData {
  return {
    ...data,
    orders: data.orders.map((o) => {
      if (o.id !== orderId || !o.pod || o.pod.collected) return o;
      const at = new Date().toISOString();
      return {
        ...o,
        status: 'packing',
        pod: { ...o.pod, failed: [...(o.pod.failed ?? []), { at, reason, note: note || undefined }] },
        events: stamp(o, 'note', `Delivery failed, not paid — ${podFailLabels[reason].toLowerCase()}${note ? ` (${note})` : ''}. Back with you to rebook or cancel.`, at)
      };
    })
  };
}

// ——— Instalments ———

/** The plan a cart can use: fewest parts, shortest gap and the stricter shipping rule across its products. */
export function instalmentCheck(
data: CommerceData | null,
ctx: {products: (Product | undefined)[];total: number;balanceLater: number;dealRoom: boolean;})
: (OptionCheck & {ok: false;}) | {ok: true;plan: ProductInstalments;} {
  if (!isNaira()) return { ok: false, reason: '', hidden: true };
  if (!payOptionsOf(data).instalments.enabled || ctx.dealRoom || ctx.balanceLater > 0 || ctx.products.length === 0) return { ok: false, reason: '', hidden: true };
  const plans = ctx.products.map((p) => p && p.kind !== 'ticket' ? p.instalments : undefined);
  if (plans.every((p) => !p)) return { ok: false, reason: '', hidden: true };
  if (ctx.products.some((p) => p?.bundle)) return { ok: false, reason: 'Not for things sold with a partner — pay online so each business gets its share.' };
  if (plans.some((p) => !p)) return { ok: false, reason: 'Only when everything in your cart can be paid in parts.' };
  if (ctx.total < INSTALMENT_MIN_NGN) return { ok: false, reason: `For orders of ${formatNgn(INSTALMENT_MIN_NGN)} or more.` };
  const list = plans as ProductInstalments[];
  const rank: Record<InstalmentEvery, number> = { week: 0, fortnight: 1, month: 2 };
  return {
    ok: true,
    plan: {
      parts: Math.min(...list.map((p) => p.parts)) as ProductInstalments['parts'],
      every: list.reduce<InstalmentEvery>((m, p) => rank[p.every] < rank[m] ? p.every : m, 'month'),
      ship: list.some((p) => p.ship === 'last') ? 'last' : 'first'
    }
  };
}

function addInterval(start: number, every: InstalmentEvery, i: number): string {
  if (every === 'month') {
    const d = new Date(start);
    d.setMonth(d.getMonth() + i);
    return d.toISOString();
  }
  return new Date(start + i * (every === 'week' ? 7 : 14) * DAY).toISOString();
}

/** Equal parts; the first absorbs any odd naira so later charges are round. */
export function schedule(total: number, plan: ProductInstalments, start = Date.now()): {n: number;dueAt: string;amountNgn: number;}[] {
  const each = Math.floor(total / plan.parts);
  return Array.from({ length: plan.parts }, (_, i) => ({ n: i + 1, dueAt: i === 0 ? new Date(start).toISOString() : addInterval(start, plan.every, i), amountNgn: i === 0 ? total - each * (plan.parts - 1) : each }));
}

export function newParts(total: number, plan: ProductInstalments, start = Date.now()): InstalmentPart[] {
  return schedule(total, plan, start).map((p) => ({
    id: uid('ip'),
    ...p,
    status: p.n === 1 ? 'paid' : 'scheduled',
    paidAt: p.n === 1 ? new Date(start).toISOString() : undefined,
    how: p.n === 1 ? 'card' : undefined,
    retries: 0
  }));
}

export function instalmentsOwed(o: Order): number {
  if (!o.instalments) return 0;
  return o.instalments.parts.filter((p) => p.status === 'scheduled' || p.status === 'failed').reduce((s, p) => s + p.amountNgn, 0);
}

export function nextPart(o: Order): InstalmentPart | undefined {
  return o.instalments?.parts.find((p) => p.status === 'failed' || p.status === 'scheduled');
}

/** When the next automatic attempt for a part happens, or null when none is planned. */
export function nextAttemptAt(p: InstalmentPart): string | null {
  if (p.status === 'scheduled') return p.dueAt;
  if (p.status === 'failed' && p.failedAt && p.retries < INSTALMENT_RETRY_DAYS.length) return new Date(Date.parse(p.failedAt) + INSTALMENT_RETRY_DAYS[p.retries] * DAY).toISOString();
  return null;
}

function markPaid(o: Order, partId: string, how: 'card' | 'online' | 'recorded', at: string): Order {
  if (!o.instalments) return o;
  const part = o.instalments.parts.find((p) => p.id === partId);
  if (!part || part.status === 'paid' || part.status === 'cancelled') return o;
  const charged = o.subtotalNgn - o.discountNgn + o.deliveryNgn - instalmentsOwed(o);
  const rate = charged > 0 ? o.kubicuFeeNgn / charged : 0;
  const parts = o.instalments.parts.map((p) => p.id === partId ? { ...p, status: 'paid' as const, paidAt: at, how } : p);
  const done = parts.every((p) => p.status === 'paid' || p.status === 'cancelled');
  const total = parts.length;
  const words = how === 'recorded' ? 'recorded as paid by you' : how === 'online' ? 'paid online by the customer (test)' : 'charged to the saved card (test)';
  return {
    ...o,
    providerFeeNgn: o.providerFeeNgn + (how === 'recorded' ? 0 : providerFee(part.amountNgn)),
    kubicuFeeNgn: o.kubicuFeeNgn + (how === 'recorded' ? 0 : Math.round(part.amountNgn * rate)),
    instalments: { ...o.instalments, parts, status: done ? 'completed' : o.instalments.status === 'defaulted' ? 'active' : o.instalments.status },
    events: stamp(o, 'paid', `Instalment ${part.n} of ${total} — ${formatNgn(part.amountNgn)} ${words}${done ? '. Fully paid.' : ''}`, at)
  };
}

export function payPart(data: CommerceData, orderId: string, partId: string, how: 'card' | 'online' | 'recorded'): CommerceData {
  const at = new Date().toISOString();
  return { ...data, orders: data.orders.map((o) => o.id === orderId ? markPaid(o, partId, how, at) : o) };
}

/** Runs every automatic charge that's due. Returns what was paid so the wallet can be credited. */
export function chargeDueParts(data: CommerceData, outcome: 'succeeds' | 'fails', now = Date.now()): {data: CommerceData;paid: {order: Order;part: InstalmentPart;}[];} {
  const paid: {order: Order;part: InstalmentPart;}[] = [];
  const at = new Date(now).toISOString();
  const orders = data.orders.map((o) => {
    if (!o.instalments || o.instalments.status !== 'active' || o.sample || o.status === 'cancelled' || o.status === 'refunded') return o;
    let next = o;
    for (const part of o.instalments.parts) {
      const when = nextAttemptAt(part);
      if (!when || Date.parse(when) > now) continue;
      if (outcome === 'succeeds') {
        next = markPaid(next, part.id, 'card', at);
        paid.push({ order: o, part });
        continue;
      }
      const retries = part.status === 'failed' ? part.retries + 1 : 0;
      const defaulted = part.status === 'failed' && retries >= INSTALMENT_RETRY_DAYS.length;
      const parts = next.instalments!.parts.map((p) => p.id === part.id ? { ...p, status: 'failed' as const, failedAt: p.failedAt ?? at, retries } : p);
      next = {
        ...next,
        instalments: { ...next.instalments!, parts, status: defaulted ? 'defaulted' : 'active' },
        events: stamp(
          next,
          'payment',
          defaulted ?
          `Instalment ${part.n} still unpaid after every retry — marked as defaulted. Contact the customer or cancel what’s left.` :
          `Instalment ${part.n} — card declined (test). ${part.status === 'failed' ? 'Retry' : 'Trying again'} in ${INSTALMENT_RETRY_DAYS[retries]} day${INSTALMENT_RETRY_DAYS[retries] === 1 ? '' : 's'}.`,
          at
        )
      };
      break; // later parts wait for this one
    }
    return next;
  });
  return { data: { ...data, orders }, paid };
}

/** Stops the remaining charges. Whatever was paid stays paid; refund it separately if needed. */
export function cancelRemaining(data: CommerceData, orderId: string, reason: string): CommerceData {
  return {
    ...data,
    orders: data.orders.map((o) => {
      if (o.id !== orderId || !o.instalments) return o;
      const left = instalmentsOwed(o);
      return {
        ...o,
        instalments: { ...o.instalments, status: 'cancelled', parts: o.instalments.parts.map((p) => p.status === 'scheduled' || p.status === 'failed' ? { ...p, status: 'cancelled' as const } : p) },
        events: stamp(o, 'note', `Remaining instalments (${formatNgn(left)}) cancelled${reason ? ` — ${reason}` : ''}. Nothing more will be charged.`)
      };
    })
  };
}

export function updateInstalmentCard(data: CommerceData, orderId: string, card: {brand: 'Visa' | 'Mastercard' | 'Verve';last4: string;}): CommerceData {
  return {
    ...data,
    orders: data.orders.map((o) => o.id === orderId && o.instalments ? { ...o, instalments: { ...o.instalments, card }, events: stamp(o, 'note', `Customer updated the card for instalments to ${card.brand} ····${card.last4}`) } : o)
  };
}

/** True while instalments should stop the order going out (seller chose "after the last part"). */
export function instalmentsBlockDispatch(o: Order): boolean {
  return !!o.instalments && o.instalments.ship === 'last' && o.instalments.status !== 'cancelled' && instalmentsOwed(o) > 0;
}