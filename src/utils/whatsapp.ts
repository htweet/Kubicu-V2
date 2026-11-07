import type { Product } from '../types/commerce';
import type { WaChat, WaChatLabel, WaKeywordReply, WaMessage, WaProductCard, WaUpdateId, WaUpdateTemplate, WhatsAppData } from '../types/whatsapp';
import { canSell } from './commerce/catalog';
import { productSlug, STOREFRONT_PATH } from './commerce/storefront';
import { publicUrl } from './format';
import { uid } from './id';

/** WhatsApp Commerce Bridge (D97) store and rules. Messages never leave this device. */

export const WHATSAPP_APP_ID = 'whatsapp-catalogue';
const key = (workspaceId: string) => `kubicu.whatsapp.${workspaceId}`;
export const WHATSAPP_EVENT = 'kubicu:whatsapp';
/** Customer-service window: free-form replies only within 24h of the customer's last message (WhatsApp rule). */
export const SERVICE_WINDOW_HOURS = 24;

/** Keyword replies and order/booking updates need Creator or above (D100). */
export const WA_AUTOMATION_PLAN = 'creator' as const;
export const MAX_KEYWORD_REPLIES = 10;
export const WELCOME_BACK_DAYS = 30;

/** Business-started updates, grouped as the setup screen shows them. Placeholders fill in from the order or booking. */
export const updateInfo: Record<WaUpdateId, { group: 'Orders' | 'Bookings' | 'Win back'; label: string; when: string; placeholders: string[]; defaultText: string; defaultOn: boolean }> = {
  order_confirmed: { group: 'Orders', label: 'Order confirmed', when: 'Right after an order is placed', placeholders: ['name', 'order', 'total', 'link'], defaultText: 'Hi {name}, thanks for your order {order} ({total}). Track it here: {link}', defaultOn: true },
  payment_received: { group: 'Orders', label: 'Payment received', when: 'When a pending payment is confirmed', placeholders: ['name', 'order', 'total'], defaultText: 'Hi {name}, we’ve received your payment of {total} for order {order}. We’re getting it ready.', defaultOn: true },
  out_for_delivery: { group: 'Orders', label: 'Out for delivery', when: 'When the order is marked out for delivery', placeholders: ['name', 'order', 'code'], defaultText: 'Good news {name} — order {order} is on its way. Share code {code} with the rider when it arrives.', defaultOn: true },
  delivered: { group: 'Orders', label: 'Delivered', when: 'When the order is completed', placeholders: ['name', 'order'], defaultText: 'Hi {name}, order {order} has been delivered. Enjoy, and thank you for buying from us!', defaultOn: false },
  balance_due: { group: 'Orders', label: 'Balance due', when: 'When a made-to-order balance or payment stage is due', placeholders: ['name', 'total', 'link'], defaultText: 'Hi {name}, your item is ready. The balance of {total} is due — pay here: {link}', defaultOn: true },
  booking_confirmed: { group: 'Bookings', label: 'Booking confirmed', when: 'Right after someone books', placeholders: ['name', 'service', 'time', 'link'], defaultText: 'Hi {name}, you’re booked for {service} on {time}. Manage your booking: {link}', defaultOn: true },
  booking_reminder: { group: 'Bookings', label: 'Booking reminder', when: '24 hours before the appointment', placeholders: ['name', 'service', 'time'], defaultText: 'Reminder: {service} tomorrow at {time}. Reply if you need to reschedule.', defaultOn: true },
  abandoned_checkout: { group: 'Win back', label: 'Unfinished checkout', when: '1 hour after a checkout is left unpaid', placeholders: ['name', 'link'], defaultText: 'Hi {name}, you left something in your cart. It’s still waiting for you: {link}', defaultOn: false },
  review_request: { group: 'Win back', label: 'Review request', when: '3 days after an order is completed', placeholders: ['name', 'link'], defaultText: 'Hi {name}, how was your order? A quick review helps us a lot: {link}', defaultOn: false },
};

