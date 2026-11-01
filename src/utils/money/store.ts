import type { Order } from '../../types/commerce';
import type { BankAccount, KycTier, LedgerEntry, LedgerRefType, LinkPayment, MoneyData, PayArea, PayMethod, Payout, PaymentLink, PendingTransfer } from '../../types/money';
import { readCommerce } from '../commerce/storage';
import { orderRef } from '../commerce/shopSettings';
import { orderMoney } from '../commerce/money';
import { orderPartnerShares, partnerDebitNgn, partnerRatio } from '../commerce/bundles';
import { uid } from '../id';
import { formatMoney } from '../currency';
import { activeCountry } from '../country';
import type { CountryCode } from '../../types/country';
import { payoutRules } from '../../data/payoutLimits';
import { figure, onOpsSettings } from '../opsSettings';
import { blankKyc, kycRules, normaliseKyc } from './kyc';
import { newCase, syncEscrow } from './escrow';
import type { EscrowCase } from '../../types/escrow';
import { DEMO_WORKSPACE_ID, sampleHandle, seedsSample } from '../workspaceStorage';
import { SAMPLE_FUND_LINK_ID, sampleFundraiserLink } from '../../data/sampleFundraiser';

/** The demo workspace gets the sample fundraiser's payment link once (D179); it can be deleted like any link. */
function withSampleFundraiser(workspaceId: string, d: MoneyData): MoneyData {
  if (!seedsSample(workspaceId) || d.sampleFundraiserSeeded) return d;
  const link = sampleFundraiserLink(blankLink());
  // Demo-data workspaces (D200) point the link at their own sample fundraiser address.
  const own = workspaceId === DEMO_WORKSPACE_ID || !link.fundraiser ? link : { ...link, fundraiser: { ...link.fundraiser, handle: sampleHandle(link.fundraiser.handle, workspaceId) } };
  const links = d.links.some((l) => l.id === SAMPLE_FUND_LINK_ID) ? d.links : [...d.links, own];
  return { ...d, links, sampleFundraiserSeeded: true };
}

/** Wallet, payouts, payment links and payment-method settings for one workspace (D92). */

const key = (workspaceId: string) => `kubicu.money.${workspaceId}`;
export const MONEY_EVENT = 'kubicu:money';

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const iso = (ms: number) => new Date(ms).toISOString();

// ——— Example figures (logged in D92; confirm with the chosen partner) ———

/** Wallet sales settle with the partner after this long (per country, D432). */
const settleHours = () => (payoutRules[activeCountry()] ?? payoutRules.NG).settleHours;
/** A new bank account can't receive payouts for this long. */
export let BANK_COOLDOWN_HOURS = 24;
onOpsSettings(() => {
  BANK_COOLDOWN_HOURS = figure('money.bankCooldownHours');
});
/** Manual payouts cost this in the workspace's currency; scheduled ones are free (D432). */
export const manualPayoutFee = () => (payoutRules[activeCountry()] ?? payoutRules.NG).manualFee;
/** Payout rules (limits, fees, wallet transfer cap) for a country — the workspace's when not given. */
export const payoutRulesFor = (country?: CountryCode) => payoutRules[country ?? activeCountry()] ?? payoutRules.NG;
/** Payment-link processing fee: 1.5% + ₦100, capped. */
export const linkProviderFee = (amount: number) => Math.min(2000, Math.round(amount * 0.015) + 100);
/** Escrow fee: 1%, capped at ₦5,000. */
export const escrowFee = (amount: number) => Math.min(5000, Math.round(amount * 0.01));
/** Days a buyer has to check what they got before escrow releases automatically. */
export const inspectionDays: Record<PayArea, number> = { shop: 3, tickets: 1, bookings: 2, quotes: 2, links: 2, dealrooms: 3 };

/**
 * Each country has its own rounded limit table in its own currency (D432, replacing the naira conversion of D425).
 * Fields keep their `Ngn` names so every caller still works; the amounts are in the workspace's currency.
 */
const tier = (id: KycTier, label: string, checks: () => string) => ({
  label,
  get checks() {return checks();},
  get dailyPayoutNgn() {return payoutRulesFor().limits[id].daily;},
  get balanceCapNgn() {return payoutRulesFor().limits[id].cap;}
});

export const tierInfo: Record<KycTier, {label: string;checks: string;dailyPayoutNgn: number;balanceCapNgn: number | null;}> = {
  0: tier(0, 'Not verified', () => 'Sales still arrive; payouts are off until you’re verified'),
  1: tier(1, 'Starter payouts', () => kycRules().secondary ? `Phone, ${kycRules().primary.label}, ${kycRules().secondary?.label}, ID and selfie checked automatically, with a bank account in your own name. Finish verification for higher limits.` : `Phone, ${kycRules().primary.label}, ID and selfie checked automatically, with a bank account in your own name. Finish verification for higher limits.`),
  2: tier(2, 'Verified individual', () => 'Identity, address and payout account checked'),
  3: tier(3, 'Verified business', () => `Identity, ${kycRules().registry.short} registration, directors and payout account checked`)
};

