import type { ApiScope, DevelopersData, KeyMode, WebhookDelivery, WebhookEndpoint, WebhookEvent } from '../types/developers';
import { AUTO_DISABLE_AFTER, RETRY_MINUTES } from '../data/developerApi';

export const developersKey = (workspaceId: string) => `kubicu.developers.${workspaceId}`;

export const emptyDevelopers = (): DevelopersData => ({ keys: [], endpoints: [], deliveries: [], apps: [], seeded: false });

const alphabet = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function randomToken(len: number): string {
  const bytes = new Uint8Array(len);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
}

export const uid = (prefix: string) => `${prefix}_${randomToken(10)}`;

/** A new key. The full secret is returned once and never stored. */
export function makeKey(mode: KeyMode): {secret: string;prefix: string;last4: string;} {
  const body = randomToken(32);
  const prefix = `kub_${mode}_`;
  return { secret: `${prefix}${body}`, prefix, last4: body.slice(-4) };
}

export const maskKey = (prefix: string, last4: string) => `${prefix}••••••••${last4}`;

export function isValidEndpoint(url: string): string | null {
  const v = url.trim();
  if (!v) return 'Enter the address that should receive events.';
  let u: URL;
  try {
    u = new URL(v);
  } catch {
    return 'That isn’t a full web address. It should start with https://';
  }
  if (u.protocol !== 'https:') return 'Use https:// so events can’t be read on the way.';
  if (['localhost', '127.0.0.1'].includes(u.hostname)) return 'KUBICU can’t reach your own computer. Use a public address, or a tunnel such as ngrok.';
  return null;
}

/** Simple, non-cryptographic stand-in for an HMAC so the signature looks and behaves realistically. */
export function fakeSignature(secret: string, body: string, t: number): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x1b873593;
  const s = `${t}.${body}${secret}`;
  for (let i = 0; i < s.length; i++) {
    h1 = Math.imul(h1 ^ s.charCodeAt(i), 16777619);
    h2 = Math.imul(h2 ^ s.charCodeAt(i), 2246822507);
  }
  const hex = (n: number) => (n >>> 0).toString(16).padStart(8, '0');
  return `t=${t},v1=${hex(h1)}${hex(h2)}${hex(h1 ^ h2)}${hex(h2 * 31)}`;
}

export function samplePayload(event: WebhookEvent, workspaceId: string): string {
  const data: Record<WebhookEvent, Record<string, unknown>> = {
    'order.paid': { order: { id: 'ord_7Hx1', number: 'KB-1042', total: { amount: 26000, currency: 'NGN' }, paid_via: 'card' } },
    'order.refunded': { order: { id: 'ord_7Hx1', refund: { amount: 26000, currency: 'NGN', reason: 'Out of stock' } } },
    'order.delivered': { order: { id: 'ord_7Hx1', delivered_at: new Date().toISOString(), handover_code_matched: true } },
    'booking.created': { booking: { id: 'bkg_2Lm4', service: 'Bridal makeup trial', starts_at: '2026-11-02T10:00:00+01:00' } },
    'booking.cancelled': { booking: { id: 'bkg_2Lm4', cancelled_by: 'customer' } },
    'contact.created': { contact: { id: 'con_9Pz0', name: 'Tunde Bello', source: 'whatsapp' } },
    'form.submitted': { form: { id: 'frm_1Ab2', name: 'Custom order request' }, submission: { id: 'sub_5Cd6' } },
    'subscription.renewed': { subscription: { id: 'subs_3Ef4', plan: 'Scarf of the month', amount: { amount: 5000, currency: 'NGN' } } },
    'subscription.payment_failed': { subscription: { id: 'subs_3Ef4', attempt: 1, next_retry_at: '2026-10-25T09:00:00+01:00' } },
    'ticket.checked_in': { ticket: { code: 'KUB-7K2Q', event: 'Owambe Nights', checked_in_by: 'Door 1' } },
    'payout.sent': { payout: { id: 'po_6Gh7', amount: { amount: 150000, currency: 'NGN' }, bank: 'GTBank ••3301' } }
  };
  return JSON.stringify({ id: uid('evt'), type: event, created: new Date().toISOString(), workspace: workspaceId, livemode: false, data: data[event] }, null, 2);
}

