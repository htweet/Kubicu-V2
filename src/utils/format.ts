import { formatDistanceToNow, format } from 'date-fns';
import { formatMoney } from './currency';
import { browserKnows, currentLang, dateLocale, ownMonthName, relativeTime } from './localeFormat';

/**
 * Formats a seller's amount in the currency of the workspace on screen (D136).
 * The name is kept from when every workspace used naira; KUBICU's own prices use formatNaira.
 */
export function formatNgn(amount: number): string {
  return formatMoney(amount);
}

export { formatNaira } from './currency';

/** "2 hours ago". English keeps its existing wording; other languages use the browser's own phrasing (D513). */
export function formatRelative(iso: string): string {
  const lang = currentLang();
  if (lang !== 'en') {
    const out = relativeTime(new Date(iso), lang);
    if (out) return out;
  }
  return formatDistanceToNow(new Date(iso), { addSuffix: true });
}

/**
 * Dates follow the person's Account preferences — date order and time zone (D125).
 * Read straight from device storage so every screen agrees without threading props.
 */
function datePrefs(): { dateFormat: 'dmy' | 'mdy' | 'iso'; timeZone: string } {
  try {
    const raw = localStorage.getItem('kubicu.account');
    const p = raw ? (JSON.parse(raw) as { prefs?: { dateFormat?: 'dmy' | 'mdy' | 'iso'; timeZone?: string } }).prefs : undefined;
    return { dateFormat: p?.dateFormat ?? 'dmy', timeZone: p?.timeZone ?? 'Africa/Lagos' };
  } catch {
    return { dateFormat: 'dmy', timeZone: 'Africa/Lagos' };
  }
}

function zonedParts(d: Date, timeZone: string) {
  try {
    // Month names follow the screen language (D513); digits stay Western so the date orders below still line up.
    // Where the browser doesn't know the language, the English short month goes through our own drafts (D514).
    const lang = currentLang();
    const native = lang === 'en' || browserKnows(lang);
    const parts = new Intl.DateTimeFormat(native && lang !== 'en' ? dateLocale(lang) : 'en-GB', { timeZone, day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false, numberingSystem: 'latn' }).formatToParts(d);
    const raw = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
    const get = (t: string) => (t === 'month' && !native ? ownMonthName(raw(t)) : raw(t));
    const num = new Intl.DateTimeFormat('en-GB', { timeZone, month: '2-digit', day: '2-digit' }).formatToParts(d);
    const getNum = (t: string) => num.find((p) => p.type === t)?.value ?? '';
    return { day: get('day'), mon: get('month'), year: get('year'), hour: get('hour') === '24' ? '00' : get('hour'), minute: get('minute'), mm: getNum('month'), dd: getNum('day') };
  } catch {
    return null;
  }
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  const { dateFormat, timeZone } = datePrefs();
  const p = zonedParts(d, timeZone);
  if (!p) return format(d, 'd MMM yyyy');
  if (dateFormat === 'iso') return `${p.year}-${p.mm}-${p.dd}`;
  if (dateFormat === 'mdy') return `${p.mon} ${p.day}, ${p.year}`;
  return `${p.day} ${p.mon} ${p.year}`;
}

export function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const p = zonedParts(d, datePrefs().timeZone);
  if (!p) return format(d, 'd MMM yyyy, HH:mm');
  return `${formatDate(iso)}, ${p.hour}:${p.minute}`;
}

export function whatsappLink(phone: string, message: string): string {
  const digits = phone.replace(/[^0-9]/g, '');
  const text = message.trim() ? `?text=${encodeURIComponent(message.trim())}` : '';
  return `https://wa.me/${digits}${text}`;
}

export function publicUrl(handle: string): string {
  return `kub.icu/${handle}`;
}
