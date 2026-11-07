import React from 'react';
import { useShopSection } from '../../../hooks/useShopSection';
import { TextInput } from '../../ui/TextInput';
import { Switch } from '../../ui/Switch';
import { SettingsSection } from './SettingsSection';
import { cleanPrefix } from '../../../utils/commerce/shopSettings';
import { STOCK_HOLD_MINUTES } from '../../../utils/commerce/tickets';

/** Order numbers, the default low-stock level and backorders (D222). */
export function OrdersStockSection() {
  const s = useShopSection('orders', 'Order and stock settings saved');
  const o = s.draft;
  const next = s.data.nextOrderNumber;
  const lowError = !Number.isInteger(o.lowStockDefault) || o.lowStockDefault < 0 || o.lowStockDefault > 999 ? 'Enter a whole number from 0 to 999' : '';
  return (
    <SettingsSection id="orders" title="Orders & stock" description="How orders are numbered, and what happens when stock runs low or out." dirty={s.dirty} justSaved={s.justSaved} onSave={() => s.save()} onReset={s.reset} saveDisabled={!!lowError}>
      <div className="grid items-start gap-5 sm:grid-cols-2">
        <TextInput
          id="ord-prefix"
          label="Order number prefix"
          optional
          placeholder="e.g. ADA"
          value={o.prefix}
          hint={`Your next order will be ${o.prefix ? `${o.prefix}-${next}` : `#${next}`}. Up to 6 letters or numbers; past orders keep theirs.`}
          onChange={(e) => s.patch({ prefix: cleanPrefix(e.target.value) })}
        />
        <TextInput
          id="ord-low"
          label="Low-stock warning for new products"
          inputMode="numeric"
          value={Number.isFinite(o.lowStockDefault) ? String(o.lowStockDefault) : ''}
          error={lowError || undefined}
          hint="Warn when a product has this many or fewer left. Each product can still set its own."
          onChange={(e) => s.patch({ lowStockDefault: e.target.value === '' ? NaN : Number(e.target.value.replace(/\D/g, '')) })}
        />
      </div>
      <div className="flex flex-col gap-5 border-t border-line pt-5">
        <Switch
          id="ord-hold"
          label={`Keep stock for buyers during checkout`}
          description={
            o.backorders
              ? 'Not needed while backorders are on — nothing can run out.'
              : `When a buyer presses Checkout, their items are kept for them for ${STOCK_HOLD_MINUTES} minutes, so two people can’t pay for the last one. Leaving checkout or paying gives them back straight away.`
          }
          checked={o.holdStock && !o.backorders}
          disabled={o.backorders}
          onChange={(holdStock) => s.patch({ holdStock })}
        />
        <Switch
          id="ord-backorders"
          label="Allow backorders"
          description="Keep selling physical products after stock reaches zero. Buyers see “Ships later”, and the order is labelled so you know to wait for new stock. Pre-orders keep their own limits."
          checked={o.backorders}
          onChange={(backorders) => s.patch({ backorders })}
        />
      </div>
    </SettingsSection>
  );
}
