import React, { useState } from 'react';
import { CameraIcon, CheckCircle2Icon, ScanFaceIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { IdType } from '../../../types/kyc';
import { idNeedsExpiry, idTypeOptions, kycRules, nameOnBvn, simulateIdCheck } from '../../../utils/money/kyc';
import type { IdNumberRule } from '../../../data/kycCountries';
import { phoneIssue, phonePlaceholder } from '../../../utils/phone';
import { activeCountry } from '../../../utils/country';
import type { KycStepProps } from '../stepProps';
import { TextInput } from '../../ui/TextInput';
import { SelectInput } from '../../ui/SelectInput';
import { Button } from '../../ui/Button';
import { CheckBadge } from '../CheckBadge';
import { DocUpload } from '../DocUpload';
import { useT } from '../../../contexts/LocaleContext';

/** The person applying: name, date of birth, verified phone, BVN + NIN checks, ID document and a liveness selfie. */
export function IdentityStep({ k, set, errors, disabled }: KycStepProps) {
  const { t: tr } = useT();
  const i = k.identity;
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [scanning, setScanning] = useState(false);

  const setId = (patch: Partial<typeof i>) => set((c) => ({ ...c, identity: { ...c.identity, ...patch } }));

  // National ID, tax number and ID types follow the workspace's country (D424).
  const rules = kycRules();
  const clean = (rule: IdNumberRule, v: string) => rule.numeric ? v.replace(/\D/g, '') : v.toUpperCase().replace(/[^A-Z0-9-]/g, '');

  const setBvn = (bvn: string) => {
    const result = simulateIdCheck(bvn, rules.primary.pattern);
    set((c) => ({ ...c, identity: { ...c.identity, bvn, checks: { ...c.identity.checks, bvn: result, nameOnBvn: nameOnBvn(c.identity.legalName, result) } } }));
  };
  const setName = (legalName: string) => set((c) => ({ ...c, identity: { ...c.identity, legalName, checks: { ...c.identity.checks, nameOnBvn: nameOnBvn(legalName, c.identity.checks.bvn) } } }));
  const setNin = (nin: string) => set((c) => ({ ...c, identity: { ...c.identity, nin, checks: { ...c.identity.checks, nin: rules.secondary ? simulateIdCheck(nin, rules.secondary.pattern) : 'not_run' } } }));

  const sendCode = () => {
    if (!i.phone.trim() || phoneIssue(i.phone) !== null) return setCodeError(tr('Enter your phone number first.'));
    setCodeError('');
    setCodeSent(true);
    toast(tr('Code sent (simulated)'), { description: tr('Type any 6 digits except 000000.') });
  };
  const confirmCode = () => {
    if (!/^\d{6}$/.test(code) || code === '000000') return setCodeError(tr('That code isn’t right. Check the message and try again.'));
    setCodeError('');
    setId({ phoneVerified: true });
    setCodeSent(false);
    setCode('');
  };

  const liveness = () => {
    setScanning(true);
    window.setTimeout(() => {
      setScanning(false);
      set((c) => ({ ...c, identity: { ...c.identity, selfie: true, checks: { ...c.identity.checks, liveness: 'pass' } } }));
    }, 1400);
  };

  const needsExpiry = idNeedsExpiry(i.idType);
  const idOptions = idTypeOptions();

  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="kyc-id-person" className="flex flex-col gap-4">
        <h3 id="kyc-id-person" className="text-label font-semibold text-fg">
          {tr('About you')}
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput id="kyc-legal-name" label="Full legal name" hint={rules.legalNameHint} value={i.legalName} onChange={(e) => setName(e.target.value)} error={errors.legalName} disabled={disabled} autoComplete="name" />
          <TextInput id="kyc-dob" label="Date of birth" type="date" value={i.dob} onChange={(e) => setId({ dob: e.target.value })} error={errors.dob} disabled={disabled} max={new Date().toISOString().slice(0, 10)} />
        </div>
        <div>
          <div className="flex flex-col gap-2 md:flex-row md:items-end">
            <TextInput
              id="kyc-phone"
              label="Phone number"
              inputMode="tel"
              value={i.phone}
              onChange={(e) => setId({ phone: e.target.value, phoneVerified: false })}
              error={errors.phone && !codeSent ? errors.phone : undefined}
              disabled={disabled}
              placeholder={activeCountry() === 'NG' ? '0803 123 4567' : phonePlaceholder()}
              fieldClassName="flex-1"
              autoComplete="tel" />
            
            {i.phoneVerified ?
            <span className="inline-flex h-10 items-center gap-1.5 text-label font-medium text-success">
                <CheckCircle2Icon size={16} aria-hidden /> {tr('Confirmed')}
              </span> :

            <Button variant="secondary" onClick={sendCode} disabled={disabled}>
                {tr(codeSent ? 'Send again' : 'Send code')}
              </Button>
            }
          </div>
          {codeSent && !i.phoneVerified &&
          <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-end">
              <TextInput id="kyc-phone-code" label="6-digit code" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} fieldClassName="md:w-48" autoComplete="one-time-code" />
              <Button onClick={confirmCode}>Confirm</Button>
            </div>
          }
          {codeError && <p role="alert" className="mt-1.5 text-caption font-medium text-danger">{codeError}</p>}
        </div>
      </section>

      <section aria-labelledby="kyc-id-numbers" className="flex flex-col gap-4 border-t border-line pt-6">
        <div>
          <h3 id="kyc-id-numbers" className="text-label font-semibold text-fg">
            {tr('Identity numbers')}
          </h3>
          <p className="mt-0.5 text-caption text-fg-subtle">{tr(rules.checkedWith)}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <TextInput id="kyc-bvn" label={rules.primary.label} inputMode={rules.primary.numeric ? 'numeric' : 'text'} maxLength={rules.primary.maxLength} placeholder={rules.primary.placeholder || undefined} value={i.bvn} onChange={(e) => setBvn(clean(rules.primary, e.target.value))} error={errors.bvn} disabled={disabled} hint={rules.primary.hint} />
            {i.checks.bvn !== 'not_run' &&
            <div className="flex flex-wrap items-center gap-2">
                <CheckBadge result={i.checks.bvn} />
                {i.checks.nameOnBvn && <span className="text-caption text-fg-muted">{tr(rules.nameOnRecord, { name: i.checks.nameOnBvn })}</span>}
              </div>
            }
            {i.checks.bvn === 'review' && <p className="text-caption text-fg-muted">{tr('The name is a partial match. You can continue — a reviewer will compare it with your ID.')}</p>}
          </div>
          {rules.secondary &&
          <div className="flex flex-col gap-2">
              <TextInput id="kyc-nin" label={rules.secondary.label} inputMode={rules.secondary.numeric ? 'numeric' : 'text'} maxLength={rules.secondary.maxLength} placeholder={rules.secondary.placeholder || undefined} value={i.nin} onChange={(e) => setNin(clean(rules.secondary as IdNumberRule, e.target.value))} error={errors.nin} disabled={disabled} hint={rules.secondary.hint} />
              {i.checks.nin !== 'not_run' && <CheckBadge result={i.checks.nin} />}
            </div>
          }
        </div>
        <p className="text-caption text-fg-subtle">{tr('Prototype: numbers ending in 0000 fail; ending in 9 need a closer look.')}</p>
      </section>

      <section aria-labelledby="kyc-id-doc" className="flex flex-col gap-4 border-t border-line pt-6">
        <h3 id="kyc-id-doc" className="text-label font-semibold text-fg">
          {tr('Photo ID and selfie')}
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          <SelectInput<IdType> id="kyc-id-type" label="ID type" value={i.idType} onChange={(idType) => setId({ idType })} options={idOptions.map((o) => ({ value: o.value, label: tr(o.label) }))} disabled={disabled} />
          <TextInput id="kyc-id-number" label="ID number" value={i.idNumber} onChange={(e) => setId({ idNumber: e.target.value })} error={errors.idNumber} disabled={disabled} />
          {needsExpiry && <TextInput id="kyc-id-expiry" label="Expiry date" type="date" value={i.idExpiry} onChange={(e) => setId({ idExpiry: e.target.value })} error={errors.idExpiry} disabled={disabled} />}
        </div>
        <DocUpload id="kyc-id-front" label="Photo of your ID" hint="All four corners visible, no glare. The photo page for passports." value={i.idFront} onChange={(idFront) => setId({ idFront })} error={errors.idFront} disabled={disabled} />
        <div>
          <p className="text-label font-medium text-fg">{tr('Liveness selfie')}</p>
          <p className="mt-0.5 text-caption text-fg-subtle">{tr('You’ll be asked to turn your head slowly. We compare it with your ID photo.')}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            {i.selfie ?
            <>
                <CheckBadge result={i.checks.liveness} label={tr('Liveness')} />
                {!disabled &&
              <Button size="sm" variant="tertiary" leadingIcon={CameraIcon} onClick={liveness}>
                    Retake
                  </Button>
              }
              </> :

            <Button variant="secondary" leadingIcon={ScanFaceIcon} onClick={liveness} loading={scanning} disabled={disabled}>
                {tr(scanning ? 'Checking…' : 'Start selfie check')}
              </Button>
            }
          </div>
          {errors.selfie && <p role="alert" className="mt-1.5 text-caption font-medium text-danger">{tr(errors.selfie)}</p>}
        </div>
      </section>
    </div>);

}