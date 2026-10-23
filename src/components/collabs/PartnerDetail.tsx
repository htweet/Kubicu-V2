import React, { useState } from 'react';
import { CopyIcon, MessageCircleIcon, PencilIcon, WalletIcon } from 'lucide-react';
import { toast } from 'sonner';
import { partnerStatusLabels, partnerStatusTones, platformLabels, type CommissionLine, type CommissionPayout, type Partner } from '../../utils/collabs';
import { formatNgn, formatTimestamp, whatsappLink } from '../../utils/format';
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

export function PartnerDetail({ partner: p, lines, payouts, link, canEdit, walletBlock, onClose, onEdit, onStatus, onAccept, onPay }: PartnerDetailProps) {
  const [method, setMethod] = useState<'wallet' | 'outside'>('wallet');
  if (!p) return <Sheet open={false} onClose={onClose} title="">{null}</Sheet>;

  const payable = lines.filter((l) => l.state === 'payable').reduce((s, l) => s + l.commissionNgn, 0);
  const invite = `Hi ${p.name.split(' ')[0]}, here’s your partner link: ${link}\n\nTerms: ${p.terms}`;
  const copy = async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${what} copied`);
    } catch {
      toast.error('Couldn’t copy. Select the text and copy it instead.');
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
      description={`${p.handle ? `${p.handle} · ` : ''}${platformLabels[p.platform]} · ${p.ratePct}% commission`}
      headerActions={canEdit ? <Button size="sm" variant="tertiary" leadingIcon={PencilIcon} onClick={onEdit}>Edit</Button> : undefined}>
      
      <div className="flex flex-col gap-8 px-5 py-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={partnerStatusTones[p.status]} dot>
            {partnerStatusLabels[p.status]}
          </Badge>
          {p.sample && <SampleTag />}
          <span className="text-caption text-fg-subtle">Invited {formatTimestamp(p.invitedAt)}</span>
        </div>

        {p.status === 'invited' &&
        <InlineAlert
          tone="info"
          title="Waiting for them to accept"
          action={
          <Button size="sm" variant="secondary" onClick={onAccept} disabled={!canEdit}>
                Prototype: they accept
              </Button>
          }>
          
            Sales only count once they accept your terms. Send the invite on WhatsApp below.
          </InlineAlert>
        }

        <section aria-labelledby="pd-link" className="flex flex-col gap-3">
          <h3 id="pd-link" className="text-label font-semibold text-fg">
            Their link
          </h3>
          <p className="break-all rounded-md border border-line bg-sunken px-3 py-2 font-mono text-caption text-fg">{link}</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" leadingIcon={CopyIcon} onClick={() => copy(link, 'Link')}>
              Copy link
            </Button>
            <Button size="sm" variant="secondary" leadingIcon={MessageCircleIcon} onClick={() => window.open(whatsappLink(p.phone, invite), '_blank', 'noopener')}>
              Send invite on WhatsApp
            </Button>
          </div>
          <p className="text-caption text-fg-subtle">Terms: {p.terms}</p>
        </section>

        <section aria-labelledby="pd-pay" className="flex flex-col gap-4 rounded-lg border border-line bg-raised p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 id="pd-pay" className="text-label font-semibold text-fg">
              Ready to pay
            </h3>
            <span className="font-display text-[1.75rem] font-semibold tabular-nums text-fg">{formatNgn(payable)}</span>
          </div>
          <Segmented
            ariaLabel="How to pay"
            value={effective}
            onChange={setMethod}
            fullWidth
            options={[
            { value: 'wallet', label: 'From KUBICU wallet' },
            { value: 'outside', label: 'I paid them myself' }]
            } />
          
          {method === 'wallet' && walletBlock && <p className="text-caption text-warning">{walletBlock}</p>}
          <Button disabled={!canEdit || payable <= 0} leadingIcon={WalletIcon} onClick={() => onPay(effective)}>
            {effective === 'wallet' ? `Pay ${formatNgn(payable)} from wallet` : `Record ${formatNgn(payable)} as paid`}
          </Button>
          <p className="text-caption text-fg-subtle">Wallet payments are sent to their bank by our licensed payment partner (test mode).</p>
        </section>

        <section aria-labelledby="pd-orders" className="flex flex-col gap-3">
          <h3 id="pd-orders" className="text-label font-semibold text-fg">
            Orders through their link
          </h3>
          {lines.length === 0 ?
          <p className="rounded-lg border border-dashed border-line-strong px-4 py-6 text-center text-caption text-fg-muted">No orders yet. Orders placed from their link show here.</p> :

          <ul className="divide-y divide-line rounded-lg border border-line">
              {lines.map((l) =>
            <li key={l.order.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 gap-y-1 px-4 py-3">
                  <span className="min-w-0">
                    <span className="block text-label font-medium text-fg">
                      #{l.order.number} · {l.order.customer.name}
                    </span>
                    <span className="block text-caption text-fg-muted">
                      {formatTimestamp(l.order.createdAt)} · on {formatNgn(l.baseNgn)} · {l.reason}
                    </span>
                  </span>
                  <span className="flex flex-col items-end gap-1">
                    <span className="text-label font-semibold tabular-nums text-fg">{formatNgn(l.commissionNgn)}</span>
                    <Badge tone={stateTone[l.state]}>{stateLabel[l.state]}</Badge>
                  </span>
                </li>
            )}
            </ul>
          }
        </section>

        {payouts.length > 0 &&
        <section aria-labelledby="pd-history" className="flex flex-col gap-3">
            <h3 id="pd-history" className="text-label font-semibold text-fg">
              Payments to them
            </h3>
            <ul className="divide-y divide-line rounded-lg border border-line">
              {payouts.map((x) =>
            <li key={x.id} className="flex items-center justify-between gap-4 px-4 py-3">
                  <span className="text-caption text-fg-muted">
                    {formatTimestamp(x.at)} · {x.method === 'wallet' ? 'From wallet' : 'Paid outside KUBICU'} · {x.orderIds.length} order{x.orderIds.length === 1 ? '' : 's'}
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
                Pause — new sales won’t earn
              </Button>
          }
            {p.status === 'paused' &&
          <Button size="sm" variant="secondary" onClick={() => onStatus('active')}>
                Resume
              </Button>
          }
            {p.status !== 'ended' &&
          <Button size="sm" variant="destructive" onClick={() => onStatus('ended')}>
                End partnership
              </Button>
          }
          </div>
        }
      </div>
    </Sheet>);

}