import type { Discount } from '../types/commerce';

const day = 86400000;
const iso = (offsetDays: number) => new Date(Date.now() + offsetDays * day).toISOString();

/** Sample offers for the demo workspace, labelled as sample. */
export const sampleDiscounts = (): Discount[] => [
  {
    id: 'sd_eid',
    kind: 'code',
    code: 'EID20',
    title: 'Eid sale — 20% off',
    value: { type: 'percent', percent: 20 },
    appliesTo: { scope: 'all' },
    minSubtotalNgn: null,
    startsAt: iso(-2),
    endsAt: iso(5),
    usageLimit: 100,
    perCustomerLimit: 1,
    active: true,
    createdAt: iso(-3),
    sample: true,
  },
  {
    id: 'sd_big',
    kind: 'automatic',
    code: '',
    title: '10% off orders over ₦50,000',
    value: { type: 'percent', percent: 10 },
    appliesTo: { scope: 'all' },
    minSubtotalNgn: 50000,
    startsAt: null,
    endsAt: null,
    usageLimit: null,
    perCustomerLimit: null,
    active: true,
    createdAt: iso(-20),
    sample: true,
  },
  {
    id: 'sd_chioma',
    kind: 'referral',
    code: 'ADA-CHIOMA',
    title: '₦2,000 off from Chioma',
    value: { type: 'fixed', amountNgn: 2000 },
    appliesTo: { scope: 'all' },
    minSubtotalNgn: 10000,
    startsAt: null,
    endsAt: null,
    usageLimit: null,
    perCustomerLimit: 1,
    active: true,
    referrerName: 'Chioma Okafor',
    rewardNote: 'Free scarf after 5 referred orders',
    createdAt: iso(-10),
    sample: true,
  },
];
