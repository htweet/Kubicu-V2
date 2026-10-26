import { useMemo } from 'react';
import type { AppNotification } from '../types/notifications';
import { useCommerce } from '../contexts/CommerceContext';
import { useOps } from '../contexts/OpsContext';
import { useTeam } from '../contexts/TeamContext';
import { useBilling } from '../contexts/BillingContext';
import { useDomains } from '../contexts/DomainsContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { usePlan } from '../contexts/PlanContext';
import { useAiUsage } from './useAiUsage';
import { useFormsStore } from './useFormsStore';
import { useMoney } from './useMoney';
import { useServiceOs } from './useServiceOs';
import { SERVICE_OS_APP_ID } from '../utils/serviceOs';
import { dueUnrequested, hasStages } from '../utils/milestones';
import { bookingBalance } from '../utils/ops/balance';
import { useMarketplace } from '../contexts/MarketplaceContext';
import { FORMS_EXTENSION_ID } from '../utils/forms/storage';
import { isLowStock, isSoldOut } from '../utils/commerce/catalog';
import { readSpacePage } from '../utils/spaces';
import { roomProgress } from '../utils/dealRoom';
import { campaignPhase } from '../utils/campaign';
import { daysUntil, formatDate, isPaidPlan } from '../utils/billing';
import { formatNgn } from '../utils/format';
import { orderMoney } from '../utils/commerce/money';
import { TRIAL_REMINDER_DAYS } from '../data/billing';
import { readTemplateStore } from '../utils/templateListings';
import { readAdminStore } from '../utils/admin/store';
import { fundraiserGoalFor } from '../utils/fundraiser';
import { useFulfilment } from './useFulfilment';
import { buildTracking, promiseLabel } from '../utils/commerce/tracking';
import { destinationExists, destinationLabel, encodeDestination, fallbackDestination } from '../utils/domains/links';

const DAY = 86400000;
const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

