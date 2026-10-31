import type { CountryCode } from '../types/country';
import { countries } from '../data/countries';
import { activeCountry, countryInfo } from './country';

/**
 * Country-aware phone numbers (D354). Numbers are stored as typed text, as they always were; these helpers
 * split them into a country code and the local part, join them back in international form, and check the
 * length for the four countries KUBICU sells from. Other country codes get the old generic check.
 */

const digitsOf = (s: string) => s.replace(/\D/g, '');

/** Which of our countries an international number belongs to, by its dialling code. */
function countryOfDigits(d: string): CountryCode | null {
  // Longest code first so +27 never shadows a longer code.
  const hit = [...countries].sort((a, b) => b.dialCode.length - a.dialCode.length).find((c) => d.startsWith(c.dialCode));
  return hit?.code ?? null;
}

/** Splits a stored number into country and local digits (without the leading 0). */
export function splitPhone(value: string, fallback: CountryCode = activeCountry()): {country: CountryCode;local: string;foreign: boolean;} {
  const v = value.trim();
  const d = digitsOf(v);
  if (v.startsWith('+') || v.startsWith('00')) {
    const intl = v.startsWith('00') ? d.slice(2) : d;
    const code = countryOfDigits(intl);
    if (code) return { country: code, local: intl.slice(countryInfo(code).dialCode.length), foreign: false };
    return { country: fallback, local: intl, foreign: true };
  }
  return { country: fallback, local: d.replace(/^0/, ''), foreign: false };
}

/** Groups local digits for reading: 803 123 4567, 712 345 678. */
export function groupLocal(local: string): string {
  const d = digitsOf(local);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
}

/** International form, e.g. "+254 712 345 678". Empty local part = empty string. */
export function joinPhone(country: CountryCode, local: string): string {
  const d = digitsOf(local).replace(/^0/, '');
  if (!d) return '';
  return `+${countryInfo(country).dialCode} ${groupLocal(d)}`;
}

/** English message for a number that's the wrong length for its country, or null when it looks right. */
export function phoneIssue(value: string, fallback: CountryCode = activeCountry()): string | null {
  const v = value.trim();
  if (!v) return null;
  const { country, local, foreign } = splitPhone(v, fallback);
  if (foreign || !(v.startsWith('+') || v.startsWith('0') || v.startsWith('00'))) {
    return /^\+?[0-9][0-9\s-]{9,16}$/.test(v) ? null : 'Phone number looks incomplete';
  }
  const need = countryInfo(country).nationalLength;
  if (local.length !== need) return `Numbers in ${countryInfo(country).name} have ${need} digits after +${countryInfo(country).dialCode}`;
  return null;
}

type Tr = (s: string, vars?: Record<string, string | number>) => string;

/** The same check, written in the screen language. */
export function phoneIssueIn(tr: Tr, value: string, fallback: CountryCode = activeCountry()): string | null {
  const v = value.trim();
  if (!v || phoneIssue(v, fallback) === null) return null;
  const { country, foreign } = splitPhone(v, fallback);
  if (foreign || !(v.startsWith('+') || v.startsWith('0'))) return tr('Phone number looks incomplete');
  const info = countryInfo(country);
  return tr('Numbers in {country} have {n} digits after +{code}', { country: tr(info.name), n: info.nationalLength, code: info.dialCode });
}

/**
 * Finds a complete mobile number from one of our four countries anywhere in a piece of text (D420) and returns it
 * in compact international form ("+254712345678"), or null. A number with a country code is read as that country.
 * A local 0… number is read as `fallback`'s when the length fits; otherwise as the one country whose length fits
 * (an 11-digit 0… number can only be Nigerian). Used where people type freely, like Copilot's chat.
 */
export function findMobileNumber(text: string, fallback: CountryCode = activeCountry()): string | null {
  const candidates = text.match(/(?:\+|00)?\d[\d\s-]{6,18}\d/g) ?? [];
  for (const raw of candidates) {
    const v = raw.trim();
    const d = digitsOf(v);
    const hasPrefix = v.startsWith('+') || v.startsWith('00');
    if (hasPrefix || !d.startsWith('0')) {
      const intl = v.startsWith('00') ? d.slice(2) : d;
      const code = countryOfDigits(intl);
      if (!code) continue;
      const info = countryInfo(code);
      if (intl.length === info.dialCode.length + info.nationalLength) return `+${intl}`;
      continue;
    }
    const local = d.slice(1);
    const own = countryInfo(fallback);
    if (local.length === own.nationalLength) return `+${own.dialCode}${local}`;
    const fits = countries.filter((c) => c.nationalLength === local.length);
    if (fits.length === 1) return `+${fits[0].dialCode}${local}`;
  }
  return null;
}

/** A placeholder in the workspace's country, e.g. "+254 712 345 678". */
export function phonePlaceholder(country: CountryCode = activeCountry()): string {
  const info = countryInfo(country);
  return `+${info.dialCode} ${info.phoneExample.replace(/^0/, '')}`;
}

/** "+254 …" for short placeholders. */
export function dialPrefix(country: CountryCode = activeCountry()): string {
  return `+${countryInfo(country).dialCode} …`;
}