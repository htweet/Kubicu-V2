import type { AnalyticsEvent, DeviceKind, EventType, SourceId } from '../../types/analytics';
import { viaLabels } from './clickQuality';

/** What happened after a click, best outcome first. */
export type ClickOutcome = 'ordered' | 'booked' | 'signed_up' | 'engaged' | 'looked' | 'left';

export interface LinkClick {
  session: string;
  at: number;
  device?: DeviceKind;
  pageId: string | null;
  outcome: ClickOutcome;
  sample: boolean;
  /** App or site the tap came from (D271). Missing on older clicks. */
  via?: SourceId;
}

export interface LinkStatsResult {
  clicks: number;
  visitors: number;
  /** Clicks that went on to tap, view a product, start a form or anything beyond looking. */
  engaged: number;
  conversions: number;
  orders: number;
  revenueNgn: number;
  daily: { label: string; value: number; previous?: number }[];
  previousClicks: number | null;
  devices: { key: DeviceKind | 'unknown'; label: string; count: number }[];
  hours: number[];
  busiestDay: string | null;
  landed: { pageId: string | null; count: number }[];
  outcomes: { key: ClickOutcome; label: string; count: number }[];
  recent: LinkClick[];
  hasSample: boolean;
  /** Where taps came from (D271). */
  via: { key: SourceId | 'unknown'; label: string; count: number }[];
  /** Taps recorded but not counted as clicks (D271). */
  filtered: { bots: number; bursts: number };
}

const ORDER: EventType[] = ['order_paid', 'ticket_paid'];
const BOOK: EventType[] = ['booking_confirmed'];
const SIGNUP: EventType[] = ['lead', 'signup', 'form_submit', 'subscribe_started', 'member_signin'];
const VIEW_ONLY: EventType[] = ['view', 'link_click'];

export const outcomeLabels: Record<ClickOutcome, string> = {
  ordered: 'Paid for something',
  booked: 'Booked',
  signed_up: 'Signed up or sent a form',
  engaged: 'Tapped or browsed',
  looked: 'Just looked',
  left: 'Went to the website',
};

const deviceLabels: Record<DeviceKind | 'unknown', string> = { phone: 'Phone', tablet: 'Tablet', desktop: 'Computer', unknown: 'Not recorded' };
const DAY = 86_400_000;
const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** Groups a link's events into clicks: one per visit (session), so tapping twice in one visit counts once. */
export function linkClicks(events: AnalyticsEvent[], slug: string): LinkClick[] {
  const bySession = new Map<string, AnalyticsEvent[]>();
  events.forEach((e) => {
    // Bots, link previews and rapid repeats are recorded but never become clicks (D271).
    if (e.campaign !== slug || e.invalid) return;
    const list = bySession.get(e.session);
    if (list) list.push(e);
    else bySession.set(e.session, [e]);
  });
  const out: LinkClick[] = [];
  bySession.forEach((list, session) => {
    const entry = list.find((e) => e.type === 'link_click' || e.type === 'view');
    if (!entry) return; // events without a click or landing aren't a click on this link
    const types = new Set(list.map((e) => e.type));
    const landedView = list.find((e) => e.type === 'view');
    const outcome: ClickOutcome = ORDER.some((t) => types.has(t))
      ? 'ordered'
      : BOOK.some((t) => types.has(t))
        ? 'booked'
        : SIGNUP.some((t) => types.has(t))
          ? 'signed_up'
          : list.some((e) => !VIEW_ONLY.includes(e.type))
            ? 'engaged'
            : landedView
              ? 'looked'
              : 'left';
    out.push({
      session,
      at: Math.min(...list.map((e) => Date.parse(e.at))),
      device: entry.device ?? landedView?.device,
      pageId: landedView?.pageId ?? null,
      outcome,
      sample: list.some((e) => e.sample),
      via: entry.via ?? list.find((e) => e.via)?.via,
    });
  });
  return out.sort((a, b) => b.at - a.at);
}

