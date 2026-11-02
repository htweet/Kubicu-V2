import type { Order } from '../../types/commerce';
import type { EscrowActor, EscrowCase, EscrowEvent, EscrowFile, EscrowIssue, EscrowKind, EscrowStage, ReleaseReason, SellerResponse, StaffDecision } from '../../types/escrow';
import type { LedgerEntry, LedgerState, MoneyData } from '../../types/money';
import { readCommerce, writeCommerceExternal as writeCommerce } from '../commerce/storage';
import { refundOrder, setOrderStatus } from '../commerce/ops';
import { refundableNgn } from '../commerce/money';
import { uid } from '../id';
import { formatMoney } from '../currency';
import { figure, onOpsSettings } from '../opsSettings';

/** Escrow lifecycle (D94): hold → delivered → inspection → release, with buyer disputes and staff decisions. */

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const iso = (ms: number) => new Date(ms).toISOString();
const now = () => new Date().toISOString();

// ——— Example figures (D94) ———
/** The seller has this long to reply to a buyer's problem before it goes to KUBICU automatically. */
export let RESPOND_HOURS = 48;
/** KUBICU aims to decide an escalated case within this long. */
export let DECIDE_HOURS = 72;
export let MAX_FILES = 5;
// Staff can change these in Figures & names (D467).
onOpsSettings(() => {
  RESPOND_HOURS = figure('escrow.respondHours');
  DECIDE_HOURS = figure('escrow.decideHours');
  MAX_FILES = figure('escrow.maxFiles');
});

export const issueLabels: Record<EscrowIssue, string> = {
  not_received: 'I didn’t receive it',
  not_as_described: 'It’s not what was described',
  damaged: 'It arrived damaged or faulty',
  incomplete: 'Part of my order is missing',
  other: 'Something else'
};

export const stageLabels: Record<EscrowStage, string> = {
  awaiting_goal: 'Waiting for group goal',
  held: 'Held · awaiting delivery',
  delivered: 'Delivered · buyer checking',
  disputed: 'Problem reported',
  escalated: 'With KUBICU',
  closed: 'Closed'
};

export const stageTones: Record<EscrowStage, 'neutral' | 'info' | 'warning' | 'danger' | 'success'> = {
  awaiting_goal: 'neutral',
  held: 'info',
  delivered: 'info',
  disputed: 'warning',
  escalated: 'danger',
  closed: 'success'
};

export const releaseLabels: Record<ReleaseReason, string> = {
  buyer_confirmed: 'Buyer confirmed they received it',
  window_ended: 'Inspection window ended with no problem reported',
  goal_reached: 'Group goal reached',
  dispute_withdrawn: 'Buyer withdrew their problem',
  staff: 'Decided by KUBICU',
  goal_missed: 'Group goal missed — refunded automatically',
  seller_refund: 'Seller refunded the order',
  delivery_code: 'Buyer gave the rider their delivery code'
};

export const isOpen = (c: EscrowCase) => c.stage !== 'closed';
export const caseForOrder = (d: MoneyData, orderId: string) => d.escrow.find((c) => c.orderId === orderId) ?? null;

export function files(names: string[]): EscrowFile[] {
  return names.filter(Boolean).slice(0, MAX_FILES).map((name) => ({ id: uid('ef'), name, at: now() }));
}

function ev(label: string, by: EscrowActor, at = now()): EscrowEvent {
  return { id: uid('eev'), at, by, label };
}

/** Plain-language state for buyer and seller screens. */
export function caseSummary(c: EscrowCase): string {
  switch (c.stage) {
    case 'awaiting_goal':
      return 'Held until the group goal is decided. If it’s missed, the buyer is refunded in full automatically.';
    case 'held':
      return 'Held by our licensed payment partner until the order is delivered.';
    case 'delivered':
      return `Delivered. Released to the seller ${c.inspectUntil ? `on ${new Date(c.inspectUntil).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}` : 'when the inspection window ends'} unless the buyer reports a problem.`;
    case 'disputed':
      return c.dispute?.response ? 'The seller has replied. The buyer can accept, or either side can ask KUBICU to decide.' : `The seller has ${RESPOND_HOURS} hours to reply. If they don’t, it goes to KUBICU automatically.`;
    case 'escalated':
      return `KUBICU is reviewing both sides and aims to decide within ${DECIDE_HOURS / 24} days. The money stays reserved until then.`;
    case 'closed':
      return c.outcome === 'released' ? `Released to the seller · ${c.releaseReason ? releaseLabels[c.releaseReason] : ''}` : c.outcome === 'refunded' ? 'Refunded to the buyer in full.' : `Partly refunded (${formatMoney(c.refundedNgn ?? 0)}); the rest released to the seller.`;
  }
}

