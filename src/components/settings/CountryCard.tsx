import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { CountryCode } from '../../types/country';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useCommerce } from '../../contexts/CommerceContext';
import { useTeam } from '../../contexts/TeamContext';
import { useT } from '../../contexts/LocaleContext';
import { countries, paymentOptionLabels } from '../../data/countries';
import { countryInfo, workspaceCountry } from '../../utils/country';
import { currencyInfo, formatMoney } from '../../utils/currency';
import { Card } from '../ui/layout/Card';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { InlineAlert } from '../ui/InlineAlert';
import { SelectInput } from '../ui/SelectInput';

/**
 * Settings → Business → Country (D352). The country sets sensible defaults — currency, phone code,
 * regions, banks and checkout options. Nothing is locked: the currency can still be changed below,
 * and switching country never touches existing orders or prices.
 */
export function CountryCard() {
  const { t: tr } = useT();
  const { current, update } = useWorkspace();
  const commerce = useCommerce().data;
  const can = useTeam().can('billing.manage');
  const code = workspaceCountry(current);
  const [choice, setChoice] = useState<CountryCode>(code);
  const [confirming, setConfirming] = useState(false);

  // The currency locks after the first paid order (D136); the country can still change.
  const paidOrders = useMemo(() => commerce.orders.filter((o) => !o.sample && (o.paymentStatus === 'paid' || o.paymentStatus === 'partially_refunded' || o.paymentStatus === 'refunded')).length, [commerce.orders]);
  const currencyLocked = paidOrders > 0;

  const now = countryInfo(code);
  const next = countryInfo(choice);
  const currentCurrency = current.currency ?? 'NGN';
  const currencyWillChange = !currencyLocked && next.currency !== currentCurrency;

  const save = () => {
    update(current.id, { country: choice, ...(currencyWillChange ? { currency: next.currency } : {}) });
    setConfirming(false);
    toast.success(tr('{workspace} now sells from {country}', { workspace: current.name, country: tr(next.name) }), {
      description: currencyWillChange ? tr('Prices now show in {currency}. Amounts were kept as numbers, not converted.', { currency: tr(currencyInfo(next.currency).name) }) : tr('New phone numbers, addresses and checkouts use it.')
    });
  };

  return (
    <Card id="country" title="Country" description="Where your business sells from. It sets the currency, phone code, address regions, banks and how customers can pay. You can still change the currency afterwards." emphasis="primary">
      <div className="flex flex-col gap-5">
        {!can.allowed &&
        <InlineAlert tone="info" title="Only the Owner can change this">
            {can.reason}
          </InlineAlert>
        }
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="sm:w-80">
            <SelectInput<CountryCode> id="ws-country" required label="Sells from" value={choice} disabled={!can.allowed} onChange={setChoice} options={countries.map((c) => ({ value: c.code, label: tr(c.name) }))} />
          </div>
          <Button disabled={!can.allowed || choice === code} onClick={() => setConfirming(true)}>
            Change country
          </Button>
        </div>

        <dl className="grid gap-x-8 gap-y-3 text-label sm:grid-cols-2">
          <Fact term={tr('Phone code')} value={`+${now.dialCode}`} />
          <Fact term={tr('Addresses use')} value={tr(now.regionLabel)} />
          <Fact term={tr('Customers can pay with')} value={now.payments.map((p) => tr(paymentOptionLabels[p])).join(' · ')} />
          <Fact term={tr('VAT guide')} value={`${now.vatPct}%`} />
        </dl>
        <p className="text-caption text-fg-subtle">{tr('Payment options, banks and VAT are example figures in this prototype. Payments outside Nigeria are simulated.')}</p>
      </div>

      <Dialog
        open={confirming}
        onClose={() => setConfirming(false)}
        size="sm"
        title={tr('Sell from {country}?', { country: tr(next.name) })}
        description="This only changes defaults for new things. Existing orders, prices and contacts stay exactly as they are."
        footer={
        <>
            <Button variant="secondary" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
            <Button onClick={save}>{tr('Change to {country}', { country: tr(next.name) })}</Button>
          </>
        }>
        
        <ul className="flex flex-col gap-2 text-label text-fg-muted">
          <li>
            {currencyWillChange ?
            <>
                {tr('Currency becomes {currency}: 12,500 shows as', { currency: tr(currencyInfo(next.currency).name) })} <span className="font-semibold tabular-nums text-fg">{formatMoney(12500, next.currency)}</span>.
              </> :
            currencyLocked && next.currency !== currentCurrency ?
            tr('Your currency stays {currency}, because you’ve already taken paid orders in it.', { currency: tr(currencyInfo(currentCurrency).name) }) :

            tr('Your currency stays {currency}.', { currency: tr(currencyInfo(currentCurrency).name) })
            }
          </li>
          <li>{tr('New phone numbers start with +{code}.', { code: next.dialCode })}</li>
          <li>{tr('Addresses ask for a {region}.', { region: tr(next.regionLabel).toLowerCase() })}</li>
          <li>{tr('Checkout offers: {options}.', { options: next.payments.map((p) => tr(paymentOptionLabels[p])).join(', ') })}</li>
          {next.currency !== now.currency &&
          <li>{tr('Your KUBICU plan is billed in {currency} from your next renewal, at that day’s rate. The current period isn’t charged again.', { currency: tr(currencyInfo(next.currency).name) })}</li>
          }
        </ul>
      </Dialog>
    </Card>);

}

function Fact({ term, value }: {term: string;value: string;}) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="text-caption text-fg-subtle">{term}</dt>
      <dd className="text-fg">{value}</dd>
    </div>);

}