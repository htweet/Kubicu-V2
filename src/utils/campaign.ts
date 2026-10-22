import type { Block, CampaignPhase, CampaignSettings, CampaignStarter } from '../types/page';
import type { CommerceData, Order } from '../types/commerce';
import type { ValidationIssue } from './validation';
import { discountStatus } from './commerce/discounts';
import { isSoldOut } from './commerce/catalog';
import { orderMoney } from './commerce/money';
import { formatSchedule } from './schedule';

/** Campaign pages (D52): one link with Before / Live / Ended phases driven by the campaign window. */

export const phaseOrder: CampaignPhase[] = ['before', 'live', 'ended'];

export const phaseLabels: Record<CampaignPhase, string> = {
  before: 'Before',
  live: 'Live',
  ended: 'Ended'
};

export const phaseDescriptions: Record<CampaignPhase, string> = {
  before: 'Before it starts — tease it and collect sign-ups.',
  live: 'While it’s on — the offer and how to buy.',
  ended: 'After it ends — say thanks and point people on.'
};

export const starterLabels: Record<CampaignStarter, {label: string;blurb: string;}> = {
  sale: { label: 'Sale', blurb: 'A discount for a set time — Eid, Black Friday, clearance.' },
  launch: { label: 'Product launch', blurb: 'A countdown to a new drop, then the products go live.' },
  event: { label: 'Event', blurb: 'A pop-up, workshop or show with a date and RSVP.' }
};

export function campaignPhase(c: CampaignSettings, now = Date.now()): CampaignPhase {
  if (c.startsAt && Date.parse(c.startsAt) > now) return 'before';
  if (c.endsAt && Date.parse(c.endsAt) <= now) return 'ended';
  return 'live';
}

export function blockInPhase(block: Block, phase: CampaignPhase): boolean {
  const p = block.visibility.phases;
  return !p || p.length === 0 || p.includes(phase);
}

/** “Starts in 2 days”, “Ends Fri 6pm”, “Ended 3 days ago”. */
export function phaseSummary(c: CampaignSettings, now = Date.now()): string {
  const phase = campaignPhase(c, now);
  if (phase === 'before' && c.startsAt) return `Starts ${formatSchedule(c.startsAt)}`;
  if (phase === 'live') return c.endsAt ? `Ends ${formatSchedule(c.endsAt)}` : 'No end date';
  return c.endsAt ? `Ended ${formatSchedule(c.endsAt)}` : 'Ended';
}

/** Orders placed through this campaign's link, within its window. */
export function campaignOrders(data: CommerceData | null, handle: string): Order[] {
  return (data?.orders ?? []).filter((o) => o.sourceHandle === handle && o.status !== 'cancelled');
}

export function campaignTotals(data: CommerceData | null, handle: string) {
  const orders = campaignOrders(data, handle);
  const paid = orders.filter((o) => o.paymentStatus !== 'pending' && o.paymentStatus !== 'cancelled');
  return {
    orders: orders.length,
    revenueNgn: paid.reduce((t, o) => t + orderMoney(o).gross, 0),
    discountNgn: orders.reduce((t, o) => t + o.discountNgn, 0)
  };
}

/** Pre-publish checks for a campaign space. */
export function campaignIssues(c: CampaignSettings, blocks: Block[], data: CommerceData | null, now = Date.now()): ValidationIssue[] {
  const out: ValidationIssue[] = [];
  const push = (id: string, severity: ValidationIssue['severity'], message: string) => out.push({ id: `campaign:${id}`, blockId: null, severity, message });
  if (!c.endsAt) push('no-end', 'error', 'Set when the campaign ends, so visitors see the Ended version afterwards.');
  if (c.startsAt && c.endsAt && Date.parse(c.endsAt) <= Date.parse(c.startsAt)) push('order', 'error', 'The campaign ends before it starts. Check the dates.');else
  if (c.endsAt && Date.parse(c.endsAt) <= now) push('over', 'warning', 'This campaign has already ended — visitors will see the Ended version.');

  if (c.discountId) {
    const d = data?.discounts.find((x) => x.id === c.discountId);
    if (!d) push('discount-missing', 'error', 'The linked discount was deleted. Pick another or remove it.');else
    {
      const status = discountStatus(d, data!, now);
      if (status === 'paused') push('discount-paused', 'warning', `${d.code || d.title} is paused, so it won’t apply.`);
      if (d.endsAt && c.endsAt && Date.parse(d.endsAt) < Date.parse(c.endsAt)) push('discount-ends', 'warning', `${d.code || d.title} ends before the campaign does (${formatSchedule(d.endsAt)}).`);
      if (d.startsAt && c.startsAt && Date.parse(d.startsAt) > Date.parse(c.startsAt)) push('discount-starts', 'warning', `${d.code || d.title} starts after the campaign does.`);
    }
  }

  c.productIds.forEach((id) => {
    const p = data?.products.find((x) => x.id === id);
    if (!p) push(`p-${id}`, 'warning', 'A featured product was deleted from Commerce.');else
    if (p.status !== 'active') push(`p-${id}`, 'warning', `“${p.name}” is ${p.status} in Commerce and won’t show.`);else
    if (isSoldOut(p)) push(`p-${id}`, 'warning', `“${p.name}” is sold out.`);
  });

  phaseOrder.forEach((phase) => {
    if (!blocks.some((b) => !b.visibility.hidden && blockInPhase(b, phase))) push(`empty-${phase}`, phase === 'live' ? 'error' : 'warning', `Nothing shows in the ${phaseLabels[phase]} phase yet.`);
  });
  return out;
}