// ——— Ledger helpers ———

function moveLedger(ledger: LedgerEntry[], orderId: string, to: LedgerState): LedgerEntry[] {
  return ledger.map((e) => {
    if (e.ref?.type !== 'order' || e.ref.id !== orderId || e.state !== 'held' && e.state !== 'reserved') return e;
    const label = to === 'available' ? e.label.replace(' · in escrow', ' · released from escrow') : e.label;
    return { ...e, state: to, availableAt: undefined, label };
  });
}

function patch(d: MoneyData, caseId: string, fn: (c: EscrowCase) => EscrowCase): MoneyData {
  return { ...d, escrow: d.escrow.map((c) => c.id === caseId ? fn(c) : c) };
}

// ——— Creating cases (called from the commerce sync) ———

export function newCase(o: Order, kind: EscrowKind, netNgn: number, grossNgn: number, inspectionDays: number): EscrowCase {
  const instant = kind === 'order' && o.items.every((i) => i.kind === 'digital' || i.kind === 'ticket');
  const heldAt = o.createdAt;
  const base: EscrowCase = {
    id: uid('esc'),
    orderId: o.id,
    orderNumber: o.number,
    kind,
    stage: kind === 'goal' ? 'awaiting_goal' : 'held',
    buyerName: o.customer.name || 'Customer',
    buyerPhone: o.customer.phone,
    grossNgn,
    netNgn,
    heldAt,
    inspectionDays,
    proof: [],
    events: [ev(kind === 'goal' ? 'Paid into escrow while the group goal is open' : 'Paid into escrow', 'system', heldAt)]
  };
  // Downloads and tickets are delivered the moment they're paid, so the inspection window starts straight away.
  if (!instant) return base;
  return { ...base, stage: 'delivered', deliveredAt: heldAt, deliveryNote: 'Delivered instantly (download or ticket)', inspectUntil: iso(Date.parse(heldAt) + inspectionDays * DAY), events: [ev('Delivered instantly — inspection window started', 'system', heldAt), ...base.events] };
}

// ——— Lifecycle actions ———

export function markDelivered(d: MoneyData, caseId: string, input: {note: string;proof: string[];}, by: EscrowActor = 'seller'): MoneyData {
  return patch(d, caseId, (c) => {
    if (c.stage !== 'held') return c;
    const at = now();
    return {
      ...c,
      stage: 'delivered',
      deliveredAt: at,
      deliveryNote: input.note.trim() || undefined,
      proof: [...c.proof, ...files(input.proof)],
      inspectUntil: iso(Date.now() + c.inspectionDays * DAY),
      events: [ev(`Marked delivered${input.proof.length ? ` with ${input.proof.length} proof file${input.proof.length === 1 ? '' : 's'}` : ''} — ${c.inspectionDays}-day inspection window started`, by, at), ...c.events]
    };
  });
}

export function release(d: MoneyData, caseId: string, reason: ReleaseReason, by: EscrowActor): MoneyData {
  const c = d.escrow.find((x) => x.id === caseId);
  if (!c || !isOpen(c)) return d;
  const at = now();
  return {
    ...patch(d, caseId, (x) => ({ ...x, stage: 'closed', outcome: 'released', releaseReason: reason, closedAt: at, events: [ev(`Released to the seller — ${releaseLabels[reason]}`, by, at), ...x.events] })),
    ledger: moveLedger(d.ledger, c.orderId, 'available')
  };
}

export function confirmReceived(d: MoneyData, caseId: string): MoneyData {
  const c = d.escrow.find((x) => x.id === caseId);
  if (!c || c.stage !== 'delivered' && c.stage !== 'held') return d;
  return release(d, caseId, 'buyer_confirmed', 'buyer');
}

export function openDispute(d: MoneyData, caseId: string, input: {issue: EscrowIssue;details: string;wants: 'full' | 'partial';partialNgn?: number;evidence: string[];}): MoneyData {
  const c = d.escrow.find((x) => x.id === caseId);
  if (!c || c.stage !== 'held' && c.stage !== 'delivered') return d;
  const at = now();
  return {
    ...patch(d, caseId, (x) => ({
      ...x,
      stage: 'disputed',
      dispute: { id: uid('edp'), openedAt: at, issue: input.issue, details: input.details.trim(), wants: input.wants, partialNgn: input.wants === 'partial' ? input.partialNgn : undefined, evidence: files(input.evidence), respondBy: iso(Date.now() + RESPOND_HOURS * HOUR) },
      events: [ev(`Buyer reported a problem: ${issueLabels[input.issue]}`, 'buyer', at), ...x.events]
    })),
    ledger: moveLedger(d.ledger, c.orderId, 'reserved')
  };
}

