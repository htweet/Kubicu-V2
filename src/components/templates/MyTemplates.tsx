import React, { useState } from 'react';
import { toast } from 'sonner';
import { BanknoteIcon, EyeOffIcon, LayoutTemplateIcon, PencilIcon, PlusIcon, RotateCcwIcon, StarIcon } from 'lucide-react';
import type { ListingStatus, TemplateListing } from '../../types/templateListing';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useTeam } from '../../contexts/TeamContext';
import { PAYOUT_MIN_NGN, REFUND_DAYS, averageStars, earnings, listingEvent, useTemplateStore } from '../../utils/templateListings';
import { uid } from '../../utils/id';
import { formatNgn, formatTimestamp } from '../../utils/format';
import { Button } from '../ui/Button';
import { Badge, type BadgeTone } from '../ui/Badge';
import { Dialog } from '../ui/Dialog';
import { TextInput } from '../ui/TextInput';
import { EmptyState } from '../ui/EmptyState';
import { InlineAlert } from '../ui/InlineAlert';
import { TestModeStrip } from '../commerce/TestModeStrip';
import { TemplateThumb } from './TemplateThumb';
import { SellTemplateDialog } from './SellTemplateDialog';
import { Stat, StatGroup } from '../ui/layout/Stat';

const statusInfo: Record<ListingStatus, {label: string;tone: BadgeTone;}> = {
  in_review: { label: 'In review', tone: 'info' },
  changes_requested: { label: 'Changes requested', tone: 'warning' },
  listed: { label: 'Listed', tone: 'success' },
  rejected: { label: 'Not approved', tone: 'danger' },
  unlisted: { label: 'Unlisted', tone: 'neutral' }
};

