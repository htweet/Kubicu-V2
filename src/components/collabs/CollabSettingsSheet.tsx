import React, { useEffect, useState } from 'react';
import { MAX_RATE, holdDayOptions, termsFor, type CollabSettings } from '../../utils/collabs';
import { useT } from '../../contexts/LocaleContext';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { TextInput } from '../ui/TextInput';
import { TextArea } from '../ui/TextArea';
import { SelectInput } from '../ui/SelectInput';

interface Props {
  open: boolean;
  settings: CollabSettings;
  canEdit: boolean;
  onClose: () => void;
  onSave: (s: CollabSettings) => void;
}

/**
 * Collaborations → Settings for referral partners (D259): starting commission and terms, and when commission becomes payable.
 * The terms sentence stays English — it's what partners agree to, so it isn't swapped by the owner's display language.
 */
export function CollabSettingsSheet({ open, settings, canEdit, onClose, onSave }: Props) {
  const { t: tr } = useT();
  const [rate, setRate] = useState(String(settings.defaultRatePct));
  const [terms, setTerms] = useState(settings.defaultTerms);
  const [holdDays, setHoldDays] = useState(settings.holdDays);
  useEffect(() => {
    if (!open) return;
    setRate(String(settings.defaultRatePct));
    setTerms(settings.defaultTerms);
    setHoldDays(settings.holdDays);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const n = Number(rate);
  const rateError = !Number.isFinite(n) || n < 1 || n > MAX_RATE ? tr('Between 1% and {max}%', { max: MAX_RATE }) : '';
  const next: CollabSettings = { defaultRatePct: Math.round(n * 10) / 10, defaultTerms: terms.trim(), holdDays };
  const dirty = JSON.stringify(next) !== JSON.stringify(settings);

  return (
    <Sheet
      open={open}
      onClose={onClose}
      side="right"
      title={tr('Referral partner settings')}
      description={tr('Starting points for new invites. Each partner’s own rate and terms stay as agreed.')}
      footer={
      <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            {tr('Cancel')}
          </Button>
          <Button disabled={!canEdit || !dirty || !!rateError} onClick={() => onSave(next)}>
            {tr('Save')}
          </Button>
        </div>
      }>
      
      <fieldset disabled={!canEdit} className="flex flex-col gap-6 px-5 py-5 md:px-6">
        <div className="sm:max-w-[50%]">
          <TextInput id="cs-rate" label={tr('Starting commission')} inputMode="decimal" value={rate} error={rateError || undefined} hint={tr('% of goods sold through their link, after discounts and refunds, never delivery.')} onChange={(e) => setRate(e.target.value.replace(/[^0-9.]/g, '').slice(0, 4))} />
        </div>
        <div className="border-t border-line pt-6">
          <SelectInput
            id="cs-hold"
            label={tr('Commission becomes payable')}
            value={String(holdDays)}
            hint={tr('Or as soon as the order is marked delivered. Open disputes always wait. Applies to commission not yet payable, for every partner.')}
            options={holdDayOptions.map((d) => ({ value: String(d), label: d === 0 ? tr('As soon as the order is paid') : tr('{n} days after payment', { n: d }) }))}
            onChange={(v) => setHoldDays(Number(v))} />
          
        </div>
        <div className="border-t border-line pt-6">
          <TextArea
            id="cs-terms"
            label={tr('Starting terms')}
            optional
            rows={4}
            maxLength={600}
            value={terms}
            placeholder={termsFor(Number.isFinite(n) && n > 0 ? Math.round(n * 10) / 10 : 10, holdDays)}
            hint={tr('Filled in on every new invite, where you can still change it. Leave empty to use the sentence shown.')}
            onChange={(e) => setTerms(e.target.value)} />
          
        </div>
      </fieldset>
    </Sheet>);

}