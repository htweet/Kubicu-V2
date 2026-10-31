/**
 * One currency per workspace (D136). Every amount a seller sets or a buyer pays is shown in the
 * workspace's currency, with no conversion. KUBICU's own plan prices always stay in naira.
 */
export type CurrencyCode = 'NGN' | 'GHS' | 'KES' | 'ZAR' | 'USD' | 'GBP' | 'EUR';

export interface CurrencyInfo {
  code: CurrencyCode;
  name: string;
  symbol: string;
  locale: string;
  country: string;
}

export const currencies: CurrencyInfo[] = [
{ code: 'NGN', name: 'Nigerian naira', symbol: '₦', locale: 'en-NG', country: 'Nigeria' },
{ code: 'GHS', name: 'Ghanaian cedi', symbol: 'GH₵', locale: 'en-GH', country: 'Ghana' },
{ code: 'KES', name: 'Kenyan shilling', symbol: 'KSh', locale: 'en-KE', country: 'Kenya' },
{ code: 'ZAR', name: 'South African rand', symbol: 'R', locale: 'en-ZA', country: 'South Africa' },
{ code: 'USD', name: 'US dollar', symbol: '$', locale: 'en-US', country: 'United States' },
{ code: 'GBP', name: 'British pound', symbol: '£', locale: 'en-GB', country: 'United Kingdom' },
{ code: 'EUR', name: 'Euro', symbol: '€', locale: 'en-IE', country: 'Euro area' }];


export const currencyInfo = (code: CurrencyCode): CurrencyInfo => currencies.find((c) => c.code === code) ?? currencies[0];

const formatters = new Map<CurrencyCode, Intl.NumberFormat>();
function formatterFor(code: CurrencyCode): Intl.NumberFormat {
  let f = formatters.get(code);
  if (!f) {
    const info = currencyInfo(code);
    f = new Intl.NumberFormat(info.locale, { style: 'currency', currency: code, currencyDisplay: code === 'GHS' || code === 'KES' ? 'symbol' : 'narrowSymbol', maximumFractionDigits: 0 });
    formatters.set(code, f);
  }
  return f;
}

/**
 * The currency of whichever workspace is on screen. Set by the app shell, the public page of the
 * workspace being viewed, and the staff console (always naira).
 */
let active: CurrencyCode = 'NGN';

export function setActiveCurrency(code: CurrencyCode | undefined): void {
  active = code ?? 'NGN';
}

export const activeCurrency = (): CurrencyCode => active;
export const currencySymbol = (code: CurrencyCode = active): string => currencyInfo(code).symbol;
/** USSD, pay on delivery, instalments and Nigerian bank payouts only work in naira. */
export const isNaira = (code: CurrencyCode = active) => code === 'NGN';

export function formatMoney(amount: number, code: CurrencyCode = active): string {
  return formatterFor(code).format(amount);
}

/** A plain number grouped the way the currency's country writes it (12,500 / 12 500), no symbol. */
export function groupNumber(amount: number, code: CurrencyCode = active): string {
  return new Intl.NumberFormat(currencyInfo(code).locale, { maximumFractionDigits: 0 }).format(amount);
}

/** Compact amount for chart axes: ₦1.2m, KSh 45k. */
export function formatShortMoney(amount: number, code: CurrencyCode = active): string {
  const s = currencySymbol(code);
  const sep = s.length > 1 ? ' ' : '';
  if (Math.abs(amount) >= 1_000_000) return `${s}${sep}${(amount / 1_000_000).toFixed(1)}m`;
  if (Math.abs(amount) >= 1000) return `${s}${sep}${Math.round(amount / 1000)}k`;
  return `${s}${sep}${amount}`;
}

/**
 * Swaps "₦" in a fixed, already-translated sentence for the workspace's symbol (D352), so examples and
 * minimums like "at least ₦100" read right in KSh, GH₵ or R without re-keying every draft. Naira is unchanged.
 * Only for seller amounts — never KUBICU's own prices or provider fees.
 */
export function withSymbol(text: string, code: CurrencyCode = active): string {
  if (code === 'NGN') return text;
  const s = currencySymbol(code);
  return text.replace(/₦/g, s.length > 1 ? `${s} ` : s);
}

/** KUBICU's own prices (plans, templates, extensions, print orders) — always naira. */
export function formatNaira(amount: number): string {
  return formatterFor('NGN').format(amount);
}