import type { AnalyticsEvent, DeviceKind, EventType, SourceId } from '../../types/analytics';

/** Pure metrics over recorded events (D61). Every number can show its sample size. */

export interface Range {
  from: number;
  to: number;
}

export function rangeFor(days: number, now = Date.now()): {current: Range;previous: Range;} {
  const end = now;
  const start = end - days * 86400000;
  return { current: { from: start, to: end }, previous: { from: start - days * 86400000, to: start } };
}

export interface Filter {
  handle?: string | null;
  pageId?: string | null | 'any';
}

export function inRange(events: AnalyticsEvent[], r: Range, f: Filter = {}): AnalyticsEvent[] {
  return events.filter((e) => {
    const t = Date.parse(e.at);
    if (t < r.from || t >= r.to) return false;
    if (f.handle && e.handle !== f.handle) return false;
    if (f.pageId !== undefined && f.pageId !== 'any' && e.pageId !== f.pageId) return false;
    return true;
  });
}

export interface Headline {
  visits: number;
  visitors: number;
  views: number;
  tapRate: number;
  revenueNgn: number;
  orders: number;
}

/** Visits = sessions with at least one view; visitors are estimated (one browser ≈ one person). */
export function headline(events: AnalyticsEvent[]): Headline {
  const viewSessions = new Set(events.filter((e) => e.type === 'view').map((e) => e.session));
  const tapSessions = new Set(events.filter((e) => e.type === 'tap').map((e) => e.session));
  const paid = events.filter((e) => e.type === 'order_paid');
  return {
    visits: viewSessions.size,
    visitors: new Set(events.filter((e) => e.type === 'view').map((e) => e.browser ?? e.session)).size,
    views: events.filter((e) => e.type === 'view').length,
    tapRate: viewSessions.size ? Array.from(tapSessions).filter((s) => viewSessions.has(s)).length / viewSessions.size : 0,
    revenueNgn: paid.reduce((t, e) => t + (e.valueNgn ?? 0), 0),
    orders: paid.length
  };
}

export function change(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return (current - previous) / previous;
}

/** Visits per day, oldest first. */
export function visitsByDay(events: AnalyticsEvent[], r: Range): {label: string;value: number;key: string;}[] {
  const days = Math.max(1, Math.round((r.to - r.from) / 86400000));
  const buckets = new Map<string, Set<string>>();
  for (let i = 0; i < days; i++) {
    const d = new Date(r.from + i * 86400000);
    buckets.set(d.toDateString(), new Set());
  }
  events.filter((e) => e.type === 'view').forEach((e) => buckets.get(new Date(e.at).toDateString())?.add(e.session));
  return Array.from(buckets.entries()).map(([key, s]) => {
    const d = new Date(key);
    return { key, label: days > 14 ? `${d.getDate()}/${d.getMonth() + 1}` : d.toLocaleDateString(undefined, { weekday: 'short' }), value: s.size };
  });
}

export interface LinkRow {
  id: string;
  label: string;
  blockId: string;
  taps: number;
  share: number;
}

export function topLinks(events: AnalyticsEvent[], visits: number): LinkRow[] {
  const map = new Map<string, LinkRow>();
  events.
  filter((e) => e.type === 'tap' && e.blockId).
  forEach((e) => {
    const key = `${e.blockId}::${e.label ?? ''}`;
    const cur = map.get(key) ?? { id: key, label: e.label || 'Untitled', blockId: e.blockId as string, taps: 0, share: 0 };
    cur.taps += 1;
    map.set(key, cur);
  });
  return Array.from(map.values()).
  map((r) => ({ ...r, share: visits ? r.taps / visits : 0 })).
  sort((a, b) => b.taps - a.taps);
}

export interface SourceRow {
  id: SourceId;
  visits: number;
  share: number;
  conversions: number;
  rate: number;
}

const conversionTypes: EventType[] = ['order_paid', 'booking_confirmed', 'lead', 'signup'];

/** Conversions = paid orders, confirmed bookings, sent forms and sign-ups in that visit. */
export function sources(events: AnalyticsEvent[]): SourceRow[] {
  const visitsBy = new Map<SourceId, Set<string>>();
  const convBy = new Map<SourceId, Set<string>>();
  events.forEach((e) => {
    if (e.type === 'view') (visitsBy.get(e.source) ?? visitsBy.set(e.source, new Set()).get(e.source)!).add(e.session);
    if (conversionTypes.includes(e.type)) (convBy.get(e.source) ?? convBy.set(e.source, new Set()).get(e.source)!).add(e.session);
  });
  const total = Array.from(visitsBy.values()).reduce((t, s) => t + s.size, 0);
  return Array.from(visitsBy.entries()).
  map(([id, s]) => {
    const conversions = convBy.get(id)?.size ?? 0;
    return { id, visits: s.size, share: total ? s.size / total : 0, conversions, rate: s.size ? conversions / s.size : 0 };
  }).
  sort((a, b) => b.visits - a.visits);
}

