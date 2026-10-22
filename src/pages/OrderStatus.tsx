import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeftIcon, CheckCircle2Icon, ClockIcon, DownloadIcon, MessageCircleIcon, RotateCcwIcon, XCircleIcon } from 'lucide-react';
import { useResolvedPage, sellerPhone } from '../hooks/useResolvedPage';
import { usePageCommerce } from '../hooks/usePageCommerce';
import { PageSurface } from '../components/blocks/PageSurface';
import { cardStyle, mix } from '../components/blocks/pageStyle';
import { CheckoutHeading, TestModeNote } from '../components/checkout/checkoutUi';
import { MoneyBreakdown } from '../components/commerce/MoneyBreakdown';
import { orderMoney } from '../utils/commerce/money';
import { formatNgn, formatTimestamp, whatsappLink } from '../utils/format';
import { Unavailable } from './PublicPage';

/** Visitor-facing order confirmation and receipt. */
export function OrderStatus() {
  const { handle = '', orderId = '' } = useParams();
  const page = useResolvedPage(handle);
  const commerce = usePageCommerce(page?.workspaceId ?? null, !!page?.isOwn);
  const order = commerce.data?.orders.find((o) => o.id === orderId);

  if (!page) return <Unavailable handle={handle} />;
  if (!order) return <Unavailable handle={handle} title="We can’t find that order" body="The link may be incomplete, or the order was removed. Contact the seller with your order number." />;

  const t = page.doc.theme;
  const muted = { color: t.mutedText };
  const phone = sellerPhone(page.doc);
  const pending = order.paymentStatus === 'pending';
  const refunded = order.paymentStatus === 'refunded' || order.status === 'cancelled';
  const Icon = refunded ? XCircleIcon : pending ? ClockIcon : CheckCircle2Icon;
  const title = order.status === 'cancelled' ? 'Order cancelled' : order.paymentStatus === 'refunded' ? 'Order refunded' : pending ? 'Order received — payment pending' : 'Thank you, your order is confirmed';
  const sub = pending ?
  order.paymentNote === 'Provider timed out' ?
  'Your bank didn’t confirm in time. If you were charged, the seller will see it once the provider updates — usually within minutes. Don’t pay twice.' :
  'We’re waiting for the payment provider to confirm. You’ll get a confirmation when it does.' :
  order.status === 'cancelled' ?
  'Any payment has been refunded to your original payment method.' :
  order.fulfilment.method === 'digital' ?
  'Your files are ready. Your download link is below and in your receipt email.' :
  order.fulfilment.method === 'pickup' ?
  'The seller will let you know when it’s ready to collect.' :
  `Expected delivery: ${order.fulfilment.eta ?? 'the seller will confirm'}.`;

  return (
    <div className="min-h-screen w-full" style={{ background: t.background }}>
      <PageSurface theme={t}>
        <main className="flex flex-col gap-5 py-6">
          <Link to={`/p/${handle}`} className="inline-flex items-center gap-1.5 self-start text-[14px] font-medium" style={muted}>
            <ArrowLeftIcon size={15} aria-hidden /> Back to {page.doc.title}
          </Link>
          <div className="flex flex-col items-start gap-3">
            <Icon size={30} aria-hidden />
            <CheckoutHeading theme={t} sub={sub}>
              {title}
            </CheckoutHeading>
          </div>
          <TestModeNote theme={t} />

          <section className="flex flex-col gap-3 p-5" style={cardStyle(t)} aria-label="Receipt">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[15px] font-semibold">Order #{order.number}</p>
              <p className="text-[12.5px]" style={muted}>
                {formatTimestamp(order.createdAt)}
              </p>
            </div>
            <ul className="flex flex-col gap-1.5 border-t pt-3 text-[14px]" style={{ borderColor: mix(t.text, 12) }}>
              {order.items.map((i) =>
              <li key={i.variantId} className="flex justify-between gap-3">
                  <span>
                    {i.qty} × {i.name}
                    {i.variantLabel ? ` (${i.variantLabel})` : ''}
                  </span>
                  <span className="tabular-nums">{formatNgn(i.unitPriceNgn * i.qty)}</span>
                </li>
              )}
            </ul>
            <div className="border-t pt-2" style={{ borderColor: mix(t.text, 12) }}>
              <div style={{ color: t.text }} className="[&_dd]:!text-inherit [&_dt]:!text-inherit">
                <MoneyBreakdown money={orderMoney(order)} audience="customer" />
              </div>
              {order.refunds.length > 0 &&
              <p className="mt-2 flex items-center gap-1.5 text-[13px]" style={muted}>
                  <RotateCcwIcon size={13} aria-hidden /> Refunded {formatNgn(order.refunds.reduce((s, r) => s + r.amountNgn, 0))}
                </p>
              }
            </div>
            <div className="border-t pt-3 text-[13.5px]" style={{ borderColor: mix(t.text, 12) }}>
              <p className="font-semibold">{order.fulfilment.method === 'pickup' ? 'Pickup' : order.fulfilment.method === 'digital' ? 'Digital delivery' : `Delivery to ${order.fulfilment.zoneName}`}</p>
              {order.fulfilment.address && <p style={muted}>{order.fulfilment.address}</p>}
              <p style={muted}>
                {order.customer.name} · {order.customer.phone}
                {order.customer.email ? ` · ${order.customer.email}` : ''}
              </p>
            </div>
          </section>

          {order.downloadToken && !pending && !refunded &&
          <Link
            to={`/p/${handle}/download/${order.downloadToken}`}
            className="flex h-12 items-center justify-center gap-2 text-[15px] font-semibold"
            style={{ background: t.accent, color: t.accentText, borderRadius: 999 }}>
            
              <DownloadIcon size={17} aria-hidden /> Go to your downloads
            </Link>
          }

          {phone &&
          <a
            href={whatsappLink(phone, `Hi! About my order #${order.number}…`)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 items-center justify-center gap-2 text-[15px] font-semibold"
            style={{ ...cardStyle(t), borderRadius: 999 }}>
            
              <MessageCircleIcon size={17} aria-hidden /> Message the seller
            </a>
          }
          <p className="text-[12px] leading-snug" style={muted}>
            Keep this page or your order number. Refunds and returns are handled by the seller under their policy and Nigerian consumer law.
          </p>
        </main>
      </PageSurface>
    </div>);

}