/** A tier's daily limit for any country, in that country's currency — for staff reviewing another country's case. */
export const tierDailyIn = (id: KycTier, country: CountryCode) => payoutRulesFor(country).limits[id].daily;

/** Full verification (D93) is approved. */
export const isVerified = (d: MoneyData) => d.kyc.status === 'approved' && d.verification.tier >= 2;

/**
 * Starter payouts (D243): before full review, once the automated identity checks pass and there's a
 * bank account in the applicant's own name, small payouts can go to that account. No address proof or
 * CAC needed yet; KUBICU review isn't required. Lost if verification is rejected or the wallet is frozen.
 */
export function starterMissing(d: MoneyData): string[] {
  const i = d.kyc.identity;
  const out: string[] = [];
  if (!i.phoneVerified) out.push('Confirm your phone number');
  // Ghana and South Africa have one identity number, so there's no second check to wait for (D425).
  const rules = kycRules();
  if (i.checks.bvn !== 'pass') out.push(`${rules.primary.label} check`);
  if (rules.secondary && i.checks.nin !== 'pass') out.push(`${rules.secondary.label} check`);
  if (!i.idFront) out.push('Photo of your ID');
  if (i.checks.liveness !== 'pass') out.push('Selfie');
  if (!personalBanks(d).length) out.push('A bank account in your own name');
  return out;
}

/** Bank accounts in the applicant's own (BVN) name — the only ones starter payouts can go to. */
export function personalBanks(d: MoneyData): BankAccount[] {
  const name = d.kyc.identity.legalName.trim();
  return name ? d.banks.filter((b) => nameMatchOf(b.accountName, name) === 'match') : [];
}

/** Starter is for people selling in their own name; registered businesses pay out to the business account only after review (D242). */
export const starterEligible = (d: MoneyData) => d.kyc.entity === null || d.kyc.entity === 'individual';
export const starterReady = (d: MoneyData) => starterEligible(d) && !isVerified(d) && !d.frozen && d.kyc.status !== 'rejected' && starterMissing(d).length === 0;

/** The limits that apply right now: full tier when verified, Starter while the basics are done, otherwise none. */
export const payoutTier = (d: MoneyData): KycTier => isVerified(d) ? d.verification.tier : starterReady(d) ? 1 : 0;
export const canPayOut = (d: MoneyData) => payoutTier(d) >= 1;

export const methodLabels: Record<PayMethod, string> = { direct: 'Direct to bank', wallet: 'KUBICU wallet', escrow: 'Escrow' };
export const areaLabels: Record<PayArea, string> = { shop: 'Shop orders', tickets: 'Event tickets', bookings: 'Bookings', quotes: 'Quotes & jobs', links: 'Payment links', dealrooms: 'DealRooms' };
export const payAreas: PayArea[] = ['shop', 'tickets', 'bookings', 'quotes', 'links', 'dealrooms'];

// ——— Store ———

export const emptyMoney = (): MoneyData => ({
  methods: { default: 'direct', overrides: {}, buyerChoice: false, escrowFeePayer: 'seller' },
  kyc: blankKyc(),
  ledger: [],
  banks: [],
  payouts: [],
  autoPayout: { mode: 'off', thresholdNgn: 100_000, lastRunAt: null },
  verification: { tier: 0, pending: null, rejectedNote: null },
  adminsCanPayout: false,
  frozen: null,
  links: [],
  escrow: [],
  synced: { orders: [], refunds: [] },
  walletSince: new Date().toISOString(),
  counters: { receipt: 0 },
  seeded: false
});

export function readMoneyRaw(workspaceId: string): MoneyData {
  try {
    const raw = window.localStorage.getItem(key(workspaceId));
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<MoneyData>;
      const base = emptyMoney();
      // Wallets from before D93 had only the quick tier check — they start full verification from scratch.
      const migrated = !parsed.kyc;
      const kyc = normaliseKyc(parsed.kyc);
      const verification = migrated ? { tier: 0 as KycTier, pending: null, rejectedNote: null } : { ...base.verification, ...parsed.verification };
      const read: MoneyData = { ...base, ...parsed, escrow: Array.isArray(parsed.escrow) ? parsed.escrow : [], kyc, verification, methods: { ...base.methods, ...parsed.methods }, synced: { ...base.synced, ...parsed.synced } };
      const withFund = withSampleFundraiser(workspaceId, read);
      if (withFund !== read) persist(workspaceId, withFund);
      return withFund;
    }
  } catch {

    /* fall through to a fresh store */}
  // A sample wallet history only for the demo workspace or one created with demo data (D200).
  const seeded = withSampleFundraiser(workspaceId, seedsSample(workspaceId) ? seedMoney() : { ...emptyMoney(), seeded: true });
  persist(workspaceId, seeded);
  return seeded;
}

