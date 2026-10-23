import React from 'react';
import { BriefcaseIcon, Building2Icon, CheckIcon, UserIcon } from 'lucide-react';
import type { EntityType } from '../../../types/kyc';
import { entityInfo } from '../../../utils/money/kyc';
import type { KycStepProps } from '../stepProps';
import { cn } from '../../../utils/cn';

const icons: Record<EntityType, typeof UserIcon> = { individual: UserIcon, business_name: BriefcaseIcon, company: Building2Icon };

/** Step 1: who is getting paid. Decides which checks apply (KYC vs KYB). */
export function TypeStep({ k, set, errors, disabled }: KycStepProps) {
  const choose = (entity: EntityType) => set((c) => ({ ...c, entity, people: entity === 'individual' ? [] : c.people }));
  return (
    <fieldset aria-describedby={errors.entity ? 'kyc-entity-error' : undefined}>
      <legend className="sr-only">How is your business set up?</legend>
      <div className="grid gap-3 md:grid-cols-3">
        {(Object.keys(entityInfo) as EntityType[]).map((id) => {
          const info = entityInfo[id];
          const Icon = icons[id];
          const on = k.entity === id;
          return (
            <label
              key={id}
              className={cn(
                'relative flex cursor-pointer flex-col rounded-lg border p-4 transition-colors duration-150 ease-out focus-within:ring-2 focus-within:ring-focus',
                on ? 'border-select bg-action-soft' : 'border-line bg-raised hover:border-line-strong',
                disabled && 'cursor-not-allowed opacity-60'
              )}>
              
              <input type="radio" name="kyc-entity" value={id} checked={on} disabled={disabled} onChange={() => choose(id)} className="sr-only" />
              <span className="flex items-center justify-between">
                <span className={cn('flex h-9 w-9 items-center justify-center rounded-md', on ? 'bg-action text-action-fg' : 'bg-sunken text-fg-muted')}>
                  <Icon size={18} strokeWidth={2.25} aria-hidden />
                </span>
                {on && <CheckIcon size={18} className="text-action" aria-hidden />}
              </span>
              <span className="mt-3 text-label font-semibold text-fg">{info.label}</span>
              <span className="mt-1 text-caption text-fg-muted">{info.blurb}</span>
              <span className="mt-3 border-t border-line pt-3 text-caption text-fg-subtle">You’ll need</span>
              <ul className="mt-1.5 flex flex-col gap-1">
                {info.needs.map((n) =>
                <li key={n} className="text-caption text-fg-muted">
                    · {n}
                  </li>
                )}
              </ul>
            </label>);

        })}
      </div>
      {errors.entity &&
      <p id="kyc-entity-error" className="mt-2 text-caption font-medium text-danger">
          {errors.entity}
        </p>
      }
      <p className="mt-4 text-caption text-fg-subtle">Not sure? If you have a CAC certificate, choose the type printed on it. Registered businesses get higher payout limits.</p>
    </fieldset>);

}