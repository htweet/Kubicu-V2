import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeftIcon, CheckCircle2Icon, ClockIcon, CopyIcon, DownloadIcon, GiftIcon, GraduationCapIcon, MessageCircleIcon, RotateCcwIcon, XCircleIcon } from 'lucide-react';
import { learnUrl } from '../utils/commerce/courses';
import { useResolvedPage, sellerPhone } from '../hooks/useResolvedPage';
import { usePageCommerce } from '../hooks/usePageCommerce';
import { useVisitorLang } from '../hooks/useVisitorLang';
import { LocaleProvider, translatorFor } from '../contexts/LocaleContext';
import { PageSurface } from '../components/blocks/PageSurface';
import { VisitorLanguageRow } from '../components/blocks/VisitorLanguageRow';
import { cardStyle, mix } from '../components/blocks/pageStyle';
import { CheckoutHeading, TestModeNote } from '../components/checkout/checkoutUi';
import { MoneyBreakdown } from '../components/commerce/MoneyBreakdown';
import { discountLineLabel } from '../utils/commerce/discounts';
import { orderMoney } from '../utils/commerce/money';
import { formatNgn, formatTimestamp, whatsappLink } from '../utils/format';
import { Unavailable } from './PublicPage';
import { ReferralShareCard } from '../components/dealroom/ReferralShareCard';
import { roomProgress, roomReferrers } from '../utils/dealRoom';
import { OrderTickets } from '../components/tickets/OrderTickets';
import { EscrowNotice } from '../components/checkout/EscrowNotice';
import { OrderBalanceCard } from '../components/checkout/OrderBalanceCard';
import { OrderInstalmentsCard } from '../components/checkout/OrderInstalmentsCard';
import { OrderTrackingCard } from '../components/checkout/OrderTrackingCard';
import { useFulfilment } from '../hooks/useFulfilment';
import { buildTracking } from '../utils/commerce/tracking';
import { markTransferSent } from '../utils/commerce/bankTransfer';
import { orderRef, shopSettingsOf } from '../utils/commerce/shopSettings';
import { ReceiptBusinessFooter } from '../components/checkout/ReceiptBusinessFooter';
import { LoyaltyReceiptCard } from '../components/checkout/LoyaltyReceiptCard';