/** Reads, then brings time-based states up to date (settlements, escrow windows, payouts, schedules, new sales). */
export function readMoney(workspaceId: string): MoneyData {
  const before = readMoneyRaw(workspaceId);
  const after = autoPayout(settle(syncCommerce(before, workspaceId)));
  if (after !== before) persist(workspaceId, after);
  return after;
}

function persist(workspaceId: string, data: MoneyData) {
  try {
    window.localStorage.setItem(key(workspaceId), JSON.stringify(data));
  } catch {

    /* storage full — the change lasts for this visit */}
}

export function writeMoney(workspaceId: string, data: MoneyData): void {
  persist(workspaceId, data);
  window.dispatchEvent(new CustomEvent(MONEY_EVENT));
}

// ——— Balances ———

export interface Balances {
  available: number;
  pending: number;
  held: number;
  reserved: number;
}

export function balances(d: MoneyData): Balances {
  const b: Balances = { available: 0, pending: 0, held: 0, reserved: 0 };
  for (const e of d.ledger) b[e.state] += e.amountNgn;
  return b;
}

export function paidOutToday(d: MoneyData): number {
  const today = new Date().toDateString();
  return d.payouts.filter((p) => p.status !== 'failed' && new Date(p.createdAt).toDateString() === today).reduce((s, p) => s + p.amountNgn, 0);
}

export function usableBanks(d: MoneyData): BankAccount[] {
  const now = Date.now();
  // On Starter payouts, money only goes to an account in the applicant's own name.
  const pool = !isVerified(d) && starterReady(d) ? personalBanks(d) : d.banks;
  return pool.filter((b) => Date.parse(b.usableAt) <= now && b.nameMatch !== 'mismatch');
}

export function methodFor(d: MoneyData, area: PayArea): PayMethod {
  return d.methods.overrides[area] ?? d.methods.default;
}

// ——— Commerce sync: wallet and escrow sales land in the ledger ———

function areaOfOrder(o: Order): PayArea {
  if (o.items.length && o.items.every((i) => i.kind === 'ticket')) return 'tickets';
  return 'shop';
}

function syncCommerce(d: MoneyData, workspaceId: string): MoneyData {
  const orders = readCommerce(workspaceId)?.orders ?? [];
  if (!orders.length) return d;
  const synced = syncNewSales(d, orders);
  return syncEscrow(synced, orders, methodFor(synced, 'dealrooms') === 'escrow');
}

