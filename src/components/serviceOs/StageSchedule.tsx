import React from 'react';
import { CopyIcon, MessageCircleIcon, SendIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { Quote, ServiceOsData } from '../../types/serviceOs';
import { invoicePayPath, requestStage, stageRows, stageStateLabels, stageStateTones } from '../../utils/milestones';
import { formatDay, itemsTotal } from '../../utils/serviceOs';
import { formatNgn, whatsappLink } from '../../utils/format';
import { useMainLink } from '../../hooks/useMainLink';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface Props {
  quote: Quote;
  data: ServiceOsData;
  businessName: string;
  canEdit: boolean;
  update: (fn: (d: ServiceOsData) => ServiceOsData) => void;
  onOpenInvoice?: (id: string) => void;
  headingId: string;
}

/** Where each payment stage is, with "Request payment" for due stages and a pay link for requested ones (D95). */
export function StageSchedule({ quote, data, businessName, canEdit, update, onOpenInvoice, headingId }: Props) {
  const { mainHandle } = useMainLink();
  const rows = stageRows(data, quote);
  const total = itemsTotal(quote.items);
  const paid = rows.reduce((s, r) => s + r.paid, 0);
  const payUrl = (invoiceId: string) => `${window.location.origin}${invoicePayPath(mainHandle, invoiceId)}`;

  const sendLink = (invoiceId: string, label: string, amount: number) => {
    const msg = `Hi ${quote.client.name.split(' ')[0]}, the “${label}” stage for ${quote.title} is now due (${formatNgn(amount)}). You can pay securely here: ${payUrl(invoiceId)} — thank you! ${businessName}`;
    window.open(whatsappLink(quote.client.phone, msg), '_blank', 'noopener');
  };

  const request = (stageId: string, label: string, amount: number) => {
    let id = '';
    update((d) => {
      const r = requestStage(d, quote.id, stageId);
      if (!r) return d;
      id = r.invoice.id;
      return r.data;
    });
    if (!id) return toast.error('Couldn’t request this stage', { description: 'It may already have been requested.' });
    navigator.clipboard?.writeText(payUrl(id)).catch(() => undefined);
    toast.success(`“${label}” requested`, { description: 'Pay link copied — send it to your client.', action: quote.client.phone ? { label: 'WhatsApp', onClick: () => sendLink(id, label, amount) } : undefined });
  };

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <h3 id={headingId} className="text-label font-semibold text-fg">
          Payment stages
        </h3>
        <span className="text-caption tabular-nums text-fg-muted">
          {formatNgn(paid)} of {formatNgn(total)} paid
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-sunken" aria-hidden>
        <div className="h-full rounded-full bg-success" style={{ width: `${total ? Math.min(100, paid / total * 100) : 0}%` }} />
      </div>
      <ol className="flex flex-col divide-y divide-line rounded-lg border border-line">
        {rows.map((r, i) =>
        <li key={r.m.id} className="flex flex-col gap-2.5 p-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sunken text-caption font-semibold tabular-nums text-fg">{i + 1}</span>
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-label font-medium text-fg">
                  {r.m.label}
                  <Badge tone={stageStateTones[r.state]} dot>
                    {stageStateLabels[r.state]}
                  </Badge>
                </p>
                <p className="mt-0.5 text-caption text-fg-muted">
                  {r.m.pct}% · {formatNgn(r.amount)} · {r.when}
                  {r.invoice && r.state !== 'paid' && ` · due ${formatDay(r.invoice.dueDate)}`}
                  {r.state === 'part_paid' && ` · ${formatNgn(r.paid)} in`}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2 pl-9 sm:pl-0">
              {r.state === 'due' &&
            <Button size="sm" leadingIcon={SendIcon} disabled={!canEdit} onClick={() => request(r.m.id, r.m.label, r.amount)}>
                  Request payment
                </Button>
            }
              {r.state === 'upcoming' && quote.status === 'accepted' &&
            <Button size="sm" variant="tertiary" disabled={!canEdit} onClick={() => request(r.m.id, r.m.label, r.amount)} title="Ask for this stage before it’s due">
                  Request early
                </Button>
            }
              {r.invoice && (r.state === 'requested' || r.state === 'part_paid') &&
            <>
                  <Button size="sm" variant="secondary" leadingIcon={CopyIcon} onClick={() => navigator.clipboard?.writeText(payUrl(r.invoice!.id)).then(() => toast.success('Pay link copied'))}>
                    Pay link
                  </Button>
                  {quote.client.phone &&
              <Button size="sm" variant="secondary" leadingIcon={MessageCircleIcon} onClick={() => sendLink(r.invoice!.id, r.m.label, r.amount - r.paid)}>
                      Send
                    </Button>
              }
                </>
            }
              {r.invoice && onOpenInvoice &&
            <Button size="sm" variant="tertiary" onClick={() => onOpenInvoice(r.invoice!.id)}>
                  {r.invoice.number}
                </Button>
            }
            </div>
          </li>
        )}
      </ol>
    </section>);

}