/** Simulated receiving server: any address containing "fail" answers 500, "slow" times out; anything else 200. */
export function simulateResponse(url: string): {status: number;ok: boolean;durationMs: number;} {
  const u = url.toLowerCase();
  if (u.includes('slow')) return { status: 408, ok: false, durationMs: 10000 };
  if (u.includes('fail')) return { status: 500, ok: false, durationMs: 180 + Math.round(Math.random() * 120) };
  return { status: 200, ok: true, durationMs: 90 + Math.round(Math.random() * 160) };
}

export function deliver(d: DevelopersData, endpoint: WebhookEndpoint, event: WebhookEvent, workspaceId: string, test: boolean): DevelopersData {
  const res = simulateResponse(endpoint.url);
  const now = Date.now();
  const delivery: WebhookDelivery = {
    id: uid('dlv'),
    endpointId: endpoint.id,
    event,
    status: res.status,
    ok: res.ok,
    attempts: 1,
    at: new Date(now).toISOString(),
    nextRetryAt: res.ok ? undefined : new Date(now + RETRY_MINUTES[0] * 60000).toISOString(),
    durationMs: res.durationMs,
    payload: samplePayload(event, workspaceId),
    test
  };
  return checkAutoDisable({ ...d, deliveries: [delivery, ...d.deliveries].slice(0, 200) }, endpoint.id);
}

export function retryDelivery(d: DevelopersData, deliveryId: string): DevelopersData {
  const del = d.deliveries.find((x) => x.id === deliveryId);
  const ep = del && d.endpoints.find((e) => e.id === del.endpointId);
  if (!del || !ep) return d;
  const res = simulateResponse(ep.url);
  const attempts = del.attempts + 1;
  const next = res.ok || attempts > RETRY_MINUTES.length ? undefined : new Date(Date.now() + RETRY_MINUTES[attempts - 1] * 60000).toISOString();
  const updated: WebhookDelivery = { ...del, status: res.status, ok: res.ok, attempts, at: new Date().toISOString(), nextRetryAt: next, durationMs: res.durationMs };
  return checkAutoDisable({ ...d, deliveries: d.deliveries.map((x) => x.id === deliveryId ? updated : x) }, ep.id);
}

function checkAutoDisable(d: DevelopersData, endpointId: string): DevelopersData {
  const recent = d.deliveries.filter((x) => x.endpointId === endpointId && !x.test).slice(0, AUTO_DISABLE_AFTER);
  if (recent.length < AUTO_DISABLE_AFTER || recent.some((x) => x.ok)) return d;
  return { ...d, endpoints: d.endpoints.map((e) => e.id === endpointId && e.active ? { ...e, active: false, autoDisabledAt: new Date().toISOString() } : e) };
}

export const deliveryState = (x: WebhookDelivery): 'delivered' | 'retrying' | 'failed' => x.ok ? 'delivered' : x.nextRetryAt ? 'retrying' : 'failed';

export function seedDevelopers(d: DevelopersData): DevelopersData {
  if (d.seeded) return d;
  const scopes: ApiScope[] = ['orders:read', 'products:read'];
  return {
    ...d,
    seeded: true,
    apps: [
    {
      id: 'app_sabibooks',
      name: 'SabiBooks Accounting',
      developer: 'SabiBooks Ltd (sample)',
      scopes,
      connectedAt: new Date(Date.now() - 12 * 86400000).toISOString(),
      connectedBy: 'Workspace owner',
      lastUsedAt: new Date(Date.now() - 3 * 3600000).toISOString(),
      sample: true
    }]

  };
}