export function sellerRespond(workspaceId: string, d: MoneyData, caseId: string, input: Omit<SellerResponse, 'at' | 'evidence'> & {evidence: string[];}): MoneyData {
  const c = d.escrow.find((x) => x.id === caseId);
  if (!c?.dispute || c.stage !== 'disputed' || c.dispute.response) return d;
  const response: SellerResponse = { ...input, text: input.text.trim(), at: now(), evidence: files(input.evidence) };
  const withResponse = patch(d, caseId, (x) => ({
    ...x,
    dispute: x.dispute && { ...x.dispute, response },
    events: [ev(input.kind === 'full_refund' ? 'Seller agreed to a full refund' : input.kind === 'partial' ? `Seller offered a partial refund of ${formatMoney(input.partialNgn ?? 0)}` : 'Seller disagreed and shared their side', 'seller'), ...x.events]
  }));
  if (input.kind === 'full_refund') return refundCase(workspaceId, withResponse, caseId, Number.MAX_SAFE_INTEGER, 'Escrow — seller agreed to refund', 'seller');
  return withResponse;
}

export function acceptOffer(workspaceId: string, d: MoneyData, caseId: string): MoneyData {
  const c = d.escrow.find((x) => x.id === caseId);
  const amount = c?.dispute?.response?.kind === 'partial' ? c.dispute.response.partialNgn ?? 0 : 0;
  if (!c || c.stage !== 'disputed' || amount <= 0) return d;
  const accepted = patch(d, caseId, (x) => ({ ...x, events: [ev('Buyer accepted the partial refund', 'buyer'), ...x.events] }));
  return refundCase(workspaceId, accepted, caseId, amount, 'Escrow — partial refund agreed', 'buyer');
}

export function withdrawDispute(d: MoneyData, caseId: string): MoneyData {
  const c = d.escrow.find((x) => x.id === caseId);
  if (!c || c.stage !== 'disputed' && c.stage !== 'escalated') return d;
  return release(d, caseId, 'dispute_withdrawn', 'buyer');
}

export function escalate(d: MoneyData, caseId: string, by: EscrowActor, note = ''): MoneyData {
  return patch(d, caseId, (c) => {
    if (c.stage !== 'disputed' || !c.dispute) return c;
    const at = now();
    const who = by === 'system' ? `Seller didn’t reply within ${RESPOND_HOURS} hours` : by === 'buyer' ? 'Buyer' : 'Seller';
    return { ...c, stage: 'escalated', dispute: { ...c.dispute, escalatedAt: at, escalatedBy: by, escalationNote: note.trim() || undefined }, events: [ev(`${who} — passed to KUBICU to decide`, by, at), ...c.events] };
  });
}

/** Staff decide an escalated case. Release, refund in full, or split. */
export function staffDecide(workspaceId: string, d: MoneyData, caseId: string, decision: Omit<StaffDecision, 'at'>): MoneyData {
  const c = d.escrow.find((x) => x.id === caseId);
  if (!c?.dispute || c.stage !== 'escalated') return d;
  const decided = patch(d, caseId, (x) => ({ ...x, dispute: x.dispute && { ...x.dispute, decision: { ...decision, at: now() } } }));
  if (decision.outcome === 'release') return release(decided, caseId, 'staff', 'staff');
  const amount = decision.outcome === 'refund' ? Number.MAX_SAFE_INTEGER : decision.partialNgn ?? 0;
  return refundCase(workspaceId, decided, caseId, amount, `Escrow — decided by KUBICU`, 'staff');
}

