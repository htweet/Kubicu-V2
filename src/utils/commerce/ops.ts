import { copyLabel, watermarkKind } from './watermark';
import type {
  CartLine,
  CommerceData,
  Dispute,
  Order,
  OrderCustomer,
  OrderEvent,
  OrderEventKind,
  OrderFulfilment,
  OrderStatus,
  Product,
  StockMovement,
  StockReason,
  TestPaymentOutcome } from
'../../types/commerce';
import type { WorkspacePlan } from '../../types/plan';
import { uid } from '../id';
import { variantLabel, variantPrice } from './catalog';
import { kubicuFee, providerFee, refundableNgn } from './money';
import { orderDiscountRecord, resolveDiscount } from './discounts';
import { formatNgn } from '../format';
import { issueTickets, orderCapacityIssue, stockFree, stockHeldMessage, ticketLineIssue } from './tickets';
import { cartBalanceNgn, dispatchBlocked } from './deposit';
import { everyLabels, instalmentCheck, newParts, payOptionsOf, podAwaiting, podCheck } from './payOptions';
import { bundleLineFor, partnerGrossFor } from './bundles';
import { enrolFromOrder } from './courses';
import { bulkUnitPrice, isPreorder, issueGiftCardsForOrder, preorderLeft, resolveGiftCard, shipsByLabel, spendGiftCard } from './sellModes';
import { shopClosedMessage, shopSettingsOf, untaxedAmount, vatFor } from './shopSettings';
import type { CountryCode } from '../../types/country';
import { shiftBranchStock } from './branches';
import { consumeBatches, fitBatches } from './batches';

export const OWNER_ACTOR = 'You';

function event(kind: OrderEventKind, label: string, at = new Date().toISOString()): OrderEvent {
  return { id: uid('ev'), kind, label, at };
}

function now() {
  return new Date().toISOString();
}

/** Applies a stock change to one variant and records the movement. */
export function moveStock(
data: CommerceData,
productId: string,
variantId: string,
delta: number,
reason: StockReason,
note = '',
orderNumber?: number,
/** Location the units leave or arrive at (D437); the main shop when missing. */
branchId?: string,
/** Batch the units leave from (D476); otherwise sales use the batch that expires soonest. */
batchId?: string)
: CommerceData {
  let after = 0;
  const products = data.products.map((p) => {
    if (p.id !== productId || !p.trackStock || p.kind === 'digital') return p;
    return {
      ...p,
      variants: p.variants.map((v) => {
        if (v.id !== variantId) return v;
        after = Math.max(0, v.stock + delta);
        const batches = delta < 0 ? consumeBatches(v, -delta, batchId, branchId) : v.batches;
        const moved = shiftBranchStock({ ...v, stock: after, batches }, branchId, delta);
        return { ...moved, batches: fitBatches(moved) };
      })
    };
  });
  const product = data.products.find((p) => p.id === productId);
  if (!product || !product.trackStock || product.kind === 'digital' || delta === 0) return data;
  const movement: StockMovement = { id: uid('mv'), productId, variantId, delta, after, reason, note, by: reason === 'order' || reason === 'cancelled' ? 'Checkout' : OWNER_ACTOR, at: now(), orderNumber };
  return { ...data, products, movements: [movement, ...data.movements].slice(0, 500) };
}

export function upsertProduct(data: CommerceData, product: Product): CommerceData {
  const prev = data.products.find((p) => p.id === product.id);
  const next = { ...product, updatedAt: now() };
  let out: CommerceData = { ...data, products: prev ? data.products.map((p) => p.id === product.id ? next : p) : [next, ...data.products] };
  // Record stock differences as corrections so the history stays complete.
  if (next.trackStock && next.kind === 'physical') {
    next.variants.forEach((v) => {
      const before = prev?.variants.find((pv) => pv.id === v.id)?.stock ?? 0;
      if (before !== v.stock) {
        const movement: StockMovement = {
          id: uid('mv'),
          productId: next.id,
          variantId: v.id,
          delta: v.stock - before,
          after: v.stock,
          reason: prev ? 'correction' : 'created',
          note: prev ? 'Edited in product' : 'Opening stock',
          by: OWNER_ACTOR,
          at: now()
        };
        out = { ...out, movements: [movement, ...out.movements] };
      }
    });
  }
  return out;
}

