/*
 * Website menu usage (D273): anonymous daily tallies of which menu panels open and which links get
 * picked. Only counts are kept — no session, browser ID, IP, referrer or page history — and nothing
 * is recorded when the browser sends Do Not Track or Global Privacy Control.
 * Production would send the same tallies to the platform; here they live on this device.
 */

const KEY = 'kubicu.siteMenuUsage';
const KEEP_DAYS = 90;
const DAY = 86400000;

export type MenuSurface = 'desktop' | 'mobile';

/** day (YYYY-MM-DD) → tally key → count. Keys: `open|<group>|<surface>` or `link|<to>|<title>|<surface>`. */
type UsageStore = Record<string, Record<string, number>>;

function trackingRefused(): boolean {
  if (typeof navigator === 'undefined') return true;
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return nav.doNotTrack === '1' || nav.globalPrivacyControl === true;
}

function read(): UsageStore {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as UsageStore) : {};
  } catch {
    return {};
  }
}

function write(store: UsageStore) {
  const cutoff = new Date(Date.now() - KEEP_DAYS * DAY).toISOString().slice(0, 10);
  const kept = Object.fromEntries(Object.entries(store).filter(([day]) => day >= cutoff));
  try {
    localStorage.setItem(KEY, JSON.stringify(kept));
  } catch {
    // Storage full or blocked: menu counts are optional, so skip silently.
  }
}

function bump(key: string) {
  if (trackingRefused()) return;
  const day = new Date().toISOString().slice(0, 10);
  const store = read();
  const today = store[day] ?? {};
  today[key] = (today[key] ?? 0) + 1;
  store[day] = today;
  write(store);
}

const clean = (s: string) => s.replace(/\|/g, '/');

export function recordMenuOpen(groupId: string, surface: MenuSurface) {
  bump(`open|${clean(groupId)}|${surface}`);
}

export function recordMenuLink(to: string, title: string, surface: MenuSurface) {
  bump(`link|${clean(to)}|${clean(title)}|${surface}`);
}

export interface MenuUsageSummary {
  opens: { group: string; desktop: number; mobile: number; total: number }[];
  links: { to: string; title: string; desktop: number; mobile: number; total: number }[];
  totalOpens: number;
  totalLinks: number;
}

/** Totals over the last `days` days, busiest first. */
export function readMenuUsage(days: number): MenuUsageSummary {
  const cutoff = new Date(Date.now() - days * DAY).toISOString().slice(0, 10);
  const opens = new Map<string, MenuUsageSummary['opens'][number]>();
  const links = new Map<string, MenuUsageSummary['links'][number]>();
  for (const [day, tallies] of Object.entries(read())) {
    if (day < cutoff) continue;
    for (const [key, n] of Object.entries(tallies)) {
      const parts = key.split('|');
      const surface = parts[parts.length - 1] as MenuSurface;
      if (parts[0] === 'open') {
        const row = opens.get(parts[1]) ?? { group: parts[1], desktop: 0, mobile: 0, total: 0 };
        row[surface] += n;
        row.total += n;
        opens.set(parts[1], row);
      } else if (parts[0] === 'link') {
        const row = links.get(parts[1]) ?? { to: parts[1], title: parts[2], desktop: 0, mobile: 0, total: 0 };
        row[surface] += n;
        row.total += n;
        links.set(parts[1], row);
      }
    }
  }
  const byTotal = <T extends { total: number }>(a: T, b: T) => b.total - a.total;
  const o = [...opens.values()].sort(byTotal);
  const l = [...links.values()].sort(byTotal);
  return { opens: o, links: l, totalOpens: o.reduce((s, r) => s + r.total, 0), totalLinks: l.reduce((s, r) => s + r.total, 0) };
}

export function clearMenuUsage() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
