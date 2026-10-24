import type { ApiScope, WebhookEvent } from '../types/developers';

export const scopeInfo: {id: ApiScope;label: string;risky?: boolean;}[] = [
{ id: 'products:read', label: 'See products, stock and prices' },
{ id: 'products:write', label: 'Add and change products and stock', risky: true },
{ id: 'orders:read', label: 'See orders, buyers and delivery details' },
{ id: 'orders:write', label: 'Update order status and mark delivered', risky: true },
{ id: 'bookings:read', label: 'See bookings and availability' },
{ id: 'contacts:read', label: 'See contacts and consent' },
{ id: 'contacts:write', label: 'Add and update contacts', risky: true },
{ id: 'analytics:read', label: 'See visit and sales figures' }];


export const scopeLabel = (s: ApiScope) => scopeInfo.find((x) => x.id === s)?.label ?? s;

export const webhookEvents: {id: WebhookEvent;label: string;}[] = [
{ id: 'order.paid', label: 'An order is paid' },
{ id: 'order.refunded', label: 'An order is refunded' },
{ id: 'order.delivered', label: 'An order is marked delivered' },
{ id: 'booking.created', label: 'A booking is made' },
{ id: 'booking.cancelled', label: 'A booking is cancelled' },
{ id: 'contact.created', label: 'A new contact is added' },
{ id: 'form.submitted', label: 'A form is sent' },
{ id: 'subscription.renewed', label: 'A subscription renews' },
{ id: 'subscription.payment_failed', label: 'A subscription payment fails' },
{ id: 'ticket.checked_in', label: 'A guest is checked in' },
{ id: 'payout.sent', label: 'A payout is sent to your bank' }];


/** Retry schedule after a failed delivery (minutes). After the last, the delivery is given up. */
export const RETRY_MINUTES = [1, 5, 30, 120, 720];
/** Consecutive failed deliveries before KUBICU turns an endpoint off (example figure). */
export const AUTO_DISABLE_AFTER = 10;
/** Requests per minute per key (example figure). */
export const RATE_LIMIT_PER_MIN = 120;

export const apiResources: {method: 'GET' | 'POST' | 'PATCH';path: string;scope: ApiScope;summary: string;}[] = [
{ method: 'GET', path: '/v1/products', scope: 'products:read', summary: 'List products with price, stock and status' },
{ method: 'POST', path: '/v1/products', scope: 'products:write', summary: 'Create a product' },
{ method: 'PATCH', path: '/v1/products/{id}/stock', scope: 'products:write', summary: 'Set stock for a product or variant' },
{ method: 'GET', path: '/v1/orders', scope: 'orders:read', summary: 'List orders, newest first, filter by status' },
{ method: 'PATCH', path: '/v1/orders/{id}', scope: 'orders:write', summary: 'Move an order along: packed, sent, delivered' },
{ method: 'GET', path: '/v1/bookings', scope: 'bookings:read', summary: 'List bookings in a date range' },
{ method: 'GET', path: '/v1/contacts', scope: 'contacts:read', summary: 'List contacts with consent status' },
{ method: 'POST', path: '/v1/contacts', scope: 'contacts:write', summary: 'Add a contact (consent must be recorded)' },
{ method: 'GET', path: '/v1/analytics/summary', scope: 'analytics:read', summary: 'Visits, taps and revenue for a period' }];


export const sandboxResponses: Record<string, unknown> = {
  'GET /v1/products': {
    data: [
    { id: 'prd_8Kq2', name: 'Ankara wrap dress', price: { amount: 18500, currency: 'NGN' }, stock: 6, status: 'active' },
    { id: 'prd_3Jd9', name: 'Adire silk scarf', price: { amount: 7500, currency: 'NGN' }, stock: 0, status: 'sold_out' }],

    has_more: false
  },
  'GET /v1/orders': {
    data: [{ id: 'ord_7Hx1', number: 'KB-1042', status: 'paid', total: { amount: 26000, currency: 'NGN' }, buyer: { name: 'Ngozi A.', phone: '+234 803 *** 4417' }, delivery: { area: 'Lekki Phase 1', landmark: 'Opposite Mega Plaza' } }],
    has_more: false
  },
  'GET /v1/bookings': { data: [{ id: 'bkg_2Lm4', service: 'Bridal makeup trial', starts_at: '2026-11-02T10:00:00+01:00', deposit_paid: true }], has_more: false },
  'GET /v1/contacts': { data: [{ id: 'con_9Pz0', name: 'Tunde Bello', whatsapp: '+234 806 *** 2290', marketing_consent: 'opted_in' }], has_more: false },
  'GET /v1/analytics/summary': { period: { from: '2026-10-01', to: '2026-10-24' }, visits: 1842, taps: 611, revenue: { amount: 412500, currency: 'NGN' } }
};

export const apiChangelog: {date: string;title: string;body: string;}[] = [
{ date: '24 Oct 2026', title: 'Developer preview opens', body: 'API keys, webhooks with signed payloads and retries, connected apps and a test sandbox. Everything is test mode until a payment partner is live.' },
{ date: '24 Oct 2026', title: 'Naira amounts are whole numbers', body: 'Every amount is an integer in naira with currency "NGN". Kobo are never used.' },
{ date: '24 Oct 2026', title: 'Phone numbers in +234 format', body: 'Phones are returned in international format. Buyer phones are partly hidden unless the key can read orders.' }];