import type { Product } from '../types/commerce';
import type { WhatsAppData } from '../types/whatsapp';
import { syncRows } from './whatsapp';

/**
 * The numbers the WhatsApp page shows (D249), in one place so the sidebar badge can repeat them:
 * unread messages (Chats tab badge) and products that need syncing (Catalogue tab badge).
 */
export function whatsappCounts(data: WhatsAppData, products: Product[]) {
  const unread = data.chats.reduce((s, c) => s + c.unread, 0);
  const waiting = data.chats.filter((c) => c.messages[c.messages.length - 1]?.from === 'customer').length;
  const syncable = syncRows(products).filter((r) => !r.reason);
  const outOfDate = data.lastSyncAt
    ? syncable.filter((r) => !data.syncedIds.includes(r.product.id) || new Date(r.product.updatedAt).getTime() > new Date(data.lastSyncAt as string).getTime()).length
    : syncable.length;
  return { unread, waiting, outOfDate, syncable };
}
