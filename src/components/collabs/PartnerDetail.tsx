import React, { useState } from 'react';
import { CopyIcon, MessageCircleIcon, PencilIcon, WalletIcon } from 'lucide-react';
import { toast } from 'sonner';
import { partnerStatusLabels, partnerStatusTones, platformLabels, type CommissionLine, type CommissionPayout, type Partner } from '../../utils/collabs';
import { formatNgn, formatTimestamp, whatsappLink } from '../../utils/format';
import { useT } from '../../contexts/LocaleContext';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Segmented } from '../ui/Segmented';
import { InlineAlert } from '../ui/InlineAlert';
import { SampleTag } from '../commerce/StatusBadges';

interface PartnerDetailProps {
  partner: Partner | null;
  lines: CommissionLine[];
  payouts: CommissionPayout[];
  link: string;
  canEdit: boolean;
  /** Why paying from the wallet isn't possible right now, if it isn't. */
  walletBlock: string | null;
  onClose: () => void;
  onEdit: () => void;
  onStatus: (s: Partner['status']) => void;
  onAccept: () => void;
  onPay: (method: 'wallet' | 'outside') => void;
}

const stateTone = { pending: 'neutral', payable: 'success', paid: 'info', void: 'neutral' } as const;
const stateLabel = { pending: 'Pending', payable: 'Payable', paid: 'Paid', void: 'Void' } as const;