/** Every notification the workspace's live data implies right now, before role and preference filtering (D66). */
export function useNotificationFeed(): AppNotification[] {
  const commerce = useCommerce().data;
  const ops = useOps().data;
  const team = useTeam();
  const billing = useBilling().data;
  const domains = useDomains().data;
  const { current } = useWorkspace();
  const plan = usePlan();
  const ai = useAiUsage();
  const formsActive = useMarketplace().isActive(FORMS_EXTENSION_ID);
  const forms = useFormsStore(formsActive ? current.id : null).data;
  const money = useMoney(current.id).data;
  const quotesActive = useMarketplace().isActive(SERVICE_OS_APP_ID);
  const serviceOs = useServiceOs(current.id).data;
  const fulfilment = useFulfilment(current.id).data;

  return useMemo(() => {
    const out: AppNotification[] = [];
    const now = Date.now();
    const today = startOfToday();

    for (const o of commerce.orders) {
      if (o.status === 'paid')
      out.push({ id: `order_paid:${o.id}`, event: 'order_paid', area: 'orders', kind: 'action', text: `Order #${o.number} from ${o.customer.name} is paid — ready to pack${o.held ? ' (held for DealRoom goal)' : ''}`, href: '/app/commerce/orders?status=paid', at: o.createdAt });
      if (o.status === 'new') out.push({ id: `order_pending:${o.id}`, event: 'order_pending', area: 'orders', kind: 'update', text: `Order #${o.number} from ${o.customer.name} is waiting for payment`, href: '/app/commerce/orders?status=new', at: o.createdAt });
      // Delivery tracking (D144): late, or a failed delivery attempt.
      const tv = buildTracking(o, fulfilment, now);
      if (tv.applies && (tv.health === 'late' || tv.health === 'problem' && !o.dispute))
      out.push({
        id: `order_late:${o.id}:${tv.health}`,
        event: 'order_late',
        area: 'orders',
        kind: 'action',
        text: tv.health === 'late' && tv.promisedBy ? `Order #${o.number} for ${o.customer.name} is running late — promised by ${promiseLabel(tv.promisedBy)}` : `Delivery for order #${o.number} (${o.customer.name}) didn’t go through — arrange another try`,
        href: `/app/commerce/orders?order=${o.id}`,
        at: tv.promisedBy && tv.health === 'late' ? tv.promisedBy : tv.lastUpdateAt
      });
      if (o.dispute?.status === 'needs_response')
      out.push({ id: `dispute:${o.dispute.id}`, event: 'dispute', area: 'orders', kind: 'action', text: `Dispute on order #${o.number} (${formatNgn(o.dispute.amountNgn)}) — respond by ${formatDate(o.dispute.respondBy)}`, href: '/app/commerce/orders', at: o.dispute.openedAt });
    }

    // Milestone payments (D95): quote stages due but not requested, booking balances due.
    if (quotesActive)
    for (const q of serviceOs.quotes) {
      if (!hasStages(q)) continue;
      for (const r of dueUnrequested(serviceOs, q))
      out.push({ id: `stage_due:${q.id}:${r.m.id}`, event: 'stage_due', area: 'orders', kind: 'action', text: `“${r.m.label}” (${formatNgn(r.amount)}) is due on ${q.client.name}’s quote — request payment`, href: '/app/services', at: q.decidedAt ?? q.createdAt });
    }
    for (const b of ops.bookings) {
      if (b.status !== 'confirmed' && b.status !== 'pending_deposit') continue;
      const bal = bookingBalance(b, ops.services.find((s) => s.id === b.serviceId), now);
      if (bal.state === 'overdue')
      out.push({ id: `balance_due:${b.id}`, event: 'stage_due', area: 'bookings', kind: 'action', text: `${b.customer.name}’s ${b.serviceName} balance (${formatNgn(bal.amount)}) is overdue`, href: `/app/bookings?booking=${b.id}`, at: new Date(bal.dueAt ?? now).toISOString() });
    }

    // Instalments that failed (D112).
    for (const o of commerce.orders) {
      const failed = o.instalments && (o.instalments.status === 'active' || o.instalments.status === 'defaulted') ? o.instalments.parts.find((p) => p.status === 'failed') : undefined;
      if (failed && o.instalments)
      out.push({ id: `inst_failed:${o.id}:${failed.id}:${failed.retries}`, event: 'stage_due', area: 'orders', kind: 'action', text: `Instalment ${failed.n} of ${o.instalments.parts.length} on order #${o.number} (${formatNgn(failed.amountNgn)}) ${o.instalments.status === 'defaulted' ? 'is unpaid after every retry' : 'didn’t go through — retrying'}`, href: `/app/commerce/orders?order=${o.id}`, at: failed.failedAt ?? failed.dueAt });
    }

    // Escrow: buyer problems to answer, and KUBICU decisions (D94).
    for (const c of money.escrow) {
      const d = c.dispute;
      if (!d) continue;
      const href = `/app/commerce/orders?order=${c.orderId}`;
      if (c.stage === 'disputed' && !d.response)
      out.push({ id: `escrow_dispute:${d.id}`, event: 'escrow', area: 'orders', kind: 'action', text: `${c.buyerName} reported a problem with order #${c.orderNumber} (${formatNgn(c.grossNgn)} in escrow) — reply by ${formatDate(d.respondBy)}`, href, at: d.openedAt });
      if (c.stage === 'escalated' && d.escalatedAt)
      out.push({ id: `escrow_escalated:${d.id}`, event: 'escrow', area: 'orders', kind: 'update', text: `Order #${c.orderNumber}’s escrow problem is with KUBICU to decide`, href, at: d.escalatedAt });
      if (d.decision)
      out.push({ id: `escrow_decided:${d.id}`, event: 'escrow', area: 'orders', kind: 'update', text: `KUBICU decided order #${c.orderNumber}: ${d.decision.outcome === 'release' ? 'released to you' : d.decision.outcome === 'refund' ? 'refunded to the buyer' : `${formatNgn(d.decision.partialNgn ?? 0)} back to the buyer`}`, href, at: d.decision.at });
    }

    // Fundraisers (D179): new gifts this week, goal reached, and staff pauses.
    const pausedFunds = readAdminStore().pausedFundraisers ?? {};
    for (const l of money.links) {
      if (!l.fundraiser) continue;
      const href = '/app/spaces';
      l.payments.
      filter((p) => !p.refundedNgn && now - Date.parse(p.at) <= 7 * 86400000).
      forEach((p) => out.push({ id: `fund_gift:${p.id}`, event: 'fundraiser', area: 'pages', kind: 'update', text: `${p.showName && p.payerName ? p.payerName.split(' ')[0] : 'Someone'} gave ${formatNgn(p.amountNgn)} to ${l.title}`, href, at: p.at }));
      const raised = l.payments.reduce((s, p) => s + p.amountNgn - (p.refundedNgn ?? 0), 0);
      const goal = fundraiserGoalFor(current, l.fundraiser.handle);
      if (goal && raised >= goal) {
        // When the running total first crossed the goal.
        let sum = 0;
        let crossing: string | null = null;
        for (const p of [...l.payments].sort((a, b) => Date.parse(a.at) - Date.parse(b.at))) {
          sum += p.amountNgn - (p.refundedNgn ?? 0);
          if (sum >= goal) {
            crossing = p.at;
            break;
          }
        }
        out.push({ id: `fund_goal:${l.id}:${goal}`, event: 'fundraiser', area: 'pages', kind: 'update', text: `${l.title} reached its ${formatNgn(goal)} goal`, href, at: crossing ?? new Date(now).toISOString() });
      }
      const pause = pausedFunds[l.fundraiser.handle];
      if (pause) out.push({ id: `fund_paused:${l.id}:${pause.at}`, event: 'fundraiser', area: 'pages', kind: 'action', text: `KUBICU paused ${l.title} while it reviews a report — visitors can’t pay until it’s resumed`, href, at: pause.at });
    }

    // Template review outcomes for this workspace's listings (D70).
    for (const l of readTemplateStore().listings) {
      if (l.workspaceId !== current.id) continue;
      const decision = l.events.find((e) => e.by === 'staff');
      if (decision && now - Date.parse(decision.at) <= 14 * 86400000)
      out.push({ id: `tpl_review:${decision.id}`, event: 'team_notice', area: 'team', kind: l.status === 'changes_requested' ? 'action' : 'update', text: `Template “${l.name}”: ${decision.label}`, href: '/app/templates?tab=mine', at: decision.at });
    }

    // Customer subscriptions (D69).
    for (const s of commerce.subscriptions ?? []) {
      const planName = commerce.subPlans.find((p) => p.id === s.planId)?.name ?? 'a plan';
      if (now - Date.parse(s.startedAt) <= 7 * 86400000)
      out.push({ id: `sub_new:${s.id}`, event: 'sub_new', area: 'orders', kind: 'update', text: `${s.customer.name} ${s.trialEndsAt ? 'started a trial of' : 'subscribed to'} ${planName}`, href: '/app/commerce/subscriptions', at: s.startedAt });
      if (s.status === 'past_due' && s.failedAt)
      out.push({ id: `sub_failed:${s.id}:${s.failedAt}`, event: 'sub_failed', area: 'orders', kind: 'action', text: `${s.customer.name}’s ${planName} payment failed — retrying automatically`, href: '/app/commerce/subscriptions', at: s.failedAt });
      const cancelled = s.events.find((e) => e.label.startsWith('Cancelled'));
      if ((s.status === 'cancelling' || s.status === 'ended') && cancelled && now - Date.parse(cancelled.at) <= 14 * 86400000)
      out.push({ id: `sub_cancelled:${s.id}`, event: 'sub_cancelled', area: 'orders', kind: 'update', text: `${s.customer.name} cancelled ${planName}${s.cancelReason ? ` — “${s.cancelReason}”` : ''}`, href: '/app/commerce/subscriptions', at: cancelled.at });
    }

    for (const p of commerce.products) {
      if (p.status !== 'active') continue;
      const sold = isSoldOut(p);
      if (p.kind === 'ticket') {
        // Events (D73): a ticket type selling out, or seats running low.
        const ev = (commerce.events ?? []).find((e) => e.id === p.eventId);
        if (!ev) continue;
        p.variants.forEach((v) => {
          const name = ev.ticketTypes.find((t) => t.id === v.id)?.name ?? 'Tickets';
          if (v.stock <= 0) out.push({ id: `stock:${p.id}:${v.id}:out`, event: 'stock', area: 'stock', kind: 'update', text: `${name} for ${ev.name} sold out`, href: `/app/commerce/events?edit=${ev.id}`, at: p.updatedAt });else
          if (v.stock <= p.lowStockAt) out.push({ id: `stock:${p.id}:${v.id}:low`, event: 'stock', area: 'stock', kind: 'update', text: `Only ${v.stock} ${name} left for ${ev.name}`, href: `/app/commerce/events?edit=${ev.id}`, at: p.updatedAt });
        });
        continue;
      }
      if (sold || isLowStock(p)) out.push({ id: `stock:${p.id}:${sold ? 'out' : 'low'}`, event: 'stock', area: 'stock', kind: 'action', text: sold ? `${p.name} is sold out` : `${p.name} is running low`, href: '/app/commerce/inventory', at: p.updatedAt });
    }

    const todayKey = new Date().toDateString();
    for (const b of ops.bookings) {
      if (b.status === 'confirmed' && new Date(b.start).toDateString() === todayKey)
      out.push({ id: `booking_today:${b.id}`, event: 'booking_today', area: 'bookings', kind: 'update', text: `${b.serviceName} with ${b.customer.name} today at ${new Date(b.start).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`, href: '/app/bookings', at: today });
      if (b.status === 'cancelled') {
        const at = b.events[b.events.length - 1]?.at ?? b.start;
        if (now - Date.parse(at) < 7 * DAY) out.push({ id: `booking_cancelled:${b.id}`, event: 'booking_cancelled', area: 'bookings', kind: 'update', text: `${b.customer.name} cancelled ${b.serviceName} (${formatDate(b.start)})`, href: '/app/bookings', at });
      }
    }

    for (const c of ops.contacts) {
      if (c.stage === 'new' && c.sources.includes('form')) out.push({ id: `lead_new:${c.id}`, event: 'lead_new', area: 'audience', kind: 'action', text: `New lead: ${c.name}`, href: '/app/audience', at: c.createdAt });
      for (const t of c.tasks) {
        if (!t.done && t.due && Date.parse(t.due) < now + DAY && (!t.assigneeId || t.assigneeId === team.me.id))
        out.push({ id: `task_due:${t.id}`, event: 'task_due', area: 'audience', kind: 'action', text: `Follow up with ${c.name}: ${t.text}`, href: '/app/audience', at: t.due });
      }
    }

    // Forms add-on responses (D79): unread responses from the last week.
    if (forms) {
      for (const s of forms.submissions) {
        if (s.status !== 'new' || now - Date.parse(s.createdAt) > 7 * DAY) continue;
        const form = forms.forms.find((f) => f.id === s.formId);
        if (!form) continue;
        out.push({ id: `form_response:${s.id}`, event: 'form_response', area: 'audience', kind: 'action', text: `${s.contactName || 'Someone'} sent “${form.name}”${s.payment ? ` and paid ${formatNgn(s.payment.amountNgn)} (test)` : ''}`, href: `/app/forms/${form.id}?tab=responses&response=${s.id}`, at: s.createdAt });
      }
    }

    for (const r of team.data.reviews) {
      if (r.status === 'pending' && r.requestedById !== team.me.id)
      out.push({ id: `review_pending:${r.id}:${r.updatedAt}`, event: 'review_pending', area: 'pages', kind: 'action', text: `${r.requestedBy} sent ${r.spaceName} for review`, href: '/app/settings/approvals', at: r.updatedAt });
    }
    for (const n of team.myNotices) out.push({ id: `team_notice:${n.id}`, event: 'team_notice', area: 'team', kind: 'update', text: n.text, href: n.href ?? '/app', at: n.at, noticeId: n.id });

    if (billing.status === 'past_due' && billing.graceEndsAt)
    out.push({ id: `payment_failed:${billing.graceEndsAt}`, event: 'payment_failed', area: 'billing', kind: 'action', text: `Plan payment failed — update your card within ${daysUntil(billing.graceEndsAt)} days to keep ${plan.name}`, href: '/app/settings/billing', at: billing.invoices.find((i) => i.status === 'failed')?.issuedAt ?? new Date(now).toISOString() });
    if (billing.trial && daysUntil(billing.trial.endsAt) <= TRIAL_REMINDER_DAYS)
    out.push({ id: `trial_ending:${billing.trial.endsAt}`, event: 'trial_ending', area: 'billing', kind: 'action', text: `Your trial ends ${formatDate(billing.trial.endsAt)} — choose a plan to keep its features`, href: '/app/settings/billing', at: new Date(Date.parse(billing.trial.endsAt) - TRIAL_REMINDER_DAYS * DAY).toISOString() });
    if (isPaidPlan(plan.id) && !billing.trial && billing.status === 'active' && billing.periodEnd && billing.pendingPlan !== 'free' && daysUntil(billing.periodEnd) <= 7)
    out.push({ id: `renewal_soon:${billing.periodEnd}`, event: 'renewal_soon', area: 'billing', kind: 'update', text: `${plan.name} renews on ${formatDate(billing.periodEnd)}${billing.card ? '' : ' — add a card first'}`, href: '/app/settings/billing', at: new Date(Date.parse(billing.periodEnd) - 7 * DAY).toISOString() });

    if (ai.limit > 0 && ai.remaining <= Math.ceil(ai.limit * 0.2))
    out.push({ id: `ai_low:${new Date().toISOString().slice(0, 7)}:${ai.remaining === 0 ? 0 : 1}`, event: 'ai_low', area: 'ai', kind: 'update', text: ai.remaining === 0 ? `AI credits used up — they reset ${ai.resetsOn}` : `${ai.remaining} AI credits left this month`, href: '/app/settings/billing', at: today });

    for (const dmn of domains.domains) {
      if (dmn.status === 'problem') out.push({ id: `domain_status:${dmn.id}:problem`, event: 'domain_status', area: 'domains', kind: 'action', text: `${dmn.host} needs attention — the DNS record doesn’t match`, href: '/app/domains', at: dmn.checkedAt ?? dmn.createdAt });
      if (dmn.status === 'live' && dmn.liveAt && now - Date.parse(dmn.liveAt) < 7 * DAY) out.push({ id: `domain_status:${dmn.id}:live`, event: 'domain_status', area: 'domains', kind: 'update', text: `${dmn.host} is live`, href: '/app/domains', at: dmn.liveAt });
    }

    // Links and QR codes whose page, product, block or space was removed (D72). Scans fall back, but the owner should re-point them.
    for (const l of domains.links) {
      if (l.archivedAt || destinationExists(current, commerce, l.destination)) continue;
      const qr = domains.qrs.find((q) => q.linkId === l.id);
      const to = destinationLabel(current, commerce, fallbackDestination(current, commerce, l.destination), ops.services);
      out.push({
        id: `link_broken:${l.id}:${encodeDestination(l.destination)}`,
        event: 'domain_status',
        area: 'domains',
        kind: 'action',
        text: `${qr ? 'QR code' : 'Link'} “${l.name}” points to something you removed — scans go to ${to} until you choose a new destination`,
        href: qr ? `/app/qr?link=${l.id}` : '/app/campaign-links',
        at: today
      });
    }

    for (const s of current.spaces ?? []) {
      if (s.archivedAt) continue;
      const page = readSpacePage(current.id, s.id);
      const pub = page?.published;
      if (!pub || !page.publishedAt) continue;
      if (pub.dealRoom) {
        const st = roomProgress(pub.dealRoom, pub.handle, commerce).state;
        const text = st === 'goal_reached' ? `${s.name} reached its goal` : st === 'ended_missed' ? `${s.name} missed its goal — buyers were refunded` : st === 'ended_success' ? `${s.name} has ended` : st === 'sold_out' ? `${s.name} sold out` : null;
        if (text) out.push({ id: `dealroom_result:${s.id}:${st}`, event: 'dealroom_result', area: 'pages', kind: 'update', text, href: '/app/spaces', at: page.publishedAt });
      }
      if (pub.campaign) {
        const ph = campaignPhase(pub.campaign);
        if (ph !== 'before') out.push({ id: `campaign_phase:${s.id}:${ph}`, event: 'campaign_phase', area: 'pages', kind: 'update', text: ph === 'live' ? `${s.name} is live` : `${s.name} has ended`, href: '/app/spaces', at: page.publishedAt });
      }
    }

    // Live automation runs (D137): drafts waiting for approval, reports and owner notices from the last week.
    for (const a of ops.automations) {
      for (const r of a.runs) {
        if (r.test || now - Date.parse(r.at) > 7 * DAY) continue;
        r.steps.forEach((s, i) => {
          if (s.status === 'waiting') out.push({ id: `automation:${r.id}:${i}`, event: 'automation', area: 'audience', kind: 'action', text: `“${a.name}” wrote a message for ${r.subject.replace(/ has been quiet.*$/, '')} — approve, edit or discard it`, href: '/app/automations#drafts', at: r.at });else
          if (s.status === 'done' && /^(Send me a report|Notify)/.test(s.label)) out.push({ id: `automation:${r.id}:${i}`, event: 'automation', area: 'audience', kind: 'update', text: s.detail.replace(/^In your notifications: /, ''), href: '/app/automations', at: r.at });
        });
        if (r.status === 'failed') out.push({ id: `automation:${r.id}:failed`, event: 'automation', area: 'audience', kind: 'action', text: `“${a.name}” failed for ${r.subject} — open it to retry`, href: '/app/automations', at: r.at });
      }
    }

    // Monday summary (D125): last 7 days against the 7 before, plus what's waiting.
    {
      const monday = new Date();
      monday.setHours(8, 0, 0, 0);
      monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);
      if (Date.now() >= monday.getTime()) {
        const since = monday.getTime() - 7 * DAY;
        const paid = (from: number, to: number) => commerce.orders.filter((o) => !o.sample && o.paymentStatus === 'paid' && Date.parse(o.createdAt) >= from && Date.parse(o.createdAt) < to);
        const week = paid(since, monday.getTime());
        const before = paid(since - 7 * DAY, since);
        const sum = (os: typeof week) => os.reduce((s, o) => s + orderMoney(o).gross, 0);
        const unpaid = commerce.orders.filter((o) => !o.sample && o.paymentStatus === 'pending' && now - Date.parse(o.createdAt) > 3600000 && now - Date.parse(o.createdAt) < 14 * DAY).length;
        const newContacts = ops.contacts.filter((c) => !c.sample && Date.parse(c.createdAt) >= since).length;
        const trend = before.length ? sum(week) >= sum(before) ? 'up' : 'down' : null;
        const parts = [`${week.length} paid order${week.length === 1 ? '' : 's'} · ${formatNgn(sum(week))}${trend ? ` (${trend} on the week before)` : ''}`, `${newContacts} new contact${newContacts === 1 ? '' : 's'}`];
        if (unpaid) parts.push(`${unpaid} unpaid checkout${unpaid === 1 ? '' : 's'} to chase`);
        out.push({ id: `weekly_digest:${monday.toISOString().slice(0, 10)}`, event: 'weekly_digest', area: 'pages', kind: 'update', text: `Your week: ${parts.join(' · ')}. See Link Intelligence for ideas.`, href: unpaid ? '/app/opportunities' : '/app/analytics#ideas', at: monday.toISOString() });
      }
    }

    return out.sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
  }, [commerce, fulfilment, money, serviceOs, quotesActive, ops, forms, team.data.reviews, team.myNotices, team.me.id, billing, domains, current, plan, ai.limit, ai.remaining, ai.resetsOn]);
}