import type { Automation, Contact, OpsData } from '../../types/ops';
import type { CommerceData, Order } from '../../types/commerce';
import { orderRef } from '../commerce/shopSettings';
import type { Workspace } from '../../types/workspace';
import { readSpacePage } from '../spaces';
import { readForms } from '../forms/storage';
import { campaignPhase } from '../campaign';
import { isLowStock, isSoldOut, totalStock } from '../commerce/catalog';
import { orderMoney } from '../commerce/money';
import { formatNgn, publicUrl } from '../format';
import { lastActivity, type LiveEvent } from './liveRuns';

const HOUR = 3600000;
const DAY = 24 * HOUR;
/** A checkout counts as left unfinished after this long without payment (D141). Example figure. */
export const ABANDON_AFTER_MS = HOUR;

interface Ctx {
  ops: OpsData;
  commerce: CommerceData;
  workspace: Workspace;
  now: number;
}

const first = (name: string) => name.trim().split(/\s+/)[0] || 'there';
const findContact = (ops: OpsData, email: string, phone: string): Contact | undefined =>
ops.contacts.find((c) => email && c.email.toLowerCase() === email.toLowerCase() || phone && c.phone.replace(/\D/g, '').slice(-10) === phone.replace(/\D/g, '').slice(-10));
const isPaid = (o: Order) => o.paymentStatus !== 'pending' && o.paymentStatus !== 'cancelled';

/** When the automation started listening. Anything before this is never replayed. */
export const liveSince = (a: Automation) => Date.parse(a.liveSince ?? a.updatedAt);

function orderEvent(a: Automation, o: Order, ctx: Ctx, key: string, subject: string): LiveEvent {
  const c = findContact(ctx.ops, o.customer.email, o.customer.phone);
  const total = orderMoney(o).gross;
  return {
    key,
    subject,
    vars: {
      first_name: first(o.customer.name),
      name: o.customer.name,
      order_number: orderRef(o),
      total: formatNgn(total),
      item: o.items[0]?.name ?? '',
      product: o.items[0]?.name ?? '',
      link: o.sourceHandle ? publicUrl(o.sourceHandle) : '',
      // The order's own page: pay a pending checkout, or follow an order (D230).
      cart_link: o.sourceHandle ? `${publicUrl(o.sourceHandle)}/order/${o.id}` : '',
      order_link: o.sourceHandle ? `${publicUrl(o.sourceHandle)}/order/${o.id}` : ''
    },
    total,
    source: 'order',
    subscribed: c ? c.consent === 'subscribed' : false,
    contactId: c?.id
  };
}

/**
 * Every real occurrence that could start this automation and hasn't fired yet (D137, D141).
 * In production these come from the server as they happen; the prototype looks for them every minute.
 */
