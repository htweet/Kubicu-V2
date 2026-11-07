import type { Workspace } from '../../types/workspace';
import { countryInfo, workspaceCountry } from '../country';
import { convertExampleNaira, formatMoney, type CurrencyCode } from '../currency';
import { nairaPerToday } from '../fxRates';

/**
 * Staff screens show each workspace's money in that workspace's own currency (D494). Seller amounts are stored
 * as plain numbers in the workspace currency (D353), so nothing is converted for display — only labelled correctly.
 */
export const workspaceCurrency = (ws: Pick<Workspace, 'currency' | 'country'> | null | undefined): CurrencyCode => ws?.currency ?? countryInfo(workspaceCountry(ws)).currency;

/** Looks up currencies by workspace id once per render. */
export function currencyLookup(workspaces: Workspace[]) {
  const map = new Map(workspaces.map((w) => [w.id, workspaceCurrency(w)]));
  const of = (id: string): CurrencyCode => map.get(id) ?? 'NGN';
  return {
    of,
    money: (id: string, amount: number) => formatMoney(amount, of(id)),
    /** A naira threshold (e.g. "large payout") expressed in this workspace's currency at the day's rate. */
    threshold: (id: string, naira: number) => convertExampleNaira(naira, of(id)),
  };
}

/** An amount in any currency, in naira at the day's rate — for KUBICU-wide totals. */
export const toNaira = (amount: number, code: CurrencyCode): number => (code === 'NGN' ? amount : Math.round(amount * nairaPerToday(code)));

/** Totals across workspaces in different currencies: one figure per currency, naira first. Never adds currencies together. */
export function formatTotals(items: { currency: CurrencyCode; amount: number }[]): string {
  const sums = new Map<CurrencyCode, number>();
  for (const i of items) sums.set(i.currency, (sums.get(i.currency) ?? 0) + i.amount);
  const shown = [...sums].filter(([, n]) => n !== 0).sort(([a], [b]) => (a === 'NGN' ? -1 : b === 'NGN' ? 1 : a.localeCompare(b)));
  if (!shown.length) return formatMoney(0, 'NGN');
  return shown.map(([c, n]) => formatMoney(n, c)).join(' · ');
}
