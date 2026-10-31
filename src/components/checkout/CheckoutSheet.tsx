import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useT } from '../../contexts/LocaleContext';
import { announce } from '../../utils/announce';
import { tagPurchase } from '../../utils/trackingTags';
import { MediaImage } from '../media/MediaImage';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DiscountCodeField } from './DiscountCodeField';
import { GiftCardField } from './GiftCardField';
import { LoyaltyRedeem } from './LoyaltyRedeem';
import { USSD_AVAILABLE } from '../../data/ussdBanks';
import { bulkUnitPrice, isPreorder, preorderLeft, resolveGiftCard, shipsByLabel } from '../../utils/commerce/sellModes';
import { useTrack } from '../../contexts/TrackContext';
import { unitsBoughtBy, type DealRoomCheckout } from '../../utils/dealRoom';
import { discountLineLabel, normaliseCode, resolveDiscount } from '../../utils/commerce/discounts';
import { AlertTriangleIcon, ArrowLeftIcon, CreditCardIcon, HashIcon, LandmarkIcon, Loader2Icon, MinusIcon, PlusIcon, ShoppingBagIcon, SmartphoneIcon, Trash2Icon, XCircleIcon } from 'lucide-react';
import type { PageTheme } from '../../types/page';
import type { OrderFulfilment, TestPaymentOutcome } from '../../types/commerce';
import type { WorkspacePlan } from '../../types/plan';
import type { PageCommerce } from '../../hooks/usePageCommerce';
import { useCart } from '../../contexts/CartContext';
import { PageOverlay } from '../blocks/PageOverlay';
import { buttonRadius, cardStyle, mix } from '../blocks/pageStyle';
import { CheckoutHeading, PrimaryButton, SecondaryButton, SheetActions, StepDots, TermsUpdatedNote, TestModeNote, ThemedField } from './checkoutUi';
import { canSell, variantLabel, variantPrice } from '../../utils/commerce/catalog';
import { placeOrder } from '../../utils/commerce/ops';
import { cartBalanceNgn, isMadeToOrder } from '../../utils/commerce/deposit';
import { instalmentCheck, payOptionsOf, podCheck, schedule } from '../../utils/commerce/payOptions';
import { PayWithChooser, type PayWith } from './PayWithChooser';
import { HOLD_MINUTES, STOCK_HOLD_MINUTES, extendHolds, findEvent, holdExpiry, holderId, placeHolds, releaseHolds, stockFree, stockHeldMessage, stockHoldable, ticketLineIssue } from '../../utils/commerce/tickets';
import { describeSeats, findSeat } from '../../utils/commerce/seating';
import { useNow } from '../../hooks/useNow';
import { isValidEmail, isValidPhone } from '../../utils/validation';
import { formatNgn } from '../../utils/format';
import { isNaira } from '../../utils/currency';
import { dialPrefix } from '../../utils/phone';
import { UssdPay } from './UssdPay';
import { stampTransfer, transferAccounts } from '../../utils/commerce/bankTransfer';
import { reservedForStalls, type PopupCheckout } from '../../utils/popup';
import { hoursSummary, orderRef, returnsSummary, shopClosedMessage, shopSettingsOf, vatFor, vatRateLabel } from '../../utils/commerce/shopSettings';
import { TransferAccountPay, transferAccountFor } from './TransferAccountPay';
import { MobileMoneyPay } from './MobileMoneyPay';
import { localPayments } from '../../utils/payments';

type Step = 'cart' | 'details' | 'delivery' | 'review' | 'paying' | 'failed';
type PayBy = 'card' | 'ussd' | 'transfer' | 'account' | 'momo' | 'eft';

const outcomes: {value: TestPaymentOutcome;label: string;hint: string;}[] = [
{ value: 'success', label: 'Succeeds', hint: '4084 0840 8408 4081' },
{ value: 'pending', label: 'Pending', hint: 'e.g. bank transfer not yet confirmed' },
{ value: 'failed', label: 'Declined', hint: 'Card declined by the bank' },
{ value: 'cancelled', label: 'Cancelled', hint: 'Customer closes the payment window' },
{ value: 'timeout', label: 'Provider timeout', hint: 'Provider is slow to respond' }];


interface CheckoutSheetProps {
  theme: PageTheme;
  commerce: PageCommerce;
  ownerPlan: WorkspacePlan;
  handle: string;
  /** A campaign's discount code, applied automatically (D52). */
  defaultCode?: string;
  /** DealRoom rules: room price, limits and the group-goal promise (D54). */
  dealRoom?: DealRoomCheckout;
  /** For the "Bank transfer payments" extension (D148). */
  workspaceId?: string | null;
  businessName?: string;
  /** Pop-up shop (D183): pickup only at the stall, for a chosen session; optional pay at the stall. */
  popup?: PopupCheckout;
}

