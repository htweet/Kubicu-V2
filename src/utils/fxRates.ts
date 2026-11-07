import type { CurrencyCode } from './currency';

/**
 * Daily exchange rates for KUBICU's own prices (D432). Naira is the one price list; a workspace in Kenya, Ghana or
 * South Africa is billed in its own currency at the day's rate. In the prototype the day's rate is the example base
 * rate moved by a small, repeatable daily amount, unless staff set it in Super admin → Exchange rates.
 * EXAMPLE RATES — the real source (a bank or the payment partner's daily rate) is still to be chosen.
 */
export type FxCode = 'KES' | 'GHS' | 'ZAR';
export const fxCodes: FxCode[] = ['KES', 'GHS', 'ZAR'];

/** Naira per one unit of each currency — starting values, the same as the earlier website example rates. */
const baseNairaPer: Record<FxCode, number> = { KES: 11.8, GHS: 132, ZAR: 84 };

export interface FxEntry {
  date: string;
  code: FxCode;
  rate: number;
  by: string;
  at: string;
}

const KEY = 'kubicu.fx.v1';
export const FX_EVENT = 'kubicu:fx';

const todayKey = (d = new Date()) => d.toISOString().slice(0, 10);

function readSet(): FxEntry[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as FxEntry[]) : [];
  } catch {
    return [];
  }
}

/** A repeatable move of up to ±2.5% for a given day and currency, so the prototype's rate changes day to day. */
function drift(date: string, code: FxCode): number {
  let h = 0;
  for (const ch of `${date}:${code}`) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return ((h % 1001) / 1000 - 0.5) * 0.05;
}

const round = (n: number) => Math.round(n * 100) / 100;

export const isFxCode = (code: CurrencyCode | string): code is FxCode => (fxCodes as string[]).includes(code);

/** The day's rate (naira per unit) and whether staff set it or it came from the automatic feed. */
export function rateOn(code: FxCode, date = todayKey()): { rate: number; source: 'staff' | 'auto'; entry?: FxEntry } {
  const set = readSet().filter((e) => e.code === code && e.date === date);
  const last = set[set.length - 1];
  if (last) return { rate: last.rate, source: 'staff', entry: last };
  return { rate: round(baseNairaPer[code] * (1 + drift(date, code))), source: 'auto' };
}

/** Naira per unit today; 1 for naira and for currencies KUBICU doesn't bill in. */
export const nairaPerToday = (code: CurrencyCode): number => (isFxCode(code) ? rateOn(code).rate : 1);

/** A KUBICU price in naira, in `code` at `rate` — always rounded up to a whole unit, so the charge is never short. */
export const nairaToLocal = (naira: number, code: CurrencyCode, rate = nairaPerToday(code)): number => (code === 'NGN' || !isFxCode(code) ? naira : Math.sign(naira) * Math.ceil(Math.abs(naira) / rate));

/** Staff set today's rate (Super admin → Exchange rates). */
export function setRateToday(code: FxCode, rate: number, by: string): void {
  const entry: FxEntry = { date: todayKey(), code, rate: round(rate), by, at: new Date().toISOString() };
  window.localStorage.setItem(KEY, JSON.stringify([...readSet(), entry].slice(-500)));
  window.dispatchEvent(new CustomEvent(FX_EVENT));
}

/** Go back to the automatic rate for today. */
export function clearRateToday(code: FxCode): void {
  const t = todayKey();
  window.localStorage.setItem(KEY, JSON.stringify(readSet().filter((e) => !(e.code === code && e.date === t))));
  window.dispatchEvent(new CustomEvent(FX_EVENT));
}

/** The last `days` days of rates, newest first, for the staff history table. */
export function rateHistory(days = 14): { date: string; rates: Record<FxCode, { rate: number; source: 'staff' | 'auto' }> }[] {
  const out = [];
  for (let i = 0; i < days; i++) {
    const date = todayKey(new Date(Date.now() - i * 86_400_000));
    out.push({ date, rates: Object.fromEntries(fxCodes.map((c) => [c, rateOn(c, date)])) as Record<FxCode, { rate: number; source: 'staff' | 'auto' }> });
  }
  return out;
}

/** How much a currency's rate has moved since `date`, as a fraction (0.12 = 12%). */
export function rateMoveSince(code: FxCode, date: string): number {
  const then = rateOn(code, date).rate;
  return then ? Math.abs(rateOn(code).rate - then) / then : 0;
}