/** One referral partner. The invite message and the agreed terms stay English — they're what the partner receives and agreed to. */
export function PartnerDetail({ partner: p, lines, payouts, link, canEdit, walletBlock, onClose, onEdit, onStatus, onAccept, onPay }: PartnerDetailProps) {
  const { t: tr } = useT();
  const [method, setMethod] = useState<'wallet' | 'outside'>('wallet');
  if (!p) return <Sheet open={false} onClose={onClose} title="">{null}</Sheet>;

  const payable = lines.filter((l) => l.state === 'payable').reduce((s, l) => s + l.commissionNgn, 0);
  const invite = `Hi ${p.name.split(' ')[0]}, here’s your partner link: ${link}\n\nTerms: ${p.terms}`;
  const copy = async (text: string, done: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(done);
    } catch {
      toast.error(tr('Couldn’t copy. Select the text and copy it instead.'));
    }
  };
  const effective = method === 'wallet' && walletBlock ? 'outside' : method;

  return (
    <Sheet
      open={!!p}
      onClose={onClose}
      side="right"
      size="lg"
      title={p.name}
      description={`${p.handle ? `${p.handle} · ` : ''}${tr(platformLabels[p.platform])} · ${tr('{n}% commission', { n: p.ratePct })}`}
      headerActions={canEdit ? <Button size="sm" variant="tertiary" leadingIcon={PencilIcon} onClick={onEdit}>{tr('Edit')}</Button> : undefined}>
      
      <div className="flex flex-col gap-8 px-5 py-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={partnerStatusTones[p.status]} dot>
            {tr(partnerStatusLabels[p.status])}
          </Badge>
          {p.sample && <SampleTag />}
          <span className="text-caption text-fg-subtle">{tr('Invited {when}', { when: formatTimestamp(p.invitedAt) })}</span>
        </div>

        {p.status === 'invited' &&
        <InlineAlert
          tone="info"
          title={tr('Waiting for them to accept')}
          action={
          <Button size="sm" variant="secondary" onClick={onAccept} disabled={!canEdit}>
                {tr('Prototype: they accept')}
              </Button>
          }>
          
            {tr('Sales only count once they accept your terms. Send the invite on WhatsApp below.')}
          </InlineAlert>
        }

        <section aria-labelledby="pd-link" className="flex flex-col gap-3">
          <h3 id="pd-link" className="text-label font-semibold text-fg">
            {tr('Their link')}
          </h3>
          <p className="break-all rounded-md border border-line bg-sunken px-3 py-2 font-mono text-caption text-fg">{link}</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" leadingIcon={CopyIcon} onClick={() => copy(link, tr('Link copied'))}>
              {tr('Copy link')}
            </Button>
            <Button size="sm" variant="secondary" leadingIcon={MessageCircleIcon} onClick={() => window.open(whatsappLink(p.phone, invite), '_blank', 'noopener')}>
              {tr('Send invite on WhatsApp')}
            </Button>
          </div>
          <p className="text-caption text-fg-subtle">
            {tr('Terms:')} {p.terms}
          </p>
        </section>

        <section aria-labelledby="pd-pay" className="flex flex-col gap-4 rounded-lg border border-line bg-raised p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 id="pd-pay" className="text-label font-semibold text-fg">
              {tr('Ready to pay')}
            </h3>
            <span className="font-display text-[1.75rem] font-semibold tabular-nums text-fg">{formatNgn(payable)}</span>
          </div>
          <Segmented
            ariaLabel={tr('How to pay')}
            value={effective}
            onChange={setMethod}
            fullWidth
            options={[
            { value: 'wallet', label: tr('From KUBICU wallet') },
            { value: 'outside', label: tr('I paid them myself') }]
            } />
          
          {method === 'wallet' && walletBlock && <p className="text-caption text-warning">{walletBlock}</p>}
          <Button disabled={!canEdit || payable <= 0} leadingIcon={WalletIcon} onClick={() => onPay(effective)}>
            {tr(effective === 'wallet' ? 'Pay {amount} from wallet' : 'Record {amount} as paid', { amount: formatNgn(payable) })}
          </Button>
          <p className="text-caption text-fg-subtle">{tr('Wallet payments are sent to their bank by our licensed payment partner (test mode).')}</p>
        </section>

        <section aria-labelledby="pd-orders" className="flex flex-col gap-3">
          <h3 id="pd-orders" className="text-label font-semibold text-fg">
            {tr('Orders through their link')}
          </h3>
          {lines.length === 0 ?
          <p className="rounded-lg border border-dashed border-line-strong px-4 py-6 text-center text-caption text-fg-muted">{tr('No orders yet. Orders placed from their link show here.')}</p> :

          <ul className="divide-y divide-line rounded-lg border border-line">
              {lines.map((l) =>
            <li key={l.order.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 gap-y-1 px-4 py-3">
                  <span className="min-w-0">
                    <span className="block text-label font-medium text-fg">
                      #{l.order.number} · {l.order.customer.name}
                    </span>
                    <span className="block text-caption text-fg-muted">
                      {formatTimestamp(l.order.createdAt)} · {tr('on {amount}', { amount: formatNgn(l.baseNgn) })} · {tr(l.reason)}
                    </span>
                  </span>
                  <span className="flex flex-col items-end gap-1">
                    <span className="text-label font-semibold tabular-nums text-fg">{formatNgn(l.commissionNgn)}</span>
                    <Badge tone={stateTone[l.state]}>{tr(stateLabel[l.state])}</Badge>
                  </span>
                </li>
            )}
            </ul>
          }
        </section>

        {payouts.length > 0 &&
        <section aria-labelledby="pd-history" className="flex flex-col gap-3">
            <h3 id="pd-history" className="text-label font-semibold text-fg">
              {tr('Payments to them')}
            </h3>
            <ul className="divide-y divide-line rounded-lg border border-line">
              {payouts.map((x) =>
            <li key={x.id} className="flex items-center justify-between gap-4 px-4 py-3">
                  <span className="text-caption text-fg-muted">
                    {formatTimestamp(x.at)} · {x.method === 'wallet' ? tr('From wallet') : tr('Paid outside KUBICU')} · {tr('Orders: {n}', { n: x.orderIds.length })}
                  </span>
                  <span className="text-label font-semibold tabular-nums text-fg">{formatNgn(x.amountNgn)}</span>
                </li>
            )}
            </ul>
          </section>
        }

        {canEdit && p.status !== 'invited' &&
        <div className="flex flex-wrap gap-2 border-t border-line pt-5">
            {p.status === 'active' &&
          <Button size="sm" variant="secondary" onClick={() => onStatus('paused')}>
                {tr('Pause — new sales won’t earn')}
              </Button>
          }
            {p.status === 'paused' &&
          <Button size="sm" variant="secondary" onClick={() => onStatus('active')}>
                {tr('Resume')}
              </Button>
          }
            {p.status !== 'ended' &&
          <Button size="sm" variant="destructive" onClick={() => onStatus('ended')}>
                {tr('End partnership')}
              </Button>
          }
          </div>
        }
      </div>
    </Sheet>);

}