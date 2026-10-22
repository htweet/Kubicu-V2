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
import { isLowStock, isSoldOut } from '../utils/commerce/catalog';
import { readSpacePage } from '../utils/spaces';
import { roomProgress } from '../utils/dealRoom';
import { campaignPhase } from '../utils/campaign';
import { daysUntil, formatDate, isPaidPlan } from '../utils/billing';
import { formatNgn } from '../utils/format';
import { TRIAL_REMINDER_DAYS } from '../data/billing';
import { readTemplateStore } from '../utils/templateListings';
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

  return useMemo(() => {
    const out: AppNotification[] = [];
    const now = Date.now();
    const today = startOfToday();

    for (const o of commerce.orders) {
      if (o.status === 'paid')
      out.push({ id: `order_paid:${o.id}`, event: 'order_paid', area: 'orders', kind: 'action', text: `Order #${o.number} from ${o.customer.name} is paid — ready to pack${o.held ? ' (held for DealRoom goal)' : ''}`, href: '/app/commerce/orders?status=paid', at: o.createdAt });
      if (o.status === 'new') out.push({ id: `order_pending:${o.id}`, event: 'order_pending', area: 'orders', kind: 'update', text: `Order #${o.number} from ${o.customer.name} is waiting for payment`, href: '/app/commerce/orders?status=new', at: o.createdAt });
      if (o.dispute?.status === 'needs_response')
      out.push({ id: `dispute:${o.dispute.id}`, event: 'dispute', area: 'orders', kind: 'action', text: `Dispute on order #${o.number} (${formatNgn(o.dispute.amountNgn)}) — respond by ${formatDate(o.dispute.respondBy)}`, href: '/app/commerce/orders', at: o.dispute.openedAt });
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
        href: qr ? `/app/domains/qr?link=${l.id}` : '/app/domains/links',
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

    return out.sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
  }, [commerce, ops, team.data.reviews, team.myNotices, team.me.id, billing, domains, current, plan, ai.limit, ai.remaining, ai.resetsOn]);
}