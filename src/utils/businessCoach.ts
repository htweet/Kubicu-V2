import type { CommerceData, Order, Product } from '../types/commerce';
import type { MoneyData } from '../types/money';
import { orderMoney } from './commerce/money';
import { balances, isVerified } from './money/store';
import { formatNgn } from './format';

/**
 * AI Business Coach (D104). Rule-based in the prototype and labelled “AI preview”:
 * every suggestion comes from the seller's own records and shows the numbers it's based on. It never invents figures.
 */

export const COACH_APP_ID = 'ai-coach';
export const COACH_PLAN = 'creator' as const;
/** AI credits per refreshed brief or answered question. */
export const COACH_COST = 1;

export type Impact = 'high' | 'medium' | 'low';

export interface CoachMove {
  id: string;
  impact: Impact;
  title: string;
  evidence: string;
  action: string;
  to: string;
}

export interface CoachBrief {
  revenue7: number;
  revenuePrev7: number;
  orders7: number;
  ordersPrev7: number;
  usedSample: boolean;
  moves: CoachMove[];
  basis: string;
}

export interface CoachAnswer {
  id: string;
  question: string;
  answer: string[];
  basis: string;
  at: string;
}

export interface CoachData {
  briefAt: string | null;
  done: string[];
  dismissed: string[];
  answers: CoachAnswer[];
}

export const emptyCoach = (): CoachData => ({ briefAt: null, done: [], dismissed: [], answers: [] });
export const coachKey = (workspaceId: string) => `kubicu.coach.${workspaceId}`;

export const coachQuestions = [
{ id: 'restock', label: 'What should I restock?' },
{ id: 'sell_more', label: 'How can I sell more this week?' },
{ id: 'slow', label: 'Which products aren’t selling?' },
{ id: 'customers', label: 'Who are my best customers?' },
{ id: 'money', label: 'Where is money waiting for me?' }] as
const;

export type CoachQuestionId = (typeof coachQuestions)[number]['id'];

