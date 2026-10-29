import type { CommerceData } from '../../types/commerce';
import type { OpsData } from '../../types/ops';
import { upsertContact } from './ops';
import { orderRef } from '../commerce/shopSettings';

/** Turns paid orders into contacts (once each). Customers are “service messages only” — buying isn’t marketing consent. */
export function syncOrdersToContacts(ops: OpsData, commerce: CommerceData): OpsData {
  const done = new Set(ops.syncedOrderIds ?? []);
  const fresh = commerce.orders.filter((o) => !done.has(o.id) && o.paymentStatus !== 'cancelled');
  if (fresh.length === 0) return ops;
  let next = ops;
  [...fresh].
  sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt)).
  forEach((o) => {
    next = upsertContact(next, o.customer, 'order', `Order ${orderRef(o)} · ${o.items.map((i) => i.name).join(', ')}`, { linkedId: o.id, consent: 'transactional', at: o.createdAt });
    if (o.sample) next = { ...next, contacts: next.contacts.map((c) => c.linked.includes(o.id) && !c.sample && c.sources.length === 1 ? { ...c, sample: true } : c) };
  });
  return { ...next, syncedOrderIds: [...done, ...fresh.map((o) => o.id)] };
}