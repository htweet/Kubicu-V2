/**
 * Meta Pixel and Google tag on public pages (D67, D230). Only called after a visitor accepts the cookie notice,
 * never in draft previews or example pages. IDs come from the extension's saved settings and are re-checked here.
 */

type FbqFn = ((...args: unknown[]) => void) & {callMethod?: (...a: unknown[]) => void;queue: unknown[];loaded: boolean;version: string;push: unknown;};

declare global {
  interface Window {
    fbq?: FbqFn;
    _fbq?: FbqFn;
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    ttq?: TtqStub;
    TiktokAnalyticsObject?: string;
    clarity?: ((...args: unknown[]) => void) & {q?: unknown[];};
  }
}

type TtqFn = (...args: unknown[]) => void;
type TtqStub = unknown[] & {[key: string]: unknown;};

export const PIXEL_ID = /^\d{15,16}$/;
export const GA_ID = /^G-[A-Z0-9]{6,12}$/;
export const TIKTOK_ID = /^[A-Z0-9]{20}$/;
export const CLARITY_ID = /^[a-z0-9]{8,12}$/;

const loaded = new Set<string>();

function addScript(src: string, id: string) {
  if (document.getElementById(id)) return;
  const s = document.createElement('script');
  s.async = true;
  s.src = src;
  s.id = id;
  document.head.appendChild(s);
}

export function loadMetaPixel(pixelId: string): void {
  if (!PIXEL_ID.test(pixelId) || loaded.has(`fb:${pixelId}`)) return;
  loaded.add(`fb:${pixelId}`);
  if (!window.fbq) {
    const fbq = function (...args: unknown[]) {
      if (fbq.callMethod) fbq.callMethod(...args);else
      fbq.queue.push(args);
    } as FbqFn;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = '2.0';
    fbq.queue = [];
    window.fbq = fbq;
    window._fbq = fbq;
    addScript('https://connect.facebook.net/en_US/fbevents.js', 'kubicu-meta-pixel');
  }
  window.fbq('init', pixelId);
  window.fbq('track', 'PageView');
}

export function loadGoogleTag(tagId: string): void {
  if (!GA_ID.test(tagId) || loaded.has(`ga:${tagId}`)) return;
  loaded.add(`ga:${tagId}`);
  addScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(tagId)}`, `kubicu-gtag-${tagId}`);
  window.dataLayer = window.dataLayer ?? [];
  if (!window.gtag) {
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };
    window.gtag('js', new Date());
  }
  window.gtag('config', tagId);
}

/** TikTok Pixel (D232): the official queue stub, then TikTok's script picks up the queued calls. */
export function loadTikTokPixel(pixelId: string): void {
  if (!TIKTOK_ID.test(pixelId) || loaded.has(`tt:${pixelId}`)) return;
  loaded.add(`tt:${pixelId}`);
  window.TiktokAnalyticsObject = 'ttq';
  const ttq: TtqStub = window.ttq ?? [] as unknown as TtqStub;
  window.ttq = ttq;
  const methods = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie'];
  ttq.methods = methods;
  methods.forEach((m) => {
    if (typeof ttq[m] !== 'function') ttq[m] = ((...args: unknown[]) => ttq.push([m, ...args])) as TtqFn;
  });
  const base = 'https://analytics.tiktok.com/i18n/pixel/events.js';
  const inst = (ttq._i as Record<string, unknown[] & {_u?: string;}> | undefined ?? {}) as Record<string, unknown[] & {_u?: string;}>;
  inst[pixelId] = Object.assign([] as unknown[], { _u: base });
  ttq._i = inst;
  ttq._t = { ...(ttq._t as Record<string, number> | undefined ?? {}), [pixelId]: Date.now() };
  ttq._o = { ...(ttq._o as Record<string, object> | undefined ?? {}), [pixelId]: {} };
  addScript(`${base}?sdkid=${encodeURIComponent(pixelId)}&lib=ttq`, `kubicu-tiktok-${pixelId}`);
  (ttq.page as TtqFn)();
}

/** Microsoft Clarity (D232): heatmaps and recordings, after consent. */
export function loadClarity(projectId: string): void {
  if (!CLARITY_ID.test(projectId) || loaded.has(`cl:${projectId}`)) return;
  loaded.add(`cl:${projectId}`);
  if (!window.clarity) {
    const clarity = function (...args: unknown[]) {
      (clarity.q = clarity.q ?? []).push(args);
    } as ((...args: unknown[]) => void) & {q?: unknown[];};
    window.clarity = clarity;
  }
  addScript(`https://www.clarity.ms/tag/${encodeURIComponent(projectId)}`, `kubicu-clarity-${projectId}`);
}

/** Purchase events for ad tools, after consent. Safe to call when no tag is loaded. */
export function tagPurchase(valueNgn: number, orderId: string): void {
  window.fbq?.('track', 'Purchase', { value: valueNgn, currency: 'NGN' });
  window.gtag?.('event', 'purchase', { transaction_id: orderId, value: valueNgn, currency: 'NGN' });
  const track = window.ttq?.track;
  if (typeof track === 'function') (track as TtqFn)('CompletePayment', { value: valueNgn, currency: 'NGN', content_id: orderId });
}