const DAY = 86_400_000;
const paid = (o: Order) => o.paymentStatus !== 'pending' && o.paymentStatus !== 'cancelled' && o.status !== 'cancelled';
const within = (o: Order, from: number, to: number) => {
  const t = new Date(o.createdAt).getTime();
  return t >= from && t < to;
};
const stockOf = (p: Product) => p.variants.reduce((s, v) => s + v.stock, 0);
const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`;

function productSales(orders: Order[]) {
  const map = new Map<string, {name: string;qty: number;revenue: number;}>();
  for (const o of orders) {
    for (const i of o.items) {
      if (i.kind === 'ticket') continue;
      const cur = map.get(i.productId) ?? { name: i.name, qty: 0, revenue: 0 };
      cur.qty += i.qty;
      cur.revenue += i.unitPriceNgn * i.qty;
      map.set(i.productId, cur);
    }
  }
  return map;
}

function bestCustomers(orders: Order[]) {
  const map = new Map<string, {name: string;phone: string;count: number;spent: number;}>();
  for (const o of orders) {
    const key = o.customer.phone.replace(/\D/g, '') || o.customer.email || o.customer.name;
    const cur = map.get(key) ?? { name: o.customer.name, phone: o.customer.phone, count: 0, spent: 0 };
    cur.count += 1;
    cur.spent += orderMoney(o).gross - orderMoney(o).refunded;
    map.set(key, cur);
  }
  return Array.from(map.values()).sort((a, b) => b.spent - a.spent);
}

function waitingMoney(c: CommerceData, money: MoneyData, now: number) {
  const pending = c.orders.filter((o) => !o.pod && o.paymentStatus === 'pending' && o.status !== 'cancelled' && now - new Date(o.createdAt).getTime() > DAY);
  const balancesDue = c.orders.filter((o) => o.balance && !o.balance.paidAt && o.status !== 'cancelled');
  const b = balances(money);
  return {
    pending,
    pendingNgn: pending.reduce((s, o) => s + o.subtotalNgn - o.discountNgn + o.deliveryNgn, 0),
    balancesDue,
    balancesNgn: balancesDue.reduce((s, o) => s + (o.balance?.dueNgn ?? 0), 0),
    wallet: b,
    verified: isVerified(money)
  };
}

export function buildBrief(c: CommerceData, money: MoneyData, now = Date.now()): CoachBrief {
  const all = c.orders.filter(paid);
  const last7 = all.filter((o) => within(o, now - 7 * DAY, now + 1));
  const prev7 = all.filter((o) => within(o, now - 14 * DAY, now - 7 * DAY));
  const last30 = all.filter((o) => within(o, now - 30 * DAY, now + 1));
  const rev = (os: Order[]) => os.reduce((s, o) => s + orderMoney(o).gross - orderMoney(o).refunded, 0);
  const sales30 = productSales(last30);
  const products = c.products.filter((p) => p.kind !== 'ticket' && p.status !== 'archived');
  const moves: CoachMove[] = [];

  // Restock what is selling and nearly gone.
  for (const p of products) {
    const s = sales30.get(p.id);
    if (!p.trackStock || !s) continue;
    const left = stockOf(p);
    if (left <= Math.max(p.lowStockAt, 0)) {
      moves.push({ id: `restock:${p.id}`, impact: 'high', title: `Restock ${p.name}`, evidence: `${plural(s.qty, 'sale')} in 30 days and ${left} left.`, action: 'Update stock', to: '/app/commerce/inventory' });
    }
  }

  // Lead with the bestseller.
  const top = Array.from(sales30.entries()).sort((a, b) => b[1].revenue - a[1].revenue)[0];
  if (top) moves.push({ id: `feature:${top[0]}`, impact: 'medium', title: `Put ${top[1].name} first on your page`, evidence: `Your top seller: ${formatNgn(top[1].revenue)} from ${plural(top[1].qty, 'sale')} in 30 days.`, action: 'Open canvas', to: '/app/canvas' });

  // Products without photos don't sell.
  const noPhoto = products.filter((p) => p.status === 'active' && !p.images.length);
  if (noPhoto.length) moves.push({ id: 'photos', impact: 'medium', title: `Add photos to ${plural(noPhoto.length, 'product')}`, evidence: `${noPhoto.slice(0, 3).map((p) => p.name).join(', ')}${noPhoto.length > 3 ? '…' : ''} ${noPhoto.length === 1 ? 'has' : 'have'} no photo.`, action: 'Open products', to: '/app/commerce/products' });

  // Money waiting.
  const w = waitingMoney(c, money, now);
  if (w.balancesNgn > 0) moves.push({ id: 'balances', impact: 'high', title: `Collect ${formatNgn(w.balancesNgn)} in balances`, evidence: `${plural(w.balancesDue.length, 'made-to-order balance')} still unpaid.`, action: 'Open Opportunities', to: '/app/opportunities' });
  if (w.pending.length) moves.push({ id: 'pending', impact: 'medium', title: `Follow up ${plural(w.pending.length, 'unpaid order')}`, evidence: `${formatNgn(w.pendingNgn)} waiting for payment for over a day.`, action: 'Open orders', to: '/app/commerce/orders' });
  if (w.wallet.available > 0 && !w.verified) moves.push({ id: 'verify', impact: 'high', title: 'Finish verification to pay out', evidence: `${formatNgn(w.wallet.available)} is in your wallet and can’t be paid out until you’re verified.`, action: 'Start verification', to: '/app/commerce/verification' });

  // Reward repeat buyers.
  const repeat = bestCustomers(all).filter((x) => x.count >= 2);
  if (repeat.length) moves.push({ id: 'repeat', impact: 'low', title: `Thank your ${plural(repeat.length, 'repeat customer')}`, evidence: `${repeat[0].name} has ordered ${repeat[0].count} times. A referral code turns loyal buyers into new ones.`, action: 'Create a referral code', to: '/app/commerce/discounts' });

  // Slow movers.
  const slow = products.filter((p) => p.status === 'active' && !sales30.has(p.id) && now - new Date(p.createdAt).getTime() > 14 * DAY);
  if (slow.length) moves.push({ id: 'slow', impact: 'low', title: `Refresh ${plural(slow.length, 'quiet product')}`, evidence: `No sales in 30 days: ${slow.slice(0, 3).map((p) => p.name).join(', ')}${slow.length > 3 ? '…' : ''}. New photos or a short offer can help.`, action: 'Open products', to: '/app/commerce/products' });

  if (!all.length) moves.push({ id: 'first-sale', impact: 'high', title: 'Share your link where your customers already are', evidence: 'No paid orders yet. Most first sales come from WhatsApp status and Instagram bio links.', action: 'Get a QR code', to: '/app/domains' });

  const rank: Record<Impact, number> = { high: 0, medium: 1, low: 2 };
  moves.sort((a, b) => rank[a.impact] - rank[b.impact]);

  return {
    revenue7: rev(last7),
    revenuePrev7: rev(prev7),
    orders7: last7.length,
    ordersPrev7: prev7.length,
    usedSample: c.orders.some((o) => o.sample) || c.products.some((p) => p.sample),
    moves: moves.slice(0, 6),
    basis: `${plural(all.length, 'paid order')} and ${plural(products.length, 'product')}`
  };
}

export function answer(q: CoachQuestionId, c: CommerceData, money: MoneyData, now = Date.now()): {answer: string[];basis: string;} {
  const all = c.orders.filter(paid);
  const last30 = all.filter((o) => within(o, now - 30 * DAY, now + 1));
  const sales30 = productSales(last30);
  const products = c.products.filter((p) => p.kind !== 'ticket' && p.status !== 'archived');
  const basis30 = `${plural(last30.length, 'paid order')} in the last 30 days`;

  if (q === 'restock') {
    const rows = products.
    filter((p) => p.trackStock && sales30.has(p.id)).
    map((p) => {
      const s = sales30.get(p.id)!;
      const left = stockOf(p);
      const perWeek = s.qty / 4.3;
      return { p, left, perWeek, weeks: perWeek ? left / perWeek : Infinity };
    }).
    sort((a, b) => a.weeks - b.weeks).
    slice(0, 4);
    if (!rows.length) return { answer: ['Nothing that’s selling is running low. Products that track stock and sold in the last 30 days would appear here.'], basis: basis30 };
    return { answer: rows.map((r) => `${r.p.name}: ${r.left} left, selling about ${r.perWeek.toFixed(1)} a week${Number.isFinite(r.weeks) ? ` — roughly ${Math.max(0, Math.floor(r.weeks))} week${Math.floor(r.weeks) === 1 ? '' : 's'} of stock` : ''}.`), basis: basis30 };
  }

  if (q === 'slow') {
    const slow = products.filter((p) => p.status === 'active' && !sales30.has(p.id));
    if (!slow.length) return { answer: ['Every live product sold at least once in the last 30 days.'], basis: basis30 };
    return { answer: [...slow.slice(0, 5).map((p) => `${p.name}${p.images.length ? '' : ' — no photo yet'}${p.priceNgn ? ` · ${formatNgn(p.priceNgn)}` : ' · no price'}`), 'Try new photos, a clearer first line, or pairing it with your top seller.'], basis: basis30 };
  }

  if (q === 'customers') {
    const best = bestCustomers(all).slice(0, 5);
    if (!best.length) return { answer: ['No paid orders yet, so there are no customers to rank.'], basis: 'All paid orders' };
    return { answer: best.map((b) => `${b.name}: ${plural(b.count, 'order')}, ${formatNgn(b.spent)} spent.`), basis: `${plural(all.length, 'paid order')}, all time` };
  }

  if (q === 'money') {
    const w = waitingMoney(c, money, now);
    const lines: string[] = [];
    if (w.wallet.available) lines.push(`${formatNgn(w.wallet.available)} available in your wallet${w.verified ? ' — you can pay it out now.' : ', waiting on verification.'}`);
    if (w.wallet.pending) lines.push(`${formatNgn(w.wallet.pending)} settling, available within 24 hours.`);
    if (w.wallet.held) lines.push(`${formatNgn(w.wallet.held)} held in escrow until buyers confirm.`);
    if (w.balancesNgn) lines.push(`${formatNgn(w.balancesNgn)} in unpaid made-to-order balances.`);
    if (w.pendingNgn) lines.push(`${formatNgn(w.pendingNgn)} in orders still waiting for payment.`);
    return { answer: lines.length ? lines : ['No money is waiting right now.'], basis: 'Your wallet and open orders today' };
  }

  // sell_more
  const top = Array.from(sales30.entries()).sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 2);
  const lines: string[] = [];
  if (top.length) lines.push(`Lead with ${top.map((t) => t[1].name).join(' and ')} — ${top.length === 1 ? 'your best seller' : 'your two best sellers'} this month.`);
  const repeat = bestCustomers(all).filter((x) => x.count >= 2).length;
  if (repeat) lines.push(`Message your ${plural(repeat, 'repeat customer')} first; they already trust you.`);
  const noPhoto = products.filter((p) => p.status === 'active' && !p.images.length).length;
  if (noPhoto) lines.push(`Add photos to ${plural(noPhoto, 'product')} — products without photos rarely sell.`);
  lines.push('Post your page link on your WhatsApp status today, with one product and its price.');
  return { answer: lines, basis: basis30 };
}