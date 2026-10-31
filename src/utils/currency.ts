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
  // The app shell, seller pages and staff console never convert (D421); only the website turns it back on.
  display = null;
}

export const activeCurrency = (): CurrencyCode => active;
export const currencySymbol = (code: CurrencyCode = active): string => currencyInfo(code).symbol;
/** USSD, pay on delivery, instalments and Nigerian bank payouts only work in naira. */
export const isNaira = (code: CurrencyCode = active) => code === 'NGN';

/**
 * Display conversion for KUBICU's public website (D421). While the website is on screen in Kiswahili, Twi or
 * isiZulu, every naira amount written without an explicit currency — sample prices, KUBICU's plan, template and
 * add-on prices — is shown in that country's currency at a fixed example rate, rounded. Nothing is charged at
 * these rates. Seller pages in their own currency (active ≠ NGN) and explicit-currency calls never convert.
 */
const nairaPer: Partial<Record<CurrencyCode, number>> = { NGN: 1, KES: 12, GHS: 135, ZAR: 85 };
let display: CurrencyCode | null = null;

export function setDisplayConversion(code: CurrencyCode | null): void {
  display = code && code !== 'NGN' && nairaPer[code] ? code : null;
}

export const displayConversion = (): CurrencyCode | null => display;

/** Rounds a converted example amount to a natural-looking figure for its currency. */
export function tidyAmount(amount: number, code: CurrencyCode): number {
  if (amount === 0) return 0;
  const step = code === 'GHS' ? 5 : code === 'ZAR' ? 10 : code === 'KES' ? amount >= 1000 ? 50 : 10 : 1;
  return Math.max(step, Math.round(amount / step) * step);
}

/** A naira amount converted to `code` at the example rate (not a live rate), rounded. */
export function convertExampleNaira(naira: number, code: CurrencyCode): number {
  if (code === 'NGN') return naira;
  return tidyAmount(naira / (nairaPer[code] ?? 1), code);
}

export function formatMoney(amount: number, code?: CurrencyCode): string {
  if (code === undefined && display && active === 'NGN') return formatterFor(display).format(convertExampleNaira(amount, display));
  return formatterFor(code ?? active).format(amount);
}

/** Replaces every "₦12,500" inside fixed text with the converted amount while the website converts (D421). */
export function localiseAmounts(text: string): string {
  if (!display) return text;
  const code = display;
  return text.replace(/₦\s?(\d[\d,]*)/g, (_m, n: string) => formatterFor(code).format(convertExampleNaira(Number(n.replace(/,/g, '')), code)));
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

/**
 * KUBICU's own prices (plans, templates, extensions, print orders) — billed in naira. On the public website in
 * Kiswahili, Twi or isiZulu they're shown converted at the example rate (D421); everywhere else, naira.
 */
export function formatNaira(amount: number): string {
  if (display) return formatterFor(display).format(convertExampleNaira(amount, display));
  return formatterFor('NGN').format(amount);
}