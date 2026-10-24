import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useT } from '../../contexts/LocaleContext';
import { announce } from '../../utils/announce';
import { MediaImage } from '../media/MediaImage';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DiscountCodeField } from './DiscountCodeField';
import { useTrack } from '../../contexts/TrackContext';
import { unitsBoughtBy, type DealRoomCheckout } from '../../utils/dealRoom';
import { discountLineLabel, normaliseCode, resolveDiscount } from '../../utils/commerce/discounts';
import { AlertTriangleIcon, ArrowLeftIcon, CreditCardIcon, HashIcon, Loader2Icon, MinusIcon, PlusIcon, ShoppingBagIcon, Trash2Icon, XCircleIcon } from 'lucide-react';
import type { PageTheme } from '../../types/page';
import type { OrderFulfilment, TestPaymentOutcome } from '../../types/commerce';
import type { WorkspacePlan } from '../../types/plan';
import type { PageCommerce } from '../../hooks/usePageCommerce';
import { useCart } from '../../contexts/CartContext';
import { PageOverlay } from '../blocks/PageOverlay';
import { buttonRadius, cardStyle, mix } from '../blocks/pageStyle';
import { CheckoutHeading, PrimaryButton, SecondaryButton, SheetActions, StepDots, TestModeNote, ThemedField } from './checkoutUi';
import { canSell, variantLabel, variantPrice } from '../../utils/commerce/catalog';
import { placeOrder } from '../../utils/commerce/ops';
import { cartBalanceNgn, isMadeToOrder } from '../../utils/commerce/deposit';
import { instalmentCheck, payOptionsOf, podCheck, schedule } from '../../utils/commerce/payOptions';
import { PayWithChooser, type PayWith } from './PayWithChooser';
import { HOLD_MINUTES, extendHolds, findEvent, holdExpiry, holderId, placeHolds, releaseHolds, ticketLineIssue } from '../../utils/commerce/tickets';
import { describeSeats, findSeat } from '../../utils/commerce/seating';
import { useNow } from '../../hooks/useNow';
import { isValidEmail, isValidPhone } from '../../utils/validation';
import { formatNgn } from '../../utils/format';
import { isNaira } from '../../utils/currency';
import { UssdPay } from './UssdPay';

type Step = 'cart' | 'details' | 'delivery' | 'review' | 'paying' | 'failed';

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
}