function syncNewSales(d: MoneyData, orders: Order[]): MoneyData {
  const since = Date.parse(d.walletSince);
  const seenOrders = new Set(d.synced.orders);
  const seenRefunds = new Set(d.synced.refunds);
  const add: LedgerEntry[] = [];
  const cases: EscrowCase[] = [];
  const newOrders: string[] = [];
  const newRefunds: string[] = [];

  for (const o of orders) {
    // Pay on delivery: cash and door transfers go straight to the seller, never through the wallet (D112).
    if (o.sample || o.pod || Date.parse(o.createdAt) < since) continue;
    const paid = o.paymentStatus === 'paid' || o.paymentStatus === 'partially_refunded' || o.paymentStatus === 'refunded';
    if (!paid) continue;
    if (!seenOrders.has(o.id)) {
      newOrders.push(o.id);
      // Group-goal money is always held by the partner until the goal is decided (D94).
      const goal = !!o.held && !!o.sourceHandle;
      const area: PayArea = goal ? 'dealrooms' : areaOfOrder(o);
      const method = goal ? 'escrow' : methodFor(d, area);
      if (method !== 'direct') {
        const m = orderMoney(o);
        const net = m.gross - m.providerFee - m.kubicuFee;
        const at = o.createdAt;
        const ref = orderRef(o);
        const label = `Order ${ref} · ${o.customer.name || 'Customer'}`;
        // Partner bundles (D122): the partner's share is split off at payment, in the same state as the sale.
        const partnerOut = partnerDebitNgn(o);
        const partnerLabel = `${orderPartnerShares(o).map((s) => s.partnerName).join(' and ')}’s share · ${ref}`;
        if (method === 'wallet') {
          const availableAt = iso(Date.parse(at) + settleHours() * HOUR);
          add.push({ id: uid('led'), at, kind: 'sale', amountNgn: net, state: 'pending', availableAt, label, ref: { type: 'order', id: o.id, label: ref } });
          if (partnerOut > 0) add.push({ id: uid('led'), at, kind: 'partner_share', amountNgn: -partnerOut, state: 'pending', availableAt, label: partnerLabel, ref: { type: 'order', id: o.id, label: ref } });
        } else {
          const days = area === 'shop' && o.items.every((i) => i.kind === 'digital') ? 1 : inspectionDays[area];
          // Held until delivery is confirmed or the inspection window ends — no fixed release date (D94).
          add.push({ id: uid('led'), at, kind: 'sale', amountNgn: net, state: 'held', label: `${label} · in escrow`, ref: { type: 'order', id: o.id, label: ref } });
          const fee = goal ? 0 : sellerEscrowFee(d, m.gross);
          if (fee) add.push({ id: uid('led'), at, kind: 'fee', amountNgn: -fee, state: 'held', label: `Escrow fee · ${ref} · in escrow`, ref: { type: 'order', id: o.id } });
          if (partnerOut > 0) add.push({ id: uid('led'), at, kind: 'partner_share', amountNgn: -partnerOut, state: 'held', label: `${partnerLabel} · in escrow`, ref: { type: 'order', id: o.id, label: ref } });
          cases.push(newCase(o, goal ? 'goal' : 'order', net - fee - partnerOut, m.gross, days));
        }
      }
    }
    for (const r of o.refunds) {
      if (seenRefunds.has(r.id)) continue;
      newRefunds.push(r.id);
      // Balances and instalments paid later count too, so refunding them takes the money back out (D112 fixes the D95 gap).
      const credits = [...d.ledger, ...add].filter((e) => e.ref?.type === 'order' && e.ref.id === o.id && (e.kind === 'sale' || e.kind === 'milestone') && e.amountNgn > 0);
      const credit = credits[credits.length - 1];
      if (!credit) continue; // paid direct to bank — the refund comes from the provider
      const state = credit.state === 'held' || credit.state === 'reserved' ? credit.state : 'available';
      add.push({ id: uid('led'), at: r.at, kind: 'refund', amountNgn: -r.amountNgn, state, availableAt: credit.availableAt, label: `Refund · order ${orderRef(o)}${state === 'held' ? ' · in escrow' : ''}`, ref: { type: 'order', id: o.id, label: orderRef(o) } });
      // Bundles: the partner's part of the refund comes back from their share, in proportion (D122).
      const back = Math.round(r.amountNgn * partnerRatio(o));
      if (back > 0) add.push({ id: uid('led'), at: r.at, kind: 'partner_share', amountNgn: back, state, availableAt: credit.availableAt, label: `Partner’s part of refund · ${orderRef(o)}`, ref: { type: 'order', id: o.id, label: orderRef(o) } });
    }
  }

  if (!newOrders.length && !newRefunds.length) return d;
  return { ...d, escrow: [...cases, ...d.escrow], ledger: [...add, ...d.ledger], synced: { orders: [...d.synced.orders, ...newOrders], refunds: [...d.synced.refunds, ...newRefunds] } };
}

export function sellerEscrowFee(d: MoneyData, gross: number): number {
  const fee = escrowFee(gross);
  return d.methods.escrowFeePayer === 'seller' ? fee : d.methods.escrowFeePayer === 'split' ? Math.round(fee / 2) : 0;
}

export function buyerEscrowFee(d: MoneyData, gross: number): number {
  return escrowFee(gross) - sellerEscrowFee(d, gross);
}

// ——— Time-based settlement ———

/** Prototype: payouts finish this many seconds after they're made. */
const PAYOUT_SECONDS = 12;

function settle(d: MoneyData): MoneyData {
  const now = Date.now();
  let changed = false;
  const ledger = d.ledger.map((e) => {
    if ((e.state === 'pending' || e.state === 'held') && e.availableAt && Date.parse(e.availableAt) <= now) {
      changed = true;
      return { ...e, state: 'available' as const, label: e.state === 'held' ? e.label.replace(' · in escrow', ' · released from escrow') : e.label };
    }
    return e;
  });
  const returned: LedgerEntry[] = [];
  const payouts = d.payouts.map((p) => {
    if (p.status !== 'processing' || now - Date.parse(p.createdAt) < PAYOUT_SECONDS * 1000) return p;
    changed = true;
    if (p.outcome === 'paid') return { ...p, status: 'paid' as const, settledAt: iso(now) };
    returned.push({ id: uid('led'), at: iso(now), kind: 'payout_returned', amountNgn: p.amountNgn + p.feeNgn, state: 'available', label: `Payout returned · ${p.bankLabel}`, ref: { type: 'payout', id: p.id } });
    // The reason the bank or wallet gave, chosen in test mode (D433).
    return { ...p, status: 'failed' as const, settledAt: iso(now), failureReason: `${p.returnReason ?? 'The bank returned the transfer (simulated).'} The money is back in your wallet.` };
  });
  return changed ? { ...d, ledger: [...returned, ...ledger], payouts } : d;
}

