/** WhatsApp Commerce Bridge (D97). The WhatsApp side is simulated until a Business API partner is chosen. */

export type WaConnectionStatus = 'none' | 'pending' | 'connected';

export interface WaConnection {
  status: WaConnectionStatus;
  phone: string;
  displayName: string;
  connectedAt?: string;
}

export interface WaProductCard {
  productId: string;
  name: string;
  priceNgn: number | null;
  url: string;
}

export type WaSender = 'customer' | 'business' | 'auto';

export interface WaMessage {
  id: string;
  from: WaSender;
  text: string;
  at: string;
  product?: WaProductCard;
}

export type WaChatLabel = 'new' | 'interested' | 'ordered' | 'follow_up' | 'closed';

export interface WaChat {
  id: string;
  name: string;
  phone: string;
  label: WaChatLabel;
  unread: number;
  messages: WaMessage[];
  contactSaved: boolean;
  sample?: boolean;
}

export interface WaQuickReply {
  id: string;
  title: string;
  text: string;
}

export interface WaAutoMessage {
  on: boolean;
  text: string;
}

/** Business-started updates. WhatsApp only allows these as pre-approved templates (D100). */
export type WaUpdateId = 'order_confirmed' | 'payment_received' | 'out_for_delivery' | 'delivered' | 'balance_due' | 'booking_confirmed' | 'booking_reminder' | 'abandoned_checkout' | 'review_request';

export interface WaUpdateTemplate extends WaAutoMessage {
  /** Simulated WhatsApp template review. Editing the text sends it back for review. */
  approval: 'draft' | 'in_review' | 'approved';
}

/** Instant reply when an incoming message contains one of the keywords. */
export interface WaKeywordReply {
  id: string;
  on: boolean;
  /** Comma-separated, matched as whole words, case-insensitive. */
  keywords: string;
  text: string;
}

export interface WhatsAppData {
  connection: WaConnection;
  greeting: WaAutoMessage;
  away: WaAutoMessage;
  /** “Back from a quiet spell” — sent to someone who hasn't written for 30+ days. */
  welcomeBack: WaAutoMessage;
  keywordReplies: WaKeywordReply[];
  updates: Record<WaUpdateId, WaUpdateTemplate>;
  /** Business hours used by the away message, 24h clock. */
  openHour: number;
  closeHour: number;
  quickReplies: WaQuickReply[];
  chats: WaChat[];
  lastSyncAt: string | null;
  syncedIds: string[];
  sampleSeeded: boolean;
}