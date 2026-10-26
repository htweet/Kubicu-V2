import React, { useState } from 'react';
import { toast } from 'sonner';
import { CopyIcon, EyeIcon, GiftIcon, MoreHorizontalIcon, PlusIcon, PowerIcon, Trash2Icon } from 'lucide-react';
import type { GiftCard } from '../../types/commerce';
import { useCommerce } from '../../contexts/CommerceContext';
import { usePlan } from '../../contexts/PlanContext';
import { plans, planAtLeast } from '../../data/plans';
import { DEFAULT_GIFT_AMOUNTS, GIFT_CARD_PLAN, GIFT_CARD_PRODUCT_ID, giftCardState, giftCardStateLabels, setGiftCardStatus, upsertGiftCardProduct, type GiftCardState } from '../../utils/commerce/sellModes';
import { formatNgn } from '../../utils/format';
import { PageHeader } from '../../components/shell/PageHeader';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/IconButton';
import { Badge, type BadgeTone } from '../../components/ui/Badge';
import { Menu } from '../../components/ui/Menu';
import { EmptyState } from '../../components/ui/EmptyState';
import { Segmented } from '../../components/ui/Segmented';
import { Switch } from '../../components/ui/Switch';
import { InlineAlert } from '../../components/ui/InlineAlert';
import { UpgradeButton } from '../../components/ui/UpgradeButton';
import { CurrencyInput } from '../../components/ui/CurrencyInput';
import { Stat, StatGroup } from '../../components/ui/layout/Stat';
import { Card } from '../../components/ui/layout/Card';
import { List } from '../../components/ui/layout/ListRow';
import { SampleTag } from '../../components/commerce/StatusBadges';
import { IssueGiftCardDialog } from '../../components/commerce/IssueGiftCardDialog';
import { GiftCardDetail } from '../../components/commerce/GiftCardDetail';

type Tab = 'active' | 'used' | 'off';
const tone: Record<GiftCardState, BadgeTone> = { active: 'success', used: 'neutral', expired: 'warning', disabled: 'neutral' };
const tabOf = (s: GiftCardState): Tab => s === 'active' ? 'active' : s === 'used' ? 'used' : 'off';
const MAX_AMOUNTS = 6;