function autoPayout(d: MoneyData): MoneyData {
  const { mode, thresholdNgn, lastRunAt } = d.autoPayout;
  if (mode === 'off' || d.frozen || !canPayOut(d)) return d;
  const bank = usableBanks(d).find((b) => b.primary) ?? usableBanks(d)[0];
  if (!bank) return d;
  const available = balances(d).available;
  const last = lastRunAt ? Date.parse(lastRunAt) : 0;
  const due = mode === 'daily' ? Date.now() - last >= DAY : mode === 'weekly' ? Date.now() - last >= 7 * DAY : available >= thresholdNgn;
  if (!due) return d;
  const limit = tierInfo[payoutTier(d)].dailyPayoutNgn - paidOutToday(d);
  const amount = Math.min(available, limit);
  if (amount < payoutRulesFor().minAuto) return d;
  const res = createPayout(d, { amountNgn: amount, bankId: bank.id, by: 'Scheduled payout', outcome: 'paid', auto: true });
  return 'error' in res ? d : { ...res.data, autoPayout: { ...res.data.autoPayout, lastRunAt: iso(Date.now()) } };
}

// ——— Payouts ———

export function payoutFee(auto: boolean): number {
  return auto ? 0 : manualPayoutFee();
}

export function payoutBlocker(d: MoneyData): string | null {
  if (d.frozen) return 'Payouts are paused by KUBICU while we check your account. See the notice above.';
  if (!canPayOut(d)) {
    if (d.kyc.status === 'rejected') return 'Your verification wasn’t approved. See the note on the Verification page.';
    if (!starterEligible(d)) return d.kyc.status === 'in_review' ? 'Your verification is with KUBICU for review. Payouts start as soon as it’s approved.' : 'Finish verifying your business to pay out. Sales still arrive as normal.';
    const missing = starterMissing(d);
    return `To start small payouts (up to ${formatMoney(tierInfo[1].dailyPayoutNgn)} a day) you still need: ${missing.join(', ').toLowerCase()}. Sales still arrive as normal.`;
  }
  if (!d.banks.length) return 'Add a bank account to pay out.';
  if (!usableBanks(d).length) return 'Your new bank account is in its 24-hour safety wait.';
  if (balances(d).available < minPayout()) return `You need at least ${formatMoney(minPayout())} available to pay out.`;
  return null;
}

/** Smallest payout in the workspace's currency (D433). */
export const minPayout = () => payoutRulesFor().minAuto;

/** How soon a payout lands, by account type and country (D433). Example timings. */
export function payoutArrival(kind: 'bank' | 'mobile_money' | undefined, now = new Date()): string {
  if (kind === 'mobile_money') return 'within minutes';
  const early = now.getHours() < 15;
  const c = activeCountry();
  if (c === 'ZA') return early ? 'today (same-day EFT)' : 'the next business day';
  if (c === 'KE' || c === 'GH') return early ? 'today, usually within 4 hours' : 'by midday the next business day';
  return early ? 'today, usually within 2 hours' : 'by 10am the next business day';
}

export function createPayout(
d: MoneyData,
input: {amountNgn: number;bankId: string;by: string;outcome: 'paid' | 'failed';auto: boolean;returnReason?: string;})
: {data: MoneyData;payout: Payout;} | {error: string;} {
  const bank = d.banks.find((b) => b.id === input.bankId);
  if (!bank) return { error: 'Choose a bank account.' };
  if (!usableBanks(d).some((b) => b.id === bank.id)) return { error: 'This account is still in its safety wait.' };
  const fee = payoutFee(input.auto);
  const available = balances(d).available;
  if (!canPayOut(d)) return { error: 'Finish the identity checks and add a bank account in your own name to pay out.' };
  if (input.amountNgn < minPayout()) return { error: `The smallest payout is ${formatMoney(minPayout())}.` };
  // Mobile money wallets cap a single transfer (M-Pesa KSh 250,000 — D432).
  const walletCap = payoutRulesFor().walletMaxPerTransfer;
  if (bank.kind === 'mobile_money' && walletCap && input.amountNgn > walletCap) return { error: `${bank.bankName} takes up to ${formatMoney(walletCap)} in one payout. Send the rest in another payout or to a bank account.` };
  if (input.amountNgn + fee > available) return { error: `You have ${formatMoney(available)} available, including the ${formatMoney(fee)} fee.` };
  const left = tierInfo[payoutTier(d)].dailyPayoutNgn - paidOutToday(d);
  if (input.amountNgn > left) return { error: `That's over today's limit. You can pay out up to ${formatMoney(Math.max(0, left))} more today.${isVerified(d) ? '' : ' Finish verification for higher limits.'}` };
  const at = new Date().toISOString();
  const bankLabel = `${bank.bankName} ····${bank.last4}`;
  const payout: Payout = { id: uid('po'), amountNgn: input.amountNgn, feeNgn: fee, bankId: bank.id, bankLabel, status: 'processing', createdAt: at, settledAt: null, outcome: input.outcome, failureReason: null, holdReason: null, auto: input.auto, by: input.by, ...(input.returnReason ? { returnReason: input.returnReason } : {}) };
  const entries: LedgerEntry[] = [{ id: uid('led'), at, kind: 'payout', amountNgn: -input.amountNgn, state: 'available', label: `Payout to ${bankLabel}`, ref: { type: 'payout', id: payout.id } }];
  if (fee) entries.push({ id: uid('led'), at, kind: 'fee', amountNgn: -fee, state: 'available', label: 'Payout fee', ref: { type: 'payout', id: payout.id } });
  return { data: { ...d, payouts: [payout, ...d.payouts], ledger: [...entries, ...d.ledger] }, payout };
}

