import React from 'react';
import type { Product, ProductInstalments } from '../../types/commerce';
import { useCommerce } from '../../contexts/CommerceContext';
import { INSTALMENT_MIN_NGN, everyLabels, payOptionsOf, schedule } from '../../utils/commerce/payOptions';
import { formatNgn } from '../../utils/format';
import { Switch } from '../ui/Switch';
import { Segmented } from '../ui/Segmented';
import { Field } from '../ui/Field';

/** Product → Stock & options: let buyers pay this product in parts (D112). Physical products only. */
export function ProductInstalmentsField({ product, onChange }: {product: Product;onChange: (patch: Partial<Product>) => void;}) {
  const { data } = useCommerce();
  const on = payOptionsOf(data).instalments.enabled;
  const plan = product.instalments;
  const set = (patch: Partial<ProductInstalments>) => plan && onChange({ instalments: { ...plan, ...patch } });
  const price = product.priceNgn ?? 0;
  const example = plan && price >= INSTALMENT_MIN_NGN ? schedule(price, plan) : null;

  return (
    <div className="flex flex-col gap-4">
      <Switch
        id="prd-inst"
        label="Pay in instalments"
        description={
        product.madeToOrder ?
        'Turn off “Made to order” below first — an order can’t use a deposit and instalments together.' :
        on ?
        `Buyers choose 2–4 parts at checkout on orders of ${formatNgn(INSTALMENT_MIN_NGN)} or more.` :
        'Instalments are off for your shop. Switch them on in Commerce → Payments for buyers to see this.'
        }
        checked={!!plan}
        disabled={!!product.madeToOrder}
        onChange={(v) => onChange({ instalments: v ? { parts: 3, every: 'month', ship: 'last' } : undefined })} />
      
      {plan &&
      <div className="flex flex-col gap-4 border-l-2 border-line pl-4">
          <Field id="prd-inst-parts" label="Number of parts">
            <Segmented
            ariaLabel="Number of parts"
            fullWidth
            value={String(plan.parts) as '2' | '3' | '4'}
            onChange={(v) => set({ parts: Number(v) as ProductInstalments['parts'] })}
            options={[
            { value: '2', label: '2' },
            { value: '3', label: '3' },
            { value: '4', label: '4' }]
            } />
          
          </Field>
          <Field id="prd-inst-every" label="How often">
            <Segmented
            ariaLabel="How often"
            fullWidth
            value={plan.every}
            onChange={(v) => set({ every: v })}
            options={[
            { value: 'week', label: 'Weekly' },
            { value: 'fortnight', label: '2 weeks' },
            { value: 'month', label: 'Monthly' }]
            } />
          
          </Field>
          <Field id="prd-inst-ship" label="When you send it">
            <Segmented
            ariaLabel="When you send it"
            fullWidth
            value={plan.ship}
            onChange={(v) => set({ ship: v })}
            options={[
            { value: 'last', label: 'After the last part' },
            { value: 'first', label: 'After the first part' }]
            } />
          
          </Field>
          <p className="text-caption text-fg-muted">
            {example ?
          `At ${formatNgn(price)}: ${formatNgn(example[0].amountNgn)} today, then ${formatNgn(example[1].amountNgn)} ${everyLabels[plan.every]}.` :
          `Below ${formatNgn(INSTALMENT_MIN_NGN)} it can still count towards a bigger cart.`}{' '}
            {plan.ship === 'first' ? 'Sending after the first part sells more but you carry the risk if later parts fail.' : 'Nothing goes out until it’s fully paid — safest for you.'}
          </p>
        </div>
      }
    </div>);

}