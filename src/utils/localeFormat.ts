import type { UiLang } from '../data/translations';

/**
 * Dates and times in the reader's language (D510). Each interface language maps to the closest locale the
 * browser's date formatter knows; when a browser has no data for it (Twi often isn't bundled), it falls back
 * to British English so dates never break.
 */
const preferred: Record<UiLang, string[]> = {
  en: ['en-GB'],
  pcm: ['pcm-NG', 'en-NG', 'en-GB'],
  yo: ['yo-NG', 'en-NG', 'en-GB'],
  ha: ['ha-NG', 'en-NG', 'en-GB'],
  ig: ['ig-NG', 'en-NG', 'en-GB'],
  sw: ['sw-KE', 'sw', 'en-GB'],
  tw: ['ak-GH', 'ak', 'en-GH', 'en-GB'],
  zu: ['zu-ZA', 'zu', 'en-ZA', 'en-GB']
};

const cache = new Map<UiLang, string>();

/** The best supported Intl locale for an interface language. */
export function dateLocale(lang: UiLang = 'en'): string {
  const hit = cache.get(lang);
  if (hit) return hit;
  let chosen = 'en-GB';
  try {
    chosen = Intl.DateTimeFormat.supportedLocalesOf(preferred[lang] ?? ['en-GB'])[0] ?? 'en-GB';
  } catch {

    /* very old browser — keep English */}
  cache.set(lang, chosen);
  return chosen;
}

/**
 * The interface language the screen is being drawn in (D513). LocaleProvider sets it while rendering, so plain
 * helpers such as formatRelative ("2 hours ago") can follow the language without every caller passing it.
 * The innermost provider wins for its subtree because React renders parents before children.
 */
let activeLang: UiLang = 'en';
let activeTr: FormatTr | null = null;
/** Called by LocaleProvider with its language and translator (D513, translator added in D514). */
export function setActiveLang(lang: UiLang, tr?: FormatTr): void {
  activeLang = lang;
  activeTr = tr ?? null;
}
export function currentLang(): UiLang {
  return activeLang;
}

/**
 * Whether the browser can write dates in this language itself. English and Pidgin always can (Pidgin reads
 * English dates); the others only when the browser bundles that language — Twi often isn't (D514).
 */
export function browserKnows(lang: UiLang): boolean {
  return lang === 'en' || lang === 'pcm' || !dateLocale(lang).startsWith('en');
}

/** Units in the order relativeTime picks them, with our own phrases for languages the browser doesn't know. */
const ownPhrases = {
  minute: ['{n} min ago', 'in {n} min'],
  hour: ['{n} h ago', 'in {n} h'],
  day: ['{n} days ago', 'in {n} days'],
  month: ['{n} months ago', 'in {n} months'],
  year: ['{n} years ago', 'in {n} years']
} as const;

/**
 * "3 hours ago", "in 2 days" in the given language. Uses the browser's own wording where it knows the language;
 * otherwise our drafted phrases through the active translator (D514), so Twi and friends never fall back to English.
 */
export function relativeTime(date: Date, lang: UiLang, now = Date.now()): string | null {
  const secs = Math.round((date.getTime() - now) / 1000);
  const abs = Math.abs(secs);
  const pick = (): [Intl.RelativeTimeFormatUnit, number] => {
    if (abs < 45 * 60) return ['minute', Math.round(secs / 60)];
    if (abs < 22 * 3600) return ['hour', Math.round(secs / 3600)];
    if (abs < 26 * 86400) return ['day', Math.round(secs / 86400)];
    if (abs < 320 * 86400) return ['month', Math.round(secs / (30 * 86400))];
    return ['year', Math.round(secs / (365 * 86400))];
  };
  if (!browserKnows(lang)) {
    if (!activeTr) return null;
    if (abs < 45) return activeTr('just now');
    const [unit, n] = pick();
    const [ago, ahead] = ownPhrases[unit as keyof typeof ownPhrases];
    return activeTr(n < 0 ? ago : ahead, { n: Math.abs(n) });
  }
  try {
    const rtf = new Intl.RelativeTimeFormat(dateLocale(lang), { numeric: 'auto' });
    if (abs < 45) return rtf.format(0, 'second');
    const [unit, n] = pick();
    return rtf.format(n, unit);
  } catch {
    return null;
  }
}

/** Short month name for a 0-based month in a language the browser doesn't know, through the translator (D514). */
const monthShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export function ownMonthName(englishShort: string): string {
  // Some browsers write September as "Sept" in British English.
  const key = englishShort === 'Sept' ? 'Sep' : englishShort;
  return activeTr && monthShort.includes(key) ? activeTr(key) : englishShort;
}

/** A translator: English phrase with {placeholders} in, display text out. Plain English when none is given. */
export type FormatTr = (phrase: string, vars?: Record<string, string | number>) => string;
export const plainTr: FormatTr = (s, v) => v ? s.replace(/\{(\w+)\}/g, (_, k: string) => String(v[k] ?? '')) : s;

/** "45 min", "1 h 30 min", "2 h" — through the translator so the units follow the reader's language. */
export function durationText(minutes: number, tr: FormatTr = plainTr): string {
  if (minutes < 60) return tr('{n} min', { n: minutes });
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? tr('{h} h {m} min', { h, m }) : tr('{h} h', { h });
}