export function CheckoutSheet({ theme, commerce, ownerPlan, handle, defaultCode, dealRoom, workspaceId, businessName = '', popup }: CheckoutSheetProps) {
  const { t: tr } = useT();
  const cart = useCart();
  const navigate = useNavigate();
  const track = useTrack();
  const [step, setStep] = useState<Step>('cart');
  const [customer, setCustomer] = useState({ name: '', phone: '', email: '' });
  const [method, setMethod] = useState<string>('');
  const [address, setAddress] = useState('');
  const [chosenOutcome, setOutcome] = useState<TestPaymentOutcome>('success');
  const outcome = chosenOutcome;
  const [failure, setFailure] = useState('');
  const [tried, setTried] = useState(false);
  // Campaign links can carry a code (?code=EID20); it's pre-filled and still checked (D51).
  const [params] = useSearchParams();
  const [code, setCode] = useState(() => normaliseCode(params.get('code') ?? defaultCode ?? ''));
  // Gift card (D202).
  const [giftCode, setGiftCode] = useState('');
  // Names printed on each ticket seat; blank seats use the buyer's name (D73).
  const [guestNames, setGuestNames] = useState<Record<string, string[]>>({});
  // Pay on delivery / instalments (D112).
  const [payWithChoice, setPayWith] = useState<PayWith>('now');
  const [agreed, setAgreed] = useState(false);
  // Card or USSD for an immediate payment (D136).
  // 'account' = a one-time provider transfer account that confirms itself (D222); 'transfer' = the seller's own account (D148).
  const [payByChoice, setPayBy] = useState<PayBy>('card');
  // Shop settings (D222): order note, checkout address, terms tick.
  const [buyerNote, setBuyerNote] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  const [termsOk, setTermsOk] = useState(false);
  // Seller's own accounts (D148, several from D223); the buyer picks one when there's more than one.
  const transferList = useMemo(() => transferAccounts(workspaceId, businessName), [workspaceId, businessName, cart?.open]);
  const [transferIdx, setTransferIdx] = useState(0);
  const transfer = transferList[Math.min(transferIdx, transferList.length - 1)] ?? null;
  const [ussdOpen, setUssdOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  // Mobile money and EFT for Kenya, Ghana and South Africa (D355).
  const [momoOpen, setMomoOpen] = useState(false);
  const [eftOpen, setEftOpen] = useState(false);
  const local = localPayments();
  useEffect(() => {
    if (step !== 'review') {
      setUssdOpen(false);
      setAccountOpen(false);
      setMomoOpen(false);
      setEftOpen(false);
    }
  }, [step]);
  // Pop-up shop pickup (D183).
  const [sessionId, setSessionId] = useState('');
  const [stallChoice, setStallChoice] = useState(false);
  const atStall = !!popup && (popup.payment === 'stall' || popup.payment === 'both' && stallChoice);
  useEffect(() => {
    if (popup?.sessions.length === 1) setSessionId(popup.sessions[0].id);
    if (popup) setMethod('pickup');
  }, [popup?.sessions.length, popup?.sessions[0]?.id, !!popup]);

  const data = commerce.data;
  const open = !!cart?.open;
  // Seats are reserved for HOLD_MINUTES once checkout starts (D73a).
  const holder = useMemo(() => holderId(), []);
  const now = useNow(1000);
  const [holdNotice, setHoldNotice] = useState('');
  const [holding, setHolding] = useState(false);
  // One "Keep my seats" extension per checkout (example figure, D76).
  const [extended, setExtended] = useState(false);
  const holdUntil = holding ? holdExpiry(data, holder, now) : null;
  useEffect(() => {
    if (open) {
      setStep('cart');
      setTried(false);
      setExtended(false);
      setPayWith('now');
      setAgreed(false);
      setTermsOk(false);
    }
  }, [open]);
  useEffect(() => {
    // The hold ran out before payment: release and send the buyer back to the cart to re-check.
    if (holding && !holdUntil && step !== 'cart' && step !== 'paying') {
      setHolding(false);
      setStep('cart');
      setHoldNotice(holdWhat === 'seats' ? `Your seats were released after ${holdMins} minutes. Check they’re still available and continue.` : `Your items were released after ${holdMins} minutes so other buyers could have them. Check they’re still available and continue.`);
    }
  }, [holding, holdUntil, step]);

  const backorders = shopSettingsOf(data).orders.backorders;
  // Stock holds (D255): never needed while backorders are on — nothing can run out.
  const holdStock = shopSettingsOf(data).orders.holdStock && !backorders;
  const lines = useMemo(() => {
    const shown = (cart?.lines ?? []
    // A DealRoom sells only its own product; a pop-up only its chosen products.
    ).filter((l) => (!dealRoom || l.productId === dealRoom.productId) && (!popup || popup.productIds.includes(l.productId)));
    // Bulk prices (D202) go by how many of each product are in the cart, across its variants.
    const qtyByProduct = shown.reduce<Record<string, number>>((m, l) => ({ ...m, [l.productId]: (m[l.productId] ?? 0) + l.qty }), {});
    return shown.
    map((l) => {
      const product = data?.products.find((p) => p.id === l.productId);
      const variant = product?.variants.find((v) => v.id === l.variantId);
      const roomPrice = dealRoom && dealRoom.priceNgn !== null ? dealRoom.priceNgn : null;
      const basePrice = product && variant ? variantPrice(product, variant) : null;
      const price = product && variant ? roomPrice ?? (basePrice !== null ? bulkUnitPrice(product, basePrice, qtyByProduct[product.id] ?? l.qty) : null) : null;
      const bulk = roomPrice === null && basePrice !== null && price !== null && price < basePrice;
      const preLeft = product && isPreorder(product) ? preorderLeft(product) : null;
      const preIssue = preLeft !== null && (qtyByProduct[l.productId] ?? 0) > preLeft ? preLeft === 0 ? 'Pre-orders are full' : `Only ${preLeft} pre-order${preLeft === 1 ? '' : 's'} left` : '';
      const stallLeft = popup?.left[l.productId] ?? null;
      // Units a pop-up has set aside can't be sold elsewhere (D191); the pop-up's own hold never blocks it.
      const reserved = product?.kind === 'physical' && product.trackStock ? reservedForStalls(data, product.id, popup?.handle) : { qty: 0, labels: [] as string[] };
      const unreserved = product && variant && reserved.qty > 0 ? Math.min(variant.stock, Math.max(0, product.variants.reduce((s, v) => s + Math.max(0, v.stock), 0) - reserved.qty)) : null;
      const asideIssue = unreserved !== null && l.qty > unreserved ? unreserved === 0 ? `Set aside for ${reserved.labels[0]}` : `Only ${unreserved} available — the rest is set aside for ${reserved.labels[0]}` : '';
      const ticketIssue = product?.kind === 'ticket' ? ticketLineIssue(data, l, Date.now(), holder) : stallLeft !== null && l.qty > stallLeft ? stallLeft === 0 ? 'Sold out at the stall' : `Only ${stallLeft} left at the stall` : preIssue || asideIssue;
      // Units other buyers are holding in checkout count as taken; this buyer's own hold counts as theirs (D255).
      const free = variant ? product?.kind === 'physical' ? stockFree(data, variant, holder) : variant.stock : 0;
      const stockIssue = product && variant && product.kind === 'physical' && product.trackStock && !isPreorder(product) && !backorders && free < l.qty && free < variant.stock ? stockHeldMessage(product.name, free) : '';
      const ok = !!product && !!variant && price !== null && canSell(product, variant) && !ticketIssue && !stockIssue && (product.kind === 'digital' || !product.trackStock || isPreorder(product) || free >= l.qty || product.kind === 'physical' && backorders);
      const ev = product?.kind === 'ticket' ? findEvent(data, product.eventId) : undefined;
      const tt = ev?.ticketTypes.find((t) => t.id === l.variantId);
      const seatText = describeSeats(ev, l.seats);
      const backorder = ok && product?.kind === 'physical' && product.trackStock && !isPreorder(product) && !!variant && variant.stock < l.qty;
      return { ...l, product, variant, price, basePrice, bulk, ok, backorder, ticketIssue: ticketIssue || stockIssue, seatText, free, maxQty: tt ? tt.maxPerOrder : 20 };
    });
  }, [cart?.lines, data, dealRoom, holder, popup, backorders]);
  // What gets held when the buyer presses Checkout: seats always, stock-tracked items when the shop holds stock.
  const stockHoldLines = holdStock ? lines.filter((l) => l.ok && stockHoldable(l.product)) : [];
  const holdWhat: 'seats' | 'items' = lines.some((l) => l.ok && l.product?.kind === 'ticket') ? 'seats' : 'items';
  const holdMins = holdWhat === 'seats' ? HOLD_MINUTES : STOCK_HOLD_MINUTES;

  if (!cart || !data) return null;

  const subtotal = lines.reduce((s, l) => s + (l.ok && l.price !== null ? l.price * l.qty : 0), 0);
  // Gift cards (D202) are delivered as codes, so they never need delivery.
  const physical = lines.some((l) => l.product?.kind === 'physical' && !l.product.giftCard);
  const hasGiftItems = lines.some((l) => !!l.product?.giftCard);
  const ticketLines = lines.filter((l) => l.ok && l.product?.kind === 'ticket');
  const ticketsOnly = lines.length > 0 && lines.every((l) => l.product?.kind === 'ticket');
  const seatName = (eventId: string, seatId: string) => {
    const ev = findEvent(data, eventId);
    return ev ? findSeat(ev, seatId)?.label : undefined;
  };
  const f = data.fulfilment;
  const zone = f.zones.find((z) => z.id === method);
  const free = f.freeDeliveryOverNgn !== null && subtotal >= f.freeDeliveryOverNgn;
  const deliveryFee = method === 'pickup' || !zone ? 0 : free ? 0 : zone.feeNgn;
  const resolution = resolveDiscount(
    data,
    {
      lines: lines.filter((l) => l.ok && l.price !== null).map((l) => ({ productId: l.productId, collectionIds: l.product?.collectionIds ?? [], amountNgn: (l.price ?? 0) * l.qty })),
      subtotalNgn: subtotal,
      deliveryNgn: physical ? method ? deliveryFee : null : 0,
      phone: customer.phone
    },
    code
  );
  const roomQty = lines.filter((l) => l.ok).reduce((t, l) => t + l.qty, 0);
  const roomCap = dealRoom ? Math.min(dealRoom.perPersonLimit, dealRoom.remaining) : Infinity;
  const priorUnits = dealRoom ? unitsBoughtBy(data, dealRoom.handle, customer.phone, dealRoom.productId) : 0;
  const roomError = !dealRoom ?
  '' :
  !dealRoom.open ?
  'This room isn’t taking orders right now.' :
  roomQty > dealRoom.remaining ?
  `Only ${dealRoom.remaining} left in this room.` :
  priorUnits + roomQty > dealRoom.perPersonLimit ?
  `The limit is ${dealRoom.perPersonLimit} per person${priorUnits ? ` — you’ve already bought ${priorUnits}` : ''}.` :
  '';
  const discount = Math.min(resolution.applied?.amountNgn ?? 0, subtotal + (physical ? deliveryFee : 0));
  // Shop settings (D222): VAT, minimum order, closed shop, payment methods.
  const shop = shopSettingsOf(data);
  const closedMsg = shopClosedMessage(shop);
  const vat = vatFor(shop, subtotal - discount + (physical ? deliveryFee : 0));
  const vatAdded = vat?.addedNgn ?? 0;
  const minError = shop.checkout.minOrderNgn && subtotal > 0 && subtotal - discount < shop.checkout.minOrderNgn ? `The minimum order is ${formatNgn(shop.checkout.minOrderNgn)} — add ${formatNgn(shop.checkout.minOrderNgn - (subtotal - discount))} more.` : '';
  const returnsText = returnsSummary(shop.policy);
  const giftRes = resolveGiftCard(data, giftCode, subtotal - discount + (physical ? deliveryFee : 0) + vatAdded, hasGiftItems);
  const giftNgn = giftRes?.ok ? giftRes.amountNgn : 0;
  const total = subtotal - discount - giftNgn + (physical ? deliveryFee : 0) + vatAdded;
  const vatRow = vat ?
  <div className="flex justify-between gap-3">
      <dt style={{ color: theme.mutedText }}>{vat.inclusive ? `Includes VAT (${vatRateLabel(vat.ratePct)})` : `VAT (${vatRateLabel(vat.ratePct)})`}</dt>
      <dd className="shrink-0 tabular-nums" style={vat.inclusive ? { color: theme.mutedText } : undefined}>
        {formatNgn(vat.amountNgn)}
      </dd>
    </div> :
  null;
  const giftRow = giftNgn > 0 ?
  <div className="flex justify-between gap-3">
      <dt style={{ color: theme.mutedText }}>Gift card</dt>
      <dd className="shrink-0 font-semibold tabular-nums">−{formatNgn(giftNgn)}</dd>
    </div> :
  null;
  const shipsBy = lines.map((l) => l.ok && isPreorder(l.product) ? l.product.preorder.shipsBy : '').filter(Boolean).sort().pop();
  // Made-to-order items: deposit now, the rest before dispatch (D95).
  const balanceLater = dealRoom ?
  0 :
  cartBalanceNgn(
    data.products,
    lines.filter((l) => l.ok && l.price !== null).map((l) => ({ productId: l.productId, amountNgn: (l.price ?? 0) * l.qty })),
    total
  );
  const okProducts = lines.filter((l) => l.ok).map((l) => l.product);
  const podOption = podCheck(data, {
    total,
    zoneId: method && method !== 'pickup' && zone ? zone.id : null,
    zoneName: zone?.name,
    onlyPhysical: okProducts.length > 0 && okProducts.every((p) => p?.kind === 'physical'),
    balanceLater,
    dealRoom: !!dealRoom,
    phone: customer.phone,
    bundle: okProducts.some((p) => !!p?.bundle)
  });
  const instOption = instalmentCheck(data, { products: okProducts, total, balanceLater, dealRoom: !!dealRoom });
  // Pop-ups take payment now or at the stall only — no pay on delivery or instalments.
  const payWith: PayWith = popup ? 'now' : payWithChoice === 'pod' && podOption.ok ? 'pod' : payWithChoice === 'instalments' && instOption.ok ? 'instalments' : 'now';
  const firstPart = payWith === 'instalments' && instOption.ok ? schedule(total, instOption.plan)[0].amountNgn : 0;
  const payNow = atStall || payWith === 'pod' ? 0 : payWith === 'instalments' ? firstPart : total - balanceLater;
  const chosenSession = popup?.sessions.find((s) => s.id === sessionId);
  const leadDays = lines.reduce((m, l) => l.ok && isMadeToOrder(l.product) ? Math.max(m, l.product.madeToOrder.leadDays) : m, 0);
  const discountRow =
  resolution.applied && (discount > 0 || resolution.applied.discount.value.type === 'free_delivery') ?
  <div className="flex justify-between gap-3">
        <dt style={{ color: theme.mutedText }}>{discountLineLabel(resolution.applied.discount)}</dt>
        <dd className="shrink-0 font-semibold tabular-nums">{discount > 0 ? `−${formatNgn(discount)}` : 'At delivery step'}</dd>
      </div> :
  null;
  const choosingProduct = cart.choosing ? data.products.find((p) => p.id === cart.choosing) : undefined;
  const steps: Step[] = physical ? ['cart', 'details', 'delivery', 'review'] : ['cart', 'details', 'review'];
  const stepNo = Math.max(1, steps.indexOf(step) + 1);

  // Email (D222): digital items, tickets and courses always need one; physical orders follow the seller's setting.
  const emailAsk = !physical ? 'required' : shop.checkout.email;
  // Address on orders that aren't delivered (D222); delivery asks for its own address.
  const addressAsk = !physical ? shop.checkout.address : 'off';
  const detailErrors = {
    name: !customer.name.trim() ? 'Enter your name' : '',
    phone: !isValidPhone(customer.phone) ? 'Enter a phone number, e.g. +234 803 123 4567' : '',
    email:
    emailAsk === 'off' ?
    '' :
    (emailAsk === 'required' || customer.email.trim()) && !isValidEmail(customer.email) ?
    !physical ?
    ticketLines.length ?
    'Enter an email for your receipt and tickets' :
    'Enter an email for your receipt and download link' :
    'Enter an email for your receipt' :
    '',
    address: addressAsk === 'required' && !buyerAddress.trim() ? 'Enter your address' : ''
  };
  const pickupAddressAsk = physical && method === 'pickup' && !popup ? shop.checkout.address : 'off';
  const deliveryError = popup ?
  !chosenSession ?
  'Choose when you’ll collect' :
  '' :
  !method ?
  'Choose how you’ll get your order' :
  method !== 'pickup' && !address.trim() ?
  'Enter the delivery address' :
  method === 'pickup' && shop.checkout.address === 'required' && !buyerAddress.trim() ?
  'Enter your address' :
  '';

  const close = () => {
    // Leaving checkout gives held items and seats straight back to other buyers (D255).
    if (holding && step !== 'paying') {
      commerce.apply((d) => releaseHolds(d, holder));
      setHolding(false);
    }
    cart.setOpen(false);
    cart.doneChoosing();
  };

  const pay = (override?: TestPaymentOutcome, via?: 'transfer' | 'account') => {
    setStep('paying');
    // Nothing to charge: the test-card choice doesn't apply. USSD passes its own result (D136).
    const outcome = payNow > 0 ? override ?? chosenOutcome : 'success';
    const fulfilment: OrderFulfilment = !physical ?
    { method: ticketsOnly ? 'tickets' : 'digital' } :
    popup ?
    { method: 'pickup', address: [popup.venue, popup.address].filter((s) => s.trim()).join(', ') } :
    method === 'pickup' ?
    { method: 'pickup', address: f.pickupAddress } :
    { method: 'delivery', zoneId: zone?.id, zoneName: zone?.name, address: address.trim(), eta: zone?.eta };
    window.setTimeout(
      () => {
        let result: ReturnType<typeof placeOrder> | null = null;
        const ok = commerce.apply((d) => {
          result = placeOrder(d, {
            lines: lines.filter((l) => l.ok).map(({ productId, variantId, qty, seats }) => ({ productId, variantId, qty, seats })),
            customer: { name: customer.name.trim(), phone: customer.phone.trim(), email: customer.email.trim() },
            fulfilment,
            deliveryNgn: physical ? deliveryFee : 0,
            outcome,
            plan: ownerPlan,
            discountCode: code,
            sourceHandle: handle,
            dealRoom: dealRoom ? { productId: dealRoom.productId, priceNgn: dealRoom.priceNgn, held: dealRoom.held } : undefined,
            referredBy: dealRoom ? params.get('ref') ?? undefined : undefined,
            guestNames,
            holder,
            payWith,
            popup: popup && chosenSession ? { sessionId: chosenSession.id, sessionLabel: chosenSession.label, payAtStall: atStall } : undefined,
            stallLeft: popup?.left,
            giftCardCode: giftRes?.ok ? giftRes.card.code : undefined,
            buyerNote: shop.checkout.orderNote ? buyerNote : undefined,
            buyerAddress: addressAsk !== 'off' || pickupAddressAsk !== 'off' ? buyerAddress : undefined,
            transferAccount: via === 'account' ? transferAccountFor(holder) : undefined
          });
          if (!result.ok) return d;
          // Creator Collaboration (D103): remember which partner's link the buyer came from.
          const partner = params.get('partner')?.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 20);
          const placed = result.order;
          const byTransfer = via === 'transfer' && transfer && placed.paymentStatus === 'pending';
          const stamped =
          partner || byTransfer ?
          { ...result.data, orders: result.data.orders.map((o) => o.id === placed.id ? byTransfer && transfer ? stampTransfer({ ...o, partnerCode: partner || o.partnerCode }, transfer) : { ...o, partnerCode: partner } : o) } :
          result.data;
          return releaseHolds(stamped, holder);
        });
        const r = result as ReturnType<typeof placeOrder> | null;
        if (!ok || !r) {
          setFailure('Something went wrong saving your order. Nothing was charged.');
          setStep('failed');
          return;
        }
        if (!r.ok) {
          setFailure(r.message);
          setStep('failed');
          return;
        }
        if (r.order.paymentStatus === 'paid') {
          track('order_paid', { valueNgn: r.order.subtotalNgn - r.order.discountNgn + r.order.deliveryNgn - (r.order.balance?.dueNgn ?? 0) - (r.order.instalments ? r.order.instalments.parts.filter((p) => p.status !== 'paid').reduce((s, p) => s + p.amountNgn, 0) : 0), label: orderRef(r.order) });
          tagPurchase(r.order.subtotalNgn - r.order.discountNgn + r.order.deliveryNgn, r.order.id);
          const ticketValue = r.order.items.filter((i) => i.kind === 'ticket').reduce((s, i) => s + i.unitPriceNgn * i.qty, 0);
          if (r.order.items.some((i) => i.kind === 'ticket')) track('ticket_paid', { valueNgn: ticketValue, label: orderRef(r.order) });
        }
        setHolding(false);
        cart.clear();
        cart.setOpen(false);
        navigate(`/p/${handle}/order/${r.order.id}`);
      },
      outcome === 'timeout' ? 2600 : 1200
    );
  };

  const back = () => setStep(steps[Math.max(0, steps.indexOf(step) - 1)]);
  const muted = { color: theme.mutedText };

  const body = () => {
    if (choosingProduct) {
      return (
        <div className="flex flex-col gap-4">
          <CheckoutHeading theme={theme} sub={`Choose ${choosingProduct.options[0]?.name.toLowerCase() ?? 'an option'}`}>
            {choosingProduct.name}
          </CheckoutHeading>
          <ul className="flex flex-col gap-2" role="list">
            {choosingProduct.variants.map((v) => {
              const ticketIssue = choosingProduct.kind === 'ticket' ? ticketLineIssue(data, { productId: choosingProduct.id, variantId: v.id, qty: 1 }, Date.now(), holder) : '';
              const available = canSell(choosingProduct, v) && !ticketIssue;
              const price = (dealRoom && dealRoom.productId === choosingProduct.id ? dealRoom.priceNgn : null) ?? variantPrice(choosingProduct, v);
              return (
                <li key={v.id}>
                  <button
                    type="button"
                    disabled={!available || price === null}
                    onClick={() => cart.add(choosingProduct.id, v.id)}
                    className="flex h-14 w-full items-center justify-between gap-3 px-4 text-left text-[15px] font-medium disabled:cursor-not-allowed disabled:opacity-50"
                    style={cardStyle(theme)}>
                    
                    <span>{variantLabel(v)}</span>
                    <span className="text-[14px] tabular-nums" style={muted}>
                      {!available ? ticketIssue || 'Sold out' : price === null ? 'Price on request' : price === 0 && choosingProduct.kind === 'ticket' ? 'Free' : formatNgn(price)}
                      {available && choosingProduct.trackStock && v.stock <= choosingProduct.lowStockAt ? ` · ${v.stock} left` : ''}
                    </span>
                  </button>
                </li>);

            })}
          </ul>
          <SheetActions theme={theme}>
            <SecondaryButton theme={theme} onClick={cart.doneChoosing}>
              {cart.lines.length ? 'Back to cart' : 'Not now'}
            </SecondaryButton>
          </SheetActions>
        </div>);

    }

    if (step === 'paying') {
      return (
        <div className="flex flex-col items-center gap-3 py-12 text-center" role="status" aria-live="polite">
          <Loader2Icon size={28} className="animate-spin" aria-hidden />
          <p className="text-[16px] font-medium">{payWith === 'pod' ? 'Placing your order…' : outcome === 'timeout' ? 'Waiting for the payment provider…' : 'Processing test payment…'}</p>
          <p className="text-[13px]" style={muted}>
            Don’t close this window.
          </p>
        </div>);

    }

    if (step === 'failed') {
      return (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-center gap-2 py-4 text-center" role="alert">
            <XCircleIcon size={30} aria-hidden />
            <p className="text-[18px] font-medium">{payWith === 'pod' ? 'We couldn’t place your order' : outcome === 'cancelled' ? 'Payment cancelled' : 'Payment didn’t go through'}</p>
            <p className="max-w-xs text-[13.5px]" style={muted}>
              {failure}
            </p>
          </div>
          <SheetActions theme={theme}>
            <PrimaryButton theme={theme} onClick={() => setStep('review')}>
              Try again
            </PrimaryButton>
            <SecondaryButton theme={theme} onClick={() => setStep('cart')}>
              Back to cart
            </SecondaryButton>
          </SheetActions>
        </div>);

    }

    if (step === 'cart') {
      return (
        <div className="flex flex-col gap-4">
          <CheckoutHeading theme={theme}>Your cart</CheckoutHeading>
          {lines.length === 0 ?
          <div className="flex flex-col items-center gap-2 py-8 text-center">
              <ShoppingBagIcon size={26} aria-hidden style={muted} />
              <p className="text-[15px] font-medium">Your cart is empty</p>
              <p className="text-[13px]" style={muted}>
                Add something from the page to get started.
              </p>
            </div> :

          <ul className="flex flex-col gap-2">
              {lines.map((l) =>
            <li key={l.variantId} className="flex items-center gap-3 p-3" style={cardStyle(theme)}>
                  {l.product?.images[0] ?
              <MediaImage src={l.product.images[0].url} alt="" className="h-14 w-12 shrink-0 rounded-md object-cover" /> :

              <span aria-hidden className="flex h-14 w-12 shrink-0 items-center justify-center rounded-md" style={{ background: mix(theme.text, 6) }}>
                      <ShoppingBagIcon size={16} />
                    </span>
              }
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14.5px] font-semibold">{l.product?.name ?? 'Unavailable item'}</p>
                    <p className="text-[12.5px]" style={muted}>
                      {[l.variant && Object.keys(l.variant.options).length ? variantLabel(l.variant) : null, l.price !== null ? formatNgn(l.price) : null].filter(Boolean).join(' · ')}
                      {l.bulk && l.basePrice !== null && <s className="ml-1.5">{formatNgn(l.basePrice)}</s>}
                    </p>
                    {(l.bulk || l.backorder || l.ok && isPreorder(l.product)) &&
                <p className="text-[12px] font-semibold" style={{ color: theme.text }}>
                        {[l.bulk ? 'Bulk price' : '', l.backorder ? 'Ships later — back in stock soon' : '', l.ok && isPreorder(l.product) ? `Pre-order · expected by ${shipsByLabel(l.product.preorder.shipsBy)}` : ''].filter(Boolean).join(' · ')}
                      </p>
                }
                    {l.seatText &&
                <p className="text-[12.5px] font-medium" style={{ color: theme.text }}>
                        {l.seatText}
                      </p>
                }
                    {!l.ok &&
                <p className="mt-0.5 flex items-center gap-1 text-[12px] font-semibold">
                        <AlertTriangleIcon size={12} aria-hidden /> {l.ticketIssue || (l.variant && l.product?.trackStock && l.free > 0 ? `Only ${l.free} left` : 'No longer available')}
                      </p>
                }
                  </div>
                  {l.product?.kind === 'physical' || l.product?.kind === 'ticket' ?
              <div className="flex items-center" role="group" aria-label={`Quantity of ${l.product.name}`}>
                      <button type="button" aria-label="One fewer" onClick={() => cart.setQty(l.variantId, l.qty - 1)} className="flex h-9 w-9 items-center justify-center" style={{ borderRadius: buttonRadius(theme), background: mix(theme.text, 6) }}>
                        {l.qty === 1 ? <Trash2Icon size={14} aria-hidden /> : <MinusIcon size={14} aria-hidden />}
                      </button>
                      <span className="w-8 text-center text-[14px] font-semibold tabular-nums" aria-live="polite">
                        {l.qty}
                      </span>
                      <button
                  type="button"
                  aria-label="One more"
                  disabled={!!l.seats?.length || !!l.product.trackStock && !isPreorder(l.product) && !(backorders && l.product.kind === 'physical') && !!l.variant && l.qty >= (l.product.kind === 'physical' ? l.free : l.variant.stock) || roomQty >= roomCap || l.qty >= l.maxQty}
                  title={l.seats?.length ? 'Add seats from the seat map' : undefined}
                  onClick={() => cart.setQty(l.variantId, l.qty + 1)}
                  className="flex h-9 w-9 items-center justify-center disabled:opacity-40"
                  style={{ borderRadius: buttonRadius(theme), background: mix(theme.text, 6) }}>
                  
                        <PlusIcon size={14} aria-hidden />
                      </button>
                    </div> :

              <button type="button" aria-label={`Remove ${l.product?.name ?? 'item'}`} onClick={() => cart.remove(l.variantId)} className="flex h-9 w-9 items-center justify-center" style={{ borderRadius: buttonRadius(theme), background: mix(theme.text, 6) }}>
                      <Trash2Icon size={14} aria-hidden />
                    </button>
              }
                </li>
            )}
            </ul>
          }
          {lines.length > 0 &&
          <>
              <dl className="flex flex-col gap-1.5 text-[15px]">
                <div className="flex items-baseline justify-between">
                  <dt style={muted}>{tr('Subtotal')}</dt>
                  <dd className="font-semibold tabular-nums">{formatNgn(subtotal)}</dd>
                </div>
                {discountRow}
                {vat && !vat.inclusive && vatRow}
                {giftRow}
              </dl>
              {closedMsg &&
            <p className="rounded-md px-3 py-2.5 text-[13.5px] font-semibold leading-snug" style={{ background: mix(theme.text, 6) }} role="alert">
                  {closedMsg}
                </p>
            }
              {!closedMsg && minError &&
            <p className="rounded-md px-3 py-2.5 text-[13px] font-semibold leading-snug" style={{ background: mix(theme.text, 6) }} role="status">
                  {minError}
                </p>
            }
              <DiscountCodeField theme={theme} code={code} onApply={setCode} resolution={resolution} />
              <GiftCardField theme={theme} code={giftCode} onApply={setGiftCode} resolution={giftRes} />
              {lines.some((l) => !l.ok) &&
            <p className="text-[12.5px]" style={muted}>
                  {tr('Unavailable items won’t be ordered.')}
                </p>
            }
              {holdNotice &&
            <p className="rounded-md px-3 py-2.5 text-[13px] font-semibold leading-snug" style={{ background: mix(theme.text, 6) }} role="alert">
                  {holdNotice}
                </p>
            }
              {(ticketLines.length > 0 || stockHoldLines.length > 0) && !holdNotice &&
            <p className="text-[12.5px]" style={muted}>
                  {holdWhat === 'seats' ?
              tr('We’ll hold your seats for {n} minutes while you check out.', { n: HOLD_MINUTES }) :
              tr('We’ll keep these items for you for {n} minutes while you check out.', { n: STOCK_HOLD_MINUTES })}
                </p>
            }
              <TestModeNote theme={theme} />
              <SheetActions theme={theme}>
              <PrimaryButton
                theme={theme}
                disabled={!lines.some((l) => l.ok) || !!closedMsg || !!minError}
                onClick={() => {
                  setHoldNotice('');
                  if (ticketLines.length || stockHoldLines.length) {
                    let issue = '';
                    let until: string | null = null;
                    commerce.apply((d) => {
                      const r = placeHolds(
                        d,
                        holder,
                        [...ticketLines, ...stockHoldLines].map(({ productId, variantId, qty, seats }) => ({ productId, variantId, qty, seats })),
                        Date.now(),
                        holdStock
                      );
                      issue = r.issue;
                      until = r.expiresAt;
                      return r.data;
                    });
                    if (issue) {
                      setHoldNotice(issue);
                      return;
                    }
                    setHolding(!!until);
                    if (ticketLines.length) track('ticket_checkout');
                  }
                  track('checkout_start');
                  setStep('details');
                }}>
                
                Checkout
              </PrimaryButton>
              </SheetActions>
            </>
          }
          {lines.length === 0 && <TestModeNote theme={theme} />}
        </div>);

    }

    if (step === 'details') {
      const showErr = (k: keyof typeof detailErrors) => tried ? detailErrors[k] || undefined : undefined;
      return (
        <form
          className="flex flex-col gap-4"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            setTried(true);
            if (Object.values(detailErrors).some(Boolean)) return;
            setTried(false);
            setStep(physical ? 'delivery' : 'review');
          }}>
          
          <CheckoutHeading theme={theme} sub="So the seller can reach you about your order.">
            Your details
          </CheckoutHeading>
          <ThemedField theme={theme} label="Full name" autoComplete="name" value={customer.name} error={showErr('name')} onChange={(name) => setCustomer((c) => ({ ...c, name }))} />
          <ThemedField theme={theme} label="Phone (WhatsApp preferred)" type="tel" inputMode="tel" autoComplete="tel" placeholder={dialPrefix()} value={customer.phone} error={showErr('phone')} onChange={(phone) => setCustomer((c) => ({ ...c, phone }))} />
          {emailAsk !== 'off' && <ThemedField theme={theme} label="Email" type="email" inputMode="email" autoComplete="email" optional={emailAsk === 'optional'} value={customer.email} error={showErr('email')} onChange={(email) => setCustomer((c) => ({ ...c, email }))} />}
          {addressAsk !== 'off' && <ThemedField theme={theme} label="Address" autoComplete="street-address" optional={addressAsk === 'optional'} value={buyerAddress} error={showErr('address')} onChange={setBuyerAddress} />}
          {ticketLines.some((l) => l.qty > 1) &&
          <fieldset className="flex flex-col gap-3 pt-1">
              <legend className="mb-1 text-[14px] font-semibold">
                {tr('Names on tickets')} <span className="font-normal" style={muted}>· {tr('optional')}</span>
              </legend>
              <p className="-mt-1 text-[12.5px] leading-snug" style={muted}>
                {tr('Each ticket gets its own QR code. Leave a name blank to use yours.')}
              </p>
              {ticketLines.flatMap((l) =>
            Array.from({ length: l.qty }, (_, n) =>
            <ThemedField
              key={`${l.variantId}-${n}`}
              theme={theme}
              label={`${l.variant ? variantLabel(l.variant) : 'Ticket'} · ${l.seats?.[n] && l.product?.eventId ? seatName(l.product.eventId, l.seats[n]) ?? `seat ${n + 1}` : `seat ${n + 1}`}`}
              autoComplete="off"
              placeholder={customer.name || 'Your name'}
              value={guestNames[l.variantId]?.[n] ?? ''}
              onChange={(v) =>
              setGuestNames((g) => {
                const list = [...(g[l.variantId] ?? [])];
                list[n] = v;
                return { ...g, [l.variantId]: list };
              })
              } />

            )
            )}
            </fieldset>
          }
          <p className="text-[12px] leading-snug" style={muted}>
            {tr('Your details go to the seller to fulfil this order. See their page for how they handle personal data.')}
          </p>
          <SheetActions theme={theme}>
            <PrimaryButton theme={theme} type="submit">
              Continue
            </PrimaryButton>
          </SheetActions>
        </form>);

    }

    if (step === 'delivery' && popup) {
      return (
        <div className="flex flex-col gap-4">
          <CheckoutHeading theme={theme} sub={[popup.venue, popup.address].filter((s) => s.trim()).join(' · ')}>
            {tr('When will you collect?')}
          </CheckoutHeading>
          <p className="text-[13px] leading-snug" style={muted}>
            {tr('Pickup only — collect at the stall during the time you choose. Bring your order number.')}
          </p>
          {popup.sessions.length === 0 ?
          <p className="rounded-md p-3 text-[14px]" style={cardStyle(theme)} role="alert">
              {tr('This pop-up has no more sessions, so it isn’t taking orders.')}
            </p> :

          <div role="radiogroup" aria-label={tr('Pickup times')} className="flex flex-col gap-2">
              {popup.sessions.map((s) => {
              const active = sessionId === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setSessionId(s.id)}
                  className="flex items-center justify-between gap-3 p-4 text-left text-[15px] font-semibold"
                  style={{ ...cardStyle(theme), border: `1.5px solid ${active ? theme.text : mix(theme.text, 12)}` }}>
                  
                    {s.when}
                    <span className="shrink-0 text-[14px] font-semibold tabular-nums">{tr('Free')}</span>
                  </button>);

            })}
            </div>
          }
          {popup.payment === 'both' &&
          <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 text-[14px] font-semibold">{tr('When do you want to pay?')}</legend>
              {(
            [
            [false, tr('Pay now'), tr('Quicker at the stall — just collect.')],
            [true, tr('Pay at the stall'), tr('Pay when you collect. Your items are kept for you during your session.')]] as
            const).
            map(([v, label, hint]) =>
            <label key={String(v)} className="flex cursor-pointer items-start gap-3 p-3" style={{ ...cardStyle(theme), border: `1.5px solid ${stallChoice === v ? theme.text : mix(theme.text, 12)}` }}>
                  <input type="radio" name="pay-when" checked={stallChoice === v} onChange={() => setStallChoice(v)} className="mt-1" style={{ accentColor: theme.text }} />
                  <span>
                    <span className="block text-[14px] font-semibold">{label}</span>
                    <span className="block text-[12px]" style={muted}>
                      {hint}
                    </span>
                  </span>
                </label>
            )}
            </fieldset>
          }
          {popup.payment === 'stall' &&
          <p className="rounded-md px-3 py-2.5 text-[13px] leading-snug" style={{ background: mix(theme.text, 6) }} role="note">
              {tr('You pay at the stall when you collect. Nothing is charged now.')}
            </p>
          }
          {tried && deliveryError &&
          <p className="text-[12.5px] font-medium" role="alert">
              {tr(deliveryError)}
            </p>
          }
          <SheetActions theme={theme}>
            <PrimaryButton
              theme={theme}
              disabled={popup.sessions.length === 0}
              onClick={() => {
                setTried(true);
                if (deliveryError) return;
                setTried(false);
                setStep('review');
              }}>
              
              Continue
            </PrimaryButton>
          </SheetActions>
        </div>);

    }

    if (step === 'delivery') {
      const options = [
      ...(f.pickupEnabled ? [{ id: 'pickup', title: tr('Pickup'), detail: [f.pickupAddress, hoursSummary(shop.status.hours) || f.pickupHours].filter(Boolean).join(' · '), fee: 0 }] : []),
      ...(f.deliveryEnabled ? f.zones.map((z) => ({ id: z.id, title: `${tr('Delivery')} · ${z.name}`, detail: z.eta ? `${tr('Usually')} ${z.eta}` : '', fee: free ? 0 : z.feeNgn })) : [])];

      return (
        <div className="flex flex-col gap-4">
          <CheckoutHeading theme={theme} sub={f.freeDeliveryOverNgn !== null ? free ? tr('You qualify for free delivery.') : tr('Free delivery over {amount}.', { amount: formatNgn(f.freeDeliveryOverNgn) }) : undefined}>
            How do you want it?
          </CheckoutHeading>
          {options.length === 0 ?
          <p className="rounded-md p-3 text-[14px]" style={cardStyle(theme)}>
              {tr('This seller hasn’t set up pickup or delivery yet. Please message them before ordering.')}
            </p> :

          <div role="radiogroup" aria-label="Delivery options" className="flex flex-col gap-2">
              {options.map((o) => {
              const active = method === o.id;
              return (
                <button
                  key={o.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setMethod(o.id)}
                  className="flex items-start justify-between gap-3 p-4 text-left"
                  style={{ ...cardStyle(theme), border: `1.5px solid ${active ? theme.text : mix(theme.text, 12)}` }}>
                  
                    <span>
                      <span className="block text-[15px] font-semibold">{o.title}</span>
                      {o.detail &&
                    <span className="block text-[12.5px]" style={muted}>
                          {o.detail}
                        </span>
                    }
                    </span>
                    <span className="shrink-0 text-[14px] font-semibold tabular-nums">{o.fee === 0 ? tr('Free') : formatNgn(o.fee)}</span>
                  </button>);

            })}
            </div>
          }
          {method && method !== 'pickup' && <ThemedField theme={theme} label="Delivery address" autoComplete="street-address" value={address} error={tried && !address.trim() ? 'Enter the delivery address' : undefined} onChange={setAddress} />}
          {pickupAddressAsk !== 'off' &&
          <ThemedField theme={theme} label="Your address" autoComplete="street-address" optional={pickupAddressAsk === 'optional'} value={buyerAddress} error={tried && pickupAddressAsk === 'required' && !buyerAddress.trim() ? 'Enter your address' : undefined} onChange={setBuyerAddress} />
          }
          {tried && !method &&
          <p className="text-[12.5px] font-medium" role="alert">
              {tr('Choose how you’ll get your order.')}
            </p>
          }
          <SheetActions theme={theme}>
          <PrimaryButton
              theme={theme}
              disabled={options.length === 0}
              onClick={() => {
                setTried(true);
                if (deliveryError) return;
                setTried(false);
                setStep('review');
              }}>
              
            Continue
          </PrimaryButton>
          </SheetActions>
        </div>);

    }

    // review
    const okLines = lines.filter((l) => l.ok);
    if (ussdOpen)
    return (
      <div className="flex flex-1 flex-col gap-4">
          <UssdPay
          theme={theme}
          amount={payNow}
          onBack={() => setUssdOpen(false)}
          onPaid={(o) => {
            setUssdOpen(false);
            pay(o);
          }} />
        
        </div>);

    if (accountOpen || eftOpen)
    return (
      <div className="flex flex-1 flex-col gap-4">
          <TransferAccountPay
          theme={theme}
          amount={payNow}
          account={transferAccountFor(holder)}
          onBack={() => (setAccountOpen(false), setEftOpen(false))}
          onPaid={() => {
            setAccountOpen(false);
            setEftOpen(false);
            pay('success', 'account');
          }} />
        
        </div>);

    if (momoOpen && local.mobileMoney)
    return (
      <div className="flex flex-1 flex-col gap-4">
          <MobileMoneyPay
          theme={theme}
          amount={payNow}
          wallet={local.mobileMoney}
          payee={businessName || handle}
          phone={customer.phone}
          onBack={() => setMomoOpen(false)}
          onPaid={() => {
            setMomoOpen(false);
            pay('success');
          }} />
        
        </div>);

    // Ways to pay follow Commerce settings → Payment methods (D222).
    // Instalments need a card, since later parts are charged to it.
    const cardAvailable = shop.methods.card || payWith === 'instalments';
    // USSD only for a single naira payment now — not for later instalment charges (D136).
    const ussdAvailable = USSD_AVAILABLE && shop.methods.ussd && isNaira() && payNow > 0 && payWith === 'now';
    // One-time transfer account from the provider: confirms itself (D222).
    const accountAvailable = shop.methods.transfer && isNaira() && payNow > 0 && payWith === 'now';
    // Bank transfer to the seller (D148): naira, a payment now, not group buys (their refunds need the provider).
    const transferAvailable = shop.methods.transfer && shop.methods.transferOwn && !!transfer && isNaira() && payNow > 0 && payWith === 'now' && !dealRoom;
    // Mobile money first where people use it most (D355): M-Pesa in Kenya, MTN MoMo in Ghana.
    const momoAvailable = !!local.mobileMoney && shop.methods.mobileMoney !== false && payNow > 0 && payWith === 'now';
    // EFT in South Africa: a one-time account that confirms itself, like the naira transfer account.
    const eftAvailable = local.eft && shop.methods.eft !== false && payNow > 0 && payWith === 'now';
    const payOptions = [
    ...(momoAvailable && local.mobileMoney ? [['momo', SmartphoneIcon, local.mobileMoney.name] as const] : []),
    ...(cardAvailable ? [['card', CreditCardIcon, tr('Card')] as const] : []),
    ...(eftAvailable ? [['eft', LandmarkIcon, tr('EFT bank transfer')] as const] : []),
    ...(accountAvailable ? [['account', LandmarkIcon, transferAvailable ? tr('Transfer account') : tr('Bank transfer')] as const] : []),
    ...(transferAvailable ? [['transfer', LandmarkIcon, tr('Seller’s account')] as const] : []),
    ...(ussdAvailable ? [['ussd', HashIcon, tr('USSD code')] as const] : [])];

    const payBy: PayBy = payOptions.some(([v]) => v === payByChoice) ? payByChoice : payOptions[0]?.[0] ?? 'card';
    const byUssd = payBy === 'ussd';
    const byTransfer = payBy === 'transfer';
    const byAccount = payBy === 'account';
    const byMomo = payBy === 'momo';
    const byEft = payBy === 'eft';
    const noWayToPay = payNow > 0 && !atStall && payOptions.length === 0;
    return (
      <div className="flex flex-col gap-4">
        <CheckoutHeading theme={theme}>Review and pay</CheckoutHeading>
        <ul className="flex flex-col gap-1.5 text-[14px]">
          {okLines.map((l) =>
          <li key={l.variantId} className="flex justify-between gap-3">
              <span>
                {l.qty} × {l.product?.name}
                {l.variant && Object.keys(l.variant.options).length ? ` (${variantLabel(l.variant)})` : ''}
              </span>
              <span className="tabular-nums">{formatNgn((l.price ?? 0) * l.qty)}</span>
            </li>
          )}
        </ul>
        <dl className="flex flex-col gap-1.5 border-t pt-3 text-[14px]" style={{ borderColor: mix(theme.text, 12) }}>
          <div className="flex justify-between">
            <dt style={muted}>{tr('Subtotal')}</dt>
            <dd className="tabular-nums">{formatNgn(subtotal)}</dd>
          </div>
          {discountRow}
          {physical &&
          <div className="flex justify-between gap-3">
              <dt style={muted}>{popup ? `${tr('Pickup')} · ${chosenSession?.when ?? ''}` : method === 'pickup' ? tr('Pickup') : `${tr('Delivery')} · ${zone?.name ?? ''}`}</dt>
              <dd className="tabular-nums">{deliveryFee === 0 ? tr('Free') : formatNgn(deliveryFee)}</dd>
            </div>
          }
          {vat && !vat.inclusive && vatRow}
          {giftRow}
          <div className={balanceLater ? 'flex justify-between pt-1' : 'flex justify-between pt-1 text-[16px] font-semibold'}>
            <dt>{tr('Total')}</dt>
            <dd className="tabular-nums">{formatNgn(total)}</dd>
          </div>
          {vat?.inclusive && vatRow}
          {balanceLater > 0 &&
          <>
              <div className="flex justify-between pt-1 text-[16px] font-semibold">
                <dt>{tr('Deposit to pay now')}</dt>
                <dd className="tabular-nums">{formatNgn(payNow)}</dd>
              </div>
              <div className="flex justify-between">
                <dt style={muted}>{tr('Balance before dispatch')}</dt>
                <dd className="tabular-nums">{formatNgn(balanceLater)}</dd>
              </div>
              <p className="rounded-md px-3 py-2.5 text-[13px] leading-snug" style={{ background: mix(theme.text, 6) }} role="note">
                {shipsBy && !leadDays ? `Pre-order — expected by ${shipsByLabel(shipsBy)}` : `Made to order${leadDays ? ` — usually ready in about ${leadDays} day${leadDays === 1 ? '' : 's'}` : ''}`}. You’ll get a link to pay the balance from your order page; nothing is sent until it’s paid.
              </p>
            </>
          }
          <p className="text-[12px]" style={muted}>
            {tr('No extra fees are added at payment. Processing fees are paid by the seller.')}
          </p>
        </dl>
        {shipsBy && !balanceLater &&
        <p className="rounded-md px-3 py-2.5 text-[13px] leading-snug" style={{ background: mix(theme.text, 6) }} role="note">
            Includes a pre-order — expected by {shipsByLabel(shipsBy)}. It’s sent as soon as it’s in.
          </p>
        }
        {!dealRoom && <LoyaltyRedeem theme={theme} workspaceId={workspaceId} data={data} apply={commerce.apply} phone={customer.phone} code={code} onApply={setCode} />}
        <DiscountCodeField theme={theme} code={code} onApply={setCode} resolution={resolution} />
        <GiftCardField theme={theme} code={giftCode} onApply={setGiftCode} resolution={giftRes} />
        {atStall &&
        <p className="rounded-md px-3 py-2.5 text-[13px] font-medium leading-snug" style={{ background: mix(theme.text, 6) }} role="note">
            {tr('Pay {amount} at the stall when you collect. Nothing is charged now.', { amount: formatNgn(total) })}
          </p>
        }
        {!popup && <PayWithChooser
          theme={theme}
          value={payWith}
          onChange={(v) => {
            setPayWith(v);
            if (v === 'instalments' && (chosenOutcome === 'pending' || chosenOutcome === 'timeout')) setOutcome('success');
          }}
          total={total}
          pod={podOption}
          podAccept={payOptionsOf(data).pod.accept}
          instalments={instOption}
          agreed={agreed}
          onAgree={setAgreed} />
        }
        {payOptions.length > 1 && !atStall &&
        <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-[14px] font-semibold">{tr('Pay with')}</legend>
            <div className={payOptions.length === 3 ? 'grid grid-cols-1 gap-2 min-[400px]:grid-cols-3' : 'grid grid-cols-1 gap-2 min-[360px]:grid-cols-2'}>
              {payOptions.map(([v, Icon, label]) =>
            <label key={v} className="flex cursor-pointer items-center gap-2.5 p-3 text-[14px] font-semibold focus-within:outline focus-within:outline-2 focus-within:outline-offset-2" style={{ ...cardStyle(theme), border: `1.5px solid ${payBy === v ? theme.text : mix(theme.text, 12)}` }}>
                  <input type="radio" name="pay-by" className="sr-only" checked={payBy === v} onChange={() => setPayBy(v)} />
                  <Icon size={17} aria-hidden />
                  {label}
                </label>
            )}
            </div>
            {byUssd &&
          <p className="text-[12.5px] leading-snug" style={muted}>
                {tr('No card or data needed — dial a code from your bank phone and approve with your PIN.')}
              </p>
          }
            {(byAccount || byEft) &&
          <p className="text-[12.5px] leading-snug" style={muted}>
                {tr('You’ll get a one-time account number to transfer to. Your order confirms automatically when the money lands.')}
              </p>
          }
            {byMomo && local.mobileMoney &&
          <p className="text-[12.5px] leading-snug" style={muted}>
                {tr('A payment request pops up on your phone. Approve it and {hint}.', { hint: tr(local.mobileMoney.approveHint) })}
              </p>
          }
            {byTransfer && transfer &&
          <div className="flex flex-col gap-2 p-3 text-[14px]" style={{ ...cardStyle(theme), background: mix(theme.text, 4) }}>
                <p className="font-semibold">{tr('Transfer {amount} to:', { amount: formatNgn(payNow) })}</p>
                {transferList.length > 1 &&
            <div role="radiogroup" aria-label={tr('Choose an account')} className="flex flex-col gap-1.5">
                    {transferList.map((a, i) =>
              <label key={`${a.bank}-${a.account}`} className="flex cursor-pointer items-center gap-2.5 text-[13.5px]">
                        <input type="radio" name="transfer-acct" checked={transfer === a} onChange={() => setTransferIdx(i)} style={{ accentColor: theme.text }} />
                        {a.bank} · {a.account.slice(-4).padStart(4, '•')}
                      </label>
              )}
                  </div>
            }
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
                  <dt style={muted}>{tr('Bank')}</dt>
                  <dd className="font-medium">{transfer.bank}</dd>
                  <dt style={muted}>{tr('Account number')}</dt>
                  <dd className="font-mono font-medium tracking-wide">{transfer.account}</dd>
                  {transfer.accountName &&
              <>
                      <dt style={muted}>{tr('Account name')}</dt>
                      <dd className="font-medium">{transfer.accountName}</dd>
                    </>
              }
                </dl>
                <p className="text-[12.5px] leading-snug" style={muted}>
                  {tr('Place the order first — your order number is the reference. The seller confirms when the money arrives; nothing is sent before then.')}
                </p>
              </div>
          }
          </fieldset>
        }
        {noWayToPay &&
        <p className="rounded-md px-3 py-2.5 text-[13.5px] font-semibold leading-snug" style={{ background: mix(theme.text, 6) }} role="alert">
            {tr('This seller hasn’t turned on a way to pay online yet. Message them to order.')}
          </p>
        }
        {payNow > 0 && !atStall && payBy === 'card' && !noWayToPay &&
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-[13px] font-semibold">{tr('Test card — choose what happens')}</legend>
          {outcomes.filter((o) => payWith !== 'instalments' || o.value !== 'pending' && o.value !== 'timeout').map((o) =>
          <label key={o.value} className="flex cursor-pointer items-start gap-3 p-3" style={{ ...cardStyle(theme), border: `1.5px solid ${outcome === o.value ? theme.text : mix(theme.text, 12)}` }}>
              <input type="radio" name="test-outcome" value={o.value} checked={outcome === o.value} onChange={() => setOutcome(o.value)} className="mt-1" style={{ accentColor: theme.text }} />
              <span>
                <span className="block text-[14px] font-semibold">{o.label}</span>
                <span className="block text-[12px]" style={muted}>
                  {o.hint}
                </span>
              </span>
            </label>
          )}
        </fieldset>
        }
        {dealRoom &&
        <p className="rounded-md px-3 py-2.5 text-[13px] font-medium leading-snug" style={{ background: mix(theme.text, 6) }} role="note">
            {dealRoom.notice}
          </p>
        }
        {roomError &&
        <p className="text-[13px] font-semibold" role="alert">
            {roomError}
          </p>
        }
        {shop.checkout.orderNote &&
        <ThemedField theme={theme} label="Note for the seller" optional autoComplete="off" placeholder="e.g. Gift wrap, please" value={buyerNote} onChange={(v) => setBuyerNote(v.slice(0, 300))} />
        }
        {shop.checkout.termsTick &&
        <label className="flex cursor-pointer items-start gap-3 text-[13.5px] leading-snug">
            <input type="checkbox" checked={termsOk} onChange={(e) => setTermsOk(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0" style={{ accentColor: theme.text }} />
            <span>
              {tr('I agree to the seller’s terms and returns policy.')}
              {returnsText &&
            <span className="mt-1 block text-[12.5px]" style={muted}>
                  {returnsText}
                </span>
            }
            </span>
          </label>
        }
        {closedMsg &&
        <p className="rounded-md px-3 py-2.5 text-[13.5px] font-semibold leading-snug" style={{ background: mix(theme.text, 6) }} role="alert">
            {closedMsg}
          </p>
        }
        <TestModeNote theme={theme} />
        <TermsUpdatedNote theme={theme} />
        <SheetActions theme={theme}>
          <PrimaryButton
            theme={theme}
            onClick={() => byMomo ? setMomoOpen(true) : byEft ? setEftOpen(true) : byUssd ? setUssdOpen(true) : byAccount ? setAccountOpen(true) : byTransfer ? pay('pending', 'transfer') : pay()}
            disabled={okLines.length === 0 || !!roomError || payWith === 'instalments' && !agreed || shop.checkout.termsTick && !termsOk || !!closedMsg || !!minError || noWayToPay}>
            
            {byMomo && local.mobileMoney ?
            tr('Pay {amount} with {wallet}', { amount: formatNgn(payNow), wallet: local.mobileMoney.name }) :
            byEft ?
            tr('Get account details for {amount}', { amount: formatNgn(payNow) }) :
            byUssd ?
            tr('Get a USSD code for {amount}', { amount: formatNgn(payNow) }) :
            byAccount ?
            tr('Get account details for {amount}', { amount: formatNgn(payNow) }) :
            byTransfer ?
            tr('Place order — pay {amount} by transfer', { amount: formatNgn(payNow) }) :
            atStall ?
            tr('Place order — pay {amount} at the stall', { amount: formatNgn(total) }) :
            payWith === 'pod' ?
            tr('Place order — pay {amount} on delivery', { amount: formatNgn(total) }) :
            payWith === 'instalments' ?
            tr('Pay {amount} today', { amount: formatNgn(payNow) }) :
            payNow > 0 ?
            balanceLater ?
            tr('Pay {amount} deposit', { amount: formatNgn(payNow) }) :
            tr('Pay {amount}', { amount: formatNgn(payNow) }) :
            ticketsOnly ?
            tr('Get free tickets') :
            tr('Place free order')}
          </PrimaryButton>
        </SheetActions>
      </div>);

  };

  return (
    <PageOverlay open={open} onClose={close} theme={theme} label={tr('Checkout')}>
      <div className="flex flex-1 flex-col gap-4 px-5 pb-2 pt-5">
        {!choosingProduct && step !== 'paying' && step !== 'failed' &&
        <div className="flex items-center gap-3 pr-12">
            {step !== 'cart' &&
          <button type="button" onClick={back} aria-label="Back" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ background: theme.surface }}>
                <ArrowLeftIcon size={16} aria-hidden />
              </button>
          }
            <div className="flex-1">
              <StepDots theme={theme} step={stepNo} total={steps.length} />
            </div>
          </div>
        }
        {holdUntil && step !== 'cart' && step !== 'failed' &&
        <HoldTimer
          theme={theme}
          msLeft={Date.parse(holdUntil) - now}
          canExtend={!extended && step !== 'paying'}
          onExtend={() => {
            let ok = false;
            commerce.apply((d) => {
              const r = extendHolds(d, holder, Date.now(), holdMins);
              ok = !!r.expiresAt;
              return r.data;
            });
            if (ok) {
              setExtended(true);
              announce(`Your ${holdWhat} are held for another ${holdMins} minutes.`);
            }
          }}
          what={holdWhat}
          minutes={holdMins} />

        }
        {body()}
      </div>
    </PageOverlay>);

}

