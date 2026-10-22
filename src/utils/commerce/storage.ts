import type { CommerceData } from '../../types/commerce';

export const commerceKey = (workspaceId: string) => `kubicu.commerce.${workspaceId}`;

export function emptyCommerce(): CommerceData {
  return {
    products: [],
    collections: [],
    movements: [],
    orders: [],
    fulfilment: {
      pickupEnabled: false,
      pickupAddress: '',
      pickupHours: '',
      deliveryEnabled: false,
      zones: [],
      freeDeliveryOverNgn: null
    },
    payments: { provider: null, connectedAt: null, businessName: '', methods: ['Card', 'Bank transfer', 'USSD'] },
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
    return {
      ...base,
      ...parsed,
      fulfilment: { ...base.fulfilment, ...parsed.fulfilment },
      payments: { ...base.payments, ...parsed.payments },
      products: Array.isArray(parsed.products) ? parsed.products : [],
      collections: Array.isArray(parsed.collections) ? parsed.collections : [],
      movements: Array.isArray(parsed.movements) ? parsed.movements : [],
      orders: Array.isArray(parsed.orders) ? parsed.orders : []
    };
  } catch {
    return null;
  }
}

/** Throws when storage is full so callers can show a real error. */
export function writeCommerce(workspaceId: string, data: CommerceData): void {
  window.localStorage.setItem(commerceKey(workspaceId), JSON.stringify(data));
}

export function commerceStorageBytes(data: CommerceData): number {
  try {
    return new Blob([JSON.stringify(data)]).size;
  } catch {
    return 0;
  }
}