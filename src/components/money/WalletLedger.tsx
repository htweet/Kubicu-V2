import React, { useMemo, useState } from 'react';
import { ArrowDownLeftIcon, ArrowUpRightIcon, DownloadIcon, LandmarkIcon } from 'lucide-react';
import type { LedgerEntry, LedgerKind, LedgerState, MoneyData, PayoutStatus } from '../../types/money';
import { formatNgn, formatTimestamp } from '../../utils/format';
import { cn } from '../../utils/cn';
import { Card } from '../ui/layout/Card';
import { Tabs } from '../ui/Tabs';
import { Segmented } from '../ui/Segmented';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { SampleTag } from '../commerce/StatusBadges';

type Tab = 'activity' | 'payouts';
type StateFilter = 'all' | LedgerState;

const kindLabels: Record<LedgerKind, string> = {
  sale: 'Sale',
  link: 'Payment link',
  milestone: 'Milestone',
  escrow_release: 'Escrow release',
  refund: 'Refund',
  fee: 'Fee',
  payout: 'Payout',
  payout_returned: 'Payout returned',
  commission: 'Commission',
  topup: 'Top-up'
};
const stateLabels: Record<LedgerState, string> = { available: 'Available', pending: 'Settling', held: 'In escrow', reserved: 'Reserved' };
const stateTones = { available: 'success', pending: 'neutral', held: 'info', reserved: 'warning' } as const;
const payoutLabels: Record<PayoutStatus, string> = { processing: 'Processing', on_hold: 'On hold', paid: 'Paid', failed: 'Returned' };
const payoutTones = { processing: 'info', on_hold: 'warning', paid: 'success', failed: 'danger' } as const;

/** Wallet history: every credit and debit with a running balance, and payouts on their own tab (D92). */
export function WalletLedger({ data }: {data: MoneyData;}) {
  const [tab, setTab] = useState<Tab>('activity');
  const [filter, setFilter] = useState<StateFilter>('all');

  // Running balance of everything that has reached the wallet, oldest first.
  const rows = useMemo(() => {
    const sorted = [...data.ledger].sort((a, b) => a.at.localeCompare(b.at));
    let running = 0;
    const withBalance = sorted.map((e) => {
      running += e.amountNgn;
      return { entry: e, balance: running };
    });
    return withBalance.reverse();
  }, [data.ledger]);

  const shown = filter === 'all' ? rows : rows.filter((r) => r.entry.state === filter);

  const exportCsv = () => {
    const lines = [['Date', 'Type', 'Description', 'Status', 'Amount (NGN)', 'Balance (NGN)'].join(',')];
    rows.forEach(({ entry, balance }) => lines.push([entry.at, kindLabels[entry.kind], `"${entry.label.replace(/"/g, '""')}"`, stateLabels[entry.state], entry.amountNgn, balance].join(',')));
    const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kubicu-wallet.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card
      title="History"
      body="flush"
      actions={
      <Button size="sm" variant="tertiary" leadingIcon={DownloadIcon} onClick={exportCsv} disabled={!rows.length}>
          Export CSV
        </Button>
      }>
      
      <div className="px-5 md:px-6">
        <Tabs
          ariaLabel="Wallet history"
          idPrefix="wallet"
          value={tab}
          onChange={setTab}
          items={[
          { id: 'activity', label: 'Activity' },
          { id: 'payouts', label: 'Payouts', badge: data.payouts.filter((p) => p.status === 'processing' || p.status === 'on_hold').length || undefined }]
          } />
        
      </div>

      <div role="tabpanel" id={`wallet-panel-${tab}`} aria-labelledby={`wallet-tab-${tab}`}>
        {tab === 'activity' ?
        <>
            <div className="scroll-quiet overflow-x-auto px-5 pt-4 md:px-6">
              <Segmented<StateFilter>
              size="sm"
              ariaLabel="Filter by status"
              value={filter}
              onChange={setFilter}
              options={[
              { value: 'all', label: 'All' },
              { value: 'available', label: 'Available' },
              { value: 'pending', label: 'Settling' },
              { value: 'held', label: 'In escrow' }]
              } />
            
            </div>
            {shown.length === 0 ?
          <EmptyState className="m-5" icon={LandmarkIcon} title="Nothing here yet" description="Sales paid into your wallet or through escrow appear here, with payouts and fees." /> :

          <ul className="mt-3 divide-y divide-line border-t border-line">
                {shown.slice(0, 60).map(({ entry, balance }) =>
            <LedgerRow key={entry.id} entry={entry} balance={balance} />
            )}
              </ul>
          }
          </> :
        data.payouts.length === 0 ?
        <EmptyState className="m-5" icon={LandmarkIcon} title="No payouts yet" description="When you pay out, each transfer to your bank shows here with its status." /> :

        <ul className="mt-3 divide-y divide-line border-t border-line">
            {data.payouts.map((p) =>
          <li key={p.id} className="flex items-center gap-3 px-5 py-3.5 md:px-6">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-sunken text-fg-muted">
                  <ArrowUpRightIcon size={16} aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-label font-semibold text-fg">{p.bankLabel}</span>
                    {p.auto && <Badge tone="neutral">Scheduled</Badge>}
                    {p.sample && <SampleTag />}
                  </span>
                  <span className="block truncate text-caption text-fg-subtle">
                    {formatTimestamp(p.createdAt)} · by {p.by}
                    {p.feeNgn ? ` · fee ${formatNgn(p.feeNgn)}` : ' · no fee'}
                  </span>
                  {(p.failureReason || p.holdReason) && <span className="mt-0.5 block text-caption text-fg-muted">{p.failureReason ?? `KUBICU is checking this payout: ${p.holdReason}`}</span>}
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-label font-semibold tabular-nums text-fg">{formatNgn(p.amountNgn)}</span>
                  <Badge tone={payoutTones[p.status]} dot>
                    {payoutLabels[p.status]}
                  </Badge>
                </span>
              </li>
          )}
          </ul>
        }
      </div>
    </Card>);

}

function LedgerRow({ entry, balance }: {entry: LedgerEntry;balance: number;}) {
  const credit = entry.amountNgn >= 0;
  return (
    <li className="flex items-center gap-3 px-5 py-3.5 md:px-6">
      <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-md', credit ? 'bg-success-soft text-success' : 'bg-sunken text-fg-muted')}>
        {credit ? <ArrowDownLeftIcon size={16} aria-hidden /> : <ArrowUpRightIcon size={16} aria-hidden />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="truncate text-label font-medium text-fg">{entry.label}</span>
          {entry.sample && <SampleTag />}
        </span>
        <span className="block truncate text-caption text-fg-subtle">
          {kindLabels[entry.kind]} · {formatTimestamp(entry.at)}
          {entry.state !== 'available' && entry.availableAt ? ` · available ${formatTimestamp(entry.availableAt)}` : ''}
        </span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1">
        <span className={cn('text-label font-semibold tabular-nums', credit ? 'text-fg' : 'text-fg-muted')}>
          {credit ? '+' : '−'}
          {formatNgn(Math.abs(entry.amountNgn))}
        </span>
        <span className="flex items-center gap-2">
          {entry.state !== 'available' && <Badge tone={stateTones[entry.state]}>{stateLabels[entry.state]}</Badge>}
          <span className="hidden text-caption tabular-nums text-fg-subtle sm:inline">Bal. {formatNgn(balance)}</span>
        </span>
      </span>
    </li>);

}