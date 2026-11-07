/** Outside services KUBICU depends on (D135). None is connected in the prototype; tests are simulated. */
export interface IntegrationService {
  id: string;
  name: string;
  purpose: string;
  /** What a real connection needs. */
  partner: string;
  mode: 'test' | 'preview';
  /** Prototype: a test sends fine unless this is set, then it fails with this message. */
  failsWith?: string;
}

export const integrationServices: IntegrationService[] = [
  { id: 'payments', name: 'Payments', purpose: 'Checkout, wallet, escrow, payouts, USSD', partner: 'Licensed payment provider with split payouts', mode: 'test' },
  { id: 'whatsapp', name: 'WhatsApp', purpose: 'Order updates, WhatsApp Bridge, booking reminders', partner: 'WhatsApp Business API partner', mode: 'preview' },
  { id: 'email', name: 'Email', purpose: 'Receipts, security emails, digests', partner: 'Transactional email provider', mode: 'preview' },
  { id: 'sms', name: 'SMS', purpose: 'Two-step codes, delivery codes', partner: 'SMS aggregator with Nigerian sender ID', mode: 'preview', failsWith: 'Sender ID “KUBICU” not yet registered with the networks' },
  { id: 'couriers', name: 'Couriers', purpose: 'Delivery quotes and tracking', partner: 'Courier partners (Lagos first)', mode: 'preview' },
  { id: 'print', name: 'Print shop', purpose: 'Print kit orders', partner: 'Print partner', mode: 'preview' },
  { id: 'calendar', name: 'Calendars', purpose: 'Google and Outlook booking sync', partner: 'Google and Microsoft OAuth apps', mode: 'preview' },
  { id: 'speech', name: 'Speech', purpose: 'Voice-to-Store', partner: 'Speech partner for Nigerian languages', mode: 'preview', failsWith: 'Only English is available from the browser’s speech service' },
];
