import type { AnalyticsEvent, SourceId } from '../types/analytics';
import { samplePage } from './samplePage';
import { blockName } from '../utils/blocks';

/**
 * SAMPLE visit history for the demo workspace (D61): 30 days of plausible, clearly labelled
 * events so charts aren't empty. Generated from a fixed seed so it looks the same every time.
 */
export function sampleAnalytics(now = Date.now()): AnalyticsEvent[] {
  let seed = 20261021;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  const pick = <T,>(items: [T, number][]): T => {
    const total = items.reduce((t, [, w]) => t + w, 0);
    let r = rand() * total;
    for (const [v, w] of items) {
      r -= w;
      if (r <= 0) return v;
    }
    return items[0][0];
  };

  const clickable = samplePage.blocks.filter((b) => ['link', 'product', 'booking', 'whatsapp', 'productGrid', 'social', 'contact'].includes(b.type));
  // Weighted so one popular button sits low on the page — Link Intelligence has something real to say.
  const links: [{id: string;label: string;}, number][] = clickable.map((b, i) => [{ id: b.id, label: blockName(b) }, i === clickable.length - 1 ? 9 : Math.max(1, 6 - i)]);
  const sources: [SourceId, number][] = [
  ['instagram', 34],
  ['whatsapp', 27],
  ['tiktok', 20],
  ['direct', 9],
  ['qr', 5],
  ['google', 5]];

  // TikTok visitors browse but rarely buy (an honest pattern, not a claim).
  const buyBoost: Partial<Record<SourceId, number>> = { tiktok: 0.15, whatsapp: 1.6, qr: 1.3 };

  const out: AnalyticsEvent[] = [];
  for (let day = 29; day >= 0; day--) {
    const dayStart = now - (day + 1) * 86400000;
    const weekend = new Date(dayStart).getDay() % 6 === 0;
    const visits = Math.round((weekend ? 95 : 70) + rand() * 30 + (29 - day) * 0.8);
    for (let v = 0; v < visits; v++) {
      const at = dayStart + rand() * 86400000;
      if (at > now) continue;
      const session = `s${day}x${v}${Math.floor(rand() * 1e6).toString(36)}`;
      const source = pick(sources);
      // About one in five visits is a returning browser.
      const browser = rand() < 0.2 ? `b${Math.floor(rand() * 400)}` : `b${session}`;
      // QR visits came from the sample “Market flyer” code; half of Instagram from the sample bio link (D62).
      const campaign = source === 'qr' ? 'flyer' : source === 'instagram' && rand() < 0.5 ? 'ig' : undefined;
      const base = { session, browser, source, campaign, handle: samplePage.handle, pageId: null, sample: true } as const;
      const ev = (type: AnalyticsEvent['type'], dt: number, extra: Partial<AnalyticsEvent> = {}) => out.push({ ...base, type, at: new Date(at + dt * 1000).toISOString(), ...extra });
      ev('view', 0);
      if (rand() < 0.42 && links.length) {
        const l = pick(links);
        ev('tap', 12, { blockId: l.id, label: l.label });
      }
      const boost = buyBoost[source] ?? 1;
      if (rand() < 0.26) {
        ev('product_view', 20);
        if (rand() < 0.3 * boost) {
          ev('cart_add', 40);
          if (rand() < 0.65) {
            ev('checkout_start', 60);
            if (rand() < 0.62) ev('order_paid', 140, { valueNgn: Math.round((28 + rand() * 45) * 1000) });
          }
        }
      }
      if (rand() < 0.05) {
        ev('booking_open', 30);
        if (rand() < 0.6) {
          ev('booking_time', 50);
          if (rand() < 0.7 * Math.min(boost, 1.2)) ev('booking_confirmed', 90, { valueNgn: 10000 });
        }
      }
      if (rand() < 0.012 * boost) ev('lead', 70);
      if (rand() < 0.01) ev('signup', 80);
    }
  }
  return out.sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
}