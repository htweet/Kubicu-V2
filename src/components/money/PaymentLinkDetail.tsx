import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CopyIcon, DownloadIcon, ExternalLinkIcon, MessageCircleIcon, PauseIcon, PencilIcon, PlayIcon, QrCodeIcon, ArchiveIcon } from 'lucide-react';
import { Dialog } from '../ui/Dialog';
import { TextInput } from '../ui/TextInput';
import { downloadCsv, toCsv } from '../../utils/csv';
import { confirmPendingTransfer, linkPaymentRows, markTransferNotReceived, refundLinkPart } from '../../utils/money/linkCheckout';
import { toast } from 'sonner';
import type { MoneyData, PaymentLink } from '../../types/money';
import { linkMethod, linkTotal, linkView, linkViewLabels, linkViewTones, methodLabels } from '../../utils/money/store';
import { formatNgn, formatTimestamp, whatsappLink } from '../../utils/format';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Stat, StatGroup } from '../ui/layout/Stat';
import { SampleTag } from '../commerce/StatusBadges';
import { useT } from '../../contexts/LocaleContext';

interface PaymentLinkDetailProps {
  link: PaymentLink | null;
  data: MoneyData;
  handle: string;
  canEdit: boolean;
  onClose: () => void;
  onEdit: (l: PaymentLink) => void;
  onStatus: (l: PaymentLink, status: PaymentLink['status']) => void;
  /** Writes money data: confirm transfers, refunds (D224). */
  onUpdate: (fn: (d: MoneyData) => MoneyData) => void;
}

export const payLinkPath = (handle: string, slug: string) => `/p/${handle}/pay/${slug}`;

