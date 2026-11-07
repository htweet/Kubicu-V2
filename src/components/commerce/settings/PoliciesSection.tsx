import React from 'react';
import { useShopSection } from '../../../hooks/useShopSection';
import { useCommerce } from '../../../contexts/CommerceContext';
import { Switch } from '../../ui/Switch';
import { Field } from '../../ui/Field';
import { Segmented } from '../../ui/Segmented';
import { TextInput } from '../../ui/TextInput';
import { TextArea } from '../../ui/TextArea';
import { SelectInput } from '../../ui/SelectInput';
import { SettingsSection } from './SettingsSection';
import { returnsSummary } from '../../../utils/commerce/shopSettings';

const dayOptions = ['3', '7', '14', '30'].map((d) => ({ value: d, label: `${d} days` }));

/**
 * Structured returns policy (D222). Shown at checkout (with the terms tick box), on receipts and on
 * the shop. The storefront's old free-text note is kept as the starting point.
 */
export function PoliciesSection() {
  const s = useShopSection('policy', 'Returns policy saved');
  const { data } = useCommerce();
  const p = s.draft;
  const oldNote = data.storefront.returnsNote?.trim() ?? '';
  const preview = returnsSummary({ ...p, set: true });

  return (
    <SettingsSection id="policies" title="Policies" description="Your returns policy, written out the same way everywhere buyers see it." dirty={s.dirty || !p.set} justSaved={s.justSaved} onSave={() => s.save({ ...p, set: true })} onReset={s.dirty ? s.reset : undefined}>
      {!p.set && oldNote && (
        <p className="rounded-md bg-sunken px-3 py-2.5 text-caption text-fg-muted">
          Your shop shows this note today: “{oldNote}”. Saving a policy here replaces it on the shop; the note stays in Storefront in case you switch back.
        </p>
      )}
      <Switch id="pol-accepts" label="Accept returns" description={p.accepts ? 'Buyers can return items within the time you set.' : 'All sales are final. Buyers see this before paying.'} checked={p.accepts} onChange={(accepts) => s.patch({ accepts })} />
      {p.accepts && (
        <div className="grid items-start gap-5 md:grid-cols-2">
          <SelectInput<string> id="pol-days" label="Within" value={String(p.days)} options={dayOptions.some((o) => o.value === String(p.days)) ? dayOptions : [...dayOptions, { value: String(p.days), label: `${p.days} days` }]} onChange={(v) => s.patch({ days: Number(v) })} hint="Counted from delivery or pickup." />
          <TextInput id="pol-condition" label="Item condition" value={p.condition} placeholder="e.g. Unused, with tags" onChange={(e) => s.patch({ condition: e.target.value.slice(0, 80) })} />
          <Field id="pol-who" label="Return delivery is paid by">
            <Segmented ariaLabel="Who pays return delivery" fullWidth value={p.returnDelivery} onChange={(returnDelivery) => s.patch({ returnDelivery })} options={[{ value: 'buyer', label: 'The buyer' }, { value: 'seller', label: 'You' }]} />
          </Field>
          <SelectInput<'original' | 'credit' | 'exchange'>
            id="pol-refund"
            label="Buyers get"
            value={p.refundAs}
            onChange={(refundAs) => s.patch({ refundAs })}
            options={[
              { value: 'original', label: 'A refund to how they paid' },
              { value: 'credit', label: 'Store credit' },
              { value: 'exchange', label: 'An exchange only' },
            ]}
          />
        </div>
      )}
      <TextArea id="pol-notes" label="Anything else" optional rows={2} maxLength={300} value={p.notes} placeholder="e.g. Custom and altered pieces can’t be returned." onChange={(e) => s.patch({ notes: e.target.value })} />
      <figure className="m-0 rounded-md border border-line bg-canvas px-4 py-3">
        <figcaption className="text-caption font-medium text-fg-muted">What buyers read</figcaption>
        <p className="mt-1 text-label text-fg">{preview}</p>
      </figure>
      <p className="text-caption text-fg-subtle">Draft wording — have it checked if you sell regulated goods. KUBICU’s buyer-protection rules still apply on top.</p>
    </SettingsSection>
  );
}
