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
'subscribe_started';

export type SourceId = 'whatsapp' | 'instagram' | 'tiktok' | 'facebook' | 'x' | 'google' | 'qr' | 'campaign' | 'direct' | 'other';

/** One thing a visitor did on a public page. No personal data — just a random session id (D61). */
export interface AnalyticsEvent {
  type: EventType;
  at: string;
  session: string;
  /** Random id for this browser, used only to estimate unique visitors. */
  browser?: string;
  source: SourceId;
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