/** Refunds the buyer through Commerce, then releases whatever is left to the seller. */
export function refundCase(workspaceId: string, d: MoneyData, caseId: string, amountNgn: number, reason: string, by: EscrowActor): MoneyData {
  const c = d.escrow.find((x) => x.id === caseId);
  if (!c || !isOpen(c)) return d;
  const commerce = readCommerce(workspaceId);
  const order = commerce?.orders.find((o) => o.id === c.orderId);
  if (!commerce || !order) return d;
  const refundable = refundableNgn(order);
  const amount = Math.min(amountNgn, refundable);
  if (amount <= 0) return release(d, caseId, 'staff', by);
  const next = refundOrder(commerce, c.orderId, amount, reason, false);
  const refund = next.orders.find((o) => o.id === c.orderId)?.refunds.slice(-1)[0];
  try {
    writeCommerce(workspaceId, next);
  } catch {
    return d;
  }
  const at = now();
  const full = amount >= refundable;
  const entry: LedgerEntry | null = refund ? { id: uid('led'), at, kind: 'refund', amountNgn: -amount, state: 'available', label: `Escrow refund · order #${c.orderNumber}`, ref: { type: 'order', id: c.orderId, label: `#${c.orderNumber}` } } : null;
  return {
    ...d,
    escrow: d.escrow.map((x) =>
    x.id === caseId ?
    { ...x, stage: 'closed', outcome: full ? 'refunded' : 'partial', refundedNgn: amount, closedAt: at, releaseReason: full ? undefined : by === 'staff' ? 'staff' : undefined, events: [ev(full ? `Refunded to the buyer in full — ${formatMoney(amount)}` : `Refunded ${formatMoney(amount)} to the buyer; the rest released to the seller`, by, at), ...x.events] } :
    x
    ),
    ledger: [...(entry ? [entry] : []), ...moveLedger(d.ledger, c.orderId, 'available')],
    synced: refund ? { ...d.synced, refunds: [...d.synced.refunds, refund.id] } : d.synced
  };
}

/** Marks the order delivered in Commerce too, so the tracker matches. */
export function markOrderDelivered(workspaceId: string, orderId: string): void {
  const commerce = readCommerce(workspaceId);
  const order = commerce?.orders.find((o) => o.id === orderId);
  if (!commerce || !order || order.status === 'completed' || order.status === 'cancelled' || order.status === 'refunded') return;
  try {
    writeCommerce(workspaceId, setOrderStatus(commerce, orderId, 'completed', 'Marked delivered (escrow)'));
  } catch {

    /* storage full — escrow still records it */}
}

/** Prototype only: skip the waiting so testers can see what happens when a window or deadline runs out. */
export function fastForward(d: MoneyData, caseId: string): MoneyData {
  const past = iso(Date.now() - 1000);
  return patch(d, caseId, (c) =>
  c.stage === 'delivered' ? { ...c, inspectUntil: past } : c.stage === 'disputed' && c.dispute && !c.dispute.response ? { ...c, dispute: { ...c.dispute, respondBy: past } } : c
  );
}

// ——— Time and commerce-driven changes (run on every read) ———

export function syncEscrow(d: MoneyData, orders: Order[], dealroomsEscrow: boolean): MoneyData {
  let next = d;
  const nowMs = Date.now();
  for (const c of d.escrow) {
    if (!isOpen(c)) continue;
    const o = orders.find((x) => x.id === c.orderId);
    if (c.stage === 'awaiting_goal' && o) {
      if (o.paymentStatus === 'refunded') {
        next = { ...patch(next, c.id, (x) => ({ ...x, stage: 'closed', outcome: 'refunded', refundedNgn: x.grossNgn, releaseReason: 'goal_missed', closedAt: now(), events: [ev(releaseLabels.goal_missed, 'system'), ...x.events] })), ledger: moveLedger(next.ledger, c.orderId, 'available') };
      } else if (!o.held) {
        next = dealroomsEscrow ?
        patch(next, c.id, (x) => ({ ...x, stage: 'held', events: [ev('Group goal reached — now protected until delivery', 'system'), ...x.events] })) :
        release(next, c.id, 'goal_reached', 'system');
      }
      continue;
    }
    if (o && o.paymentStatus === 'refunded' && c.stage !== 'escalated') {
      next = { ...patch(next, c.id, (x) => ({ ...x, stage: 'closed', outcome: 'refunded', refundedNgn: x.grossNgn, releaseReason: 'seller_refund', closedAt: now(), events: [ev(releaseLabels.seller_refund, 'seller'), ...x.events] })), ledger: moveLedger(next.ledger, c.orderId, 'available') };
      continue;
    }
    if (c.stage === 'held' && o?.status === 'completed') {
      next = markDelivered(next, c.id, { note: 'Order marked delivered', proof: [] }, 'seller');
      continue;
    }
    if (c.stage === 'delivered' && c.inspectUntil && Date.parse(c.inspectUntil) <= nowMs) {
      next = release(next, c.id, 'window_ended', 'system');
      continue;
    }
    if (c.stage === 'disputed' && c.dispute && !c.dispute.response && Date.parse(c.dispute.respondBy) <= nowMs) {
      next = escalate(next, c.id, 'system');
    }
  }
  return next;
}