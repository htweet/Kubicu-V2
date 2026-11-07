import type { AccountingRun, AccountingState, AccountKey } from '../../types/accounting';
import type { IncomeEntry } from '../commerce/salesReport';
import type { Payout } from '../../types/money';
import { activeCountry, countryInfo } from '../country';
import { accountLabels } from '../../data/accountingProviders';
import { uid } from '../id';

/** One stable key per payment line, so a payment is never posted twice (D438). */
export const entryKey = (e: IncomeEntry) => `${e.type}:${e.ref}`;

export function emptyAccounting(): AccountingState {
  const d = new Date();
  d.setDate(1);
  return {
    provider: null,
    organisation: '',
    connectedAt: null,
    mode: 'each',
    startFrom: d.toISOString().slice(0, 10),
    accounts: { sales: '', fees: '', refunds: '', vat: '', clearing: '', bank: '' },
    auto: true,
    synced: {},
    runs: [],
  };
}

/** Live payments from the start date that haven't been posted yet. Sample data never syncs. */
export function waiting(s: AccountingState, entries: IncomeEntry[]): IncomeEntry[] {
  const from = Date.parse(s.startFrom);
  return entries.filter((e) => !e.sample && Date.parse(e.at) >= from && !s.synced[entryKey(e)]).sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
}

/** Wallet payouts that reached the bank from the start date and haven't been posted yet (D452). */
export const payoutKey = (p: Payout) => `payout:${p.id}`;
export function payoutsWaiting(s: AccountingState, payouts: Payout[]): Payout[] {
  const from = Date.parse(s.startFrom);
  return payouts.filter((p) => !p.sample && p.status === 'paid' && p.settledAt && Date.parse(p.settledAt) >= from && !s.synced[payoutKey(p)]).sort((a, b) => Date.parse(a.settledAt!) - Date.parse(b.settledAt!));
}

/** Account codes that are missing for the lines waiting. */
export function missingAccounts(s: AccountingState, list: IncomeEntry[], payouts: Payout[] = []): string[] {
  const need = new Set<AccountKey>(list.length ? ['sales', 'clearing'] : []);
  list.forEach((e) => {
    if (e.fees) need.add('fees');
    if (e.refunded) need.add('refunds');
    if (e.vat && !abroadTax(e)) need.add('vat');
  });
  if (payouts.length) {
    need.add('clearing');
    need.add('bank');
    if (payouts.some((p) => p.feeNgn > 0)) need.add('fees');
  }
  return [...need].filter((k) => !(s.accounts[k] ?? '').trim()).map((k) => accountLabels[k].label);
}

/** Tax for another country goes to that country's own tax account (D456). The shop's own country uses "Tax collected". */
export const abroadTax = (e: IncomeEntry) => (e.vat > 0 && e.vatCountry && e.vatCountry !== activeCountry() ? e.vatCountry : null);

/** Countries whose tax account code is missing for the lines waiting. */
export function missingTaxCountries(s: AccountingState, list: IncomeEntry[]): string[] {
  return [...new Set(list.map(abroadTax).filter((c): c is NonNullable<typeof c> => !!c))].filter((c) => !(s.accounts.vatAbroad?.[c] ?? '').trim());
}

/**
 * Posts what's waiting. Lines needing a missing account fail and stay waiting; the rest post.
 * Daily mode groups a day's lines into one summary, so one bad line holds back its whole day.
 */
export function runSync(s: AccountingState, entries: IncomeEntry[], trigger: AccountingRun['trigger'], payouts: Payout[] = []): AccountingState {
  const list = waiting(s, entries);
  const at = new Date().toISOString();
  const lineProblem = (e: IncomeEntry): string | null => {
    if (!s.accounts.sales.trim() || !s.accounts.clearing.trim()) return 'Sales and clearing accounts are needed';
    if (e.fees && !s.accounts.fees.trim()) return 'No payment fees account';
    if (e.refunded && !s.accounts.refunds.trim()) return 'No refunds account';
    const abroad = abroadTax(e);
    if (abroad && !(s.accounts.vatAbroad?.[abroad] ?? '').trim()) return `No tax account for ${countryInfo(abroad).name}`;
    if (e.vat && !abroad && !s.accounts.vat.trim()) return 'No tax collected account';
    return null;
  };
  const groups = s.mode === 'daily' ? Object.values(list.reduce<Record<string, IncomeEntry[]>>((g, e) => ((g[e.at.slice(0, 10)] ??= []).push(e), g), {})) : list.map((e) => [e]);
  const synced = { ...s.synced };
  const problems = new Set<string>();
  let posted = 0;
  let failed = 0;
  let amountNgn = 0;
  groups.forEach((g) => {
    const issue = g.map(lineProblem).find(Boolean);
    if (issue) {
      failed += g.length;
      problems.add(s.mode === 'daily' ? `${g[0].at.slice(0, 10)}: ${issue}` : `${g[0].ref}: ${issue}`);
      return;
    }
    g.forEach((e) => {
      synced[entryKey(e)] = at;
      posted++;
      amountNgn += e.paid;
    });
  });
  // Payouts (D452): each one is a transfer from the clearing account to the bank account — not sales.
  // A manual payout's fee (D455) posts from clearing to the payment fees account. Only payouts that reached the
  // bank are posted, so a returned payout (status 'failed') never needs reversing.
  const outs = payoutsWaiting(s, payouts);
  let transfers = 0;
  let payoutFeesNgn = 0;
  outs.forEach((p) => {
    const issue = !s.accounts.clearing.trim() || !(s.accounts.bank ?? '').trim() ? 'clearing and bank accounts are needed' : p.feeNgn > 0 && !s.accounts.fees.trim() ? 'no payment fees account for the payout fee' : null;
    if (issue) {
      failed++;
      problems.add(`Payouts: ${issue}`);
      return;
    }
    synced[payoutKey(p)] = at;
    transfers++;
    payoutFeesNgn += p.feeNgn;
  });
  posted += transfers;
  const run: AccountingRun = { id: uid('acr'), at, posted, failed, amountNgn, trigger, problems: [...problems].slice(0, 5), transfers, payoutFeesNgn };
  return { ...s, synced, runs: [run, ...s.runs].slice(0, 20) };
}
