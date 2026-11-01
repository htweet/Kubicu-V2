import type { AnalyticsEvent, SourceId } from '../../types/analytics';
import { detectSource } from './track';

/*
 * Short-link click quality (D271). Link previews (WhatsApp, Telegram, Slack…), crawlers and automated browsers are
 * recorded but never counted as clicks; nor are rapid repeats from one browser. A live version also filters on the
 * server (known data-centre ranges, request rate), which a browser-only prototype can't see.
 */

const BOT_UA = /bot\b|bot\/|crawl|spider|slurp|facebookexternalhit|facebookcatalog|WhatsApp\/|TelegramBot|Slackbot|Discordbot|LinkedInBot|Twitterbot|SkypeUriPreview|Pinterest|HeadlessChrome|PhantomJS|Lighthouse|curl\/|Wget|python-requests|okhttp|Go-http-client/i;

/** Burst rule: this many taps on one link from one browser within the window counts as repeats, not people. */
export const BURST_TAPS = 5;
export const BURST_WINDOW_MS = 60_000;

export function isAutomated(): boolean {
  try {
    return navigator.webdriver === true || BOT_UA.test(navigator.userAgent);
  } catch {
    return false;
  }
}

/** True when this browser has already tapped this link BURST_TAPS-1 times in the last minute. */
export function isBurst(events: AnalyticsEvent[], slug: string, browser: string, now = Date.now()): boolean {
  let n = 0;
  for (const e of events) {
    if (e.type === 'link_click' && e.campaign === slug && e.browser === browser && now - Date.parse(e.at) < BURST_WINDOW_MS) n += 1;
  }
  return n >= BURST_TAPS - 1;
}

/**
 * The app or site a tap came from: in-app browsers say so in their description, otherwise the referring site.
 * Only the kind is kept (Instagram, WhatsApp…), never the address. A printed QR or typed link has neither.
 */
export function clickVia(): SourceId {
  try {
    const ua = navigator.userAgent;
    if (/Instagram/i.test(ua)) return 'instagram';
    if (/FBAN|FBAV|FB_IAB|Messenger/i.test(ua)) return 'facebook';
    if (/musical_ly|BytedanceWebview|TikTok/i.test(ua)) return 'tiktok';
    if (/Twitter/i.test(ua)) return 'x';
    if (/WhatsApp/i.test(ua)) return 'whatsapp';
    return detectSource(new URLSearchParams(), document.referrer).source;
  } catch {
    return 'direct';
  }
}

export const viaLabels: Record<SourceId, string> = {
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  facebook: 'Facebook or Messenger',
  x: 'X (Twitter)',
  google: 'Google',
  qr: 'QR code',
  nfc: 'NFC tag',
  campaign: 'Campaign link',
  direct: 'Scanned, typed or no app info',
  other: 'Other websites'
};