/** Prototype: name check against the business name. */
export function nameMatchOf(accountName: string, businessName: string): BankAccount['nameMatch'] {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter((w) => w.length > 2 && !['ltd', 'limited', 'enterprises', 'the'].includes(w));
  const a = norm(accountName);
  const b = norm(businessName);
  if (!a.length || !b.length) return 'mismatch';
  const shared = a.filter((w) => b.includes(w)).length;
  if (shared >= Math.min(a.length, b.length)) return 'match';
  return shared > 0 ? 'close' : 'mismatch';
}

// ——— Payment links ———

export function linkUses(l: PaymentLink): number {
  return l.payments.length;
}

export type LinkView = 'active' | 'paused' | 'archived' | 'expired' | 'used_up';

export function linkView(l: PaymentLink): LinkView {
  if (l.status !== 'active') return l.status;
  if (l.expiresAt && Date.parse(l.expiresAt) < Date.now()) return 'expired';
  // Staged links close once every stage is paid (D95).
  const cap = l.kind === 'fixed' && l.stages && l.stages.length > 1 ? l.stages.length : l.reusable ? l.maxUses : 1;
  if (cap !== null && linkUses(l) >= cap) return 'used_up';
  return 'active';
}

export const linkViewLabels: Record<LinkView, string> = { active: 'Active', paused: 'Paused', archived: 'Archived', expired: 'Expired', used_up: 'Fully used' };
export const linkViewTones = { active: 'success', paused: 'warning', archived: 'neutral', expired: 'neutral', used_up: 'info' } as const;

export function linkMethod(d: MoneyData, l: PaymentLink): PayMethod {
  return l.method === 'default' ? methodFor(d, 'links') : l.method;
}

export function linkTotal(l: PaymentLink): number {
  return l.payments.reduce((s, p) => s + p.amountNgn, 0);
}

export const slugify = (s: string) =>
s.
toLowerCase().
replace(/[^a-z0-9]+/g, '-').
replace(/^-+|-+$/g, '').
slice(0, 40);

export function uniqueSlug(d: MoneyData, base: string, ignoreId?: string): string {
  const root = slugify(base) || 'pay';
  let slug = root;
  let n = 2;
  while (d.links.some((l) => l.slug === slug && l.id !== ignoreId)) slug = `${root}-${n++}`;
  return slug;
}

export function blankLink(): PaymentLink {
  return {
    id: uid('pl'),
    slug: '',
    title: '',
    description: '',
    kind: 'fixed',
    amountNgn: 0,
    minNgn: 1000,
    items: [],
    reusable: true,
    expiresAt: null,
    maxUses: null,
    fields: { name: true, phone: true, note: false },
    method: 'default',
    status: 'active',
    views: 0,
    createdAt: new Date().toISOString(),
    payments: []
  };
}

