import React from 'react';
import type { Agreement, DeliveryRule, SupportRule } from '../../types/partnership';
import { deliveryLabels, supportLabels } from '../../utils/partnerships';
import { TextArea } from '../ui/TextArea';
import { SelectInput } from '../ui/SelectInput';
import { RangeInput } from '../ui/RangeInput';
import { SplitExplainer } from './SplitExplainer';

interface AgreementFieldsProps {
  value: Agreement;
  onChange: (next: Agreement) => void;
  leadName: string;
  partnerName: string;
  disabled?: boolean;
}

/** The parts of a partnership agreement a business can set (D120). */
export function AgreementFields({ value: a, onChange, leadName, partnerName, disabled }: AgreementFieldsProps) {
  const set = (patch: Partial<Agreement>) => onChange({ ...a, ...patch });
  return (
    <fieldset disabled={disabled} className="flex flex-col gap-5">
      <legend className="sr-only">Agreement</legend>
      <TextArea id="agr-purpose" label="What you’re doing together" rows={2} maxLength={200} value={a.purpose} onChange={(e) => set({ purpose: e.target.value })} hint="One or two sentences, e.g. “Bridal packages: makeup by us, gele by them.”" />
      <div className="flex flex-col gap-2">
        <RangeInput label="Money split on things you sell together" value={a.leadSharePct} min={10} max={90} step={5} format={(v) => `${v}% · ${100 - v}%`} onChange={(v) => set({ leadSharePct: v })} />
        <p className="text-caption text-fg-subtle">You propose it; it only applies once {partnerName || 'your partner'} accepts too. Agree it together first — most partners split by who does more of the work or brings the product.</p>
        <SplitExplainer leadName={leadName} partnerName={partnerName} leadSharePct={a.leadSharePct} viewer="lead" compact className="mt-1" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectInput<DeliveryRule> id="agr-delivery" label="Who delivers" value={a.delivery} onChange={(v) => set({ delivery: v })} options={(Object.keys(deliveryLabels) as DeliveryRule[]).map((k) => ({ value: k, label: deliveryLabels[k] }))} />
        <SelectInput<SupportRule> id="agr-support" label="Customer questions and refunds" value={a.support} onChange={(v) => set({ support: v })} options={(Object.keys(supportLabels) as SupportRule[]).map((k) => ({ value: k, label: supportLabels[k] }))} />
      </div>
    </fieldset>);

}