export function CheckoutSheet({ theme, commerce, ownerPlan, handle, defaultCode, dealRoom }: CheckoutSheetProps) {
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
  // Names printed on each ticket seat; blank seats use the buyer's name (D73).
  const [guestNames, setGuestNames] = useState<Record<string, string[]>>({});
  // Pay on delivery / instalments (D112).
  const [payWithChoice, setPayWith] = useState<PayWith>('now');
  const [agreed, setAgreed] = useState(false);
  // Card or USSD for an immediate payment (D136).
  const [payBy, setPayBy] = useState<'card' | 'ussd'>('card');
  const [ussdOpen, setUssdOpen] = useState(false);
  useEffect(() => {
    if (step !== 'review') setUssdOpen(false);
  }, [step]);

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
    }
  }, [open]);
  useEffect(() => {
    // The hold ran out before payment: release and send the buyer back to the cart to re-check.
    if (holding && !holdUntil && step !== 'cart' && step !== 'paying') {
      setHolding(false);
      setStep('cart');
      setHoldNotice(`Your seats were released after ${HOLD_MINUTES} minutes. Check they’re still available and continue.`);
    }
  }, [holding, holdUntil, step]);

  const lines = useMemo(
    () =>
    (cart?.lines ?? []
    // A DealRoom sells only its own product.
    ).filter((l) => !dealRoom || l.productId === dealRoom.productId).
    map((l) => {
      const product = data?.products.find((p) => p.id === l.productId);
      const variant = product?.variants.find((v) => v.id === l.variantId);
      const roomPrice = dealRoom && dealRoom.priceNgn !== null ? dealRoom.priceNgn : null;
      const price = product && variant ? roomPrice ?? variantPrice(product, variant) : null;
      const ticketIssue = product?.kind === 'ticket' ? ticketLineIssue(data, l, Date.now(), holder) : '';
      const ok = !!product && !!variant && price !== null && canSell(product, variant) && !ticketIssue && (product.kind === 'digital' || !product.trackStock || variant.stock >= l.qty);
      const ev = product?.kind === 'ticket' ? findEvent(data, product.eventId) : undefined;
      const tt = ev?.ticketTypes.find((t) => t.id === l.variantId);
      const seatText = describeSeats(ev, l.seats);
      return { ...l, product, variant, price, ok, ticketIssue, seatText, maxQty: tt ? tt.maxPerOrder : 20 };
    }),
    [cart?.lines, data, dealRoom, holder]
  );

  if (!cart || !data) return null;

  const subtotal = lines.reduce((s, l) => s + (l.ok && l.price !== null ? l.price * l.qty : 0), 0);
  const physical = lines.some((l) => l.product?.kind === 'physical');
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
  const total = subtotal - discount + (physical ? deliveryFee : 0);
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
  const payWith: PayWith = payWithChoice === 'pod' && podOption.ok ? 'pod' : payWithChoice === 'instalments' && instOption.ok ? 'instalments' : 'now';
  const firstPart = payWith === 'instalments' && instOption.ok ? schedule(total, instOption.plan)[0].amountNgn : 0;
  const payNow = payWith === 'pod' ? 0 : payWith === 'instalments' ? firstPart : total - balanceLater;
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

  const detailErrors = {
    name: !customer.name.trim() ? 'Enter your name' : '',
    phone: !isValidPhone(customer.phone) ? 'Enter a phone number, e.g. +234 803 123 4567' : '',
    email: (!physical || customer.email.trim()) && !isValidEmail(customer.email) ? ticketLines.length ? 'Enter an email for your receipt and tickets' : 'Enter an email for your receipt and download link' : ''
  };
  const deliveryError = !method ? 'Choose how you’ll get your order' : method !== 'pickup' && !address.trim() ? 'Enter the delivery address' : '';

  const close = () => {
    cart.setOpen(false);
    cart.doneChoosing();
  };

  const pay = (override?: TestPaymentOutcome) => {
    setStep('paying');
    // Nothing to charge: the test-card choice doesn't apply. USSD passes its own result (D136).
    const outcome = payNow > 0 ? override ?? chosenOutcome : 'success';
    const fulfilment: OrderFulfilment = !physical ?
    { method: ticketsOnly ? 'tickets' : 'digital' } :
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
            payWith
          });
          if (!result.ok) return d;
          // Creator Collaboration (D103): remember which partner's link the buyer came from.
          const partner = params.get('partner')?.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 20);
          const placed = result.order;
          const stamped = partner ? { ...result.data, orders: result.data.orders.map((o) => o.id === placed.id ? { ...o, partnerCode: partner } : o) } : result.data;
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
          track('order_paid', { valueNgn: r.order.subtotalNgn - r.order.discountNgn + r.order.deliveryNgn - (r.order.balance?.dueNgn ?? 0) - (r.order.instalments ? r.order.instalments.parts.filter((p) => p.status !== 'paid').reduce((s, p) => s + p.amountNgn, 0) : 0), label: `#${r.order.number}` });
          const ticketValue = r.order.items.filter((i) => i.kind === 'ticket').reduce((s, i) => s + i.unitPriceNgn * i.qty, 0);
          if (r.order.items.some((i) => i.kind === 'ticket')) track('ticket_paid', { valueNgn: ticketValue, label: `#${r.order.number}` });
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
                    </p>
                    {l.seatText &&
                <p className="text-[12.5px] font-medium" style={{ color: theme.text }}>
                        {l.seatText}
                      </p>
                }
                    {!l.ok &&
                <p className="mt-0.5 flex items-center gap-1 text-[12px] font-semibold">
                        <AlertTriangleIcon size={12} aria-hidden /> {l.ticketIssue || (l.variant && l.product?.trackStock && l.variant.stock > 0 ? `Only ${l.variant.stock} left` : 'No longer available')}
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
                  disabled={!!l.seats?.length || !!l.product.trackStock && !!l.variant && l.qty >= l.variant.stock || roomQty >= roomCap || l.qty >= l.maxQty}
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
              </dl>
              <DiscountCodeField theme={theme} code={code} onApply={setCode} resolution={resolution} />
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
              {ticketLines.length > 0 && !holdNotice &&
            <p className="text-[12.5px]" style={muted}>
                  {tr('We’ll hold your seats for {n} minutes while you check out.', { n: HOLD_MINUTES })}
                </p>
            }
              <TestModeNote theme={theme} />
              <SheetActions theme={theme}>
              <PrimaryButton
                theme={theme}
                disabled={!lines.some((l) => l.ok)}
                onClick={() => {
                  setHoldNotice('');
                  if (ticketLines.length) {
                    let issue = '';
                    let until: string | null = null;
                    commerce.apply((d) => {
                      const r = placeHolds(d, holder, ticketLines.map(({ productId, variantId, qty, seats }) => ({ productId, variantId, qty, seats })));
                      issue = r.issue;
                      until = r.expiresAt;
                      return r.data;
                    });
                    if (issue) {
                      setHoldNotice(issue);
                      return;
                    }
                    setHolding(!!until);
                    track('ticket_checkout');
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
          <ThemedField theme={theme} label="Phone (WhatsApp preferred)" type="tel" inputMode="tel" autoComplete="tel" placeholder="+234 …" value={customer.phone} error={showErr('phone')} onChange={(phone) => setCustomer((c) => ({ ...c, phone }))} />
          <ThemedField theme={theme} label="Email" type="email" inputMode="email" autoComplete="email" optional={physical} value={customer.email} error={showErr('email')} onChange={(email) => setCustomer((c) => ({ ...c, email }))} />
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

    if (step === 'delivery') {
      const options = [
      ...(f.pickupEnabled ? [{ id: 'pickup', title: tr('Pickup'), detail: [f.pickupAddress, f.pickupHours].filter(Boolean).join(' · '), fee: 0 }] : []),
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

    // USSD only for a single naira payment now — not for later instalment charges (D136).
    const ussdAvailable = isNaira() && payNow > 0 && payWith === 'now';
    const byUssd = ussdAvailable && payBy === 'ussd';
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
          <div className="flex justify-between">
              <dt style={muted}>{method === 'pickup' ? tr('Pickup') : `${tr('Delivery')} · ${zone?.name ?? ''}`}</dt>
              <dd className="tabular-nums">{deliveryFee === 0 ? tr('Free') : formatNgn(deliveryFee)}</dd>
            </div>
          }
          <div className={balanceLater ? 'flex justify-between pt-1' : 'flex justify-between pt-1 text-[16px] font-semibold'}>
            <dt>{tr('Total')}</dt>
            <dd className="tabular-nums">{formatNgn(total)}</dd>
          </div>
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
                Made to order{leadDays ? ` — usually ready in about ${leadDays} day${leadDays === 1 ? '' : 's'}` : ''}. You’ll get a link to pay the balance from your order page; nothing is sent until it’s paid.
              </p>
            </>
          }
          <p className="text-[12px]" style={muted}>
            {tr('No extra fees are added at payment. Processing fees are paid by the seller.')}
          </p>
        </dl>
        <DiscountCodeField theme={theme} code={code} onApply={setCode} resolution={resolution} />
        <PayWithChooser
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
        
        {ussdAvailable &&
        <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-[14px] font-semibold">{tr('Pay with')}</legend>
            <div className="grid grid-cols-2 gap-2">
              {(
            [
            ['card', CreditCardIcon, tr('Card or transfer')],
            ['ussd', HashIcon, tr('USSD code')]] as
            const).
            map(([v, Icon, label]) =>
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
          </fieldset>
        }
        {payNow > 0 && !byUssd &&
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
        <TestModeNote theme={theme} />
        <SheetActions theme={theme}>
          <PrimaryButton theme={theme} onClick={() => byUssd ? setUssdOpen(true) : pay()} disabled={okLines.length === 0 || !!roomError || payWith === 'instalments' && !agreed}>
            {byUssd ?
            tr('Get a USSD code for {amount}', { amount: formatNgn(payNow) }) :
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
              const r = extendHolds(d, holder);
              ok = !!r.expiresAt;
              return r.data;
            });
            if (ok) {
              setExtended(true);
              announce(`Your seats are held for another ${HOLD_MINUTES} minutes.`);
            }
          }} />

        }
        {body()}
      </div>
    </PageOverlay>);

}

/**
 * Countdown for reserved seats; turns emphatic in the last minute and offers one extension
 * (WCAG 2.2.1, D76). The ticking digits are silent — the warning is announced once.
 */
function HoldTimer({ theme, msLeft, canExtend, onExtend }: {theme: PageTheme;msLeft: number;canExtend: boolean;onExtend: () => void;}) {
  const s = Math.max(0, Math.ceil(msLeft / 1000));
  const label = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const urgent = s <= 60;
  const warned = useRef(false);
  useEffect(() => {
    if (urgent && !warned.current) {
      warned.current = true;
      announce(canExtend ? 'Your seats are released in about a minute. Choose Keep my seats if you need more time.' : 'Your seats are released in about a minute.', 'assertive');
    }
    if (!urgent) warned.current = false;
  }, [urgent, canExtend]);
  return (
    <div className="flex flex-col gap-2 rounded-md px-3 py-2 text-[13px]" style={{ background: urgent ? theme.text : mix(theme.text, 6), color: urgent ? theme.background : theme.text }}>
      <p className="flex items-center justify-between gap-3">
        <span className="font-medium">{urgent && canExtend ? 'Need more time?' : 'Your seats are held'}</span>
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
        
          Keep my seats for {HOLD_MINUTES} more minutes
        </button>
      }
    </div>);

}