/** A payer's successful payment: recorded on the link and, for wallet/escrow, in the ledger. */
export function recordLinkPayment(d: MoneyData, linkId: string, p: Omit<LinkPayment, 'id' | 'at' | 'receipt' | 'method'>): {data: MoneyData;payment: LinkPayment;} | null {
  const link = d.links.find((l) => l.id === linkId);
  if (!link || linkView(link) !== 'active') return null;
  const method = linkMethod(d, link);
  const n = d.counters.receipt + 1;
  const at = new Date().toISOString();
  const payment: LinkPayment = { ...p, id: uid('lp'), at, method, receipt: `R-${String(n).padStart(5, '0')}` };
  const net = p.amountNgn - linkProviderFee(p.amountNgn);
  const label = `${link.title} · ${p.payerName || 'Payer'}`;
  const entries: LedgerEntry[] = [];
  if (method === 'wallet') entries.push({ id: uid('led'), at, kind: 'link', amountNgn: net, state: 'pending', availableAt: iso(Date.now() + settleHours() * HOUR), label, ref: { type: 'link', id: link.id, label: payment.receipt } });
  if (method === 'escrow') {
    const until = iso(Date.now() + inspectionDays.links * DAY);
    entries.push({ id: uid('led'), at, kind: 'link', amountNgn: net, state: 'held', availableAt: until, label: `${label} · in escrow`, ref: { type: 'link', id: link.id, label: payment.receipt } });
    const fee = sellerEscrowFee(d, p.amountNgn);
    if (fee) entries.push({ id: uid('led'), at, kind: 'fee', amountNgn: -fee, state: 'held', availableAt: until, label: `Escrow fee · ${payment.receipt}`, ref: { type: 'link', id: link.id } });
  }
  return {
    data: { ...d, counters: { receipt: n }, ledger: [...entries, ...d.ledger], links: d.links.map((l) => l.id === linkId ? { ...l, payments: [payment, ...l.payments] } : l) },
    payment
  };
}

/**
 * The organiser refunds one fundraiser payment in full (D179). The payer gets back what they paid;
 * the wallet records the refund, and the payment leaves the "raised" total. Test mode.
 */
export function refundLinkPayment(d: MoneyData, linkId: string, paymentId: string): MoneyData {
  const link = d.links.find((l) => l.id === linkId);
  const p = link?.payments.find((x) => x.id === paymentId);
  if (!link || !p || p.refundedNgn) return d;
  const at = new Date().toISOString();
  const entry: LedgerEntry = { id: uid('led'), at, kind: 'refund', amountNgn: -p.amountNgn, state: 'available', availableAt: at, label: `Refund · ${link.title} · ${p.receipt}`, ref: { type: 'link', id: link.id, label: p.receipt } };
  return {
    ...d,
    ledger: [entry, ...d.ledger],
    links: d.links.map((l) => l.id === linkId ? { ...l, payments: l.payments.map((x) => x.id === paymentId ? { ...x, refundedNgn: x.amountNgn, refundedAt: at } : x) } : l)
  };
}

/**
 * A client paid a Quotes & jobs invoice through its pay link (D95).
 * Follows the Quotes & jobs payment setting: direct = straight to the bank (no wallet entry), wallet = settles in 24h, escrow = held for the inspection window.
 */
export function recordInvoicePayment(
d: MoneyData,
p: {invoiceId: string;label: string;amountNgn: number;milestone: boolean;})
: {data: MoneyData;receipt: string;method: PayMethod;} {
  return recordStagePayment(d, 'quotes', { type: 'invoice', id: p.invoiceId }, p.label, p.amountNgn, p.milestone);
}

/** A staged payment (quote stage, booking balance, made-to-order balance) following that area's payment setting (D95). */
export function recordStagePayment(
d: MoneyData,
area: PayArea,
refBase: {type: LedgerRefType;id: string;},
label: string,
amountNgn: number,
milestone = true)
: {data: MoneyData;receipt: string;method: PayMethod;} {
  const method = methodFor(d, area);
  const n = d.counters.receipt + 1;
  const receipt = `R-${String(n).padStart(5, '0')}`;
  const at = new Date().toISOString();
  const net = amountNgn - linkProviderFee(amountNgn);
  const kind = milestone ? 'milestone' : 'sale';
  const ref = { ...refBase, label: receipt };
  const entries: LedgerEntry[] = [];
  if (method === 'wallet') entries.push({ id: uid('led'), at, kind, amountNgn: net, state: 'pending', availableAt: iso(Date.now() + settleHours() * HOUR), label, ref });
  if (method === 'escrow') {
    const until = iso(Date.now() + inspectionDays[area] * DAY);
    entries.push({ id: uid('led'), at, kind, amountNgn: net, state: 'held', availableAt: until, label: `${label} · in escrow`, ref });
    const fee = sellerEscrowFee(d, amountNgn);
    if (fee) entries.push({ id: uid('led'), at, kind: 'fee', amountNgn: -fee, state: 'held', availableAt: until, label: `Escrow fee · ${receipt}`, ref: refBase });
  }
  return { data: { ...d, counters: { receipt: n }, ledger: [...entries, ...d.ledger] }, receipt, method };
}

// ——— Sample data ———

