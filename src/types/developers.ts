export type ApiScope =
  | 'products:read'
  | 'products:write'
  | 'orders:read'
  | 'orders:write'
  | 'bookings:read'
  | 'contacts:read'
  | 'contacts:write'
  | 'analytics:read';

export type WebhookEvent =
  | 'order.paid'
  | 'order.refunded'
  | 'order.delivered'
  | 'booking.created'
  | 'booking.cancelled'
  | 'contact.created'
  | 'form.submitted'
  | 'subscription.renewed'
  | 'subscription.payment_failed'
  | 'ticket.checked_in'
  | 'payout.sent';

export type KeyMode = 'test' | 'live';

export interface ApiKey {
  id: string;
  name: string;
  mode: KeyMode;
  /** Only the start and end are kept — the full key is shown once. */
  prefix: string;
  last4: string;
  scopes: ApiScope[];
  createdAt: string;
  createdBy: string;
  lastUsedAt?: string;
  revokedAt?: string;
}

export interface WebhookEndpoint {
  id: string;
  url: string;
  description: string;
  events: WebhookEvent[];
  secret: string;
  active: boolean;
  /** Set when KUBICU turned it off after repeated failures. */
  autoDisabledAt?: string;
  createdAt: string;
}

export interface WebhookDelivery {
  id: string;
  endpointId: string;
  event: WebhookEvent;
  status: number;
  ok: boolean;
  attempts: number;
  at: string;
  nextRetryAt?: string;
  durationMs: number;
  payload: string;
  test: boolean;
}

export interface ConnectedApp {
  id: string;
  name: string;
  developer: string;
  scopes: ApiScope[];
  connectedAt: string;
  connectedBy: string;
  lastUsedAt?: string;
  sample?: boolean;
}

export interface DevelopersData {
  keys: ApiKey[];
  endpoints: WebhookEndpoint[];
  deliveries: WebhookDelivery[];
  apps: ConnectedApp[];
  seeded: boolean;
}
