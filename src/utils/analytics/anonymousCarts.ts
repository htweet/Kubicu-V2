import type { AnalyticsEvent } from '../../types/analytics';

export interface AnonymousCarts {
  count: number;
  valueNgn: number;
  sample: boolean;
}

/**
 * Carts that were started but never reached checkout in the last `days` days (D125).
 * Nothing about the visitor is known, so these can only be counted — never contacted.
 */
export function anonymousCarts(events: AnalyticsEvent[], now: number, days = 7): AnonymousCarts {
  const since = now - days * 86400000;
  const bySession = new Map<string, { value: number; checkout: boolean; sample: boolean }>();
  for (const e of events) {
    if (Date.parse(e.at) < since) continue;
    if (e.type !== 'cart_add' && e.type !== 'checkout_start' && e.type !== 'order_paid') continue;
    const s = bySession.get(e.session) ?? { value: 0, checkout: false, sample: false };
    if (e.type === 'cart_add') s.value += e.valueNgn ?? 0;
    else s.checkout = true;
    if (e.sample) s.sample = true;
    bySession.set(e.session, s);
  }
  const left = [...bySession.values()].filter((s) => !s.checkout);
  return { count: left.length, valueNgn: left.reduce((t, s) => t + s.value, 0), sample: left.some((s) => s.sample) };
}
