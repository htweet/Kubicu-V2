import type { SubPlan, Subscription, SubEvent, SubPayment } from '../types/subscriptions';
import { defaultRules } from '../utils/commerce/subscriptions';

/** SAMPLE subscription plans and subscribers for Adaeze Atelier (D69). Flagged `sample`. */

const ago = (days: number) => new Date(Date.now() - days * 86400000).toISOString();
const ahead = (days: number) => new Date(Date.now() + days * 86400000).toISOString();

export const sampleSubPlans = (): SubPlan[] => [
{
  id: 'ssp_circle',
  kind: 'membership',
  name: 'Atelier Circle',
  description: 'First look at every drop and a monthly styling session in the studio.',
  benefits: 'Early access to new collections\nOne 30-minute styling session a month\nFree alterations on Atelier pieces',
  priceNgn: 5000,
  interval: 'month',
  trialDays: 7,
  setupFeeNgn: 0,
  memberCap: 40,
  items: [],
  rules: defaultRules(),
  status: 'active',
  createdAt: ago(60),
  sample: true
},
{
  id: 'ssp_scarf',
  kind: 'box',
  name: 'Scarf of the month',
  description: 'A new hand-dyed adire silk scarf, delivered every month.',
  benefits: 'One adire silk scarf a month\nMembers-only colourways\nSkip or pause any month',
  priceNgn: 12000,
  interval: 'month',
  trialDays: 0,
  setupFeeNgn: 2000,
  memberCap: null,
  items: [{ productId: 'sp_scarf', variantId: 'scarf_default', qty: 1 }],
  rules: { ...defaultRules(), cancelAnyTime: false, noticeDays: 3 },
  status: 'active',
  createdAt: ago(45),
  sample: true
}];


const ev = (id: string, label: string, days: number, by: SubEvent['by'] = 'automatic'): SubEvent => ({ id, at: ago(days), label, by });
const pay = (id: string, label: string, amount: number, days: number, status: SubPayment['status'] = 'paid'): SubPayment => ({ id, at: ago(days), label, amountNgn: amount, status });

const base = {
  pendingPlanId: null,
  pausedUntil: null,
  cancelReason: null,
  endedAt: null,
  failedAt: null,
  retries: 0,
  graceEndsAt: null,
  card: { brand: 'Visa' as const, last4: '4242' },
  sample: true
};

export const sampleSubscriptions = (): Subscription[] => [
{
  ...base,
  id: 'ssub_tolu',
  token: 'sample-tolu',
  planId: 'ssp_circle',
  customer: { name: 'Tolu Bankole', phone: '+234 803 000 3101', email: 'tolu@example.com' },
  delivery: null,
  status: 'active',
  startedAt: ago(52),
  trialEndsAt: null,
  periodEnd: ahead(8),
  payments: [pay('sp_t2', 'Monthly renewal', 5000, 22), pay('sp_t1', 'First charge after trial', 5000, 45)],
  events: [ev('se_t3', 'Renewed — ₦5,000 paid', 22), ev('se_t2', 'Renewed — ₦5,000 paid', 45), ev('se_t1', 'Started a 7-day free trial of Atelier Circle', 52, 'customer')]
},
{
  ...base,
  id: 'ssub_amaka',
  token: 'sample-amaka',
  planId: 'ssp_circle',
  customer: { name: 'Amaka Obi', phone: '+234 809 000 3102', email: 'amaka@example.com' },
  delivery: null,
  status: 'trialing',
  startedAt: ago(3),
  trialEndsAt: ahead(4),
  periodEnd: ahead(4),
  payments: [],
  events: [ev('se_a1', 'Started a 7-day free trial of Atelier Circle', 3, 'customer')]
},
{
  ...base,
  id: 'ssub_zainab',
  token: 'sample-zainab',
  planId: 'ssp_scarf',
  customer: { name: 'Zainab Musa', phone: '+234 802 000 3103', email: 'zainab@example.com' },
  delivery: { method: 'delivery', zoneId: 'z_island', zoneName: 'Lagos Island', address: '12 Example Close, Ikoyi', feeNgn: 2500 },
  status: 'past_due',
  startedAt: ago(34),
  trialEndsAt: null,
  periodEnd: ago(2),
  failedAt: ago(2),
  retries: 1,
  graceEndsAt: ahead(5),
  card: { brand: 'Mastercard', last4: '0119' },
  payments: [pay('sp_z3', 'Retry 1 of 3', 14500, 1, 'failed'), pay('sp_z2', 'Monthly renewal', 14500, 2, 'failed'), pay('sp_z1', 'First month', 14500, 34), pay('sp_z0', 'Setup fee', 2000, 34)],
  events: [ev('se_z3', 'Retry 1 failed — card declined', 1), ev('se_z2', 'Renewal failed — retrying on days 1, 3, 5', 2), ev('se_z1', 'Subscribed to Scarf of the month', 34, 'customer')]
},
{
  ...base,
  id: 'ssub_funmi',
  token: 'sample-funmi',
  planId: 'ssp_circle',
  customer: { name: 'Funmi Adeyemi', phone: '+234 806 000 3104', email: '' },
  delivery: null,
  status: 'cancelling',
  cancelReason: 'Travelling for a few months',
  startedAt: ago(80),
  trialEndsAt: null,
  periodEnd: ahead(12),
  payments: [pay('sp_f2', 'Monthly renewal', 5000, 18), pay('sp_f1', 'Monthly renewal', 5000, 48)],
  events: [ev('se_f2', 'Cancelled — “Travelling for a few months”. Ends at the end of the paid period.', 4, 'customer'), ev('se_f1', 'Subscribed to Atelier Circle', 80, 'customer')]
}];