export function eventsFor(a: Automation, fired: Set<string>, ctx: Ctx): LiveEvent[] {
  const { ops, commerce, workspace, now } = ctx;
  const since = liveSince(a);
  const out: LiveEvent[] = [];
  const push = (ev: LiveEvent) => {
    if (!fired.has(ev.key)) out.push(ev);
  };
  const after = (iso: string | null | undefined) => !!iso && Date.parse(iso) >= since && Date.parse(iso) <= now;

  switch (a.trigger) {
    case 'order_paid':
      for (const o of commerce.orders) if (!o.sample && isPaid(o) && after(o.createdAt)) push(orderEvent(a, o, ctx, `${a.id}:order:${o.id}`, `Order ${orderRef(o)} paid — ${o.customer.name}, ${formatNgn(orderMoney(o).gross)}`));
      break;

    case 'checkout_abandoned':
      for (const o of commerce.orders) {
        if (o.sample || o.paymentStatus !== 'pending' || o.status !== 'new' || o.pod || o.instalments) continue;
        if (!o.customer.phone && !o.customer.email) continue;
        if (now - Date.parse(o.createdAt) < ABANDON_AFTER_MS || Date.parse(o.createdAt) < since) continue;
        push(orderEvent(a, o, ctx, `${a.id}:abandoned:${o.id}`, `${o.customer.name} left checkout unpaid — ${o.items.map((i) => i.name).join(', ')}`));
      }
      break;

    case 'booking_created':
      for (const b of ops.bookings) {
        // Requests (D256) only count as booked once accepted, so "Confirm every booking" never confirms one early.
        if (b.sample || b.status === 'cancelled' || b.status === 'requested') continue;
        const created = b.events.length ? new Date(Math.min(...b.events.map((e) => Date.parse(e.at)))).toISOString() : b.start;
        if (!after(created)) continue;
        const c = findContact(ops, b.customer.email, b.customer.phone);
        push({ key: `${a.id}:booking:${b.id}`, subject: `${b.customer.name} booked ${b.serviceName}`, vars: { first_name: first(b.customer.name), name: b.customer.name, service: b.serviceName, time: new Date(b.start).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }), ref: b.ref }, total: b.priceNgn ?? 0, source: 'booking', subscribed: c ? c.consent === 'subscribed' : false, contactId: c?.id });
      }
      break;

    case 'lead_submitted':
      for (const c of ops.contacts) {
        if (c.sample) continue;
        for (const act of c.activity) {
          if (act.kind !== 'form' && act.kind !== 'newsletter' || !after(act.at)) continue;
          push({ key: `${a.id}:lead:${act.id}`, subject: `${c.name} — ${act.label}`, vars: { first_name: first(c.name), name: c.name, form: act.label }, total: 0, source: act.kind, subscribed: c.consent === 'subscribed', contactId: c.id });
        }
      }
      break;

    // Forms add-on (D195): every real response, optionally for one form only.
    case 'form_sent':{
        const forms = readForms(workspace.id);
        const names = new Map(forms.forms.map((f) => [f.id, f.name]));
        for (const s of forms.submissions) {
          if (s.sample || !after(s.createdAt)) continue;
          if (a.triggerFormId && s.formId !== a.triggerFormId) continue;
          const formName = names.get(s.formId) ?? 'a form';
          const c = findContact(ops, s.contactEmail, s.contactPhone ?? '');
          push({
            key: `${a.id}:form:${s.id}`,
            subject: `${s.contactName || 'Someone'} sent “${formName}”`,
            vars: { first_name: first(s.contactName), name: s.contactName, email: s.contactEmail, form: formName, total: s.payment ? formatNgn(s.payment.amountNgn) : '' },
            total: s.payment?.amountNgn ?? 0,
            source: s.source ?? 'form',
            subscribed: s.marketingConsent,
            contactId: c?.id
          });
        }
        break;
      }

    case 'stock_low':
      for (const p of commerce.products) {
        if (p.status !== 'active' || !p.trackStock) continue;
        const out_ = isSoldOut(p);
        if (!out_ && !isLowStock(p)) continue;
        push({ key: `${a.id}:stock:${p.id}:${out_ ? 'out' : 'low'}`, subject: out_ ? `${p.name} sold out` : `${p.name} is running low`, vars: { product: p.name, stock: String(totalStock(p)) }, total: 0, source: 'order', subscribed: true });
      }
      break;

    case 'sub_started':
    case 'sub_failed':
    case 'sub_cancelled':
      for (const s of commerce.subscriptions) {
        if (s.sample) continue;
        const plan = commerce.subPlans.find((p) => p.id === s.planId)?.name ?? 'a plan';
        const c = findContact(ops, s.customer.email, s.customer.phone);
        const base = { vars: { first_name: first(s.customer.name), name: s.customer.name, plan }, total: 0, source: 'order', subscribed: c ? c.consent === 'subscribed' : false, contactId: c?.id };
        if (a.trigger === 'sub_started' && after(s.startedAt)) push({ ...base, key: `${a.id}:subs:${s.id}`, subject: `${s.customer.name} subscribed to ${plan}${s.trialEndsAt ? ' (free trial)' : ''}` });
        if (a.trigger === 'sub_failed' && s.failedAt && after(s.failedAt)) push({ ...base, key: `${a.id}:subf:${s.id}:${s.failedAt}`, subject: `${s.customer.name}’s ${plan} payment failed` });
        if (a.trigger === 'sub_cancelled' && (s.status === 'cancelling' || s.status === 'ended' && s.cancelReason)) {
          const at = s.events[s.events.length - 1]?.at ?? s.endedAt;
          if (after(at)) push({ ...base, key: `${a.id}:subc:${s.id}`, subject: `${s.customer.name} cancelled ${plan}${s.cancelReason ? ` — “${s.cancelReason}”` : ''}` });
        }
      }
      break;

    case 'stage_due':
      for (const c of ops.contacts) {
        for (const t of c.tasks) {
          if (t.done || !t.due || !after(t.due)) continue;
          push({ key: `${a.id}:task:${t.id}`, subject: `Due: ${t.text} — ${c.name}`, vars: { first_name: first(c.name), name: c.name, task: t.text }, total: 0, source: c.sources[0] ?? 'manual', subscribed: c.consent === 'subscribed', contactId: c.id });
        }
      }
      for (const b of ops.bookings) {
        if (b.sample || b.status !== 'confirmed' || !b.balanceOnline || b.priceNgn === null) continue;
        const left = b.priceNgn - b.depositPaidNgn - (b.balancePaidNgn ?? 0);
        const due = Date.parse(b.start) - (b.balanceHoursBefore ?? 24) * HOUR;
        if (left <= 0 || due > now || due < since || Date.parse(b.start) < now) continue;
        const c = findContact(ops, b.customer.email, b.customer.phone);
        push({ key: `${a.id}:bal:${b.id}`, subject: `${b.customer.name}’s balance of ${formatNgn(left)} is due for ${b.serviceName}`, vars: { first_name: first(b.customer.name), name: b.customer.name, service: b.serviceName, total: formatNgn(left) }, total: left, source: 'booking', subscribed: c ? c.consent === 'subscribed' : false, contactId: c?.id });
      }
      for (const o of commerce.orders) {
        if (o.sample || !o.balance?.requestedAt || o.balance.paidAt || !after(o.balance.requestedAt)) continue;
        push({ ...orderEvent(a, o, ctx, `${a.id}:mto:${o.id}`, `Balance of ${formatNgn(o.balance.dueNgn)} due on order ${orderRef(o)}`), total: o.balance.dueNgn });
      }
      break;

    case 'contact_quiet':{
        const days = Math.max(7, a.triggerDays ?? 30);
        for (const c of ops.contacts) {
          const last = lastActivity(c);
          const quiet = Math.floor((now - last) / DAY);
          const key = `${a.id}:quiet:${c.id}:${last}`;
          if (quiet < days) continue;
          const lastItem = c.activity.find((x) => x.kind === 'order')?.label.replace(/^.*?:\s*/, '') ?? '';
          push({ key, subject: `${c.name} has been quiet for ${quiet} days`, vars: { first_name: first(c.name), days: String(quiet), last_item: lastItem }, total: 0, source: c.sources[0] ?? 'manual', subscribed: c.consent === 'subscribed', contactId: c.id });
        }
        break;
      }

    case 'campaign_started':
    case 'campaign_ended':
      for (const s of workspace.spaces ?? []) {
        if (s.archivedAt) continue;
        const pub = readSpacePage(workspace.id, s.id)?.published;
        if (!pub?.campaign) continue;
        const wanted = a.trigger === 'campaign_started' ? 'live' : 'ended';
        if (campaignPhase(pub.campaign) !== wanted) continue;
        const orders = commerce.orders.filter((o) => o.sourceHandle === pub.handle && isPaid(o));
        push({ key: `${a.id}:${wanted}:${s.id}:${pub.campaign.startsAt ?? ''}:${pub.campaign.endsAt ?? ''}`, subject: wanted === 'live' ? `“${s.name}” went live` : `“${s.name}” ended — ${orders.length} order${orders.length === 1 ? '' : 's'}`, vars: { campaign: s.name, link: publicUrl(pub.handle), orders: String(orders.length) }, total: 0, source: 'order', subscribed: true });
      }
      break;
  }
  return out;
}