import type { LinkPayment, MoneyData, PaymentLink, PendingTransfer } from '../../types/money';
import type { ShopSettings } from '../../types/commerce';
import type { LedgerEntry } from '../../types/money';
import { USSD_AVAILABLE } from '../../data/ussdBanks';
import { uid } from '../id';
import { linkProviderFee, recordLinkPayment } from './store';
import { vatFor } from '../commerce/shopSettings';

/** Standard payment links (D224). Example limits. */
export const MAX_SUGGESTED_AMOUNTS = 4;
export const MAX_LINK_QUESTIONS = 5;

/**
 * What the payer adds so the seller still receives `amount` after the processing fee.
 * The fee depends on the total, so it's settled in a couple of passes.
 */
export function payerFeeFor(amount: number): number {
  if (amount <= 0) return 0;
  let fee = linkProviderFee(amount);
  for (let i = 0; i < 3; i++) fee = linkProviderFee(amount + fee);
  return fee;
}

export interface LinkPayWays {
  card: boolean;
  /** One-time provider transfer account. */
  account: boolean;
  /** The seller's own bank accounts (Bank transfer payments app). */
  own: boolean;
  ussd: boolean;
}

/** Ways to pay on this link: the link's own choice, else Commerce settings. Fundraisers follow Commerce settings. */
export function linkPayWays(link: PaymentLink, shop: ShopSettings, naira: boolean, ownAccounts: number): LinkPayWays {
  const m = !link.fundraiser && link.methods ? link.methods : { card: shop.methods.card, transfer: shop.methods.transfer, ussd: shop.methods.ussd };
  return {
    card: m.card,
    account: naira && m.transfer,
    own: naira && m.transfer && shop.methods.transferOwn && ownAccounts > 0,
    ussd: USSD_AVAILABLE && naira && m.ussd,
  };
}

/** VAT on a link payment, unless the link turns it off. Fundraisers never carry VAT (gifts to the organiser). */
export function linkVat(link: PaymentLink, shop: ShopSettings, amount: number) {
  if (link.fundraiser || link.noVat) return null;
  return vatFor(shop, amount);
}

/** Only https addresses can be used to send payers on. */
export function safeRedirect(url: string): string {
  const u = url.trim();
  try {
    const parsed = new URL(u);
    return parsed.protocol === 'https:' ? parsed.toString() : '';
  } catch {
    return '';
  }
}

/** A payer says they've transferred to the seller's own account. Nothing counts until the seller confirms. */
export function addPendingTransfer(d: MoneyData, linkId: string, payment: PendingTransfer['payment']): { data: MoneyData; pending: PendingTransfer } {
  const pending: PendingTransfer = { id: uid('lpt'), at: new Date().toISOString(), payment, status: 'waiting' };
  return { data: { ...d, links: d.links.map((l) => (l.id === linkId ? { ...l, pendingTransfers: [pending, ...(l.pendingTransfers ?? [])] } : l)) }, pending };
}

/** The seller saw the money arrive: it becomes a normal payment with a receipt. */
export function confirmPendingTransfer(d: MoneyData, linkId: string, pendingId: string): MoneyData {
  const link = d.links.find((l) => l.id === linkId);
  const p = link?.pendingTransfers?.find((x) => x.id === pendingId);
  if (!link || !p) return d;
  // Confirm even if the link has since closed — the money already arrived.
  const open: MoneyData = { ...d, links: d.links.map((l) => (l.id === linkId ? { ...l, status: 'active', expiresAt: null, maxUses: null } : l)) };
  const res = recordLinkPayment(open, linkId, p.payment);
  if (!res) return d;
  return {
    ...res.data,
    links: res.data.links.map((l) => (l.id === linkId ? { ...l, status: link.status, expiresAt: link.expiresAt, maxUses: link.maxUses, pendingTransfers: (l.pendingTransfers ?? []).filter((x) => x.id !== pendingId) } : l)),
  };
}

export function markTransferNotReceived(d: MoneyData, linkId: string, pendingId: string): MoneyData {
  return { ...d, links: d.links.map((l) => (l.id === linkId ? { ...l, pendingTransfers: (l.pendingTransfers ?? []).map((x) => (x.id === pendingId ? { ...x, status: 'not_received' } : x)) } : l)) };
}

/** Full or partial refund of one payment, with a reason (D224). Test mode — the wallet records it. */
export function refundLinkPart(d: MoneyData, linkId: string, paymentId: string, amountNgn: number, reason: string): MoneyData {
  const link = d.links.find((l) => l.id === linkId);
  const p = link?.payments.find((x) => x.id === paymentId);
  if (!link || !p) return d;
  const left = p.amountNgn - (p.refundedNgn ?? 0);
  const amount = Math.min(left, Math.max(0, Math.round(amountNgn)));
  if (amount <= 0) return d;
  const at = new Date().toISOString();
  const entry: LedgerEntry = { id: uid('led'), at, kind: 'refund', amountNgn: -amount, state: 'available', availableAt: at, label: `Refund · ${link.title} · ${p.receipt}`, ref: { type: 'link', id: link.id, label: p.receipt } };
  return {
    ...d,
    ledger: [entry, ...d.ledger],
    links: d.links.map((l) => (l.id === linkId ? { ...l, payments: l.payments.map((x) => (x.id === paymentId ? { ...x, refundedNgn: (x.refundedNgn ?? 0) + amount, refundedAt: at, refundReason: reason.trim() || x.refundReason } : x)) } : l)),
  };
}

/** Rows for a link's payments CSV. */
export function linkPaymentRows(link: PaymentLink): (string | number)[][] {
  const qLabels = (link.questions ?? []).map((q) => q.label);
  const head = ['Receipt', 'Paid at', 'Name', 'Phone', 'Email', 'Address', 'Amount (NGN)', 'Fee paid by payer', 'VAT', 'Paid by', 'Refunded', 'Note', ...qLabels];
  const rows = link.payments.map((p: LinkPayment) => [
    p.receipt,
    p.at,
    p.payerName,
    p.payerPhone,
    p.payerEmail ?? '',
    p.payerAddress ?? '',
    p.amountNgn,
    p.feeNgn ?? 0,
    p.vatNgn ?? 0,
    p.payBy ?? 'card',
    p.refundedNgn ?? 0,
    p.note,
    ...qLabels.map((label) => p.answers?.find((a) => a.label === label)?.value ?? ''),
  ]);
  return [head, ...rows];
}
