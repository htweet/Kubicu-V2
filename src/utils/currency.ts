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

/** KUBICU's own prices (plans, templates, extensions, print orders) — always naira. */
export function formatNaira(amount: number): string {
  return formatterFor('NGN').format(amount);
}