export const updateIds = Object.keys(updateInfo) as WaUpdateId[];

const defaultUpdates = (): Record<WaUpdateId, WaUpdateTemplate> =>
  Object.fromEntries(updateIds.map((id) => [id, { on: updateInfo[id].defaultOn, text: updateInfo[id].defaultText, approval: 'approved' }])) as Record<WaUpdateId, WaUpdateTemplate>;

/** Example values used in previews and test sends. */
export const sampleValues: Record<string, string> = { name: 'Amaka', order: '#1042', total: '₦25,000', link: 'kub.icu/o/7K2Q', code: '4821', service: 'Bridal trial', time: 'Sat 14 Nov, 10:00' };

export function fillPlaceholders(text: string, values: Record<string, string> = sampleValues): string {
  return text.replace(/\{(\w+)\}/g, (m, k: string) => values[k] ?? m);
}

/** Placeholders in the text that this update can't fill. */
export function unknownPlaceholders(id: WaUpdateId, text: string): string[] {
  const allowed = new Set(updateInfo[id].placeholders);
  return Array.from(new Set(Array.from(text.matchAll(/\{(\w+)\}/g)).map((m) => m[1]))).filter((k) => !allowed.has(k));
}

export const keywordList = (k: WaKeywordReply) => k.keywords.split(',').map((w) => w.trim().toLowerCase()).filter(Boolean);

/** First switched-on keyword reply whose keyword appears as a whole word. */
export function matchKeyword(replies: WaKeywordReply[], text: string): WaKeywordReply | null {
  const lower = ` ${text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ')} `;
  return replies.find((r) => r.on && r.text.trim() && keywordList(r).some((w) => lower.includes(` ${w} `))) ?? null;
}

export const emptyWhatsApp = (): WhatsAppData => ({
  connection: { status: 'none', phone: '', displayName: '' },
  greeting: { on: true, text: 'Hi! Thanks for messaging us. Tap a product below or tell us what you’re looking for.' },
  away: { on: false, text: 'We’re closed right now and will reply first thing when we open.' },
  welcomeBack: { on: false, text: 'Welcome back! It’s been a while — here’s what’s new this month.' },
  keywordReplies: [
    { id: 'kw-price', on: true, keywords: 'price, how much, cost', text: 'You’ll find every price on our shop page. Tell us which item and we’ll confirm it’s in stock.' },
    { id: 'kw-loc', on: true, keywords: 'location, address, where', text: 'We’re in Yaba, Lagos. Pickup is free, or we deliver across Lagos.' },
  ],
  updates: defaultUpdates(),
  openHour: 9,
  closeHour: 18,
  quickReplies: [
    { id: 'qr-price', title: 'Delivery fee', text: 'Delivery within Lagos is calculated at checkout. You can also pick up from us for free.' },
    { id: 'qr-pay', title: 'How to pay', text: 'You can pay securely by card or transfer on our checkout page. We start packing once payment is confirmed.' },
    { id: 'qr-time', title: 'How long it takes', text: 'Orders paid before 2pm usually go out the same day. Made-to-order pieces take a little longer.' },
  ],
  chats: [],
  lastSyncAt: null,
  syncedIds: [],
  sampleSeeded: false,
});

export function readWhatsApp(workspaceId: string): WhatsAppData {
  try {
    const raw = window.localStorage.getItem(key(workspaceId));
    if (raw) {
      const base = emptyWhatsApp();
      const parsed = JSON.parse(raw) as Partial<WhatsAppData>;
      return { ...base, ...parsed, updates: { ...base.updates, ...parsed.updates } };
    }
  } catch {
    /* fresh store */
  }
  return emptyWhatsApp();
}

export function writeWhatsApp(workspaceId: string, data: WhatsAppData): void {
  try {
    window.localStorage.setItem(key(workspaceId), JSON.stringify(data));
  } catch {
    /* storage full — lasts for this visit */
  }
  window.dispatchEvent(new CustomEvent(WHATSAPP_EVENT));
}

// ——— Labels ———

