import React from 'react';
import { useShopSection } from '../../../hooks/useShopSection';
import { Switch } from '../../ui/Switch';
import { Field } from '../../ui/Field';
import { Segmented } from '../../ui/Segmented';
import { TextInput } from '../../ui/TextInput';
import { SettingsSection } from './SettingsSection';
import { formatNgn } from '../../../utils/format';
import { defaultShopSettings, shopSettingsOf, taxNumberLabels, vatFor, vatRateLabel } from '../../../utils/commerce/shopSettings';
import { activeCountry, activeCountryInfo } from '../../../utils/country';
import { countries } from '../../../data/countries';
import type { CountryCode } from '../../../types/country';
import type { TaxRegistration } from '../../../types/commerce';

const EXAMPLE_PRICE = 10000;

const taxNumberLabel = taxNumberLabels;

/**
 * Tax (D222, extended D435): your own rate, prices with or without tax, your tax number, and the other countries
 * you're registered in. Buyers abroad pay that country's rate only where you're registered; otherwise no tax is added.
 */
export function TaxSection() {
  const s = useShopSection('tax', 'Tax settings saved');
  const t = s.draft;
  const home = activeCountry();
  const homeInfo = activeCountryInfo();
  const rateError = t.enabled && (!(t.ratePct > 0) || t.ratePct > 50) ? 'Enter a rate between 0.1% and 50%' : '';
  const others = countries.filter((c) => c.code !== home);
  const regError = others.some((c) => {
    const r = t.sellsTo?.[c.code];
    return r?.registered && (!(r.ratePct > 0) || r.ratePct > 50 || !r.taxNumber.trim());
  });
  const example = vatFor({ ...shopSettingsOf(s.data), tax: { ...t, enabled: true, ratePct: t.ratePct > 0 ? t.ratePct : defaultShopSettings.tax.ratePct } }, EXAMPLE_PRICE);

  const setReg = (code: CountryCode, patch: Partial<TaxRegistration>) => {
    const info = countries.find((c) => c.code === code)!;
    const cur: TaxRegistration = t.sellsTo?.[code] ?? { registered: false, taxNumber: '', ratePct: info.vatPct };
    s.patch({ sellsTo: { ...t.sellsTo, [code]: { ...cur, ...patch } } });
  };

  return (
    <SettingsSection id="tax" title="Tax" description="Tax on what you sell, at home and in other countries you’re registered in. Leave it off if you’re not registered." dirty={s.dirty} justSaved={s.justSaved} onSave={() => s.save()} onReset={s.reset} saveDisabled={!!rateError || regError}>
      <Switch id="tax-on" label={`Charge tax in ${homeInfo.name}`} description="Applies to products, tickets, courses and delivery at checkout, and to payment links unless a link turns it off. Items marked zero-rated or exempt are left out." checked={t.enabled} onChange={(enabled) => s.patch({ enabled })} />
      {t.enabled &&
      <>
          <div className="grid items-start gap-5 md:grid-cols-[10rem_minmax(0,1fr)]">
            <TextInput
            id="tax-rate"
            label="Rate (%)"
            inputMode="decimal"
            value={Number.isFinite(t.ratePct) ? String(t.ratePct) : ''}
            error={rateError || undefined}
            hint={`${homeInfo.vatPct}% is the usual rate in ${homeInfo.name} — check with your accountant.`}
            onChange={(e) => s.patch({ ratePct: Number(e.target.value.replace(/[^\d.]/g, '')) })} />
          
            <Field id="tax-mode" label="Your prices">
              <Segmented
              ariaLabel="Do your prices include tax?"
              fullWidth
              value={t.inclusive ? 'inclusive' : 'exclusive'}
              onChange={(v) => s.patch({ inclusive: v === 'inclusive' })}
              options={[
              { value: 'inclusive', label: 'Already include tax' },
              { value: 'exclusive', label: 'Tax added at checkout' }]
              } />
            
            </Field>
          </div>
          <p className="text-caption text-fg-muted">
            {`Your ${taxNumberLabel[home].label} is set once, under Business & receipts, and printed on receipts.`}{' '}
            <a href="#business" className="font-medium text-action hover:underline">
              Go to Business & receipts
            </a>
          </p>
          {example &&
        <div className="rounded-md bg-sunken px-4 py-3 text-caption text-fg-muted">
              <p className="font-semibold text-fg">Example: a {formatNgn(EXAMPLE_PRICE)} item</p>
              {example.inclusive ?
          <p className="mt-1">
                  The buyer pays <strong className="text-fg">{formatNgn(EXAMPLE_PRICE)}</strong>. The receipt shows “Includes VAT ({vatRateLabel(example.ratePct)}) {formatNgn(example.amountNgn)}”, and you keep {formatNgn(EXAMPLE_PRICE - example.amountNgn)} before fees.
                </p> :

          <p className="mt-1">
                  The buyer pays <strong className="text-fg">{formatNgn(EXAMPLE_PRICE + example.addedNgn)}</strong> — {formatNgn(EXAMPLE_PRICE)} plus {formatNgn(example.addedNgn)} VAT, shown as its own line at checkout and on the receipt.
                </p>
          }
            </div>
        }
        </>
      }

      <div className="flex flex-col gap-3 border-t border-line pt-5">
        <div>
          <h4 className="text-label font-semibold text-fg">Selling to other countries</h4>
          <p className="mt-0.5 text-caption text-fg-muted">When you deliver abroad, buyers in a country where you’re registered pay that country’s tax. Everywhere else the sale is an export: no tax is added, and the buyer may pay import tax when it arrives.</p>
        </div>
        <ul className="flex flex-col divide-y divide-line rounded-md border border-line">
          {others.map((c) => {
            const r = t.sellsTo?.[c.code];
            const on = !!r?.registered;
            return (
              <li key={c.code} className="flex flex-col gap-3 px-4 py-3">
                <Switch id={`tax-reg-${c.code}`} label={`Registered for tax in ${c.name}`} checked={on} onChange={(registered) => setReg(c.code, { registered })} />
                {on && r &&
                <div className="grid gap-3 sm:grid-cols-[8rem_minmax(0,1fr)]">
                    <TextInput id={`tax-reg-rate-${c.code}`} label="Rate (%)" inputMode="decimal" value={String(r.ratePct)} error={!(r.ratePct > 0) || r.ratePct > 50 ? 'Between 0.1% and 50%' : undefined} onChange={(e) => setReg(c.code, { ratePct: Number(e.target.value.replace(/[^\d.]/g, '')) })} />
                    <TextInput id={`tax-reg-no-${c.code}`} label={taxNumberLabel[c.code].label} placeholder={taxNumberLabel[c.code].placeholder} value={r.taxNumber} error={!r.taxNumber.trim() ? 'Add your number in this country' : undefined} onChange={(e) => setReg(c.code, { taxNumber: e.target.value })} />
                  </div>
                }
              </li>);

          })}
        </ul>
      </div>
      <p className="text-caption text-fg-subtle">Changing this affects new orders only. Past orders keep the tax they were placed with. Rates and rules are examples — check with your accountant.</p>
    </SettingsSection>);

}