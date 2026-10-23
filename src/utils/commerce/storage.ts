import type { CommerceData, StorefrontSettings } from '../../types/commerce';
import { sampleDiscounts } from '../../data/sampleDiscounts';
import { SAMPLE_ROOM_HANDLE, sampleRoomOrders } from '../../data/commerceSeed';
import { sampleSubPlans, sampleSubscriptions } from '../../data/sampleSubscriptions';
import { withSampleEvent } from '../../data/sampleEvents';

export const commerceKey = (workspaceId: string) => `kubicu.commerce.${workspaceId}`;

/** Workspaces saved before DealRooms existed get the sample group-buy orders if they still hold sample data. */
function withRoomSamples(parsed: Partial<CommerceData>): CommerceData['orders'] {
  const orders = Array.isArray(parsed.orders) ? parsed.orders : [];
  const hasSample = Array.isArray(parsed.products) && parsed.products.some((p) => p.sample);
  if (parsed.settledRooms !== undefined || !hasSample || orders.some((o) => o.sourceHandle === SAMPLE_ROOM_HANDLE)) return orders;
  const used = new Set(orders.map((o) => o.number));
  return [...sampleRoomOrders().filter((o) => !used.has(o.number)), ...orders].sort((a, b) => b.number - a.number);
}

export function defaultStorefront(enabled = false): StorefrontSettings {
  return { enabled, title: 'Shop', intro: '', showInMenu: true, menuLabel: 'Shop', ordering: 'checkout', whatsappPhone: '', hideSoldOut: false };
}

export function emptyCommerce(): CommerceData {
  return {
    products: [],
    collections: [],
    movements: [],
    orders: [],
    discounts: [],
    storefront: defaultStorefront(),
    fulfilment: {
      pickupEnabled: false,
      pickupAddress: '',
      pickupHours: '',
      deliveryEnabled: false,
      zones: [],
      freeDeliveryOverNgn: null
    },
    payments: { provider: null, connectedAt: null, businessName: '', methods: ['Card', 'Bank transfer', 'USSD'] },
    subPlans: [],
    subscriptions: [],
    events: [],
    nextOrderNumber: 1001,
    sampleSeeded: false
  };
}

export function readCommerce(workspaceId: string): CommerceData | null {
  try {
    const raw = window.localStorage.getItem(commerceKey(workspaceId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CommerceData>;
    const base = emptyCommerce();
    const read: CommerceData = {
      ...base,
      ...parsed,
      fulfilment: { ...base.fulfilment, ...parsed.fulfilment },
      payments: { ...base.payments, ...parsed.payments },
      // Saved before the storefront existed: switch it on for workspaces still holding sample products.
      storefront: { ...defaultStorefront(!parsed.storefront && Array.isArray(parsed.products) && parsed.products.some((p) => p.sample)), ...parsed.storefront },
      products: Array.isArray(parsed.products) ? parsed.products : [],
      collections: Array.isArray(parsed.collections) ? parsed.collections : [],
      movements: Array.isArray(parsed.movements) ? parsed.movements : [],
      orders: withRoomSamples(parsed),
      settledRooms: parsed.settledRooms ?? {},
      nextOrderNumber: Math.max(parsed.nextOrderNumber ?? base.nextOrderNumber, withRoomSamples(parsed).reduce((m, o) => Math.max(m, o.number + 1), 0)),
      // Workspaces saved before discounts existed get the sample offers if they still hold sample data.
      discounts: Array.isArray(parsed.discounts) ?
      parsed.discounts :
      Array.isArray(parsed.products) && parsed.products.some((p) => p.sample) ?
      sampleDiscounts() :
      [],
      // Saved before subscriptions existed (D69): workspaces holding sample data get the sample plans.
      subPlans: Array.isArray(parsed.subPlans) ? parsed.subPlans : hasSampleProducts(parsed) ? sampleSubPlans() : [],
      subscriptions: Array.isArray(parsed.subscriptions) ? parsed.subscriptions : hasSampleProducts(parsed) ? sampleSubscriptions() : [],
      events: Array.isArray(parsed.events) ? parsed.events : []
    };
    // Saved before ticketing existed (D73): workspaces holding sample data get the sample event once.
    return !Array.isArray(parsed.events) && hasSampleProducts(parsed) ? withSampleEvent(read) : read;
  } catch {
    return null;
  }
}

const hasSampleProducts = (parsed: Partial<CommerceData>) => Array.isArray(parsed.products) && parsed.products.some((p) => p.sample);

/** Throws when storage is full so callers can show a real error. */
export function writeCommerce(workspaceId: string, data: CommerceData): void {
  window.localStorage.setItem(commerceKey(workspaceId), JSON.stringify(data));
}

export const COMMERCE_EVENT = 'kubicu:commerce';

/** For writes made outside CommerceContext (e.g. escrow refunds) — tells the open app to reload. */
export function writeCommerceExternal(workspaceId: string, data: CommerceData): void {
  writeCommerce(workspaceId, data);
  window.dispatchEvent(new CustomEvent(COMMERCE_EVENT));
}

export function commerceStorageBytes(data: CommerceData): number {
  try {
    return new Blob([JSON.stringify(data)]).size;
  } catch {
    return 0;
  }
}