export const chatLabels: Record<WaChatLabel, string> = {
  new: 'New',
  interested: 'Interested',
  ordered: 'Ordered',
  follow_up: 'Follow up',
  closed: 'Closed',
};

export const chatTones: Record<WaChatLabel, 'neutral' | 'info' | 'warning' | 'danger' | 'success'> = {
  new: 'info',
  interested: 'warning',
  ordered: 'success',
  follow_up: 'warning',
  closed: 'neutral',
};

// ——— Catalogue ———

export interface SyncRow {
  product: Product;
  reason: string | null;
}

/** Which products can appear in the WhatsApp catalogue, and why others can't. */
export function syncRows(products: Product[]): SyncRow[] {
  return products
    .filter((p) => p.status !== 'archived' && p.kind !== 'ticket')
    .map((p) => ({
      product: p,
      reason: p.status !== 'active' ? 'Draft' : !p.priceNgn ? 'No price' : !p.images.length ? 'No photo' : !canSell(p) ? 'Sold out — hidden' : null,
    }));
}

export function productCard(p: Product, all: Product[], handle: string): WaProductCard {
  return { productId: p.id, name: p.name, priceNgn: p.priceNgn, url: `https://${publicUrl(`${handle}/${STOREFRONT_PATH}/${productSlug(p, all)}`)}` };
}

// ——— Chats ———

export const lastCustomerAt = (c: WaChat): string | null => [...c.messages].reverse().find((m) => m.from === 'customer')?.at ?? null;

/** Free-form replies are allowed for 24h after the customer last wrote. */
export function inServiceWindow(c: WaChat, now = Date.now()): boolean {
  const at = lastCustomerAt(c);
  return !!at && now - new Date(at).getTime() < SERVICE_WINDOW_HOURS * 3600_000;
}

export function sortChats(chats: WaChat[]): WaChat[] {
  return [...chats].sort((a, b) => new Date(b.messages[b.messages.length - 1]?.at ?? 0).getTime() - new Date(a.messages[a.messages.length - 1]?.at ?? 0).getTime());
}

const msg = (from: WaMessage['from'], text: string, at: string, product?: WaProductCard): WaMessage => ({ id: uid('wam'), from, text, at, product });

export function updateChat(data: WhatsAppData, chatId: string, fn: (c: WaChat) => WaChat): WhatsAppData {
  return { ...data, chats: data.chats.map((c) => (c.id === chatId ? fn(c) : c)) };
}

export function sendReply(data: WhatsAppData, chatId: string, text: string, product?: WaProductCard): WhatsAppData {
  return updateChat(data, chatId, (c) => ({
    ...c,
    unread: 0,
    label: c.label === 'new' ? (product ? 'interested' : 'new') : c.label,
    messages: [...c.messages, msg('business', text, new Date().toISOString(), product)],
  }));
}

export function isOpenNow(data: WhatsAppData, at = new Date()): boolean {
  const h = at.getHours();
  return h >= data.openHour && h < data.closeHour;
}

/**
 * Adds an incoming message with the automatic replies the bridge would send, in this order:
 * greeting (first message) or welcome back (30+ quiet days), a keyword reply (Creator+), then the away message (outside hours).
 */
