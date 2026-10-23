import React from 'react';
import { Link } from 'react-router-dom';
import { CopyIcon, ExternalLinkIcon, MessageCircleIcon, PauseIcon, PencilIcon, PlayIcon, QrCodeIcon, ArchiveIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { MoneyData, PaymentLink } from '../../types/money';
import { linkMethod, linkTotal, linkView, linkViewLabels, linkViewTones, methodLabels } from '../../utils/money/store';
import { formatNgn, formatTimestamp, whatsappLink } from '../../utils/format';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Stat, StatGroup } from '../ui/layout/Stat';
import { SampleTag } from '../commerce/StatusBadges';

interface PaymentLinkDetailProps {
  link: PaymentLink | null;
  data: MoneyData;
  handle: string;
  canEdit: boolean;
  onClose: () => void;
  onEdit: (l: PaymentLink) => void;
  onStatus: (l: PaymentLink, status: PaymentLink['status']) => void;
}

export const payLinkPath = (handle: string, slug: string) => `/p/${handle}/pay/${slug}`;

/** One payment link: share it, see who paid, pause or archive it (D92). */
export function PaymentLinkDetail({ link, data, handle, canEdit, onClose, onEdit, onStatus }: PaymentLinkDetailProps) {
  if (!link) return <Sheet open={false} onClose={onClose} title="">{null}</Sheet>;
  const view = linkView(link);
  const short = `kub.icu/pay/${link.slug}`;
  const path = payLinkPath(handle, link.slug);
  const total = linkTotal(link);
  const conversion = link.views ? Math.round(link.payments.length / link.views * 100) : 0;
  const shareText = `${link.title}${link.kind === 'fixed' ? ` — ${formatNgn(link.amountNgn)}` : ''}. Pay securely here: https://${short}`;

  return (
    <Sheet
      open={!!link}
      onClose={onClose}
      title={link.title}
      description={`${short} · ${methodLabels[linkMethod(data, link)]}`}
      side="right"
      size="lg"
      footer={
      canEdit ?
      <div className="flex w-full flex-wrap justify-between gap-2">
            <div className="flex gap-2">
              {link.status === 'active' ?
          <Button variant="secondary" leadingIcon={PauseIcon} onClick={() => onStatus(link, 'paused')}>
                  Pause
                </Button> :
          link.status === 'paused' ?
          <Button variant="secondary" leadingIcon={PlayIcon} onClick={() => onStatus(link, 'active')}>
                  Resume
                </Button> :
          null}
              {link.status !== 'archived' &&
          <Button variant="tertiary" leadingIcon={ArchiveIcon} onClick={() => onStatus(link, 'archived')}>
                  Archive
                </Button>
          }
            </div>
            <Button leadingIcon={PencilIcon} onClick={() => onEdit(link)}>
              Edit
            </Button>
          </div> :
      undefined
      }>
      
      <div className="flex flex-col gap-6 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={linkViewTones[view]} dot>
            {linkViewLabels[view]}
          </Badge>
          {link.sample && <SampleTag />}
          <span className="text-caption text-fg-subtle">Created {formatTimestamp(link.createdAt)}</span>
        </div>

        <StatGroup columns={3}>
          <Stat label="Collected" value={formatNgn(total)} hint="Before fees" />
          <Stat label="Payments" value={`${link.payments.length}${link.reusable && link.maxUses ? ` / ${link.maxUses}` : ''}`} />
          <Stat label="Paid after viewing" value={`${conversion}%`} hint={`${link.views} views`} />
        </StatGroup>

        <section aria-labelledby="pl-share" className="flex flex-col gap-3 border-t border-line pt-6">
          <h3 id="pl-share" className="text-label font-semibold text-fg">
            Share
          </h3>
          <div className="flex items-center justify-between gap-3 rounded-md bg-sunken px-4 py-3">
            <span className="truncate text-label font-medium text-fg">{short}</span>
            <Button size="sm" variant="tertiary" leadingIcon={CopyIcon} onClick={() => (void navigator.clipboard?.writeText(`https://${short}`), toast('Link copied'))}>
              Copy
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" leadingIcon={MessageCircleIcon} onClick={() => window.open(whatsappLink('', shareText), '_blank', 'noopener')}>
              WhatsApp
            </Button>
            <Link to="/app/domains/qr" className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line-strong bg-raised px-3 text-label font-medium text-fg transition-colors duration-150 hover:bg-sunken">
              <QrCodeIcon size={15} aria-hidden /> QR code
            </Link>
            <Link to={path} target="_blank" className="inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-label font-medium text-fg-muted transition-colors duration-150 hover:bg-sunken hover:text-fg">
              <ExternalLinkIcon size={15} aria-hidden /> Open payer page
            </Link>
          </div>
        </section>

        <section aria-labelledby="pl-payments" className="flex flex-col gap-3 border-t border-line pt-6">
          <h3 id="pl-payments" className="text-label font-semibold text-fg">
            Payments
          </h3>
          {link.payments.length === 0 ?
          <p className="text-label text-fg-muted">No one has paid yet. Payments show here as they come in.</p> :

          <ul className="divide-y divide-line">
              {link.payments.map((p) =>
            <li key={p.id} className="flex items-start justify-between gap-3 py-3">
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-label font-medium text-fg">
                      {p.payerName || 'Payer'} {p.sample && <SampleTag />}
                    </span>
                    <span className="block truncate text-caption text-fg-subtle">
                      {p.receipt} · {formatTimestamp(p.at)}
                      {p.payerPhone ? ` · ${p.payerPhone}` : ''}
                    </span>
                    {p.items && <span className="block text-caption text-fg-muted">{p.items.map((i) => `${i.qty} × ${i.label}`).join(', ')}</span>}
                    {p.note && <span className="mt-0.5 block text-caption text-fg-muted">“{p.note}”</span>}
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-label font-semibold tabular-nums text-fg">{formatNgn(p.amountNgn)}</span>
                    <span className="text-caption text-fg-subtle">{methodLabels[p.method]}</span>
                  </span>
                </li>
            )}
            </ul>
          }
        </section>
      </div>
    </Sheet>);

}