// ——— Devices and returning visitors (D258) ———

export type DeviceId = DeviceKind | 'unknown';

export interface BreakdownRow<T extends string> {
  id: T;
  visits: number;
  share: number;
  conversions: number;
  rate: number;
}

/** Each visit's first view: when it started, which browser, which device. */
function visitStarts(events: AnalyticsEvent[]): Map<string, {at: number;browser?: string;device?: DeviceKind;}> {
  const out = new Map<string, {at: number;browser?: string;device?: DeviceKind;}>();
  events.forEach((e) => {
    if (e.type !== 'view') return;
    const t = Date.parse(e.at);
    const cur = out.get(e.session);
    if (!cur || t < cur.at) out.set(e.session, { at: t, browser: e.browser, device: e.device ?? cur?.device });
  });
  return out;
}

function breakdown<T extends string>(events: AnalyticsEvent[], groupOf: (session: string) => T | null): BreakdownRow<T>[] {
  const visits = new Map<T, Set<string>>();
  const conv = new Map<T, Set<string>>();
  const sessions = new Set(events.filter((e) => e.type === 'view').map((e) => e.session));
  sessions.forEach((s) => {
    const g = groupOf(s);
    if (g !== null) (visits.get(g) ?? visits.set(g, new Set()).get(g)!).add(s);
  });
  events.forEach((e) => {
    if (!conversionTypes.includes(e.type) || !sessions.has(e.session)) return;
    const g = groupOf(e.session);
    if (g !== null) (conv.get(g) ?? conv.set(g, new Set()).get(g)!).add(e.session);
  });
  const total = sessions.size;
  return Array.from(visits.entries()).
  map(([id, s]) => {
    const conversions = conv.get(id)?.size ?? 0;
    return { id, visits: s.size, share: total ? s.size / total : 0, conversions, rate: s.size ? conversions / s.size : 0 };
  }).
  sort((a, b) => b.visits - a.visits);
}

/** Visits by phone, tablet or computer. Visits recorded before devices were counted show as "Not recorded". */
export function devices(events: AnalyticsEvent[]): BreakdownRow<DeviceId>[] {
  const starts = visitStarts(events);
  return breakdown<DeviceId>(events, (s) => starts.get(s)?.device ?? 'unknown');
}

/**
 * New vs returning visits. A visit is returning when the same browser had an earlier visit in
 * anything still kept (`all`, not just this period) — so it's an estimate, like visitors.
 */
export function visitorMix(events: AnalyticsEvent[], all: AnalyticsEvent[]): BreakdownRow<'new' | 'returning'>[] {
  const firstByBrowser = new Map<string, number>();
  visitStarts(all).forEach((v) => {
    if (!v.browser) return;
    const cur = firstByBrowser.get(v.browser);
    if (cur === undefined || v.at < cur) firstByBrowser.set(v.browser, v.at);
  });
  const starts = visitStarts(events);
  return breakdown<'new' | 'returning'>(events, (s) => {
    const v = starts.get(s);
    if (!v) return null;
    const first = v.browser ? firstByBrowser.get(v.browser) : undefined;
    return first !== undefined && first < v.at ? 'returning' : 'new';
  });
}

export interface CampaignStat {
  visits: number;
  orders: number;
  revenueNgn: number;
}

/**
 * Per short link (campaign slug): visits (scans for QR codes), paid orders and revenue (D62).
 * Links that send people to another website or a WhatsApp chat never open a page, so each real click
 * counts as the visit there (D343). Bot and burst clicks are left out, as everywhere else.
 */
export function campaignStats(events: AnalyticsEvent[]): Map<string, CampaignStat> {
  const sessions = new Map<string, Set<string>>();
  const out = new Map<string, CampaignStat>();
  events.forEach((e) => {
    if (!e.campaign) return;
    const s = out.get(e.campaign) ?? { visits: 0, orders: 0, revenueNgn: 0 };
    const leavesPage = e.type === 'link_click' && !e.invalid && (e.label === 'website' || e.label === 'whatsapp');
    if (e.type === 'view' || leavesPage) {
      const set = sessions.get(e.campaign) ?? new Set<string>();
      if (!set.has(e.session)) {
        set.add(e.session);
        s.visits += 1;
      }
      sessions.set(e.campaign, set);
    }
    if (e.type === 'order_paid') {
      s.orders += 1;
      s.revenueNgn += e.valueNgn ?? 0;
    }
    out.set(e.campaign, s);
  });
  return out;
}

export interface FunnelStep {
  label: string;
  count: number;
}

function sessionsWith(events: AnalyticsEvent[], type: EventType): Set<string> {
  return new Set(events.filter((e) => e.type === type).map((e) => e.session));
}

/** Each step counts visits that reached it (and every earlier step), so the funnel never grows. */
function funnel(events: AnalyticsEvent[], steps: [string, EventType][]): FunnelStep[] {
  let carry: Set<string> | null = null;
  return steps.map(([label, type]) => {
    const s = sessionsWith(events, type);
    const reached: Set<string> = carry ? new Set(Array.from(s).filter((x) => carry!.has(x))) : s;
    carry = reached;
    return { label, count: reached.size };
  });
}

