import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeftIcon, CopyIcon, DownloadIcon, FileIcon, LockIcon, ShieldCheckIcon } from 'lucide-react';
import { ensureLicenceKeys } from '../utils/commerce/licence';
import { useResolvedPage } from '../hooks/useResolvedPage';
import { usePageCommerce } from '../hooks/usePageCommerce';
import { useVisitorLang } from '../hooks/useVisitorLang';
import { LocaleProvider, translatorFor } from '../contexts/LocaleContext';
import { PageSurface } from '../components/blocks/PageSurface';
import { VisitorLanguageRow } from '../components/blocks/VisitorLanguageRow';
import { buttonStyle, cardStyle, mix } from '../components/blocks/pageStyle';
import { CheckoutHeading, TestModeNote } from '../components/checkout/checkoutUi';
import { checkDownload, recordDownload } from '../utils/commerce/ops';
import { formatBytes } from '../utils/commerce/catalog';
import { copyLabel, watermarkKind } from '../utils/commerce/watermark';
import { WatermarkPreview } from '../components/commerce/WatermarkPreview';
import { formatTimestamp } from '../utils/format';
import { Unavailable } from './PublicPage';

const blocked = {
  revoked: 'Access was removed because this order was refunded or cancelled.',
  limit: 'You’ve used all your downloads for this file. Ask the seller if you need another.',
  expired: 'This download link has expired. Ask the seller for a new one.',
  not_ready: 'The seller is updating this file. Try again shortly.',
  pending: 'Downloads unlock once your payment is confirmed.',
} as const;

