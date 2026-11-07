import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import type { ServiceOsData, ServiceOsSettings } from '../../types/serviceOs';
import type { ShopSettings } from '../../types/commerce';
import { cleanDocPrefix, docNumber, dueDayOptions, serviceSettingsOf, validDayOptions } from '../../utils/serviceOs';
import { vatRateLabel } from '../../utils/commerce/shopSettings';
import { SettingsSection } from '../commerce/settings/SettingsSection';
import { TextInput } from '../ui/TextInput';
import { TextArea } from '../ui/TextArea';
import { SelectInput } from '../ui/SelectInput';
import { Switch } from '../ui/Switch';

interface Props {
  data: ServiceOsData;
  /** Commerce tax settings — the one place the VAT rate is set. */
  tax: ShopSettings['tax'];
  canEdit: boolean;
  update: (fn: (d: ServiceOsData) => ServiceOsData) => void;
}

/** Quotes & jobs → Settings (D257): numbering, validity, payment terms, default wording and VAT. Applies to new quotes and invoices only. */
export function ServiceOsSettingsPanel({ data, tax, canEdit, update }: Props) {
  const saved = serviceSettingsOf(data);
  const [draft, setDraft] = useState<ServiceOsSettings>(saved);
  const [justSaved, setJustSaved] = useState(false);
  const savedKey = JSON.stringify(saved);
  useEffect(() => setDraft(serviceSettingsOf(data)), [savedKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (p: Partial<ServiceOsSettings>) => {
    setDraft((d) => ({ ...d, ...p }));
    setJustSaved(false);
  };
  const dirty = JSON.stringify(draft) !== savedKey;
  const clash = draft.quotePrefix === draft.invoicePrefix ? 'Use a different prefix from quotes, so numbers never look alike' : '';
  const save = () => {
    if (clash) return;
    update((d) => ({ ...d, settings: { ...draft } }));
    setJustSaved(true);
    toast.success('Quotes & jobs settings saved', { description: 'They apply to new quotes and invoices. Ones already made keep their numbers and terms.' });
  };

  return (
    <div className="flex flex-col gap-6">
      <SettingsSection
        id="sos-settings"
        title="Quotes & invoices"
        description="Used for every new quote and invoice. Ones you’ve already made keep their own numbers, dates and wording."
        dirty={dirty}
        justSaved={justSaved}
        onSave={canEdit ? save : undefined}
        onReset={() => setDraft(saved)}
        saveDisabled={!!clash}
      >
        <fieldset disabled={!canEdit} className="flex flex-col gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput
              id="sos-qp"
              label="Quote number prefix"
              value={draft.quotePrefix}
              maxLength={8}
              hint={`Next quote: ${docNumber(draft.quotePrefix, data.counters.quote + 1)}`}
              onChange={(e) => set({ quotePrefix: cleanDocPrefix(e.target.value) })}
            />
            <TextInput
              id="sos-ip"
              label="Invoice number prefix"
              value={draft.invoicePrefix}
              maxLength={8}
              error={clash || undefined}
              hint={clash ? undefined : `Next invoice: ${docNumber(draft.invoicePrefix, data.counters.invoice + 1)}`}
              onChange={(e) => set({ invoicePrefix: cleanDocPrefix(e.target.value) })}
            />
          </div>
          <div className="grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
            <SelectInput
              id="sos-valid"
              label="Quotes stay valid for"
              value={String(draft.validDays)}
              options={validDayOptions.map((n) => ({ value: String(n), label: `${n} days` }))}
              onChange={(v) => set({ validDays: Number(v) })}
            />
            <SelectInput
              id="sos-due"
              label="Invoices are due"
              value={String(draft.dueDays)}
              options={dueDayOptions.map((n) => ({ value: String(n), label: n === 0 ? 'On receipt' : `${n} days after sending` }))}
              onChange={(v) => set({ dueDays: Number(v) })}
            />
          </div>
          <div className="flex flex-col gap-4 border-t border-line pt-5">
            <TextArea
              id="sos-qnote"
              label="Starting note on every quote"
              optional
              rows={3}
              maxLength={400}
              value={draft.quoteNote}
              placeholder="e.g. Prices include materials. Travel outside Lagos is quoted separately."
              hint="You can still change it on each quote."
              onChange={(e) => set({ quoteNote: e.target.value })}
            />
            <TextArea
              id="sos-inote"
              label="Payment terms on every invoice"
              optional
              rows={3}
              maxLength={400}
              value={draft.invoiceNote}
              placeholder="e.g. Please use the invoice number as your transfer narration. Work starts once the deposit is received."
              hint="Shown on the pay page and the printed invoice."
              onChange={(e) => set({ invoiceNote: e.target.value })}
            />
          </div>
          <div className="border-t border-line pt-5">
            <Switch
              id="sos-vat"
              label="Charge VAT on quotes and invoices"
              description={`${vatRateLabel(tax.ratePct)}, ${tax.inclusive ? 'included in your prices' : 'added on top of your prices'} — the rate and how it’s shown come from Commerce settings, so your shop and your quotes always match. You can switch it off for a single quote.`}
              checked={draft.vat}
              onChange={(vat) => set({ vat })}
            />
            <Link to="/app/commerce/settings#tax" className="mt-2 inline-block text-caption font-medium text-action hover:underline">
              Change the VAT rate in Commerce settings
            </Link>
          </div>
        </fieldset>
      </SettingsSection>
    </div>
  );
}