export function receive(data: WhatsAppData, input: { name: string; phone: string; text: string }, opts: { automations?: boolean } = {}): { data: WhatsAppData; chatId: string } {
  const now = new Date();
  const at = now.toISOString();
  const digits = input.phone.replace(/[^0-9]/g, '');
  const existing = data.chats.find((c) => c.phone.replace(/[^0-9]/g, '') === digits);
  const autos: WaMessage[] = [];
  const later = new Date(now.getTime() + 1000).toISOString();
  const lastAt = existing ? lastCustomerAt(existing) : null;
  const quiet = !!lastAt && now.getTime() - new Date(lastAt).getTime() > WELCOME_BACK_DAYS * 86_400_000;
  if (!existing && data.greeting.on && data.greeting.text.trim()) autos.push(msg('auto', data.greeting.text.trim(), later));
  if (quiet && data.welcomeBack.on && data.welcomeBack.text.trim()) autos.push(msg('auto', data.welcomeBack.text.trim(), later));
  const kw = opts.automations ? matchKeyword(data.keywordReplies, input.text) : null;
  if (kw) autos.push(msg('auto', kw.text.trim(), later));
  if (data.away.on && data.away.text.trim() && !isOpenNow(data, now)) autos.push(msg('auto', data.away.text.trim(), later));
  if (existing) {
    return {
      chatId: existing.id,
      data: updateChat(data, existing.id, (c) => ({ ...c, unread: c.unread + 1, label: c.label === 'closed' ? 'new' : c.label, messages: [...c.messages, msg('customer', input.text, at), ...autos] })),
    };
  }
  const chat: WaChat = { id: uid('wac'), name: input.name || input.phone, phone: input.phone, label: 'new', unread: 1, contactSaved: false, messages: [msg('customer', input.text, at), ...autos] };
  return { chatId: chat.id, data: { ...data, chats: [chat, ...data.chats] } };
}

export const TEST_CHAT_PHONE = '+000 test';

/** Puts a filled-in update into a “Test messages” chat so the seller sees exactly what a customer would get. */
export function sendTestUpdate(data: WhatsAppData, id: WaUpdateId): WhatsAppData {
  const text = fillPlaceholders(data.updates[id].text);
  const at = new Date().toISOString();
  const existing = data.chats.find((c) => c.phone === TEST_CHAT_PHONE);
  const m = msg('auto', text, at);
  if (existing) return updateChat(data, existing.id, (c) => ({ ...c, messages: [...c.messages, m] }));
  const chat: WaChat = { id: uid('wac'), name: 'Test messages (only you)', phone: TEST_CHAT_PHONE, label: 'closed', unread: 0, contactSaved: true, sample: true, messages: [m] };
  return { ...data, chats: [chat, ...data.chats] };
}

const SIM_CUSTOMERS = [
  { name: 'Amaka Obi', phone: '+234 803 555 0142', text: 'Good afternoon, do you still have the Ankara wrap dress in size 12?' },
  { name: 'Tunde Bello', phone: '+234 812 555 0199', text: 'How much is delivery to Lekki?' },
  { name: 'Halima Yusuf', phone: '+234 706 555 0123', text: 'I want to order 2 scarves as gifts. Can you wrap them?' },
  { name: 'Chidi Eze', phone: '+234 909 555 0177', text: 'Hello, is it possible to pay on delivery?' },
];

export function simulatedCustomer(data: WhatsAppData) {
  const unused = SIM_CUSTOMERS.find((c) => !data.chats.some((x) => x.phone === c.phone));
  return unused ?? SIM_CUSTOMERS[Math.floor(Math.random() * SIM_CUSTOMERS.length)];
}

export function seedSample(data: WhatsAppData): WhatsAppData {
  if (data.sampleSeeded) return data;
  const ago = (min: number) => new Date(Date.now() - min * 60_000).toISOString();
  const sample: WaChat[] = [
    {
      id: uid('wac'),
      name: 'Ngozi Umeh',
      phone: '+234 802 555 0110',
      label: 'new',
      unread: 2,
      contactSaved: false,
      sample: true,
      messages: [msg('customer', 'Hi, I saw your page on Instagram 😍', ago(42)), msg('auto', emptyWhatsApp().greeting.text, ago(42)), msg('customer', 'Do you have the gele in wine colour?', ago(40))],
    },
    {
      id: uid('wac'),
      name: 'Bisi Adeyemi',
      phone: '+234 805 555 0181',
      label: 'follow_up',
      unread: 0,
      contactSaved: true,
      sample: true,
      messages: [msg('customer', 'Please send me the price list for the bridal package.', ago(60 * 30)), msg('business', 'Sure — I’ll send it in the morning.', ago(60 * 29))],
    },
  ];
  return { ...data, chats: [...sample, ...data.chats], sampleSeeded: true };
}