function seedMoney(): MoneyData {
  const now = Date.now();
  const base = emptyMoney();
  const bank: BankAccount = { id: 'bank_s1', bankName: 'GTBank', last4: '4821', accountName: 'Adaeze Atelier', nameMatch: 'match', addedAt: iso(now - 40 * DAY), usableAt: iso(now - 39 * DAY), primary: true };
  const payout: Payout = { id: 'po_s1', amountNgn: 60_000, feeNgn: payoutRules.NG.manualFee, bankId: bank.id, bankLabel: 'GTBank ····4821', status: 'paid', createdAt: iso(now - 5 * DAY), settledAt: iso(now - 5 * DAY + 2 * HOUR), outcome: 'paid', failureReason: null, holdReason: null, auto: false, by: 'Owner', sample: true };
  const linkPayments: LinkPayment[] = [
  { id: 'lp_s1', at: iso(now - 3 * DAY), amountNgn: 15_000, payerName: 'Temi A.', payerPhone: '0803 000 1122', note: '', method: 'wallet', receipt: 'R-00001', sample: true, payBy: 'card', payerEmail: 'temi@example.com', answers: [{ label: 'Which class?', value: 'Saturday 10am' }] },
  { id: 'lp_s2', at: iso(now - 6 * HOUR), amountNgn: 15_000, payerName: 'Bisi O.', payerPhone: '0812 000 3344', note: 'Saturday class please', method: 'wallet', receipt: 'R-00002', sample: true, payBy: 'account', answers: [{ label: 'Which class?', value: 'Saturday 2pm' }] }];

  // D224 sample: one transfer to the seller's own account waiting to be confirmed.
  const pending: PendingTransfer[] = [
  {
    id: 'pt_s1',
    at: iso(now - 2 * HOUR),
    status: 'waiting',
    payment: { amountNgn: 15_000, payerName: 'Ngozi E.', payerPhone: '0809 000 5566', note: '', payBy: 'transfer', transferTo: { bank: 'GTBank', account: '0123454821', accountName: 'Adaeze Atelier' }, answers: [{ label: 'Which class?', value: 'Saturday 10am' }], sample: true }
  }];

  const link: PaymentLink = {
    ...blankLink(),
    id: 'pl_s1',
    slug: 'gele-masterclass',
    title: 'Gele tying masterclass — one seat',
    description: 'Two-hour hands-on class at the studio. Bring your own gele or use ours.',
    kind: 'fixed',
    amountNgn: 15_000,
    reusable: true,
    maxUses: 12,
    method: 'wallet',
    views: 41,
    createdAt: iso(now - 10 * DAY),
    payments: linkPayments,
    sample: true,
    ask: { email: 'optional', address: 'off' },
    questions: [{ id: 'q_s1', label: 'Which class?', type: 'choice', options: ['Saturday 10am', 'Saturday 2pm'], required: true }],
    after: { message: 'Thank you! We’ll send directions to the studio the day before your class.', redirectUrl: '' },
    pendingTransfers: pending
  };
  const ledger: LedgerEntry[] = [
  { id: 'led_s1', at: iso(now - 6 * HOUR), kind: 'link', amountNgn: 15_000 - linkProviderFee(15_000), state: 'pending', availableAt: iso(now + 18 * HOUR), label: 'Gele tying masterclass · Bisi O.', ref: { type: 'link', id: link.id, label: 'R-00002' }, sample: true },
  { id: 'led_s2', at: iso(now - 3 * DAY), kind: 'link', amountNgn: 15_000 - linkProviderFee(15_000), state: 'available', label: 'Gele tying masterclass · Temi A.', ref: { type: 'link', id: link.id, label: 'R-00001' }, sample: true },
  { id: 'led_s3', at: iso(now - 4 * DAY), kind: 'sale', amountNgn: 62_000, state: 'available', label: 'Order #1038 · Kemi B.', sample: true },
  { id: 'led_s4', at: iso(now - 5 * DAY), kind: 'fee', amountNgn: -payoutRules.NG.manualFee, state: 'available', label: 'Payout fee', ref: { type: 'payout', id: payout.id }, sample: true },
  { id: 'led_s5', at: iso(now - 5 * DAY), kind: 'payout', amountNgn: -60_000, state: 'available', label: 'Payout to GTBank ····4821', ref: { type: 'payout', id: payout.id }, sample: true },
  { id: 'led_s6', at: iso(now - 7 * DAY), kind: 'sale', amountNgn: 45_000, state: 'available', label: 'Order #1031 · Ifeoma N.', sample: true },
  { id: 'led_s7', at: iso(now - 9 * DAY), kind: 'sale', amountNgn: 28_500, state: 'available', label: 'Order #1027 · Chuka E.', sample: true },
  { id: 'led_s8', at: iso(now - 12 * DAY), kind: 'topup', amountNgn: 20_000, state: 'available', label: 'Top-up by bank transfer', sample: true }];

  // Demo starts unverified so the verification flow is the first thing to try (D93).
  return { ...base, ledger, banks: [bank], payouts: [payout], verification: { tier: 0, pending: null, rejectedNote: null }, links: [link], counters: { receipt: 2 }, seeded: true };
}