/** Templates → My templates: listings, sales, earnings and payouts (D70). Owner and Admins. */
export function MyTemplates({ sellOpen, setSellOpen }: {sellOpen: boolean;setSellOpen: (v: boolean) => void;}) {
  const { current } = useWorkspace();
  const team = useTeam();
  const can = team.can('extensions.manage');
  const [store, update] = useTemplateStore();
  const [editing, setEditing] = useState<TemplateListing | null>(null);
  const [payoutOpen, setPayoutOpen] = useState(false);
  const account = store.accounts[current.id];
  const [bank, setBank] = useState({ bankName: account?.bankName ?? '', accountNumber: account?.accountNumber ?? '', accountName: account?.accountName ?? current.name });
  const mine = store.listings.filter((l) => l.workspaceId === current.id);
  const money = earnings(store, current.id);
  const myIds = new Set(mine.map((l) => l.id));
  const sales = store.sales.filter((s) => myIds.has(s.listingId));
  const payouts = store.payouts.filter((p) => p.workspaceId === current.id);

  if (!can.allowed) {
    return <InlineAlert tone="info" title="Only the Owner and Admins can sell templates">{can.reason}</InlineAlert>;
  }

  const setListed = (l: TemplateListing, listed: boolean) =>
  update((s) => ({ ...s, listings: s.listings.map((x) => x.id === l.id ? { ...x, status: listed ? 'listed' : 'unlisted', events: [listingEvent(listed ? 'Listed again' : 'Unlisted by the creator', 'creator'), ...x.events] } : x) })) &&
  toast(listed ? 'Listed again' : 'Unlisted', { description: listed ? 'Buyers can find it in Templates.' : 'Buyers can’t find it any more. People who bought it keep it.' });

  const requestPayout = () => {
    const digits = bank.accountNumber.replace(/\D/g, '');
    if (!bank.bankName.trim() || digits.length !== 10 || !bank.accountName.trim()) return toast.error('Check the bank details', { description: 'Bank name, a 10-digit account number and the account name.' });
    const amount = money.available;
    update((s) => ({
      ...s,
      accounts: { ...s.accounts, [current.id]: { bankName: bank.bankName.trim(), accountNumber: digits, accountName: bank.accountName.trim() } },
      payouts: amount >= PAYOUT_MIN_NGN ? [{ id: uid('pout'), workspaceId: current.id, amountNgn: amount, bankName: bank.bankName.trim(), accountLast4: digits.slice(-4), at: new Date().toISOString() }, ...s.payouts] : s.payouts
    }));
    if (amount >= PAYOUT_MIN_NGN) {
      team.log('settings', `requested a template earnings payout of ${formatNgn(amount)}`, '/app/templates?tab=mine');
      toast.success(`${formatNgn(amount)} on its way (test mode)`, { description: `To ${bank.bankName} •••• ${digits.slice(-4)}. Usually 1–2 working days in production.` });
    } else toast.success('Bank details saved');
    setPayoutOpen(false);
  };

  return (
    <div className="flex flex-col gap-8">
      <TestModeStrip />

      <div className="flex flex-col gap-5 border-b border-line pb-6 lg:flex-row lg:items-end lg:justify-between">
        <StatGroup columns={3} className="flex-1 items-end">
          <Stat primary label="Available to pay out" value={formatNgn(money.available)} hint={`Minimum ${formatNgn(PAYOUT_MIN_NGN)} (example)`} />
          <Stat label="Pending" value={formatNgn(money.pending)} hint={`Inside the ${REFUND_DAYS}-day refund window`} />
          <Stat label="Earned all time" value={formatNgn(money.lifetime)} hint={`${money.salesCount} sale${money.salesCount === 1 ? '' : 's'} · you keep 70%`} />
        </StatGroup>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button variant="secondary" leadingIcon={BanknoteIcon} disabled={!team.can('billing.manage').allowed} onClick={() => setPayoutOpen(true)}>
            {money.available >= PAYOUT_MIN_NGN ? 'Pay out' : 'Payout account'}
          </Button>
          <Button leadingIcon={PlusIcon} onClick={() => setSellOpen(true)}>
            Sell a template
          </Button>
        </div>
      </div>

      {mine.length === 0 ?
      <EmptyState icon={LayoutTemplateIcon} title="You haven’t listed a template yet" description="Turn one of your spaces into a template. KUBICU removes your details, reviews it, then lists it with your name on it." action={<Button leadingIcon={PlusIcon} onClick={() => setSellOpen(true)}>Sell a template</Button>} /> :

      <ul className="flex flex-col divide-y divide-line rounded-lg border border-line bg-raised">
          {mine.map((l) => {
          const doc = l.listedDoc ?? l.pendingDoc;
          const lSales = sales.filter((s) => s.listingId === l.id && !s.refundedAt);
          const avg = averageStars(l);
          return (
            <li key={l.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start">
                <div className="shrink-0 self-start overflow-hidden rounded-[12px] border border-line">{doc && <TemplateThumb doc={doc} width={84} height={130} />}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-label font-semibold text-fg">{l.name}</h3>
                    <Badge tone={statusInfo[l.status].tone} dot>
                      {statusInfo[l.status].label}
                    </Badge>
                    {l.pendingVersion && l.status === 'listed' && <Badge tone="info">v{l.pendingVersion} in review</Badge>}
                  </div>
                  <p className="mt-0.5 text-caption text-fg-subtle">
                    {l.category} · {l.region} · {l.priceNgn ? formatNgn(l.priceNgn) : 'Free'}
                    {l.listedVersion ? ` · v${l.listedVersion} on sale` : ''}
                  </p>
                  {l.reviewNote && (l.status === 'changes_requested' || l.status === 'rejected') &&
                <p className="mt-2 rounded-md bg-warning-soft px-3 py-2 text-caption text-fg">
                      <span className="font-semibold">KUBICU review: </span>
                      {l.reviewNote}
                    </p>
                }
                  <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-caption text-fg-muted">
                    <span>{lSales.length} sale{lSales.length === 1 ? '' : 's'}</span>
                    <span>{formatNgn(lSales.reduce((t, s) => t + s.creatorShareNgn, 0))} earned</span>
                    {avg !== null &&
                  <span className="flex items-center gap-1">
                        <StarIcon size={12} className="fill-current text-warning" aria-hidden /> {avg} ({l.reviews.length})
                      </span>
                  }
                    <span>Updated {formatTimestamp(l.events[0]?.at ?? l.submittedAt)}</span>
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {l.status !== 'rejected' &&
                <Button size="sm" variant="secondary" leadingIcon={PencilIcon} onClick={() => setEditing(l)}>
                      {l.status === 'changes_requested' ? 'Fix and resubmit' : 'Update'}
                    </Button>
                }
                  {l.status === 'listed' &&
                <Button size="sm" variant="tertiary" leadingIcon={EyeOffIcon} onClick={() => setListed(l, false)}>
                      Unlist
                    </Button>
                }
                  {l.status === 'unlisted' && l.listedDoc &&
                <Button size="sm" variant="tertiary" leadingIcon={RotateCcwIcon} onClick={() => setListed(l, true)}>
                      List again
                    </Button>
                }
                </div>
              </li>);

        })}
        </ul>
      }

      {(sales.length > 0 || payouts.length > 0) &&
      <div className="grid gap-8 lg:grid-cols-2">
          <section aria-labelledby="tpl-sales">
            <h2 id="tpl-sales" className="text-label font-semibold text-fg">
              Sales
            </h2>
            <ul className="mt-2 divide-y divide-line rounded-lg border border-line bg-raised">
              {sales.slice(0, 12).map((s) =>
            <li key={s.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-label">
                  <span className="min-w-0">
                    <span className="block truncate text-fg">{s.buyerName}</span>
                    <span className="block text-caption text-fg-subtle">
                      {mine.find((l) => l.id === s.listingId)?.name} · v{s.version} · {formatTimestamp(s.at)}
                    </span>
                  </span>
                  <span className={s.refundedAt ? 'tabular-nums text-fg-subtle line-through' : 'tabular-nums text-fg'}>+{formatNgn(s.creatorShareNgn)}</span>
                </li>
            )}
              {sales.length === 0 && <li className="px-4 py-3 text-caption text-fg-muted">No sales yet.</li>}
            </ul>
          </section>
          <section aria-labelledby="tpl-payouts">
            <h2 id="tpl-payouts" className="text-label font-semibold text-fg">
              Payouts
            </h2>
            <ul className="mt-2 divide-y divide-line rounded-lg border border-line bg-raised">
              {payouts.map((p) =>
            <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-label">
                  <span>
                    {p.bankName} •••• {p.accountLast4}
                    <span className="block text-caption text-fg-subtle">{formatTimestamp(p.at)} · test mode</span>
                  </span>
                  <span className="tabular-nums text-fg">{formatNgn(p.amountNgn)}</span>
                </li>
            )}
              {payouts.length === 0 && <li className="px-4 py-3 text-caption text-fg-muted">No payouts yet.</li>}
            </ul>
          </section>
        </div>
      }

      <SellTemplateDialog open={sellOpen || !!editing} listing={editing} onClose={() => {setSellOpen(false);setEditing(null);}} />

      <Dialog
        open={payoutOpen}
        onClose={() => setPayoutOpen(false)}
        title={money.available >= PAYOUT_MIN_NGN ? `Pay out ${formatNgn(money.available)}` : 'Payout account'}
        description={money.available >= PAYOUT_MIN_NGN ? 'Sent to this account. Test mode — no money moves.' : `Save your account now. Payouts open once ${formatNgn(PAYOUT_MIN_NGN)} has cleared the ${REFUND_DAYS}-day refund window.`}
        footer={
        <>
            <Button variant="secondary" onClick={() => setPayoutOpen(false)}>
              Cancel
            </Button>
            <Button onClick={requestPayout}>{money.available >= PAYOUT_MIN_NGN ? 'Pay out' : 'Save'}</Button>
          </>
        }>
        
        <div className="flex flex-col gap-4">
          <TextInput id="po-bank" label="Bank" value={bank.bankName} placeholder="e.g. GTBank" onChange={(e) => setBank((b) => ({ ...b, bankName: e.target.value }))} />
          <TextInput id="po-acct" label="Account number" inputMode="numeric" value={bank.accountNumber} placeholder="10 digits" onChange={(e) => setBank((b) => ({ ...b, accountNumber: e.target.value }))} />
          <TextInput id="po-name" label="Account name" value={bank.accountName} onChange={(e) => setBank((b) => ({ ...b, accountName: e.target.value }))} hint="Must match your business name in production." />
        </div>
      </Dialog>
    </div>);

}