export interface CheckoutInput {
  lines: CartLine[];
  customer: OrderCustomer;
  fulfilment: OrderFulfilment;
  deliveryNgn: number;
  outcome: TestPaymentOutcome;
  plan: WorkspacePlan;
  /** Code the customer entered (may be empty). Discounts are re-checked here against live data. */
  discountCode?: string;
  /** Which link the order came from. */
  sourceHandle?: string;
  /** DealRoom checkout: room price for its product, and whether orders wait for the goal. */
  dealRoom?: {productId: string;priceNgn: number | null;held: boolean;};
  /** Share code from a DealRoom link (?ref=), checked against the room's real orders. */
  referredBy?: string;
  /** Optional names for each ticket seat, keyed by ticket type (variant) id (D73). */
  guestNames?: Record<string, string[]>;
  /** The buyer's seat-hold id, so their own held seats count as theirs (D73a). */
  holder?: string;
  /** How the buyer pays (D112). Defaults to paying in full now. Rules are re-checked here. */
  payWith?: 'now' | 'pod' | 'instalments';
  /** Pop-up shop pickup (D183): the chosen session, and whether the buyer pays at the stall. */
  popup?: {sessionId: string;sessionLabel: string;payAtStall: boolean;};
  /** Pop-up stall limits still available, re-checked here so a stall never oversells its allocation. */
  stallLeft?: Record<string, number | null>;
  /** Gift card code the buyer entered (D202), re-checked here against live balances. */
  giftCardCode?: string;
  /** Order-note box and checkout address (D222). */
  buyerNote?: string;
  buyerAddress?: string;
  /** Paid to a one-time provider transfer account (D222). */
  transferAccount?: {bank: string;account: string;};
  /** Cross-border delivery (D438): the buyer's country. Decides whose tax applies (D435). */
  shipTo?: CountryCode;
}

