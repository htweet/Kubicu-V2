import type { CountryCode, CountryInfo } from '../types/country';
import type { CurrencyCode } from './currency';
import { countries } from '../data/countries';

/** The country table row for a code. Missing or unknown = Nigeria, so older workspaces keep working (D352). */
export const countryInfo = (code: CountryCode | undefined | null): CountryInfo => countries.find((c) => c.code === code) ?? countries[0];

/** The country whose currency this is, when a workspace has a currency but no country yet. */
export function countryForCurrency(code: CurrencyCode | undefined): CountryCode {
  return countries.find((c) => c.currency === code)?.code ?? 'NG';
}

/** A workspace's country: its own setting, else inferred from its currency, else Nigeria. */
export function workspaceCountry(ws: {country?: CountryCode;currency?: CurrencyCode;} | null | undefined): CountryCode {
  return ws?.country ?? countryForCurrency(ws?.currency);
}

/**
 * The country of whichever workspace is on screen. Set next to the active currency by the app shell and
 * public pages, so forms, phone fields and checkout pick the right defaults without threading props.
 */
let active: CountryCode = 'NG';

export function setActiveCountry(code: CountryCode | undefined): void {
  active = code ?? 'NG';
}

export const activeCountry = (): CountryCode => active;

/**
 * Best guess at a visitor's country from their screen language, for public screens with no workspace behind them
 * (Copilot, D420): Kiswahili → Kenya, Twi → Ghana, isiZulu → South Africa, anything else → Nigeria.
 */
export function countryForLanguage(lang: string): CountryCode {
  if (lang === 'sw') return 'KE';
  if (lang === 'tw') return 'GH';
  if (lang === 'zu') return 'ZA';
  return 'NG';
}
export const activeCountryInfo = (): CountryInfo => countryInfo(active);

/** Is this account number the right length for the country's banks? Returns an English message or null. */
export function accountNumberIssue(value: string, code: CountryCode = active): string | null {
  const rule = countryInfo(code).accountNumber;
  const digits = value.replace(/\D/g, '');
  if (!digits) return 'Enter the account number';
  if (digits.length < rule.min || digits.length > rule.max) return `Account numbers here are ${rule.label}`;
  return null;
}