/** Visitor-facing order confirmation and receipt. Follows the visitor's language (D133). */
export function OrderStatus() {
  const { handle = '', orderId = '' } = useParams();
  const page = useResolvedPage(handle);
  const commerce = usePageCommerce(page?.workspaceId ?? null, !!page?.isOwn);
  const [lang, setLang] = useVisitorLang(page?.doc.language);
  const tx = translatorFor(lang);
  const order = commerce.data?.orders.find((o) => o.id === orderId);
  const fulfilment = useFulfilment(page?.workspaceId ?? '__none').data;
  const tracking = order ? buildTracking(order, page?.workspaceId ? fulfilment : null) : null;

  if (!page) return <Unavailable handle={handle} />;
  if (!order) return <Unavailable handle={handle} title={tx('We can’t find that order')} body={tx('The link may be incomplete, or the order was removed. Contact the seller with your order number.')} />;

  const t = page.doc.theme;
  const room = page.doc.dealRoom;
  const roomStats = room ? roomProgress(room, handle, commerce.data) : null;
  const muted = { color: t.mutedText };
  const phone = sellerPhone(page.doc);
  // Pay on delivery isn't "pending payment" for the buyer — it's a confirmed order paid at the door (D112).
  const podDue = !!order.pod && !order.pod.collected && order.status !== 'cancelled';
  const pending = order.paymentStatus === 'pending' && !order.pod;
  const refunded = order.paymentStatus === 'refunded' || order.status === 'cancelled';
  const Icon = refunded ? XCircleIcon : pending ? ClockIcon : CheckCircle2Icon;
  const eta = order.fulfilment.eta ?? tx('the seller will confirm');
  const title = tx(order.status === 'cancelled' ? 'Order cancelled' : order.paymentStatus === 'refunded' ? 'Order refunded' : pending ? 'Order received — payment pending' : 'Thank you, your order is confirmed');
  const sub = podDue && order.pod
    ? tx('Pay {amount} when it arrives ({how}). The seller will call before delivery — keep your phone on. Expected: {eta}.', {
        amount: formatNgn(order.pod.amountNgn),
        how: tx(order.pod.accept === 'cash' ? 'cash' : order.pod.accept === 'transfer' ? 'transfer' : 'cash or transfer'),
        eta,
      })
    : pending
    ? order.bankTransfer
      ? tx(order.bankTransfer.sentAt ? 'Thanks — the seller will confirm when your transfer arrives. Nothing is sent before then.' : 'Transfer the amount below using your order number as the reference. The seller confirms when it arrives.')
      : order.paymentNote === 'Provider timed out'
      ? tx('Your bank didn’t confirm in time. If you were charged, the seller will see it once the provider updates — usually within minutes. Don’t pay twice.')
      : tx('We’re waiting for the payment provider to confirm. You’ll get a confirmation when it does.')
    : order.status === 'cancelled'
      ? tx('Any payment has been refunded to your original payment method.')
      : order.fulfilment.method === 'tickets'
        ? tx('Your tickets are below and in your receipt email. Open each one to show its QR code at the door.')
        : order.fulfilment.method === 'digital'
        ? tx('Your files are ready. Your download link is below and in your receipt email.')
        : order.balance && !order.balance.paidAt
          ? tx('Your deposit is confirmed and your order is being made. Pay the balance below before it’s sent out.')
          : order.popup
          ? order.popup.payAtStall && order.paymentStatus === 'pending'
            ? tx('Collect at the stall: {when}. Pay when you collect and show your order number.', { when: order.popup.sessionLabel })
            : tx('Collect at the stall: {when}. Show your order number.', { when: order.popup.sessionLabel })
          : order.fulfilment.method === 'pickup'
          ? tx('The seller will let you know when it’s ready to collect.')
          : tx('Expected delivery: {eta}.', { eta });

  return (
    <LocaleProvider lang={lang} setLang={setLang}>
    <div className="min-h-screen w-full" style={{ background: t.background }}>
      <PageSurface theme={t} header={<VisitorLanguageRow theme={t} />}>
        <main className="flex flex-col gap-5 py-6">
          <Link to={`/p/${handle}`} className="inline-flex items-center gap-1.5 self-start text-[14px] font-medium" style={muted}>
            <ArrowLeftIcon size={15} aria-hidden /> {tx('Back to {name}', { name: page.doc.title })}
          </Link>
          <div className="flex flex-col items-start gap-3">
            <Icon size={30} aria-hidden />
            <CheckoutHeading theme={t} sub={sub} level={1}>
              {title}
            </CheckoutHeading>
          </div>
          <TestModeNote theme={t} />

          {pending && order.bankTransfer && (
            <section className="flex flex-col gap-3 p-5" style={cardStyle(t)} aria-label={tx('Bank transfer details')}>
              <p className="text-[15px] font-semibold">{tx('Transfer {amount} to:', { amount: formatNgn(orderMoney(order).gross) })}</p>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[14px]">
                <dt style={muted}>{tx('Bank')}</dt>
                <dd className="font-medium">{order.bankTransfer.bank}</dd>
                <dt style={muted}>{tx('Account number')}</dt>
                <dd className="font-mono font-medium tracking-wide">{order.bankTransfer.account}</dd>
                {order.bankTransfer.accountName && (
                  <>
                    <dt style={muted}>{tx('Account name')}</dt>
                    <dd className="font-medium">{order.bankTransfer.accountName}</dd>
                  </>
                )}
                <dt style={muted}>{tx('Reference')}</dt>
                <dd className="font-mono font-semibold">{orderRef(order)}</dd>
              </dl>
              {order.bankTransfer.sentAt ? (
                <p className="flex items-center gap-1.5 text-[13.5px] font-medium">
                  <CheckCircle2Icon size={15} aria-hidden /> {tx('You marked it as sent {when}.', { when: formatTimestamp(order.bankTransfer.sentAt) })}
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => commerce.apply((d) => markTransferSent(d, order.id))}
                  className="h-11 self-start px-5 text-[14px] font-semibold focus-visible:outline-none focus-visible:ring-2"
                  style={{ background: t.accent, color: t.accentText, borderRadius: 999 }}
                >
                  {tx('I’ve sent the money')}
                </button>
              )}
              <p className="text-[12.5px]" style={muted}>
                {tx('Only transfer to the account shown here. KUBICU doesn’t hold this money and can’t refund a transfer to the wrong account.')}
              </p>
            </section>
          )}

          {tracking?.applies && !pending && <OrderTrackingCard theme={t} view={tracking} tx={tx} />}

          <section className="flex flex-col gap-3 p-5" style={cardStyle(t)} aria-label={tx('Receipt')}>
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[15px] font-semibold">{order.numberPrefix ? tx('Order {ref}', { ref: orderRef(order) }) : tx('Order #{n}', { n: order.number })}</p>
              <p className="text-[12.5px]" style={muted}>
                {formatTimestamp(order.createdAt)}
              </p>
            </div>
            <ul className="flex flex-col gap-1.5 border-t pt-3 text-[14px]" style={{ borderColor: mix(t.text, 12) }}>
              {order.items.map((i) => (
                <li key={i.variantId} className="flex justify-between gap-3">
                  <span>
                    {i.qty} × {i.name}
                    {i.variantLabel ? ` (${i.variantLabel})` : ''}
                  </span>
                  <span className="tabular-nums">{formatNgn(i.unitPriceNgn * i.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="border-t pt-2" style={{ borderColor: mix(t.text, 12) }}>
              <div style={{ color: t.text }} className="[&_dd]:!text-inherit [&_dt]:!text-inherit">
                <MoneyBreakdown money={orderMoney(order)} audience="customer" discountLabel={order.discount ? discountLineLabel(order.discount) : undefined} />
              </div>
              {order.refunds.length > 0 && (
                <p className="mt-2 flex items-center gap-1.5 text-[13px]" style={muted}>
                  <RotateCcwIcon size={13} aria-hidden /> {tx('Refunded {amount}', { amount: formatNgn(order.refunds.reduce((s, r) => s + r.amountNgn, 0)) })}
                </p>
              )}
            </div>
            <div className="border-t pt-3 text-[13.5px]" style={{ borderColor: mix(t.text, 12) }}>
              <p className="font-semibold">
                {order.fulfilment.method === 'pickup'
                  ? tx('Pickup')
                  : order.fulfilment.method === 'tickets'
                    ? tx('Event tickets')
                    : order.fulfilment.method === 'digital'
                      ? tx('Digital delivery')
                      : tx('Delivery to {zone}', { zone: order.fulfilment.zoneName ?? '' })}
              </p>
              {order.fulfilment.address && <p style={muted}>{order.fulfilment.address}</p>}
              {order.popup && <p style={muted}>{tx('Pop-up pickup · {when}', { when: order.popup.sessionLabel })}</p>}
              {order.popup?.payAtStall && order.paymentStatus === 'pending' && <p className="font-semibold">{tx('Pay at the stall when you collect')}</p>}
              <p style={muted}>
                {order.customer.name} · {order.customer.phone}
                {order.customer.email ? ` · ${order.customer.email}` : ''}
              </p>
              {order.buyerAddress && <p style={muted}>{order.buyerAddress}</p>}
              {order.buyerNote && <p style={muted}>{tx('Your note: “{note}”', { note: order.buyerNote })}</p>}
              {order.backorder && <p className="font-semibold">{tx('Some items ship later — they’re on their way back into stock.')}</p>}
            </div>
            <ReceiptBusinessFooter business={shopSettingsOf(commerce.data).business} fallbackName={page.doc.title} muted={muted} borderColor={mix(t.text, 12)} />
          </section>

          {!pending && !refunded && commerce.data && <LoyaltyReceiptCard theme={t} workspaceId={page.workspaceId ?? null} order={order} data={commerce.data} />}

          {order.instalments && !refunded && <OrderInstalmentsCard theme={t} order={order} workspaceId={page.workspaceId ?? null} apply={commerce.apply} />}

          {order.balance && !pending && !refunded && <OrderBalanceCard theme={t} order={order} data={commerce.data} workspaceId={page.workspaceId ?? null} apply={commerce.apply} />}

          {page.workspaceId && !pending && <EscrowNotice workspaceId={page.workspaceId} handle={handle} orderId={order.id} theme={t} />}

          {order.tickets && order.tickets.length > 0 && !pending && <OrderTickets theme={t} tickets={order.tickets} data={commerce.data} handle={handle} />}

          {order.held && !refunded && (
            <p className="rounded-md px-3 py-2.5 text-[13.5px] font-medium leading-snug" style={{ background: mix(t.text, 6) }}>
              {tx('You’ve joined the group buy. Your order is packed once the goal is reached — if it isn’t reached by the deadline, you’re refunded in full automatically.')}
            </p>
          )}

          {order.referralCode && room && !refunded && (
            <ReferralShareCard
              theme={t}
              handle={handle}
              code={order.referralCode}
              productName={order.items[0]?.name ?? 'this'}
              joinedThroughYou={roomReferrers(commerce.data, handle).find((r) => r.code === order.referralCode)?.joined ?? 0}
              reward={room.referralReward}
              needed={roomStats && room.type === 'goal' && roomStats.remaining > 0 ? roomStats.remaining : null}
            />
          )}

          {order.downloadToken && !pending && !refunded && (
            <Link
              to={`/p/${handle}/download/${order.downloadToken}`}
              className="flex h-12 items-center justify-center gap-2 text-[15px] font-semibold"
              style={{ background: t.accent, color: t.accentText, borderRadius: 999 }}
            >
              <DownloadIcon size={17} aria-hidden /> {tx('Go to your downloads')}
            </Link>
          )}

          {(() => {
            // Gift card codes (D202) appear once the payment is confirmed.
            const codes = (commerce.data?.giftCards ?? []).filter((g) => g.orderId === order.id);
            const hasGiftItems = order.items.some((i) => commerce.data?.products.find((p) => p.id === i.productId)?.giftCard);
            if (!hasGiftItems || refunded) return null;
            return (
              <section aria-labelledby="order-gift-codes" className="p-5" style={{ ...cardStyle(t), borderRadius: 16 }}>
                <h2 id="order-gift-codes" className="flex items-center gap-2 text-[15px] font-semibold">
                  <GiftIcon size={16} aria-hidden /> {tx(codes.length === 1 ? 'Your gift card' : 'Your gift cards')}
                </h2>
                {pending || codes.length === 0 ? (
                  <p className="mt-1.5 text-[13.5px]" style={{ color: t.mutedText }}>
                    {tx('Your code appears here as soon as the payment is confirmed.')}
                  </p>
                ) : (
                  <>
                    <p className="mt-1.5 text-[13.5px]" style={{ color: t.mutedText }}>
                      {tx('Send the code to whoever it’s for. It works at this shop’s checkout; anything left over carries to the next order.')}
                    </p>
                    <ul className="mt-3 flex flex-col gap-2">
                      {codes.map((g) => (
                        <li key={g.id} className="flex items-center justify-between gap-3 rounded-md px-3 py-2.5" style={{ background: mix(t.text, 6) }}>
                          <span className="min-w-0">
                            <span className="block truncate font-mono text-[15px] font-semibold tracking-wide">{g.code}</span>
                            <span className="text-[12.5px]" style={{ color: t.mutedText }}>
                              {tx('{left} left of {total}', { left: formatNgn(g.balanceNgn), total: formatNgn(g.initialNgn) })}
                            </span>
                          </span>
                          <button
                            type="button"
                            onClick={() => navigator.clipboard?.writeText(g.code).catch(() => undefined)}
                            className="flex h-10 shrink-0 items-center gap-1.5 px-3.5 text-[13.5px] font-semibold focus-visible:outline-none focus-visible:ring-2"
                            style={{ ...cardStyle(t), borderRadius: 999 }}
                            aria-label={tx('Copy code {code}', { code: g.code })}
                          >
                            <CopyIcon size={14} aria-hidden /> {tx('Copy')}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </section>
            );
          })()}

          {!pending && !refunded &&
            order.items
              .filter((i) => i.kind === 'course')
              .map((i) => {
                const courseId = commerce.data?.products.find((p) => p.id === i.productId)?.courseId;
                return courseId ? (
                  <Link
                    key={i.productId}
                    to={learnUrl(handle, courseId)}
                    className="flex h-12 items-center justify-center gap-2 text-[15px] font-semibold"
                    style={{ background: t.accent, color: t.accentText, borderRadius: 999 }}
                  >
                    <GraduationCapIcon size={17} aria-hidden /> {tx('Start learning: {name}', { name: i.name })}
                  </Link>
                ) : null;
              })}

          {phone && (
            <a
              href={whatsappLink(phone, `Hi! About my order ${orderRef(order)}…`)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 items-center justify-center gap-2 text-[15px] font-semibold"
              style={{ ...cardStyle(t), borderRadius: 999 }}
            >
              <MessageCircleIcon size={17} aria-hidden /> {tx('Message the seller')}
            </a>
          )}
          <p className="text-[12px] leading-snug" style={muted}>
            {tx('Keep this page or your order number. Refunds and returns are handled by the seller under their policy and Nigerian consumer law.')}
          </p>
        </main>
      </PageSurface>
    </div>
    </LocaleProvider>
  );
}
