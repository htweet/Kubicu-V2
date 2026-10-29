import React from 'react';
import { useShopSection } from '../../../hooks/useShopSection';
import { Switch } from '../../ui/Switch';
import { Field } from '../../ui/Field';
import { Segmented } from '../../ui/Segmented';
import { TextInput } from '../../ui/TextInput';
import { SettingsSection } from './SettingsSection';
import { formatNgn } from '../../../utils/format';
import { defaultShopSettings, shopSettingsOf, vatFor, vatRateLabel } from '../../../utils/commerce/shopSettings';

const EXAMPLE_PRICE = 10000;

/** VAT: off, included in prices, or added at checkout (D222). One rate for the whole shop. */
export function TaxSection() {
  const s = useShopSection('tax', 'Tax settings saved');
  const t = s.draft;
  const rateError = t.enabled && (!(t.ratePct > 0) || t.ratePct > 50) ? 'Enter a rate between 0.1% and 50%' : '';
  const example = vatFor({ ...shopSettingsOf(s.data), tax: { ...t, enabled: true, ratePct: t.ratePct > 0 ? t.ratePct : defaultShopSettings.tax.ratePct } }, EXAMPLE_PRICE);

  return (
    <SettingsSection id="tax" title="Tax" description="VAT on what you sell. Leave it off if you’re not registered for VAT." dirty={s.dirty} justSaved={s.justSaved} onSave={() => s.save()} onReset={s.reset} saveDisabled={!!rateError}>
      <Switch id="tax-on" label="Charge VAT" description="Applies to products, tickets, courses and delivery at checkout, and to payment links unless a link turns it off." checked={t.enabled} onChange={(enabled) => s.patch({ enabled })} />
      {t.enabled &&
      <>
          <div className="grid items-start gap-5 md:grid-cols-[10rem_minmax(0,1fr)]">
            <TextInput
            id="tax-rate"
            label="Rate (%)"
            inputMode="decimal"
            value={Number.isFinite(t.ratePct) ? String(t.ratePct) : ''}
            error={rateError || undefined}
            hint="7.5% is an example — check with your accountant."
            onChange={(e) => s.patch({ ratePct: Number(e.target.value.replace(/[^\d.]/g, '')) })} />
          
            <Field id="tax-mode" label="Your prices">
              <Segmented
              ariaLabel="Are your prices VAT inclusive?"
              fullWidth
              value={t.inclusive ? 'inclusive' : 'exclusive'}
              onChange={(v) => s.patch({ inclusive: v === 'inclusive' })}
              options={[
              { value: 'inclusive', label: 'Already include VAT' },
              { value: 'exclusive', label: 'VAT added at checkout' }]
              } />
            
            </Field>
          </div>
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
          <p className="text-caption text-fg-subtle">Changing this affects new orders only. Past orders keep the VAT they were placed with.</p>
        </>
      }
    </SettingsSection>);

}