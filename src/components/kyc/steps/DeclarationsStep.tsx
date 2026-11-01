import React from 'react';
import type { KycDeclarations } from '../../../types/kyc';
import { fundsLabels, kycRules, volumeLabels } from '../../../utils/money/kyc';
import type { KycStepProps } from '../stepProps';
import { SelectInput } from '../../ui/SelectInput';
import { TextInput } from '../../ui/TextInput';
import { Switch } from '../../ui/Switch';
import { ConsentCheck } from '../ConsentCheck';
import { useT } from '../../../contexts/LocaleContext';

type Vol = KycDeclarations['monthlyVolume'];
type Funds = KycDeclarations['sourceOfFunds'];

/** Anti-money-laundering questions every partner asks, plus the applicant's own confirmation. */
export function DeclarationsStep({ k, set, errors, disabled }: KycStepProps) {
  const { t: tr } = useT();
  const d = k.declarations;
  const setD = (patch: Partial<KycDeclarations>) => set((c) => ({ ...c, declarations: { ...c.declarations, ...patch } }));
  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="kyc-dec-money" className="flex flex-col gap-4">
        <h3 id="kyc-dec-money" className="text-label font-semibold text-fg">
          {tr('Your money')}
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <SelectInput<Vol>
            id="kyc-volume"
            label="Expected sales each month"
            value={d.monthlyVolume}
            onChange={(monthlyVolume) => setD({ monthlyVolume })}
            options={[{ value: '' as Vol, label: tr('Choose a range'), disabled: true }, ...(Object.keys(volumeLabels) as Exclude<Vol, ''>[]).map((v) => ({ value: v as Vol, label: tr(volumeLabels[v]) }))]}
            error={errors.monthlyVolume}
            disabled={disabled}
            hint="A rough guess is fine. It helps avoid unexpected holds." />
          
          <SelectInput<Funds>
            id="kyc-funds"
            label="Where your money mainly comes from"
            value={d.sourceOfFunds}
            onChange={(sourceOfFunds) => setD({ sourceOfFunds })}
            options={[{ value: '' as Funds, label: tr('Choose one'), disabled: true }, ...(Object.keys(fundsLabels) as Exclude<Funds, ''>[]).map((v) => ({ value: v as Funds, label: tr(fundsLabels[v]) }))]}
            error={errors.sourceOfFunds}
            disabled={disabled} />
          
        </div>
        {d.sourceOfFunds === 'other' && <TextInput id="kyc-funds-detail" label="Tell us more" value={d.sourceDetail} onChange={(e) => setD({ sourceDetail: e.target.value })} error={errors.sourceDetail} disabled={disabled} />}
      </section>

      <section aria-labelledby="kyc-dec-pep" className="flex flex-col gap-4 border-t border-line pt-6">
        <h3 id="kyc-dec-pep" className="text-label font-semibold text-fg">
          {tr('Public roles')}
        </h3>
        <Switch
          id="kyc-pep"
          checked={d.pep}
          onChange={(pep) => setD({ pep })}
          disabled={disabled}
          label="I hold, or am closely related to someone who holds, a prominent public role"
          description="For example a minister, legislator, senior judge, military officer or head of a state-owned company. Saying yes doesn’t stop you being verified." />
        
        {d.pep && <TextInput id="kyc-pep-detail" label="Which role, and who holds it?" value={d.pepDetail} onChange={(e) => setD({ pepDetail: e.target.value })} error={errors.pepDetail} disabled={disabled} />}
      </section>

      <section aria-labelledby="kyc-dec-confirm" className="flex flex-col gap-4 border-t border-line pt-6">
        <h3 id="kyc-dec-confirm" className="text-label font-semibold text-fg">
          {tr('Confirm')}
        </h3>
        <ConsentCheck id="kyc-accurate" checked={d.accurate} onChange={(accurate) => setD({ accurate })} error={errors.accurate} disabled={disabled} label="Everything I’ve given is true and belongs to me or the business. I’ll tell KUBICU if anything changes." />
        <ConsentCheck
          id="kyc-terms"
          checked={d.terms}
          onChange={(terms) => setD({ terms })}
          error={errors.terms}
          disabled={disabled}
          label={kycRules().consent} />
        
      </section>
    </div>);

}