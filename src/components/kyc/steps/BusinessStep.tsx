import React from 'react';
import type { KycBusiness } from '../../../types/kyc';
import { industries, simulateCac } from '../../../utils/money/kyc';
import type { KycStepProps } from '../stepProps';
import { TextInput } from '../../ui/TextInput';
import { TextArea } from '../../ui/TextArea';
import { SelectInput } from '../../ui/SelectInput';
import { CheckBadge } from '../CheckBadge';
import { DocUpload } from '../DocUpload';

/** KYB: CAC registration, tax number, what the business does and its registration documents. */
export function BusinessStep({ k, set, errors, disabled }: KycStepProps) {
  const b = k.business;
  const company = k.entity === 'company';
  const setB = (patch: Partial<KycBusiness>) => set((c) => ({ ...c, business: { ...c.business, ...patch } }));

  const cacName = (name: string, result: KycBusiness['checks']['cac']) => result === 'pass' || result === 'review' ? name.trim().toUpperCase() : '';
  const setNumber = (number: string) => {
    const cac = simulateCac(number);
    set((c) => ({ ...c, business: { ...c.business, number, checks: { ...c.business.checks, cac, registeredNameOnCac: cacName(c.business.registeredName, cac) } } }));
  };
  const setName = (registeredName: string) => set((c) => ({ ...c, business: { ...c.business, registeredName, checks: { ...c.business.checks, registeredNameOnCac: cacName(registeredName, c.business.checks.cac) } } }));
  const setTin = (tin: string) => setB({ tin, checks: { ...b.checks, tin: /^\d{8}-\d{4}$/.test(tin.trim()) ? 'pass' : 'not_run' } });

  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="kyc-biz-reg" className="flex flex-col gap-4">
        <h3 id="kyc-biz-reg" className="text-label font-semibold text-fg">
          CAC registration
        </h3>
        <TextInput id="kyc-reg-name" label="Registered name" hint="Exactly as printed on your CAC certificate." value={b.registeredName} onChange={(e) => setName(e.target.value)} error={errors.registeredName} disabled={disabled} />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <TextInput id="kyc-reg-number" label={company ? 'RC number' : 'BN number'} placeholder={company ? 'RC 1234567' : 'BN 3456789'} value={b.number} onChange={(e) => setNumber(e.target.value)} error={errors.number} disabled={disabled} />
            {b.checks.cac !== 'not_run' &&
            <div className="flex flex-wrap items-center gap-2">
                <CheckBadge result={b.checks.cac} label="CAC" />
                {b.checks.registeredNameOnCac &&
              <span className="text-caption text-fg-muted">
                    {b.checks.registeredNameOnCac} · {b.checks.cac === 'review' ? 'shows as inactive' : 'active'}
                  </span>
              }
              </div>
            }
          </div>
          <TextInput id="kyc-reg-date" label="Date registered" type="date" value={b.incorporatedOn} onChange={(e) => setB({ incorporatedOn: e.target.value })} error={errors.incorporatedOn} disabled={disabled} max={new Date().toISOString().slice(0, 10)} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <TextInput id="kyc-tin" label="Tax ID (TIN)" optional={!company} placeholder="12345678-0001" value={b.tin} onChange={(e) => setTin(e.target.value)} error={errors.tin} disabled={disabled} />
            {b.checks.tin === 'pass' && <CheckBadge result="pass" label="FIRS" />}
          </div>
          <TextInput id="kyc-website" label="Website or social page" optional value={b.website} onChange={(e) => setB({ website: e.target.value })} disabled={disabled} placeholder="instagram.com/yourbusiness" />
        </div>
        <p className="text-caption text-fg-subtle">Prototype: CAC numbers ending in 000 aren’t found; ending in 7 show as inactive.</p>
      </section>

      <section aria-labelledby="kyc-biz-what" className="flex flex-col gap-4 border-t border-line pt-6">
        <h3 id="kyc-biz-what" className="text-label font-semibold text-fg">
          What the business does
        </h3>
        <SelectInput id="kyc-industry" label="Industry" value={b.industry} onChange={(industry) => setB({ industry })} options={[{ value: '', label: 'Choose one', disabled: true }, ...industries.map((x) => ({ value: x, label: x }))]} error={errors.industry} disabled={disabled} />
        <TextArea id="kyc-desc" label="Describe what you sell and how" hint="For example: “Made-to-order Ankara dresses, sold on Instagram and delivered across Lagos.”" value={b.description} onChange={(e) => setB({ description: e.target.value })} error={errors.description} disabled={disabled} />
      </section>

      <section aria-labelledby="kyc-biz-docs" className="flex flex-col gap-5 border-t border-line pt-6">
        <h3 id="kyc-biz-docs" className="text-label font-semibold text-fg">
          Documents
        </h3>
        <DocUpload id="kyc-cert" label="CAC certificate" value={b.certificate} onChange={(certificate) => setB({ certificate })} error={errors.certificate} disabled={disabled} />
        <DocUpload
          id="kyc-status"
          label={company ? 'CAC status report' : 'BN application form (Form BN/1)'}
          hint={company ? 'Lists your directors and shareholders. Download it from the CAC portal.' : 'Shows the proprietors’ names and address.'}
          value={b.statusReport}
          onChange={(statusReport) => setB({ statusReport })}
          error={errors.statusReport}
          disabled={disabled} />
        
        {company && <DocUpload id="kyc-memart" label="Memorandum & articles of association" value={b.memart} onChange={(memart) => setB({ memart })} error={errors.memart} disabled={disabled} />}
      </section>
    </div>);

}