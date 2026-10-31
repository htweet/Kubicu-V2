import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useCommerce } from '../../contexts/CommerceContext';
import { useTeam } from '../../contexts/TeamContext';
import { currencies, currencyInfo, formatMoney, type CurrencyCode } from '../../utils/currency';
import { Card } from '../ui/layout/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { InlineAlert } from '../ui/InlineAlert';
import { SelectInput } from '../ui/SelectInput';
import { DemoDataCard } from './DemoDataCard';
import { DemoWorkspaceCard } from './DemoWorkspaceCard';
import { BusinessWhatsAppCard } from './BusinessWhatsAppCard';
import { CountryCard } from './CountryCard';
import { useT } from '../../contexts/LocaleContext';

const nairaOnly = ['USSD at checkout', 'Pay on delivery', 'Pay in instalments', 'Payouts to Nigerian bank accounts'];

/** Settings → Business (D136): the one currency this workspace sells in. */
export function BusinessTab() {
  const { t: tr } = useT();
  const { current, update } = useWorkspace();
  const commerce = useCommerce().data;
  const can = useTeam().can('billing.manage');
  const code: CurrencyCode = current.currency ?? 'NGN';
  const [choice, setChoice] = useState<CurrencyCode>(code);
  const [confirming, setConfirming] = useState(false);

  const paidOrders = useMemo(() => commerce.orders.filter((o) => !o.sample && (o.paymentStatus === 'paid' || o.paymentStatus === 'partially_refunded' || o.paymentStatus === 'refunded')).length, [commerce.orders]);
  const locked = paidOrders > 0;
  const priced = useMemo(() => commerce.products.filter((p) => p.status !== 'archived' && p.kind !== 'ticket' && ((p.priceNgn ?? 0) > 0 || p.variants.some((v) => (v.priceNgn ?? 0) > 0))).length, [commerce.products]);

  const save = () => {
    update(current.id, { currency: choice });
    setConfirming(false);
    toast.success(tr('{workspace} now sells in {currency}', { workspace: current.name, currency: currencyInfo(choice).name }), { description: priced ? tr('Check your priced products ({n}) — amounts were kept as numbers, not converted.', { n: priced }) : tr('New prices you set use it.') });
  };

  return (
    <div className="flex flex-col gap-8">
      <DemoWorkspaceCard />
      <DemoDataCard />
      <CountryCard />
      <BusinessWhatsAppCard />
      <Card id="currency" title="Currency" description="Everything you sell — products, tickets, bookings, subscriptions, payment links — is priced and paid in this one currency. Visitors see the same currency; nothing is converted." emphasis="primary">
        <div className="flex flex-col gap-5">
          {!can.allowed &&
          <InlineAlert tone="info" title="Only the Owner can change this">
              {can.reason}
            </InlineAlert>
          }
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="sm:w-80">
              <SelectInput<CurrencyCode> id="ws-currency" label="Sell in" value={choice} disabled={locked || !can.allowed} onChange={setChoice} options={currencies.map((c) => ({ value: c.code, label: `${c.name} (${c.symbol}) — ${c.country}` }))} />
            </div>
            <Button disabled={locked || !can.allowed || choice === code} onClick={() => setConfirming(true)}>
              Change currency
            </Button>
          </div>

          <p className="text-label text-fg-muted">
            {tr('Example: a price of 12,500 shows as')} <span className="font-semibold tabular-nums text-fg">{formatMoney(12500, choice)}</span>.
          </p>

          {locked ?
          <InlineAlert tone="info" title="Locked after your first paid order">
              {tr('You’ve taken paid orders ({n}) in {currency}. Changing now would make past orders, refunds and payouts stop adding up. To change it, ask KUBICU support from the Help menu.', { n: paidOrders, currency: currencyInfo(code).name })}
            </InlineAlert> :

          <p className="text-caption text-fg-subtle">{tr('You can change this freely until your first paid order. Sample orders don’t count.')}</p>
          }
        </div>
      </Card>

      <Card id="naira-only" title="Only available in naira" description={code === 'NGN' ? 'These work because you sell in naira.' : 'These switch off while you sell in another currency, and customers don’t see them.'}>
        <ul className="flex flex-col gap-2.5">
          {nairaOnly.map((f) =>
          <li key={f} className="flex items-center justify-between gap-4 text-label text-fg">
              {tr(f)}
              <Badge tone={code === 'NGN' ? 'success' : 'neutral'} dot>
                {code === 'NGN' ? 'On' : 'Off'}
              </Badge>
            </li>
          )}
        </ul>
        {code !== 'NGN' && <p className="mt-4 text-caption text-fg-subtle">{tr('Payouts outside Nigeria need a payment partner in your country; the wallet shows a placeholder account until then.')}</p>}
        <p className="mt-4 border-t border-line pt-4 text-caption text-fg-subtle">{tr('KUBICU’s own plan prices are always charged in naira, whatever you sell in.')}</p>
      </Card>

      <Dialog
        open={confirming}
        onClose={() => setConfirming(false)}
        size="sm"
        title={tr('Sell in {currency}?', { currency: currencyInfo(choice).name })}
        description="Prices are kept as numbers and shown in the new currency — they aren’t converted."
        footer={
        <>
            <Button variant="secondary" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
            <Button onClick={save}>{tr('Change to {code}', { code: currencyInfo(choice).code })}</Button>
          </>
        }>
        
        <ul className="flex flex-col gap-2 text-label text-fg-muted">
          <li>
            {tr('A product at 12,500 becomes')} <span className="font-semibold text-fg">{formatMoney(12500, choice)}</span>. {priced > 0 && <span className="font-semibold text-fg">{tr('Check your priced products ({n}).', { n: priced })}</span>}
          </li>
          {choice !== 'NGN' && <li>{tr('USSD, pay on delivery and instalments switch off.')}</li>}
          <li>{tr('It locks after your first paid order.')}</li>
        </ul>
      </Dialog>
    </div>);

}