export function funnels(events: AnalyticsEvent[]) {
  return {
    shop: funnel(events, [
    ['Saw a product', 'product_view'],
    ['Added to cart', 'cart_add'],
    ['Started checkout', 'checkout_start'],
    ['Paid', 'order_paid']]
    ),
    // Product views happen on pages and in the shop; cart adds without a product view still count from step 2.
    shopFromCart: funnel(events, [
    ['Added to cart', 'cart_add'],
    ['Started checkout', 'checkout_start'],
    ['Paid', 'order_paid']]
    ),
    booking: funnel(events, [
    ['Opened booking', 'booking_open'],
    ['Chose a time', 'booking_time'],
    ['Confirmed', 'booking_confirmed']]
    ),
    leads: funnel(events, [
    ['Visited', 'view'],
    ['Sent a form or signed up', 'lead']]
    ),
    subscriptions: funnel(events, [
    ['Opened a plan', 'subscribe_open'],
    ['Subscribed or started a trial', 'subscribe_started']]
    ),
    tickets: funnel(events, [
    ['Chose tickets', 'ticket_select'],
    ['Started checkout', 'ticket_checkout'],
    ['Got tickets', 'ticket_paid']]
    ),
    forms: funnel(events, [
    ['Saw a form', 'form_view'],
    ['Started filling in', 'form_start'],
    ['Sent', 'form_submit']]
    ),
    // Members-only content (D110).
    members: funnel(events, [
    ['Reached members-only content', 'member_gate'],
    ['Signed in', 'member_signin'],
    ['Saw members content', 'member_view']]
    )
  };
}

export interface Insight {
  id: string;
  title: string;
  evidence: string;
  blockId?: string;
}

/** Up to three plain observations with their evidence. Never claims cause and effect. */
export function insights(events: AnalyticsEvent[], blockOrder: string[], labelFor: (blockId: string) => string): Insight[] {
  const out: Insight[] = [];
  const h = headline(events);
  if (h.visits < 30) return out;
  const links = topLinks(events, h.visits);
  const totalTaps = links.reduce((t, l) => t + l.taps, 0);
  const top = links[0];
  if (top && totalTaps >= 20) {
    const pos = blockOrder.indexOf(top.blockId);
    if (pos >= 3 && top.taps / totalTaps >= 0.25)
    out.push({ id: `move-${top.blockId}`, title: `“${top.label}” gets ${Math.round(top.taps / totalTaps * 100)}% of taps but sits ${ordinal(pos + 1)} on the page`, evidence: `${top.taps} of ${totalTaps} taps from ${h.visits} visits. Moving it higher might help more people find it.`, blockId: top.blockId });
  }
  const src = sources(events);
  const totalConv = src.reduce((t, s) => t + s.conversions, 0);
  src.forEach((s) => {
    if (out.length >= 3 || s.visits < 20 || totalConv < 5) return;
    const convShare = s.conversions / totalConv;
    if (s.share >= 0.25 && convShare < s.share / 3)
    out.push({ id: `src-${s.id}`, title: `${labelSource(s.id)} brings ${Math.round(s.share * 100)}% of visits but ${Math.round(convShare * 100)}% of sales and sign-ups`, evidence: `${s.visits} visits, ${s.conversions} conversions. These visitors may want something different — IntentFlow can show them their own blocks.` });
  });
  const unused = blockOrder.filter((id) => !links.some((l) => l.blockId === id)).map((id) => labelFor(id)).filter(Boolean);
  if (out.length < 3 && totalTaps >= 30 && links.length >= 2) {
    const quiet = links.filter((l) => l.taps / totalTaps < 0.03);
    if (quiet.length) out.push({ id: `quiet-${quiet[0].blockId}`, title: `“${quiet[0].label}” was tapped ${quiet[0].taps} time${quiet[0].taps === 1 ? '' : 's'}`, evidence: `Out of ${totalTaps} taps in this period. Consider rewording it or moving it.${unused.length ? '' : ''}`, blockId: quiet[0].blockId });
  }
  return out.slice(0, 3);
}

function ordinal(n: number): string {
  return `${n}${n % 10 === 1 && n % 100 !== 11 ? 'st' : n % 10 === 2 && n % 100 !== 12 ? 'nd' : n % 10 === 3 && n % 100 !== 13 ? 'rd' : 'th'}`;
}

const sourceNames: Record<SourceId, string> = { whatsapp: 'WhatsApp', instagram: 'Instagram', tiktok: 'TikTok', facebook: 'Facebook', x: 'X', google: 'Google', qr: 'QR codes', nfc: 'NFC tags', campaign: 'Campaign links', direct: 'Direct visits', other: 'Other sites' };
function labelSource(s: SourceId): string {
  return sourceNames[s];
}

export function hasSample(events: AnalyticsEvent[]): boolean {
  return events.some((e) => e.sample);
}