/** The buyer’s secure download page. Counts each download against the seller’s limit. Follows the visitor's language (D133). */
export function DownloadPage() {
  const { handle = '', token = '' } = useParams();
  const page = useResolvedPage(handle);
  const commerce = usePageCommerce(page?.workspaceId ?? null, !!page?.isOwn);
  const [lang, setLang] = useVisitorLang(page?.doc.language);
  const tx = translatorFor(lang);
  const order = commerce.data?.orders.find((o) => o.downloadToken === token);
  const [justDownloaded, setJustDownloaded] = useState<string | null>(null);
  // Licence keys (D125) are issued the first time a paid buyer opens their downloads.
  useEffect(() => {
    if (!order) return;
    const needs = order.items.some((i) => i.kind === 'digital' && commerce.data?.products.find((p) => p.id === i.productId)?.digital?.keys?.enabled && !(order.licenceKeys ?? []).some((k) => k.productId === i.productId));
    if (needs) commerce.apply((d) => ensureLicenceKeys(d, order.id));
  }, [order?.id, order?.paymentStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!page) return <Unavailable handle={handle} />;
  if (!order) return <Unavailable handle={handle} title={tx('This download link isn’t valid')} body={tx('Check you copied the whole link from your receipt, or contact the seller.')} />;

  const t = page.doc.theme;
  const muted = { color: t.mutedText };
  const items = order.items.filter((i) => i.kind === 'digital');

  return (
    <LocaleProvider lang={lang} setLang={setLang}>
    <div className="min-h-screen w-full" style={{ background: t.background }}>
      <PageSurface theme={t} header={<VisitorLanguageRow theme={t} />}>
        <main className="flex flex-col gap-5 py-6">
          <Link to={`/p/${handle}/order/${order.id}`} className="inline-flex items-center gap-1.5 self-start text-[14px] font-medium" style={muted}>
            <ArrowLeftIcon size={15} aria-hidden /> {tx('Order #{n}', { n: order.number })}
          </Link>
          <CheckoutHeading level={1} theme={t} sub={tx('For {name}. Please don’t share this link — downloads are counted.', { name: order.customer.name })}>
            {tx('Your downloads')}
          </CheckoutHeading>
          <TestModeNote theme={t} />
          <ul className="flex flex-col gap-3">
            {items.map((i) => {
              const product = commerce.data?.products.find((p) => p.id === i.productId);
              if (!product?.digital) {
                return (
                  <li key={i.productId} className="p-4 text-[14px]" style={cardStyle(t)}>
                    {tx('{name} is no longer available from this seller. Contact them for help.', { name: i.name })}
                  </li>
                );
              }
              const check = checkDownload(order, product);
              const asset = product.digital;
              return (
                <li key={i.productId} className="flex flex-col gap-3 p-4" style={cardStyle(t)}>
                  <div className="flex items-start gap-3">
                    <span aria-hidden className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md" style={{ background: mix(t.text, 6) }}>
                      <FileIcon size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-semibold">{i.name}</p>
                      <p className="text-[12.5px]" style={muted}>
                        {asset.fileName} · {formatBytes(asset.sizeBytes)} · {tx('version {v}', { v: asset.version })}
                      </p>
                      {check.ok && (
                        <p className="text-[12.5px]" style={muted}>
                          {check.remaining === null ? tx('Unlimited downloads') : tx(check.remaining === 1 ? '{n} download left' : '{n} downloads left', { n: check.remaining })}
                          {check.expiresAt ? ` · ${tx('link works until {when}', { when: formatTimestamp(check.expiresAt) })}` : ''}
                        </p>
                      )}
                    </div>
                  </div>
                  {check.ok ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (commerce.apply((d) => recordDownload(d, order.id, product.id))) setJustDownloaded(product.id);
                      }}
                      className="flex h-11 items-center justify-center gap-2 text-[14.5px] font-semibold"
                      style={buttonStyle(t, 'featured')}
                    >
                      <DownloadIcon size={16} aria-hidden /> {tx('Download')}
                    </button>
                  ) : (
                    <p className="flex items-start gap-2 rounded-md px-3 py-2.5 text-[13.5px]" style={{ background: mix(t.text, 6) }} role="status">
                      <LockIcon size={14} className="mt-0.5 shrink-0" aria-hidden />
                      {tx(blocked[check.reason])}
                    </p>
                  )}
                  {justDownloaded === product.id && (
                    <p className="text-[12.5px]" style={muted} role="status">
                      {tx('Prototype: the file isn’t stored, so nothing downloads — but this counted as one download.')}
                    </p>
                  )}
                  {check.ok && watermarkKind(asset) && (
                    <div className="flex flex-col gap-2 rounded-md p-3" style={{ background: mix(t.text, 4) }}>
                      <WatermarkPreview theme={t} kind={watermarkKind(asset)!} label={copyLabel(order)} title={i.name} />
                      <p className="text-[12.5px]" style={muted}>
                        {watermarkKind(asset) === 'pdf' ? tx('Your copy is stamped “{stamp}” on every page.', { stamp: copyLabel(order) }) : tx('Your copy carries a faint “{stamp}” mark, so a shared copy points back to this order.', { stamp: copyLabel(order) })}
                      </p>
                    </div>
                  )}
                  {(order.licenceKeys ?? []).filter((k) => k.productId === i.productId).map((k) => (
                    <div key={k.id} className="flex flex-col gap-1 rounded-md px-3 py-2.5" style={{ background: mix(t.text, 5), opacity: k.status === 'revoked' ? 0.6 : 1 }}>
                      <span className="text-[12px] font-medium" style={muted}>{tx(k.status === 'revoked' ? 'Licence key — no longer valid' : 'Your licence key')}</span>
                      <span className="flex items-center justify-between gap-2">
                        <code className="select-all font-mono text-[15px] font-semibold tracking-wide" style={{ color: t.text, textDecoration: k.status === 'revoked' ? 'line-through' : undefined }}>{k.key}</code>
                        {k.status === 'active' && (
                          <button type="button" onClick={() => navigator.clipboard?.writeText(k.key)} aria-label={tx('Copy licence key {key}', { key: k.key })} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-2" style={{ color: t.text }}>
                            <CopyIcon size={14} aria-hidden />
                          </button>
                        )}
                      </span>
                      {k.status === 'active' && <span className="text-[11.5px]" style={muted}>{tx(k.activationsAllowed === 1 ? 'Works on up to {n} device. Keep it private.' : 'Works on up to {n} devices. Keep it private.', { n: k.activationsAllowed })}</span>}
                    </div>
                  ))}
                  {asset.licence && (
                    <p className="flex items-start gap-1.5 text-[12px]" style={muted}>
                      <ShieldCheckIcon size={12} className="mt-0.5 shrink-0" aria-hidden />
                      {asset.licence}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </main>
      </PageSurface>
    </div>
    </LocaleProvider>
  );
}