/**
 * Countdown for reserved seats; turns emphatic in the last minute and offers one extension
 * (WCAG 2.2.1, D76). The ticking digits are silent — the warning is announced once.
 */
function HoldTimer({ theme, msLeft, canExtend, onExtend, what = 'seats', minutes = HOLD_MINUTES }: {theme: PageTheme;msLeft: number;canExtend: boolean;onExtend: () => void;what?: 'seats' | 'items';minutes?: number;}) {
  const s = Math.max(0, Math.ceil(msLeft / 1000));
  const label = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const urgent = s <= 60;
  const warned = useRef(false);
  useEffect(() => {
    if (urgent && !warned.current) {
      warned.current = true;
      announce(canExtend ? `Your ${what} are released in about a minute. Choose Keep my ${what} if you need more time.` : `Your ${what} are released in about a minute.`, 'assertive');
    }
    if (!urgent) warned.current = false;
  }, [urgent, canExtend, what]);
  return (
    <div className="flex flex-col gap-2 rounded-md px-3 py-2 text-[13px]" style={{ background: urgent ? theme.text : mix(theme.text, 6), color: urgent ? theme.background : theme.text }}>
      <p className="flex items-center justify-between gap-3">
        <span className="font-medium">{urgent && canExtend ? 'Need more time?' : what === 'seats' ? 'Your seats are held' : 'Your items are kept for you'}</span>
        <span role="timer" aria-live="off" aria-label={`${Math.ceil(s / 60)} minute${Math.ceil(s / 60) === 1 ? '' : 's'} left`} className="font-semibold tabular-nums">
          {label}
        </span>
      </p>
      {urgent && canExtend &&
      <button
        type="button"
        onClick={onExtend}
        className="min-h-[36px] self-start rounded-md px-3 text-[13px] font-semibold underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2"
        style={{ background: theme.background, color: theme.text }}>
        
          Keep my {what} for {minutes} more minutes
        </button>
      }
    </div>);

}