/** Commerce → Gift cards: sell cards in the shop, issue them by hand and follow balances (D202). */
export function GiftCards() {
  const { data, apply } = useCommerce();
  const plan = usePlan();
  const allowed = planAtLeast(plan.id, GIFT_CARD_PLAN);
  const [tab, setTab] = useState<Tab>('active');
  const [issuing, setIssuing] = useState(false);
  const [viewing, setViewing] = useState<GiftCard | null>(null);
  const [newAmount, setNewAmount] = useState<number | null>(null);

  const cards = data.giftCards ?? [];
  const product = data.products.find((p) => p.id === GIFT_CARD_PRODUCT_ID);
  const selling = product?.status === 'active';
  const amounts = product ? product.variants.map((v) => v.priceNgn ?? 0).filter((a) => a > 0) : DEFAULT_GIFT_AMOUNTS;

  const counts: Record<Tab, number> = { active: 0, used: 0, off: 0 };
  cards.forEach((c) => counts[tabOf(giftCardState(c))]++);
  const shown = cards.filter((c) => tabOf(giftCardState(c)) === tab);
  const outstanding = cards.filter((c) => giftCardState(c) === 'active').reduce((s, c) => s + c.balanceNgn, 0);
  const sold = cards.filter((c) => c.source === 'sold').reduce((s, c) => s + c.initialNgn, 0);
  const redeemed = cards.reduce((s, c) => s + c.uses.reduce((x, u) => x + u.amountNgn, 0), 0);

  const setAmounts = (next: number[], active = !!selling) => apply((d) => upsertGiftCardProduct(d, next, active));
  const toggleSelling = (on: boolean) => {
    if (setAmounts(amounts.length ? amounts : DEFAULT_GIFT_AMOUNTS, on)) toast.success(on ? 'Gift cards are on sale in your shop' : 'Gift cards are hidden from your shop', { description: on ? 'Buyers get their code on the order page once payment is confirmed.' : 'Codes already sold still work.' });
  };
  const addAmount = () => {
    if (!newAmount || newAmount < 500) return toast.error('Enter at least ₦500');
    if (amounts.includes(newAmount)) return toast.error(`${formatNgn(newAmount)} is already there`);
    if (setAmounts([...amounts, newAmount])) setNewAmount(null);
  };

  const copy = (code: string) => {
    navigator.clipboard?.writeText(code).catch(() => undefined);
    toast.success(`${code} copied`);
  };

  const issueButton =
  <Button leadingIcon={PlusIcon} disabled={!allowed} onClick={() => setIssuing(true)}>
      Issue a gift card
    </Button>;


  return (
    <>
      <PageHeader
        title="Gift cards"
        description="Sell gift cards in your shop or issue them by hand. Each code works at your checkout until its balance runs out; what’s left carries over to the next order."
        actions={issueButton} />
      

      {!allowed &&
      <InlineAlert tone="info" title={`Gift cards are on ${plans[GIFT_CARD_PLAN].name}`} className="mt-6" action={<UpgradeButton plan={GIFT_CARD_PLAN} feature="Gift cards" />}>
          They’re sold and spent through your checkout. Codes you already have keep working.
        </InlineAlert>
      }

      <section aria-labelledby="gc-sell" className="mt-8 border-b border-line pb-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-md">
            <h2 id="gc-sell" className="text-heading font-semibold text-fg">
              Sell in your shop
            </h2>
            <p className="mt-1 text-label text-fg-muted">A “Gift card” product with the amounts below. It needs no delivery and can’t be paid for with another gift card.</p>
            <div className="mt-4">
              <Switch id="gc-selling" label="Gift cards on sale" checked={!!selling} disabled={!allowed} onChange={toggleSelling} />
            </div>
          </div>
          <div className="w-full lg:max-w-sm">
            <p className="text-label font-medium text-fg">Amounts</p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {amounts.map((a) =>
              <li key={a} className="inline-flex h-10 items-center gap-0.5 rounded-full border border-line-strong pl-3.5 pr-0.5 text-label font-medium tabular-nums text-fg">
                  {formatNgn(a)}
                  <button
                  type="button"
                  aria-label={`Remove ${formatNgn(a)}`}
                  disabled={!allowed || amounts.length <= 1}
                  onClick={() => setAmounts(amounts.filter((x) => x !== a))}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-fg-subtle transition-colors duration-150 hover:bg-sunken hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-40">
                  
                    <Trash2Icon size={12} aria-hidden />
                  </button>
                </li>
              )}
            </ul>
            {amounts.length < MAX_AMOUNTS &&
            <div className="mt-3 flex items-end gap-2">
                <div className="min-w-0 flex-1">
                  <CurrencyInput id="gc-new-amount" label="Add an amount" value={newAmount} disabled={!allowed} onChange={setNewAmount} />
                </div>
                <Button variant="secondary" disabled={!allowed || !newAmount} onClick={addAmount}>
                  Add
                </Button>
              </div>
            }
          </div>
        </div>
      </section>

      {cards.length === 0 ?
      <EmptyState
        framed
        className="mt-8"
        icon={GiftIcon}
        title="No gift cards yet"
        description="Cards appear here when someone buys one in your shop, or when you issue one by hand."
        action={allowed ? issueButton : undefined} /> :


      <>
          <StatGroup columns={3} className="mt-8 items-end border-b border-line pb-6">
            <Stat primary label="Unspent balance" value={formatNgn(outstanding)} hint="What your active cards can still pay for" />
            <Stat label="Sold in your shop" value={formatNgn(sold)} />
            <Stat label="Spent at checkout" value={formatNgn(redeemed)} />
          </StatGroup>

          <div className="mt-8 max-w-full overflow-x-auto overflow-y-hidden">
            <Segmented<Tab>
            ariaLabel="Show gift cards"
            value={tab}
            onChange={setTab}
            options={[
            { value: 'active', label: `Active · ${counts.active}` },
            { value: 'used', label: `Used · ${counts.used}` },
            { value: 'off', label: `Off · ${counts.off}` }]
            } />
          
          </div>

          {shown.length === 0 ?
        <p className="mt-6 rounded-lg border border-dashed border-line-strong px-5 py-8 text-center text-label text-fg-muted">Nothing here right now.</p> :

        <Card as="div" body="flush" className="mt-4">
              <List label="Gift cards">
                {shown.map((c) => {
              const state = giftCardState(c);
              const pct = c.initialNgn ? Math.round(c.balanceNgn / c.initialNgn * 100) : 0;
              return (
                <li key={c.id} className="flex items-center gap-4 px-5 py-4 md:px-6">
                      <button type="button" onClick={() => setViewing(c)} className="min-w-0 flex-1 rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="truncate font-mono text-label font-semibold text-fg">{c.code}</span>
                          {c.sample && <SampleTag />}
                          {state !== 'active' && <Badge tone={tone[state]}>{giftCardStateLabels[state]}</Badge>}
                        </span>
                        <span className="mt-0.5 block truncate text-caption text-fg-subtle">
                          {c.source === 'sold' ? `Bought by ${c.buyerName}${c.orderNumber ? ` · #${c.orderNumber}` : ''}` : `Issued by you${c.recipientName ? ` for ${c.recipientName}` : ''}`}
                          {c.uses.length ? ` · used on ${c.uses.length} order${c.uses.length === 1 ? '' : 's'}` : ''}
                        </span>
                      </button>
                      <div className="w-28 shrink-0 text-right sm:w-40">
                        <p className="text-caption tabular-nums text-fg">
                          <span className="font-semibold">{formatNgn(c.balanceNgn)}</span> <span className="hidden text-fg-subtle sm:inline">of {formatNgn(c.initialNgn)}</span>
                        </p>
                        <div className="mt-1.5 hidden h-1.5 overflow-hidden rounded-full bg-sunken sm:block" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={`${pct}% of the balance left`}>
                          <div className="h-full rounded-full bg-action" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      <Menu
                    align="end"
                    trigger={(p) => <IconButton {...p} icon={MoreHorizontalIcon} label={`Actions for ${c.code}`} variant="ghost" />}
                    items={[
                    { id: 'view', label: 'View history', icon: EyeIcon, onSelect: () => setViewing(c) },
                    { id: 'copy', label: 'Copy code', icon: CopyIcon, onSelect: () => copy(c.code) },
                    c.status === 'active' ?
                    { id: 'off', label: 'Turn off', icon: PowerIcon, destructive: true, onSelect: () => apply((d) => setGiftCardStatus(d, c.id, 'disabled')) && toast(`${c.code} turned off`, { description: 'It can’t be used at checkout until you turn it back on.' }) } :
                    { id: 'on', label: 'Turn back on', icon: PowerIcon, onSelect: () => apply((d) => setGiftCardStatus(d, c.id, 'active')) && toast.success(`${c.code} turned back on`) }]
                    } />
                  
                    </li>);

            })}
              </List>
            </Card>
        }
        </>
      }

      <IssueGiftCardDialog open={issuing} onClose={() => setIssuing(false)} />
      <GiftCardDetail card={viewing ? cards.find((c) => c.id === viewing.id) ?? viewing : null} onClose={() => setViewing(null)} />
    </>);

}