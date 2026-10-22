import React, { useMemo, useState } from 'react';
import { CreditCardIcon, DownloadIcon, HistoryIcon, LayersIcon, ReceiptIcon } from 'lucide-react';
import type { BillingEvent, BillingEventKind, Invoice } from '../../types/billing';
import { formatDate } from '../../utils/billing';
import { downloadCsv, toCsv } from '../../utils/csv';
import { Button } from '../ui/Button';
import { Segmented } from '../ui/Segmented';
import { EmptyState } from '../ui/EmptyState';
import { cn } from '../../utils/cn';

type Filter = 'all' | BillingEventKind;

const kindIcon = { plan: LayersIcon, payment: ReceiptIcon, card: CreditCardIcon } as const;
const toneDot: Record<NonNullable<BillingEvent['tone']>, string> = {
  neutral: 'bg-fg-subtle',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger'
};

interface Props {
  history: BillingEvent[];
  invoices: Invoice[];
  workspaceName: string;
  onOpenInvoice: (invoice: Invoice) => void;
}

/** Plan & billing → Subscription history (D68): a dated record of every change, newest first. */
export function BillingHistory({ history, invoices, workspaceName, onOpenInvoice }: Props) {
  const [filter, setFilter] = useState<Filter>('all');
  const [showAll, setShowAll] = useState(false);
  const list = useMemo(() => history.filter((e) => filter === 'all' || e.kind === filter), [history, filter]);
  const shown = showAll ? list : list.slice(0, 8);
  const invoiceById = useMemo(() => new Map(invoices.map((i) => [i.id, i])), [invoices]);

  const exportCsv = () => {
    const csv = toCsv(
      ['Date', 'Type', 'What happened', 'Details', 'By', 'Invoice', 'Sample'],
      list.map((e) => [e.at.slice(0, 16).replace('T', ' '), e.kind, e.text, e.detail ?? '', e.actor, e.invoiceId ? invoiceById.get(e.invoiceId)?.number ?? '' : '', e.sample ? 'yes' : ''])
    );
    downloadCsv(`kubicu-subscription-history-${workspaceName.toLowerCase().replace(/\W+/g, '-')}.csv`, csv);
  };

  return (
    <section aria-labelledby="billing-history" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="billing-history" className="text-label font-semibold text-fg">
          Subscription history
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <Segmented<Filter>
            ariaLabel="Filter history"
            size="sm"
            value={filter}
            onChange={(v) => {
              setFilter(v);
              setShowAll(false);
            }}
            options={[
            { value: 'all', label: 'All' },
            { value: 'plan', label: 'Plan' },
            { value: 'payment', label: 'Payments' },
            { value: 'card', label: 'Card' }]
            } />
          
          {list.length > 0 &&
          <Button size="sm" variant="tertiary" leadingIcon={DownloadIcon} onClick={exportCsv}>
              Export CSV
            </Button>
          }
        </div>
      </div>

      {list.length === 0 ?
      <EmptyState icon={HistoryIcon} title={history.length === 0 ? 'Nothing has happened yet' : 'Nothing of this type'} description={history.length === 0 ? 'Trials, plan changes, renewals and card updates are recorded here as they happen.' : 'Try another filter.'} /> :

      <ol className="relative flex flex-col rounded-lg border border-line bg-raised px-4 py-2">
          {shown.map((e, i) => {
          const Icon = kindIcon[e.kind];
          const inv = e.invoiceId ? invoiceById.get(e.invoiceId) : undefined;
          const prev = shown[i - 1];
          const newDay = !prev || prev.at.slice(0, 10) !== e.at.slice(0, 10);
          return (
            <li key={e.id} className={cn('grid grid-cols-[88px_20px_minmax(0,1fr)] gap-x-3 py-3 sm:grid-cols-[110px_20px_minmax(0,1fr)_auto]', i > 0 && 'border-t border-line')}>
                <span className={cn('pt-0.5 text-caption tabular-nums', newDay ? 'text-fg-muted' : 'text-transparent')} aria-hidden={!newDay}>
                  {formatDate(e.at)}
                </span>
                <span className="relative flex justify-center pt-1">
                  <span className={cn('h-2 w-2 rounded-full', toneDot[e.tone ?? 'neutral'])} aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-label font-medium text-fg">
                    <Icon size={14} className="shrink-0 text-fg-subtle" aria-hidden />
                    <span className="min-w-0">{e.text}</span>
                  </p>
                  {e.detail && <p className="mt-0.5 text-caption text-fg-muted">{e.detail}</p>}
                  <p className="mt-0.5 text-caption text-fg-subtle">
                    {new Date(e.at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} · {e.actor}
                    {e.sample && ' · sample'}
                  </p>
                  {inv &&
                <button type="button" onClick={() => onOpenInvoice(inv)} className="mt-1 rounded-sm text-caption font-medium text-action hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus sm:hidden">
                      Invoice {inv.number}
                    </button>
                }
                </div>
                <div className="hidden sm:block">
                  {inv &&
                <Button size="sm" variant="tertiary" leadingIcon={ReceiptIcon} onClick={() => onOpenInvoice(inv)}>
                      {inv.number}
                    </Button>
                }
                </div>
              </li>);

        })}
        </ol>
      }
      {list.length > 8 &&
      <Button size="sm" variant="tertiary" className="self-start" onClick={() => setShowAll((v) => !v)}>
          {showAll ? 'Show fewer' : `Show all ${list.length}`}
        </Button>
      }
    </section>);

}