export type EventType =
'view' |
'tap' |
'product_view' |
'cart_add' |
'checkout_start' |
'order_paid' |
'booking_open' |
'booking_time' |
'booking_confirmed' |
'lead' |
'signup' |
'subscribe_open' |
'subscribe_started' |
'ticket_select' |
'ticket_checkout' |
'ticket_paid' |
'form_view' |
'form_start' |
'form_submit' |
'member_gate' |
'member_signin' |
'member_view'
/** Someone tapped or scanned a short link, before it sent them on (D270). Counted for the link, never as a page visit. */ |
'link_click';

export type DeviceKind = 'phone' | 'tablet' | 'desktop';

export type SourceId = 'whatsapp' | 'instagram' | 'tiktok' | 'facebook' | 'x' | 'google' | 'qr' | 'nfc' | 'campaign' | 'direct' | 'other';

/** One thing a visitor did on a public page. No personal data — just a random session id (D61). */
export interface AnalyticsEvent {
  type: EventType;
  at: string;
  session: string;
  /** Random id for this browser, used only to estimate unique visitors. */
  browser?: string;
  source: SourceId;
  /** Kind of device, from the browser's own description (D258). Missing on older visits. */
  device?: DeviceKind;
  /** Campaign link slug when the visit came through one. */
  campaign?: string;
  /** Link the event happened on (main page, campaign, DealRoom). */
  handle: string;
  /** Sub-page id (null = home, 'shop' = storefront). */
  pageId: string | null;
  blockId?: string;
  label?: string;
  /** Naira value for paid orders and deposits. */
  valueNgn?: number;
  sample?: boolean;
  /** Short-link clicks only: the app or site the tap came from, by kind — never the address (D271). */
  via?: SourceId;
  /** Short-link clicks only: not counted as a click — a bot or link preview, or rapid repeats from one browser (D271). */
  invalid?: 'bot' | 'burst';
}

export interface AnalyticsSettings {
  enabled: boolean;
  /** Prototype default off: here you're both the owner and the visitor (D61). */
  excludeOwn: boolean;
  retentionDays: number;
}

export interface AnalyticsData {
  events: AnalyticsEvent[];
  settings: AnalyticsSettings;
  dismissedInsights: string[];
  sampleSeeded: boolean;
}