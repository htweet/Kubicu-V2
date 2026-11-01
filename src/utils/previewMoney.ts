import type { UiLang } from '../data/translations';
import type { CountryCode } from '../types/country';
import { countryInfo } from './country';
import type { Block } from '../types/page';
import { convertExampleNaira, displayConversion, formatMoney, localiseAmounts, type CurrencyCode } from './currency';

/**
 * Example amounts on KUBICU's own public pages follow the visitor's language (D373, D421): Kiswahili shows Kenya,
 * Twi shows Ghana, isiZulu shows South Africa, everything else Nigeria. Fixed example rates, not live rates.
 * Real seller prices never convert (D136).
 */
const langCountry: Partial<Record<UiLang, CountryCode>> = { sw: 'KE', tw: 'GH', zu: 'ZA' };

export const countryForLang = (lang: UiLang): CountryCode => langCountry[lang] ?? 'NG';

/** The currency the public website shows in for a language. */
export const currencyForLang = (lang: UiLang): CurrencyCode => countryInfo(countryForLang(lang)).currency as CurrencyCode;

/** A sample amount, written in naira in the source, shown in the currency of the language's country. */
export function previewAmount(naira: number, lang: UiLang): string {
  const code = currencyForLang(lang);
  return formatMoney(convertExampleNaira(naira, code), code);
}

/** Every "₦…" inside any text of a value, recursively (strings, arrays, plain objects). */
function localiseDeep<T>(value: T): T {
  if (typeof value === 'string') return (value.includes('₦') ? localiseAmounts(value) : value) as T;
  if (Array.isArray(value)) return value.map(localiseDeep) as T;
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, localiseDeep(v)])) as T;
  return value;
}

/**
 * Example pages on the website (template previews, example phones) with amounts the fictional businesses typed
 * into their own text — "From ₦35,000" — converted while the website converts (D423). A no-op everywhere else.
 */
export function localiseBlockAmounts(blocks: Block[]): Block[] {
  if (!displayConversion()) return blocks;
  return blocks.map((b) => ({ ...b, content: localiseDeep(b.content) }) as Block);
}

/** Replaces the first naira amount inside an already-translated sentence with the converted sample amount. */
export function swapPreviewAmount(text: string, naira: number, lang: UiLang): string {
  if (countryForLang(lang) === 'NG') return text;
  return text.replace(/₦\s?\d[\d,.\u00a0 ]*\d|₦\s?\d/, previewAmount(naira, lang));
}