/** One payment link: share it, see who paid, pause or archive it (D92). */
export function PaymentLinkDetail({ link, data, handle, canEdit, onClose, onEdit, onStatus, onUpdate }: PaymentLinkDetailProps) {
  const { t: tr } = useT();
  const [refunding, setRefunding] = useState<{ id: string; max: number; amount: string; reason: string } | null>(null);
  if (!link) return <Sheet open={false} onClose={onClose} title="">{null}</Sheet>;
  const pending = link.pendingTransfers ?? [];
  const refundAmount = Number(refunding?.amount ?? 0);
  const refundOk = !!refunding && refundAmount > 0 && refundAmount <= refunding.max;
  const view = linkView(link);
  const short = `kub.icu/pay/${link.slug}`;
  const path = payLinkPath(handle, link.slug);
  const total = linkTotal(link);
  const conversion = link.views ? Math.round((link.payments.length / link.views) * 100) : 0;
  const shareText = `${link.title}${link.kind === 'fixed' ? ` — ${formatNgn(link.amountNgn)}` : ''}. Pay securely here: https://${short}`;

  return (
    <Sheet
      open={!!link}
      onClose={onClose}
      title={link.title}
      description={`${short} · ${tr(methodLabels[linkMethod(data, link)])}`}
      side="right"
      size="lg"
      footer={
        canEdit ? (
          <div className="flex w-full flex-wrap justify-between gap-2">
            <div className="flex gap-2">
              {link.status === 'active' ? (
                <Button variant="secondary" leadingIcon={PauseIcon} onClick={() => onStatus(link, 'paused')}>
                  Pause
                </Button>
              ) : link.status === 'paused' ? (
                <Button variant="secondary" leadingIcon={PlayIcon} onClick={() => onStatus(link, 'active')}>
                  Resume
                </Button>
              ) : null}
              {link.status !== 'archived' && (
                <Button variant="tertiary" leadingIcon={ArchiveIcon} onClick={() => onStatus(link, 'archived')}>
                  Archive
                </Button>
              )}
            </div>
            <Button leadingIcon={PencilIcon} onClick={() => onEdit(link)}>
              Edit
            </Button>
          </div>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-6 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={linkViewTones[view]} dot>
            {linkViewLabels[view]}
          </Badge>
          {link.sample && <SampleTag />}
          <span className="text-caption text-fg-subtle">{tr('Created {date}', { date: formatTimestamp(link.createdAt) })}</span>
        </div>

        <StatGroup columns={3}>
          <Stat label="Collected" value={formatNgn(total)} hint="Before fees" />
          <Stat label="Payments" value={`${link.payments.length}${link.reusable && link.maxUses ? ` / ${link.maxUses}` : ''}`} />
          <Stat label="Paid after viewing" value={`${conversion}%`} hint={tr('{n} views', { n: link.views })} />
        </StatGroup>

        <section aria-labelledby="pl-share" className="flex flex-col gap-3 border-t border-line pt-6">
          <h3 id="pl-share" className="text-label font-semibold text-fg">
            {tr('Share')}
          </h3>
          <div className="flex items-center justify-between gap-3 rounded-md bg-sunken px-4 py-3">
            <span className="truncate text-label font-medium text-fg">{short}</span>
            <Button size="sm" variant="tertiary" leadingIcon={CopyIcon} onClick={() => (void navigator.clipboard?.writeText(`https://${short}`), toast(tr('Link copied')))}>
              Copy
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" leadingIcon={MessageCircleIcon} onClick={() => window.open(whatsappLink('', shareText), '_blank', 'noopener')}>
              WhatsApp
            </Button>
            <Link to="/app/qr" className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line-strong bg-raised px-3 text-label font-medium text-fg transition-colors duration-150 hover:bg-sunken">
              <QrCodeIcon size={15} aria-hidden /> {tr('QR code')}
            </Link>
            <Link to={path} target="_blank" className="inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-label font-medium text-fg-muted transition-colors duration-150 hover:bg-sunken hover:text-fg">
              <ExternalLinkIcon size={15} aria-hidden /> {tr('Open payer page')}
            </Link>
          </div>
        </section>

        {pending.length > 0 && (
          <section aria-labelledby="pl-pending" className="flex flex-col gap-3 border-t border-line pt-6">
            <h3 id="pl-pending" className="flex items-center gap-2 text-label font-semibold text-fg">
              {tr('Waiting for you to confirm')} <Badge tone="warning">{pending.filter((x) => x.status === 'waiting').length}</Badge>
            </h3>
            <p className="-mt-1 text-caption text-fg-muted">{tr('Payers say they transferred to your own account. Check your bank app before confirming.')}</p>
            <ul className="divide-y divide-line rounded-md border border-line">
              {pending.map((x) => (
                <li key={x.id} className="flex flex-col gap-2 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="min-w-0">
                    <span className="block text-label font-medium text-fg">
                      {x.payment.payerName || tr('Payer')} · {formatNgn(x.payment.amountNgn)}
                    </span>
                    <span className="block text-caption text-fg-subtle">
                      {formatTimestamp(x.at)}
                      {x.payment.transferTo ? ` · ${x.payment.transferTo.bank} ${x.payment.transferTo.account.slice(-4)}` : ''}
                      {x.status === 'not_received' ? ` · ${tr('marked not received')}` : ''}
                    </span>
                  </span>
                  {canEdit && (
                    <span className="flex shrink-0 gap-2">
                      <Button size="sm" onClick={() => (onUpdate((d) => confirmPendingTransfer(d, link.id, x.id)), toast(tr('Payment confirmed'), { description: tr('A receipt was issued and it now counts towards the link.') }))}>
                        Confirm received
                      </Button>
                      {x.status === 'waiting' && (
                        <Button size="sm" variant="tertiary" onClick={() => onUpdate((d) => markTransferNotReceived(d, link.id, x.id))}>
                          Not received
                        </Button>
                      )}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="pl-payments" className="flex flex-col gap-3 border-t border-line pt-6">
          <div className="flex items-center justify-between gap-3">
            <h3 id="pl-payments" className="text-label font-semibold text-fg">
              {tr('Payments')}
            </h3>
            {link.payments.length > 0 && (
              <Button
                size="sm"
                variant="tertiary"
                leadingIcon={DownloadIcon}
                onClick={() => {
                  const [head, ...rows] = linkPaymentRows(link);
                  downloadCsv(`kubicu-${link.slug}-payments.csv`, toCsv(head.map(String), rows));
                }}
              >
                Export CSV
              </Button>
            )}
          </div>
          {link.payments.length === 0 ? (
            <p className="text-label text-fg-muted">{tr('No one has paid yet. Payments show here as they come in.')}</p>
          ) : (
            <ul className="divide-y divide-line">
              {link.payments.map((p) => {
                const left = p.amountNgn - (p.refundedNgn ?? 0);
                const extra = [p.payerEmail, p.payerAddress].filter(Boolean).join(' · ');
                return (
                  <li key={p.id} className="flex items-start justify-between gap-3 py-3">
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 text-label font-medium text-fg">
                        {p.payerName || tr('Payer')} {p.sample && <SampleTag />}
                      </span>
                      <span className="block truncate text-caption text-fg-subtle">
                        {p.receipt} · {formatTimestamp(p.at)}
                        {p.payerPhone ? ` · ${p.payerPhone}` : ''}
                      </span>
                      {extra && <span className="block text-caption text-fg-subtle">{extra}</span>}
                      {p.items && <span className="block text-caption text-fg-muted">{p.items.map((i) => `${i.qty} × ${i.label}`).join(', ')}</span>}
                      {p.answers?.map((a) => (
                        <span key={a.label} className="block text-caption text-fg-muted">
                          {a.label}: <span className="text-fg">{a.value}</span>
                        </span>
                      ))}
                      {p.note && <span className="mt-0.5 block text-caption text-fg-muted">“{p.note}”</span>}
                      {!!p.refundedNgn && (
                        <span className="mt-0.5 block text-caption font-medium text-fg">
                          {tr('Refunded {amount}', { amount: formatNgn(p.refundedNgn) })}
                          {p.refundReason ? ` — ${p.refundReason}` : ''}
                        </span>
                      )}
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-1">
                      <span className="text-label font-semibold tabular-nums text-fg">{formatNgn(p.amountNgn)}</span>
                      <span className="text-caption text-fg-subtle">
                        {[p.feeNgn ? tr('incl. {fee} fee', { fee: formatNgn(p.feeNgn) }) : '', tr(methodLabels[p.method])].filter(Boolean).join(' · ')}
                      </span>
                      {canEdit && left > 0 && !p.sample && !link.fundraiser && (
                        <Button size="sm" variant="tertiary" onClick={() => setRefunding({ id: p.id, max: left, amount: String(left), reason: '' })}>
                          Refund
                        </Button>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
      <Dialog
        open={!!refunding}
        onClose={() => setRefunding(null)}
        size="sm"
        title="Refund this payment?"
        description="The payer gets the money back to how they paid (test mode). Your processing fee isn’t returned."
        footer={
          <>
            <Button variant="secondary" onClick={() => setRefunding(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!refundOk}
              onClick={() => {
                if (!refunding || !refundOk) return;
                onUpdate((d) => refundLinkPart(d, link.id, refunding.id, refundAmount, refunding.reason));
                toast(tr('Refund of {amount} sent (test mode)', { amount: formatNgn(refundAmount) }));
                setRefunding(null);
              }}
            >
              {refundOk ? tr('Refund {amount}', { amount: formatNgn(refundAmount) }) : tr('Refund')}
            </Button>
          </>
        }
      >
        {refunding && (
          <div className="flex flex-col gap-4">
            <TextInput id="pl-ref-amt" label="Amount" inputMode="numeric" value={refunding.amount} hint={tr('Up to {amount}.', { amount: formatNgn(refunding.max) })} error={refunding.amount && !refundOk ? tr('Enter an amount up to {amount}.', { amount: formatNgn(refunding.max) }) : undefined} onChange={(e) => setRefunding({ ...refunding, amount: e.target.value.replace(/\D/g, '') })} />
            <TextInput id="pl-ref-why" label="Reason" optional placeholder={tr('e.g. Class cancelled')} value={refunding.reason} onChange={(e) => setRefunding({ ...refunding, reason: e.target.value.slice(0, 120) })} />
          </div>
        )}
      </Dialog>
    </Sheet>
  );
}