/** A short, readable share code for a DealRoom buyer, e.g. NGOZI-7K2. */
export function makeReferralCode(name: string, taken: Set<string>): string {
  const first = (name.trim().split(/\s+/)[0] ?? 'FRIEND').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) || 'FRIEND';
  for (let i = 0; i < 20; i++) {
    const code = `${first}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
    if (!taken.has(code)) return code;
  }
  return `${first}-${Date.now().toString(36).toUpperCase().slice(-4)}`;
}

export type CheckoutResult =
{ok: true;data: CommerceData;order: Order;} |
{ok: false;reason: 'failed' | 'cancelled' | 'unavailable';message: string;};

/** Gives a DealRoom buyer their own code, and credits the person whose link they used (never themselves). */
function roomReferral(data: CommerceData, input: CheckoutInput): Pick<Order, 'referralCode' | 'referredBy'> {
  const roomOrders = data.orders.filter((o) => o.sourceHandle === input.sourceHandle);
  const digits = input.customer.phone.replace(/\D/g, '');
  // Someone who already bought keeps the same code.
  const existing = roomOrders.find((o) => o.referralCode && o.customer.phone.replace(/\D/g, '') === digits)?.referralCode;
  const taken = new Set(data.orders.map((o) => o.referralCode).filter((c): c is string => !!c));
  const code = existing ?? makeReferralCode(input.customer.name, taken);
  const ref = input.referredBy?.trim().toUpperCase();
  const referrer = ref ? roomOrders.find((o) => o.referralCode === ref && o.customer.phone.replace(/\D/g, '') !== digits) : undefined;
  return { referralCode: code, referredBy: referrer ? ref : undefined };
}

/** Places a test-mode order. Failed or cancelled payments create no order and keep the cart. */
export function placeOrder(data: CommerceData, input: CheckoutInput): CheckoutResult {
  const pod = input.payWith === 'pod';
  // Pay at the stall (D183): nothing is charged now; the seller marks it paid when it's collected.
  const atStall = !!input.popup?.payAtStall;
  if (pod || atStall) input = { ...input, outcome: 'success' };
  if (input.outcome === 'failed') return { ok: false, reason: 'failed', message: 'The test card was declined. No money moved and nothing was ordered.' };
  if (input.outcome === 'cancelled') return { ok: false, reason: 'cancelled', message: 'Payment was cancelled before it finished. Your cart is still here.' };
  // Shop settings (D222) are re-checked here against the live store, like discounts and stock.
  const shop = shopSettingsOf(data);
  const closed = shopClosedMessage(shop);
  if (closed) return { ok: false, reason: 'unavailable', message: `${closed} Nothing was charged.` };
  let backordered = false;

  const items = [];
  // Bulk prices (D202) go by how many of each product are in the order, across its variants.
  const qtyByProduct = input.lines.reduce<Record<string, number>>((m, l) => ({ ...m, [l.productId]: (m[l.productId] ?? 0) + l.qty }), {});
  for (const line of input.lines) {
    const product = data.products.find((p) => p.id === line.productId);
    const variant = product?.variants.find((v) => v.id === line.variantId);
    const roomPrice = input.dealRoom && input.dealRoom.productId === line.productId ? input.dealRoom.priceNgn : null;
    const base = product && variant ? variantPrice(product, variant) : null;
    const price = product && variant ? roomPrice ?? (base !== null ? bulkUnitPrice(product, base, qtyByProduct[product.id] ?? line.qty) : null) : null;
    if (!product || !variant || product.status !== 'active' || price === null) {
      return { ok: false, reason: 'unavailable', message: `${product?.name ?? 'An item'} is no longer available.` };
    }
    if (isPreorder(product)) {
      const left = preorderLeft(product);
      if (left !== null && (qtyByProduct[product.id] ?? 0) > left) return { ok: false, reason: 'unavailable', message: left === 0 ? `Pre-orders for ${product.name} are full. Nothing was charged.` : `Only ${left} pre-order${left === 1 ? '' : 's'} left for ${product.name}. Nothing was charged.` };
    } else if (product.kind === 'physical' && product.trackStock && !shop.orders.backorders) {
      // Other buyers' checkout holds (D255) count as taken; this buyer's own hold counts as theirs.
      const free = stockFree(data, variant, input.holder);
      if (free < line.qty) {
        const held = free < variant.stock;
        return { ok: false, reason: 'unavailable', message: held ? `${stockHeldMessage(product.name, free)}. Nothing was charged.` : `Only ${variant.stock} of ${product.name} (${variantLabel(variant)}) left.` };
      }
    }
    if (product.kind === 'physical' && product.trackStock && !isPreorder(product) && variant.stock < line.qty) backordered = true;
    if (product.kind === 'ticket') {
      // Seats are re-checked at payment so an event never oversells (D73).
      const issue = ticketLineIssue(data, line, Date.now(), input.holder);
      if (issue) return { ok: false, reason: 'unavailable', message: `${issue}. Nothing was charged.` };
    }
    items.push({
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      variantLabel: Object.keys(variant.options).length ? variantLabel(variant) : '',
      unitPriceNgn: price,
      qty: line.qty,
      imageUrl: product.images[0]?.url ?? '',
      kind: product.kind,
      seats: product.kind === 'ticket' && line.seats?.length ? line.seats : undefined,
      bundle: bundleLineFor(product, price)
    });
  }

  if (input.stallLeft) {
    for (const [productId, left] of Object.entries(input.stallLeft)) {
      if (left === null) continue;
      const qty = input.lines.filter((l) => l.productId === productId).reduce((t, l) => t + l.qty, 0);
      if (qty > left) {
        const name = data.products.find((p) => p.id === productId)?.name ?? 'An item';
        return { ok: false, reason: 'unavailable', message: left === 0 ? `${name} has sold out at the stall. Nothing was charged.` : `Only ${left} of ${name} left at the stall. Nothing was charged.` };
      }
    }
  }

  const capacityIssue = orderCapacityIssue(data, input.lines, input.holder);
  if (capacityIssue) return { ok: false, reason: 'unavailable', message: `${capacityIssue}. Nothing was charged.` };

  const subtotal = items.reduce((s, i) => s + i.unitPriceNgn * i.qty, 0);
  const { applied } = resolveDiscount(
    data,
    {
      lines: items.map((i) => ({ productId: i.productId, collectionIds: data.products.find((p) => p.id === i.productId)?.collectionIds ?? [], amountNgn: i.unitPriceNgn * i.qty })),
      subtotalNgn: subtotal,
      deliveryNgn: input.deliveryNgn,
      phone: input.customer.phone
    },
    input.discountCode ?? ''
  );
  const codeDiscountNgn = Math.min(applied?.amountNgn ?? 0, subtotal + input.deliveryNgn);
  // Minimum order value (D222), on goods after any discount code.
  if (shop.checkout.minOrderNgn && subtotal - codeDiscountNgn < shop.checkout.minOrderNgn)
  return { ok: false, reason: 'unavailable', message: `The minimum order is ${formatNgn(shop.checkout.minOrderNgn)}. Nothing was charged.` };
  // VAT (D222): on goods after discount, plus delivery. Exclusive VAT is added before any gift card is spent.
  // Zero-rated and exempt items, and buyers in other countries, follow the tax rules (D435).
  const untaxedNgn = untaxedAmount(items.map((i) => ({ amountNgn: i.unitPriceNgn * i.qty, taxClass: data.products.find((p) => p.id === i.productId)?.taxClass })));
  const vat = vatFor(shop, subtotal - codeDiscountNgn + input.deliveryNgn, { buyerCountry: input.shipTo, untaxedNgn });
  const vatAdded = vat?.addedNgn ?? 0;
  // Gift card (D202): spent after any discount; the amount is part of the order's discount line.
  const giftProducts = new Set(data.products.filter((p) => p.giftCard).map((p) => p.id));
  const gift = resolveGiftCard(data, input.giftCardCode ?? '', subtotal - codeDiscountNgn + input.deliveryNgn + vatAdded, items.some((i) => giftProducts.has(i.productId)));
  if (gift && !gift.ok) return { ok: false, reason: 'unavailable', message: `${gift.message} Nothing was charged.` };
  const giftNgn = gift?.ok ? gift.amountNgn : 0;
  const discountNgn = codeDiscountNgn + giftNgn;
  const fullTotal = subtotal - discountNgn + input.deliveryNgn + vatAdded;
  // Made-to-order items: only the deposit is charged now; the rest before dispatch (D95). Not for DealRooms.
  const balanceNgn = input.dealRoom ?
  0 :
  cartBalanceNgn(
    data.products,
    items.map((i) => ({ productId: i.productId, amountNgn: i.unitPriceNgn * i.qty })),
    fullTotal
  );
  // Pay on delivery and instalments are re-checked against live settings (D112).
  const productsInCart = items.map((i) => data.products.find((p) => p.id === i.productId));
  if (pod) {
    const zone = data.fulfilment.zones.find((z) => z.id === input.fulfilment.zoneId);
    const check = podCheck(data, { total: fullTotal, zoneId: input.fulfilment.method === 'delivery' ? input.fulfilment.zoneId ?? null : null, zoneName: zone?.name, onlyPhysical: items.every((i) => i.kind === 'physical'), balanceLater: balanceNgn, dealRoom: !!input.dealRoom, phone: input.customer.phone, bundle: items.some((i) => !!i.bundle) });
    if (!check.ok) return { ok: false, reason: 'unavailable', message: `${check.reason || 'Pay on delivery isn’t available for this order.'} Nothing was ordered.` };
  }
  let instalmentPlan: ReturnType<typeof instalmentCheck> | null = null;
  if (input.payWith === 'instalments') {
    // Later parts go on the same card, so the first payment has to confirm straight away.
    if (input.outcome !== 'success') return { ok: false, reason: 'failed', message: 'Paying in parts needs a card that confirms straight away. Nothing was charged — try again or pay in full.' };
    instalmentPlan = instalmentCheck(data, { products: productsInCart, total: fullTotal, balanceLater: balanceNgn, dealRoom: !!input.dealRoom });
    if (!instalmentPlan.ok) return { ok: false, reason: 'unavailable', message: `${instalmentPlan.reason || 'Paying in parts isn’t available for this order.'} Nothing was charged.` };
  }
  const parts = instalmentPlan?.ok ? newParts(fullTotal, instalmentPlan.plan) : null;
  const gross = pod || atStall ? 0 : parts ? parts[0].amountNgn : fullTotal - balanceNgn;
  const paid = !pod && !atStall && input.outcome === 'success';
  // Partner bundles (D122): each business pays its own KUBICU fee on its own share.
  const partnerGross = partnerGrossFor(items, subtotal, discountNgn);
  const number = data.nextOrderNumber;
  const placedAt = now();
  const hasDigital = items.some((i) => i.kind === 'digital');
  const hasTickets = items.some((i) => i.kind === 'ticket');
  const hasCourse = items.some((i) => i.kind === 'course');
  const hasGiftCards = items.some((i) => giftProducts.has(i.productId));
  // Digital files, tickets, courses (D197) and gift card codes (D202) are delivered the moment payment clears.
  const digitalOnly = items.every((i) => i.kind === 'digital' || i.kind === 'ticket' || i.kind === 'course' || giftProducts.has(i.productId));
  const deliveredLabel = [hasTickets ? 'Tickets issued' : '', hasDigital ? 'download link sent' : '', hasCourse ? 'course access opened' : '', hasGiftCards ? 'gift card codes issued' : ''].filter(Boolean).join(' and ').replace(/^./, (c) => c.toUpperCase()) || 'Delivered';
  const events: OrderEvent[] = [event('placed', 'Order placed on your page', placedAt)];
  if (applied && codeDiscountNgn > 0) {
    const who = applied.discount.referrerName ? ` — referred by ${applied.discount.referrerName}` : '';
    events.unshift(event('note', `${applied.discount.code ? `Code ${applied.discount.code}` : applied.discount.title} saved the customer ${formatNgn(codeDiscountNgn)}${who}`, placedAt));
  }
  if (gift?.ok && giftNgn > 0) events.unshift(event('note', `Gift card ${gift.card.code} paid ${formatNgn(giftNgn)} — ${formatNgn(gift.card.balanceNgn - giftNgn)} left on it`, placedAt));
  const preProducts = items.map((i) => data.products.find((p) => p.id === i.productId)).filter(isPreorder);
  const shipsBy = preProducts.map((p) => p.preorder.shipsBy).sort().pop();
  if (shipsBy) events.unshift(event('note', `Pre-order — expected by ${shipsByLabel(shipsBy)}. Don’t send until it’s in stock`, placedAt));
  const bulkLines = items.filter((i) => {
    const p = data.products.find((x) => x.id === i.productId);
    const v = p?.variants.find((x) => x.id === i.variantId);
    const base = p && v ? variantPrice(p, v) : null;
    return !input.dealRoom && base !== null && i.unitPriceNgn < base;
  });
  if (bulkLines.length) events.unshift(event('note', `Bulk price applied to ${bulkLines.map((i) => i.name).join(', ')}`, placedAt));
  if (pod) {
    const accept = payOptionsOf(data).pod.accept;
    events.unshift(event('note', `Pay on delivery — collect ${formatNgn(fullTotal)} (${accept === 'cash' ? 'cash' : accept === 'transfer' ? 'transfer' : 'cash or transfer'}) at the door`, placedAt));
  }
  if (paid && parts && instalmentPlan?.ok)
  events.unshift(event('paid', `Instalment 1 of ${parts.length} — ${formatNgn(gross)} paid (test mode). ${formatNgn(fullTotal - gross)} to be charged ${everyLabels[instalmentPlan.plan.every]}${instalmentPlan.plan.ship === 'last' ? '; sent once fully paid' : ''}`));else
  if (paid) events.unshift(event('paid', balanceNgn ? `Deposit of ${formatNgn(gross)} confirmed (test mode) — ${formatNgn(balanceNgn)} due before dispatch` : 'Payment confirmed by provider (test mode)'));
  if (input.dealRoom?.held) events.unshift(event('note', 'Joined the group buy — held until the goal is reached, refunded automatically if it isn’t', placedAt));
  if (paid && partnerGross > 0) {
    const names = [...new Set(items.filter((i) => i.bundle).map((i) => i.bundle!.partnerName))].join(' and ');
    events.unshift(event('note', `Sold with ${names} — their share of ${formatNgn(partnerGross)} was split off at payment, as agreed`, placedAt));
  }
  if (paid && digitalOnly && !input.dealRoom?.held) events.unshift(event('completed', deliveredLabel));
  if (input.popup) events.unshift(event('note', `Pop-up pickup — ${input.popup.sessionLabel}${atStall ? `. Collect ${formatNgn(fullTotal)} at the stall` : ''}`, placedAt));
  if (backordered) events.unshift(event('note', 'Includes items sold past zero stock (backorder) — send when they’re back in', placedAt));
  if (input.buyerNote?.trim()) events.unshift(event('note', `Customer’s note: “${input.buyerNote.trim().slice(0, 300)}”`, placedAt));
  if (!paid && !pod && !atStall) events.unshift(event('payment', input.outcome === 'timeout' ? 'Provider didn’t respond in time — awaiting confirmation' : 'Payment pending with provider'));

  const order: Order = {
    id: uid('ord'),
    number,
    createdAt: placedAt,
    customer: input.customer,
    items,
    fulfilment: input.shipTo ? { ...input.fulfilment, country: input.shipTo } : input.fulfilment,
    subtotalNgn: subtotal,
    discountNgn,
    discount: applied && codeDiscountNgn > 0 ? orderDiscountRecord(applied) : undefined,
    giftCard: gift?.ok && giftNgn > 0 ? { code: gift.card.code, amountNgn: giftNgn } : undefined,
    preorder: shipsBy ? { shipsBy } : undefined,
    sourceHandle: input.sourceHandle,
    held: input.dealRoom?.held || undefined,
    ...(input.dealRoom ? roomReferral(data, input) : {}),
    deliveryNgn: input.deliveryNgn,
    providerFeeNgn: providerFee(gross),
    kubicuFeeNgn: kubicuFee(Math.max(0, gross - partnerGross), input.plan),
    status: paid ? digitalOnly && !input.dealRoom?.held ? 'completed' : 'paid' : 'new',
    paymentStatus: paid ? 'paid' : 'pending',
    paymentNote: input.outcome === 'timeout' ? 'Provider timed out' : undefined,
    refunds: [],
    events,
    downloadToken: hasDigital ? uid('dl') : undefined,
    downloads: [],
    note: '',
    tickets: hasTickets ? issueTickets(data, items, input.customer.name, input.guestNames) : undefined,
    balance: balanceNgn > 0 && !parts ? { dueNgn: balanceNgn } : undefined,
    pod: pod ? { amountNgn: fullTotal, accept: payOptionsOf(data).pod.accept } : undefined,
    instalments: parts && instalmentPlan?.ok ? { every: instalmentPlan.plan.every, ship: instalmentPlan.plan.ship, card: { brand: 'Visa', last4: '4081' }, parts, status: 'active', agreedAt: placedAt } : undefined,
    popup: input.popup ? { ...input.popup } : undefined,
    vat: vat ? { ratePct: vat.ratePct, amountNgn: vat.amountNgn, inclusive: vat.inclusive, country: vat.country } : undefined,
    numberPrefix: shop.orders.prefix || undefined,
    buyerNote: input.buyerNote?.trim().slice(0, 300) || undefined,
    buyerAddress: input.buyerAddress?.trim() || undefined,
    backorder: backordered || undefined,
    transferAccount: input.transferAccount
  };

  let next: CommerceData = { ...data, orders: [order, ...data.orders], nextOrderNumber: number + 1 };
  const preIds = new Set(preProducts.map((p) => p.id));
  items.forEach((i) => {
    // Pre-orders count against their own limit instead of stock (D202).
    if (preIds.has(i.productId)) return;
    next = moveStock(next, i.productId, i.variantId, -i.qty, 'order', 'Reserved by order', number, input.fulfilment.branchId);
  });
  if (preIds.size)
  next = { ...next, products: next.products.map((p) => preIds.has(p.id) && p.preorder ? { ...p, preorder: { ...p.preorder, taken: p.preorder.taken + (qtyByProduct[p.id] ?? 0) } } : p) };
  if (gift?.ok && giftNgn > 0) next = spendGiftCard(next, gift.card.code, giftNgn, order);
  if (hasGiftCards) next = issueGiftCardsForOrder(next, order.id);
  // Courses (D197): the buyer is enrolled now; access opens once the payment is confirmed.
  if (hasCourse) next = enrolFromOrder(next, order);
  return { ok: true, data: next, order };
}

const statusEvent: Partial<Record<OrderStatus, [OrderEventKind, string]>> = {
  paid: ['paid', 'Payment confirmed'],
  packing: ['packing', 'Marked as packing'],
  out_for_delivery: ['shipped', 'Out for delivery'],
  completed: ['completed', 'Marked as completed']
};

export function setOrderStatus(data: CommerceData, orderId: string, status: OrderStatus, label?: string): CommerceData {
  const next = setOrderStatusOnly(data, orderId, status, label);
  // A payment confirmed by hand (e.g. a bank transfer) issues any gift card codes too (D202).
  return status === 'paid' ? issueGiftCardsForOrder(next, orderId) : next;
}

function setOrderStatusOnly(data: CommerceData, orderId: string, status: OrderStatus, label?: string): CommerceData {
  return {
    ...data,
    orders: data.orders.map((o) => {
      if (o.id !== orderId) return o;
      // Made-to-order: nothing goes out until the balance is in (D95).
      if ((status === 'out_for_delivery' || status === 'completed') && dispatchBlocked(o)) return o;
      // Pay on delivery (D112): completing needs the collection recorded (collectPod), never a silent "paid".
      if ((status === 'completed' || status === 'paid') && podAwaiting(o)) return o;
      const ev = statusEvent[status];
      const pickupReady = status === 'out_for_delivery' && o.fulfilment.method === 'pickup';
      const e = ev ? event(pickupReady ? 'ready' : ev[0], label ?? (pickupReady ? 'Ready for pickup' : ev[1])) : null;
      return {
        ...o,
        status,
        paymentStatus: status === 'paid' && o.paymentStatus === 'pending' ? 'paid' : o.paymentStatus,
        events: e ? [e, ...o.events] : o.events
      };
    })
  };
}

/** Simulates the provider's delayed webhook. Digital-only orders complete straight away. */
export function confirmPayment(data: CommerceData, orderId: string): CommerceData {
  const order = data.orders.find((o) => o.id === orderId);
  // Gift card codes (D202) are issued once the payment is in.
  const next = issueGiftCardsForOrder(setOrderStatus(data, orderId, 'paid', 'Payment confirmed by provider (test mode)'), orderId);
  const gifts = new Set(data.products.filter((p) => p.giftCard).map((p) => p.id));
  if (order && order.items.every((i) => i.kind === 'digital' || i.kind === 'ticket' || i.kind === 'course' || gifts.has(i.productId)))
  return setOrderStatus(next, orderId, 'completed', order.items.some((i) => i.kind === 'ticket') ? 'Tickets issued' : order.items.some((i) => i.kind === 'course') ? 'Course access opened' : order.items.every((i) => gifts.has(i.productId)) ? 'Gift card codes issued' : 'Delivered by secure download link');
  return next;
}

/** Refunded or cancelled orders can't admit anyone. */
function voidTickets(data: CommerceData, orderId: string): CommerceData {
  return { ...data, orders: data.orders.map((o) => o.id === orderId && o.tickets ? { ...o, tickets: o.tickets.map((t) => ({ ...t, status: 'void' as const })) } : o) };
}

export function cancelOrder(data: CommerceData, orderId: string, reason: string, restock: boolean): CommerceData {
  const order = data.orders.find((o) => o.id === orderId);
  if (!order) return data;
  let next: CommerceData = {
    ...data,
    orders: data.orders.map((o) =>
    o.id === orderId ?
    {
      ...o,
      status: 'cancelled' as const,
      paymentStatus: o.paymentStatus === 'pending' ? 'cancelled' as const : o.paymentStatus,
      events: [event('cancelled', `Cancelled${reason ? ` — ${reason}` : ''}`), ...o.events]
    } :
    o
    )
  };
  // Ticket seats always go back on sale when an order is cancelled.
  order.items.forEach((i) => {
    if (restock || i.kind === 'ticket') next = moveStock(next, i.productId, i.variantId, i.qty, 'cancelled', 'Released by cancellation', order.number, order.fulfilment.branchId);
  });
  return voidTickets(next, orderId);
}

export function refundOrder(data: CommerceData, orderId: string, amountNgn: number, reason: string, restock: boolean): CommerceData {
  const order = data.orders.find((o) => o.id === orderId);
  if (!order) return data;
  const amount = Math.min(amountNgn, refundableNgn(order));
  if (amount <= 0) return data;
  const full = amount >= refundableNgn(order);
  let next: CommerceData = {
    ...data,
    orders: data.orders.map((o) =>
    o.id === orderId ?
    {
      ...o,
      refunds: [...o.refunds, { id: uid('rf'), amountNgn: amount, reason, restocked: restock, at: now() }],
      paymentStatus: full ? 'refunded' as const : 'partially_refunded' as const,
      status: full ? 'refunded' as const : o.status,
      // KUBICU returns its fee when an order is refunded in full; the provider fee stays (D55).
      kubicuFeeNgn: full ? 0 : o.kubicuFeeNgn,
      events: [event('refund', `${full ? 'Refunded in full' : 'Partial refund'} — ${formatNgn(amount)}${reason ? ` · ${reason}` : ''}`), ...o.events]
    } :
    o
    )
  };
  // A full refund voids the order's tickets and frees their seats (D73).
  order.items.forEach((i) => {
    if (restock || full && i.kind === 'ticket') next = moveStock(next, i.productId, i.variantId, i.qty, 'returned', 'Returned with refund', order.number, order.fulfilment.branchId);
  });
  // A full refund puts any gift card amount back on the card (D202); the card is never refunded as cash.
  if (full && order.giftCard && order.giftCard.amountNgn > 0) {
    const gc = order.giftCard;
    next = {
      ...next,
      giftCards: (next.giftCards ?? []).map((g) =>
      g.code === gc.code && g.uses.some((u) => u.orderId === order.id && u.amountNgn > 0) ?
      { ...g, balanceNgn: Math.min(g.initialNgn, g.balanceNgn + gc.amountNgn), uses: [{ orderId: order.id, orderNumber: order.number, amountNgn: -gc.amountNgn, at: now() }, ...g.uses] } :
      g
      ),
      orders: next.orders.map((o) => o.id === orderId ? { ...o, events: [event('note', `${formatNgn(gc.amountNgn)} put back on gift card ${gc.code}`), ...o.events] } : o)
    };
  }
  // Refunding a gift card purchase turns its codes off so they can't be spent after the money is returned.
  if (full) next = { ...next, giftCards: (next.giftCards ?? []).map((g) => g.orderId === orderId && g.status === 'active' ? { ...g, status: 'disabled' as const } : g) };
  return full ? voidTickets(next, orderId) : next;
}

export function updateDispute(data: CommerceData, orderId: string, patch: Partial<Dispute>, label?: string): CommerceData {
  return {
    ...data,
    orders: data.orders.map((o) =>
    o.id === orderId && o.dispute ? { ...o, dispute: { ...o.dispute, ...patch }, events: label ? [event('dispute', label), ...o.events] : o.events } : o
    )
  };
}

export function addOrderNote(data: CommerceData, orderId: string, note: string): CommerceData {
  return { ...data, orders: data.orders.map((o) => o.id === orderId ? { ...o, events: [event('note', note), ...o.events] } : o) };
}

export type DownloadCheck =
{ok: true;remaining: number | null;expiresAt: string | null;} |
{ok: false;reason: 'revoked' | 'limit' | 'expired' | 'not_ready' | 'pending';};

export function checkDownload(order: Order, product: Product): DownloadCheck {
  const asset = product.digital;
  if (!asset || asset.status !== 'ready') return { ok: false, reason: 'not_ready' };
  if (order.paymentStatus === 'pending') return { ok: false, reason: 'pending' };
  if (order.paymentStatus === 'refunded' || order.status === 'cancelled') return { ok: false, reason: 'revoked' };
  const expiresAt = asset.expiryDays ? new Date(Date.parse(order.createdAt) + asset.expiryDays * 86400000).toISOString() : null;
  if (expiresAt && Date.parse(expiresAt) < Date.now()) return { ok: false, reason: 'expired' };
  const used = order.downloads.filter((d) => d.productId === product.id).length;
  if (asset.downloadLimit !== null && used >= asset.downloadLimit) return { ok: false, reason: 'limit' };
  return { ok: true, remaining: asset.downloadLimit === null ? null : asset.downloadLimit - used, expiresAt };
}

export function recordDownload(data: CommerceData, orderId: string, productId: string): CommerceData {
  const asset = data.products.find((p) => p.id === productId)?.digital;
  return {
    ...data,
    orders: data.orders.map((o) => {
      if (o.id !== orderId) return o;
      // Watermarked files record whose copy left the shop, so a leaked file can be traced (D136).
      const copy = asset && watermarkKind(asset) ? copyLabel(o) : undefined;
      return { ...o, downloads: [...o.downloads, { id: uid('dlr'), productId, at: now(), copy }], events: [event('download', copy ? `Customer downloaded their stamped copy (${copy})` : 'Customer downloaded their file'), ...o.events] };
    })
  };
}

/** Removes everything marked as sample. */
export function clearSample(data: CommerceData): CommerceData {
  const sampleProducts = new Set(data.products.filter((p) => p.sample).map((p) => p.id));
  return {
    ...data,
    products: data.products.filter((p) => !p.sample),
    collections: data.collections.filter((c) => !c.sample),
    movements: data.movements.filter((m) => !m.sample && !sampleProducts.has(m.productId)),
    orders: data.orders.filter((o) => !o.sample),
    discounts: data.discounts.filter((d) => !d.sample),
    subPlans: data.subPlans.filter((p) => !p.sample),
    subscriptions: data.subscriptions.filter((s) => !s.sample),
    events: (data.events ?? []).filter((e) => !e.sample),
    courses: (data.courses ?? []).filter((c) => !c.sample),
    enrolments: (data.enrolments ?? []).filter((e) => !e.sample),
    giftCards: (data.giftCards ?? []).filter((g) => !g.sample)
  };
}