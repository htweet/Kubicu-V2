import React from 'react';
import type { KycAddress } from '../../../types/kyc';
import { nigerianStates, proofLabels } from '../../../utils/money/kyc';
import type { KycStepProps } from '../stepProps';
import { TextInput } from '../../ui/TextInput';
import { SelectInput } from '../../ui/SelectInput';
import { DocUpload } from '../DocUpload';

/** Where the applicant lives or trades, with a recent proof of address. */
export function AddressStep({ k, set, errors, disabled }: KycStepProps) {
  const a = k.address;
  const setA = (patch: Partial<KycAddress>) => set((c) => ({ ...c, address: { ...c.address, ...patch } }));
  const business = k.entity !== 'individual';
  return (
    <div className="flex flex-col gap-4">
      <TextInput id="kyc-line1" label={business ? 'Business or operating address' : 'Home address'} value={a.line1} onChange={(e) => setA({ line1: e.target.value })} error={errors.line1} disabled={disabled} autoComplete="street-address" placeholder="12 Admiralty Way, Lekki Phase 1" />
      <div className="grid gap-4 md:grid-cols-2">
        <TextInput id="kyc-city" label="City or town" value={a.city} onChange={(e) => setA({ city: e.target.value })} error={errors.city} disabled={disabled} autoComplete="address-level2" />
        <SelectInput id="kyc-state" label="State" value={a.state} onChange={(state) => setA({ state })} options={nigerianStates.map((s) => ({ value: s, label: s }))} disabled={disabled} />
      </div>
      <div className="mt-2 flex flex-col gap-4 border-t border-line pt-6">
        <SelectInput<KycAddress['proofType']>
          id="kyc-proof-type"
          label="Proof of address"
          value={a.proofType}
          onChange={(proofType) => setA({ proofType })}
          options={(Object.keys(proofLabels) as KycAddress['proofType'][]).map((v) => ({ value: v, label: proofLabels[v] }))}
          disabled={disabled}
          hint="It must show the same name and address as above." />
        
        <DocUpload id="kyc-proof" label="Upload it" value={a.proof} onChange={(proof) => setA({ proof })} error={errors.proof} disabled={disabled} />
      </div>
    </div>);

}