export function linkStats(events: AnalyticsEvent[], slug: string, from: number, to: number, compare: boolean): LinkStatsResult {
  const scoped = events.filter((e) => e.campaign === slug);
  const all = linkClicks(scoped, slug);
  const clicks = all.filter((c) => c.at >= from && c.at < to);
  const span = to - from;
  const prev = compare ? all.filter((c) => c.at >= from - span && c.at < from) : null;
  const sessions = new Set(clicks.map((c) => c.session));
  const inPeriod = scoped.filter((e) => sessions.has(e.session));

  const days = Math.max(1, Math.ceil(span / DAY));
  const step = days > 120 ? 7 : 1;
  const buckets = Math.ceil(days / step);
  const daily = Array.from({ length: buckets }, (_, i) => {
    const start = from + i * step * DAY;
    const end = start + step * DAY;
    const point: { label: string; value: number; previous?: number } = {
      label: new Date(start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      value: clicks.filter((c) => c.at >= start && c.at < end).length,
    };
    if (prev) point.previous = prev.filter((c) => c.at >= start - span && c.at < end - span).length;
    return point;
  });

  const deviceCounts = new Map<DeviceKind | 'unknown', number>();
  clicks.forEach((c) => deviceCounts.set(c.device ?? 'unknown', (deviceCounts.get(c.device ?? 'unknown') ?? 0) + 1));
  const hours = Array.from({ length: 24 }, () => 0);
  const weekday = Array.from({ length: 7 }, () => 0);
  clicks.forEach((c) => {
    const d = new Date(c.at);
    hours[d.getHours()] += 1;
    weekday[d.getDay()] += 1;
  });
  const top = Math.max(...weekday);
  const landedMap = new Map<string | null, number>();
  clicks.filter((c) => c.outcome !== 'left').forEach((c) => landedMap.set(c.pageId, (landedMap.get(c.pageId) ?? 0) + 1));
  const outcomeOrder: ClickOutcome[] = ['ordered', 'booked', 'signed_up', 'engaged', 'looked', 'left'];
  const paid = inPeriod.filter((e) => ORDER.includes(e.type));
  const viaCounts = new Map<SourceId | 'unknown', number>();
  clicks.forEach((c) => viaCounts.set(c.via ?? 'unknown', (viaCounts.get(c.via ?? 'unknown') ?? 0) + 1));
  const invalid = scoped.filter((e) => e.invalid && e.type === 'link_click' && Date.parse(e.at) >= from && Date.parse(e.at) < to);

  return {
    clicks: clicks.length,
    visitors: new Set(inPeriod.filter((e) => e.type === 'view' || e.type === 'link_click').map((e) => e.browser ?? e.session)).size,
    engaged: clicks.filter((c) => c.outcome !== 'looked' && c.outcome !== 'left').length,
    conversions: clicks.filter((c) => c.outcome === 'ordered' || c.outcome === 'booked' || c.outcome === 'signed_up').length,
    orders: paid.length,
    revenueNgn: paid.reduce((s, e) => s + (e.valueNgn ?? 0), 0),
    daily,
    previousClicks: prev ? prev.length : null,
    devices: Array.from(deviceCounts.entries())
      .map(([key, count]) => ({ key, label: deviceLabels[key], count }))
      .sort((a, b) => b.count - a.count),
    hours,
    busiestDay: top > 0 ? weekdays[weekday.indexOf(top)] : null,
    landed: Array.from(landedMap.entries())
      .map(([pageId, count]) => ({ pageId, count }))
      .sort((a, b) => b.count - a.count),
    outcomes: outcomeOrder.map((key) => ({ key, label: outcomeLabels[key], count: clicks.filter((c) => c.outcome === key).length })).filter((o) => o.count > 0),
    recent: clicks.slice(0, 20),
    hasSample: clicks.some((c) => c.sample),
    via: Array.from(viaCounts.entries())
      .map(([key, count]) => ({ key, label: key === 'unknown' ? 'Not recorded (older clicks)' : viaLabels[key], count }))
      .sort((a, b) => b.count - a.count),
    filtered: { bots: invalid.filter((e) => e.invalid === 'bot').length, bursts: invalid.filter((e) => e.invalid === 'burst').length },
  };
}

/** Clicks per link, all time — for the list. */
export function clicksBySlug(events: AnalyticsEvent[]): Map<string, { clicks: number; last7: number; last: number | null }> {
  const out = new Map<string, { clicks: number; last7: number; last: number | null }>();
  const seen = new Set<string>();
  const weekAgo = Date.now() - 7 * DAY;
  events.forEach((e) => {
    if (!e.campaign || e.invalid || (e.type !== 'view' && e.type !== 'link_click')) return;
    const at = Date.parse(e.at);
    const s = out.get(e.campaign) ?? { clicks: 0, last7: 0, last: null };
    s.last = s.last === null ? at : Math.max(s.last, at);
    out.set(e.campaign, s);
    const key = `${e.campaign}|${e.session}`;
    if (seen.has(key)) return;
    seen.add(key);
    s.clicks += 1;
    if (at >= weekAgo) s.last7 += 1;
  });
  return out;
}
