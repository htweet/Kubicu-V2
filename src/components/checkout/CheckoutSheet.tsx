import React, { useEffect, useMemo, useState } from 'react';
import { MediaImage } from '../media/MediaImage';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DiscountCodeField } from './DiscountCodeField';
import { useTrack } from '../../contexts/TrackContext';
import { unitsBoughtBy, type DealRoomCheckout } from '../../utils/dealRoom';
import { discountLineLabel, normaliseCode, resolveDiscount } from '../../utils/commerce/discounts';
import { AlertTriangleIcon, ArrowLeftIcon, Loader2Icon, MinusIcon, PlusIcon, ShoppingBagIcon, Trash2Icon, XCircleIcon } from 'lucide-react';
import type { PageTheme } from '../../types/page';
import type { OrderFulfilment, TestPaymentOutcome } from '../../types/commerce';
import type { WorkspacePlan } from '../../types/plan';
import type { PageCommerce } from '../../hooks/usePageCommerce';
import { useCart } from '../../contexts/CartContext';
import { PageOverlay } from '../blocks/PageOverlay';
import { buttonRadius, cardStyle, mix } from '../blocks/pageStyle';
import { CheckoutHeading, PrimaryButton, SecondaryButton, StepDots, TestModeNote, ThemedField } from './checkoutUi';
import { canSell, variantLabel, variantPrice } from '../../utils/commerce/catalog';
import { placeOrder } from '../../utils/commerce/ops';
import { isValidEmail, isValidPhone } from '../../utils/validation';
import { formatNgn } from '../../utils/format';

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
  const cart = useCart();
  const navigate = useNavigate();
  const track = useTrack();
  const [step, setStep] = useState<Step>('cart');
  const [customer, setCustomer] = useState({ name: '', phone: '', email: '' });
  const [method, setMethod] = useState<string>('');
  const [address, setAddress] = useState('');
  const [outcome, setOutcome] = useState<TestPaymentOutcome>('success');
  const [failure, setFailure] = useState('');
  const [tried, setTried] = useState(false);
  // Campaign links can carry a code (?code=EID20); it's pre-filled and still checked (D51).
  const [params] = useSearchParams();
  const [code, setCode] = useState(() => normaliseCode(params.get('code') ?? defaultCode ?? ''));

  const data = commerce.data;
  const open = !!cart?.open;
  useEffect(() => {
    if (open) {
      setStep('cart');
      setTried(false);
    }
  }, [open]);

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
      const ok = !!product && !!variant && price !== null && canSell(product, variant) && (product.kind === 'digital' || !product.trackStock || variant.stock >= l.qty);
      return { ...l, product, variant, price, ok };
    }),
    [cart?.lines, data, dealRoom]
  );

  if (!cart || !data) return null;

  const subtotal = lines.reduce((s, l) => s + (l.ok && l.price !== null ? l.price * l.qty : 0), 0);
  const physical = lines.some((l) => l.product?.kind === 'physical');
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
    email: (!physical || customer.email.trim()) && !isValidEmail(customer.email) ? 'Enter an email for your receipt and download link' : ''
  };
  const deliveryError = !method ? 'Choose how you’ll get your order' : method !== 'pickup' && !address.trim() ? 'Enter the delivery address' : '';

  const close = () => {
    cart.setOpen(false);
    cart.doneChoosing();
  };

  const pay = () => {
    setStep('paying');
    const fulfilment: OrderFulfilment = !physical ?
    { method: 'digital' } :
    method === 'pickup' ?
    { method: 'pickup', address: f.pickupAddress } :
    { method: 'delivery', zoneId: zone?.id, zoneName: zone?.name, address: address.trim(), eta: zone?.eta };
    window.setTimeout(
      () => {
        let result: ReturnType<typeof placeOrder> | null = null;
        const ok = commerce.apply((d) => {
          result = placeOrder(d, {
            lines: lines.filter((l) => l.ok).map(({ productId, variantId, qty }) => ({ productId, variantId, qty })),
            customer: { name: customer.name.trim(), phone: customer.phone.trim(), email: customer.email.trim() },
            fulfilment,
            deliveryNgn: physical ? deliveryFee : 0,
            outcome,
            plan: ownerPlan,
            discountCode: code,
            sourceHandle: handle,
            dealRoom: dealRoom ? { productId: dealRoom.productId, priceNgn: dealRoom.priceNgn, held: dealRoom.held } : undefined,
            referredBy: dealRoom ? params.get('ref') ?? undefined : undefined
          });
          return result.ok ? result.data : d;
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
        if (r.order.paymentStatus === 'paid') track('order_paid', { valueNgn: r.order.subtotalNgn - r.order.discountNgn + r.order.deliveryNgn, label: `#${r.order.number}` });
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
              const available = canSell(choosingProduct, v);
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
                      {!available ? 'Sold out' : price === null ? 'Price on request' : formatNgn(price)}
                      {available && choosingProduct.trackStock && v.stock <= choosingProduct.lowStockAt ? ` · ${v.stock} left` : ''}
                    </span>
                  </button>
                </li>);

            })}
          </ul>
          <SecondaryButton theme={theme} onClick={cart.doneChoosing}>
            {cart.lines.length ? 'Back to cart' : 'Not now'}
          </SecondaryButton>
        </div>);

    }

    if (step === 'paying') {
      return (
        <div className="flex flex-col items-center gap-3 py-12 text-center" role="status" aria-live="polite">
          <Loader2Icon size={28} className="animate-spin" aria-hidden />
          <p className="text-[16px] font-medium">{outcome === 'timeout' ? 'Waiting for the payment provider…' : 'Processing test payment…'}</p>
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
            <p className="text-[18px] font-medium">{outcome === 'cancelled' ? 'Payment cancelled' : 'Payment didn’t go through'}</p>
            <p className="max-w-xs text-[13.5px]" style={muted}>
              {failure}
            </p>
          </div>
          <PrimaryButton theme={theme} onClick={() => setStep('review')}>
            Try again
          </PrimaryButton>
          <SecondaryButton theme={theme} onClick={() => setStep('cart')}>
            Back to cart
          </SecondaryButton>
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
                    {!l.ok &&
                <p className="mt-0.5 flex items-center gap-1 text-[12px] font-semibold">
                        <AlertTriangleIcon size={12} aria-hidden /> {l.variant && l.product?.trackStock && l.variant.stock > 0 ? `Only ${l.variant.stock} left` : 'No longer available'}
                      </p>
                }
                  </div>
                  {l.product?.kind === 'physical' ?
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
                  disabled={!!l.product.trackStock && !!l.variant && l.qty >= l.variant.stock || roomQty >= roomCap}
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
                  <dt style={muted}>Subtotal</dt>
                  <dd className="font-semibold tabular-nums">{formatNgn(subtotal)}</dd>
                </div>
                {discountRow}
              </dl>
              <DiscountCodeField theme={theme} code={code} onApply={setCode} resolution={resolution} />
              {lines.some((l) => !l.ok) &&
            <p className="text-[12.5px]" style={muted}>
                  Unavailable items won’t be ordered.
                </p>
            }
              <PrimaryButton
              theme={theme}
              disabled={subtotal === 0}
              onClick={() => {
                track('checkout_start');
                setStep('details');
              }}>
              
                Checkout
              </PrimaryButton>
            </>
          }
          <TestModeNote theme={theme} />
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
          <p className="text-[12px] leading-snug" style={muted}>
            Your details go to the seller to fulfil this order. See their page for how they handle personal data.
          </p>
          <PrimaryButton theme={theme} type="submit">
            Continue
          </PrimaryButton>
        </form>);

    }

    if (step === 'delivery') {
      const options = [
      ...(f.pickupEnabled ? [{ id: 'pickup', title: 'Pickup', detail: [f.pickupAddress, f.pickupHours].filter(Boolean).join(' · '), fee: 0 }] : []),
      ...(f.deliveryEnabled ? f.zones.map((z) => ({ id: z.id, title: `Delivery · ${z.name}`, detail: z.eta ? `Usually ${z.eta}` : '', fee: free ? 0 : z.feeNgn })) : [])];

      return (
        <div className="flex flex-col gap-4">
          <CheckoutHeading theme={theme} sub={f.freeDeliveryOverNgn !== null ? free ? 'You qualify for free delivery.' : `Free delivery over ${formatNgn(f.freeDeliveryOverNgn)}.` : undefined}>
            How do you want it?
          </CheckoutHeading>
          {options.length === 0 ?
          <p className="rounded-md p-3 text-[14px]" style={cardStyle(theme)}>
              This seller hasn’t set up pickup or delivery yet. Please message them before ordering.
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
                    <span className="shrink-0 text-[14px] font-semibold tabular-nums">{o.fee === 0 ? 'Free' : formatNgn(o.fee)}</span>
                  </button>);

            })}
            </div>
          }
          {method && method !== 'pickup' && <ThemedField theme={theme} label="Delivery address" autoComplete="street-address" value={address} error={tried && !address.trim() ? 'Enter the delivery address' : undefined} onChange={setAddress} />}
          {tried && !method &&
          <p className="text-[12.5px] font-medium" role="alert">
              Choose how you’ll get your order.
            </p>
          }
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
        </div>);

    }

    // review
    const okLines = lines.filter((l) => l.ok);
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
            <dt style={muted}>Subtotal</dt>
            <dd className="tabular-nums">{formatNgn(subtotal)}</dd>
          </div>
          {discountRow}
          {physical &&
          <div className="flex justify-between">
              <dt style={muted}>{method === 'pickup' ? 'Pickup' : `Delivery · ${zone?.name ?? ''}`}</dt>
              <dd className="tabular-nums">{deliveryFee === 0 ? 'Free' : formatNgn(deliveryFee)}</dd>
            </div>
          }
          <div className="flex justify-between pt-1 text-[16px] font-semibold">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatNgn(total)}</dd>
          </div>
          <p className="text-[12px]" style={muted}>
            No extra fees are added at payment. Processing fees are paid by the seller.
          </p>
        </dl>
        <DiscountCodeField theme={theme} code={code} onApply={setCode} resolution={resolution} />
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-[13px] font-semibold">Test card — choose what happens</legend>
          {outcomes.map((o) =>
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
        <PrimaryButton theme={theme} onClick={pay} disabled={okLines.length === 0 || !!roomError}>
          Pay {formatNgn(total)}
        </PrimaryButton>
      </div>);

  };

  return (
    <PageOverlay open={open} onClose={close} theme={theme} label="Checkout">
      <div className="flex flex-col gap-4 px-5 pb-6 pt-5">
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
        {body()}
      </div>
    </PageOverlay>);

}