import React from 'react';
import type { FieldAsk } from '../../../types/commerce';
import { useShopSection } from '../../../hooks/useShopSection';
import { Field } from '../../ui/Field';
import { Segmented } from '../../ui/Segmented';
import { Switch } from '../../ui/Switch';
import { CurrencyInput } from '../../ui/CurrencyInput';
import { SettingsSection } from './SettingsSection';

const askOptions: { value: FieldAsk; label: string }[] = [
  { value: 'required', label: 'Required' },
  { value: 'optional', label: 'Optional' },
  { value: 'off', label: 'Don’t ask' },
];

/** What checkout asks for (D222). Phone is always asked — it's how orders reach buyers. */
export function CheckoutSettingsSection() {
  const s = useShopSection('checkout', 'Checkout settings saved');
  const c = s.draft;
  return (
    <SettingsSection id="checkout" title="Checkout" description="What buyers fill in, and the rules an order has to meet." dirty={s.dirty} justSaved={s.justSaved} onSave={() => s.save()} onReset={s.reset}>
      <p className="rounded-md bg-sunken px-3 py-2.5 text-caption text-fg-muted">Name and phone are always asked — the phone is how you reach buyers on WhatsApp.</p>
      <div className="grid gap-5 md:grid-cols-2">
        <Field id="co-email" label="Email" hint="Digital items, tickets and courses always ask for one — that’s where they’re delivered.">
          <Segmented ariaLabel="Email at checkout" fullWidth value={c.email} options={askOptions} onChange={(email) => s.patch({ email })} />
        </Field>
        <Field id="co-address" label="Address on orders you don’t deliver" hint="Pickup and digital orders. Delivery always asks for the delivery address.">
          <Segmented ariaLabel="Address at checkout" fullWidth value={c.address} options={askOptions} onChange={(address) => s.patch({ address })} />
        </Field>
      </div>
      <div className="max-w-xs">
        <CurrencyInput id="co-min" label="Minimum order" optional value={c.minOrderNgn} placeholder="No minimum" hint="Goods after discounts, before delivery." onChange={(minOrderNgn) => s.patch({ minOrderNgn: minOrderNgn && minOrderNgn > 0 ? minOrderNgn : null })} />
      </div>
      <div className="flex flex-col gap-4 border-t border-line pt-5">
        <Switch id="co-terms" label="Ask buyers to agree to your terms" description="A tick box before paying, with your returns policy written out. Pay is disabled until it’s ticked." checked={c.termsTick} onChange={(termsTick) => s.patch({ termsTick })} />
        <Switch id="co-note" label="Let buyers add a note" description="An optional box for things like gift wrapping or delivery directions. It shows on the order." checked={c.orderNote} onChange={(orderNote) => s.patch({ orderNote })} />
      </div>
    </SettingsSection>
  );
}
