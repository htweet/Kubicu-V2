import React from 'react';
import { PlusIcon, Trash2Icon, UserPlusIcon } from 'lucide-react';
import type { KycPerson, PersonRole } from '../../../types/kyc';
import { blankPerson, personErrors, simulateIdCheck } from '../../../utils/money/kyc';
import type { KycStepProps } from '../stepProps';
import { TextInput } from '../../ui/TextInput';
import { SelectInput } from '../../ui/SelectInput';
import { Button } from '../../ui/Button';
import { CheckBadge } from '../CheckBadge';
import { ConsentCheck } from '../ConsentCheck';
import { useT } from '../../../contexts/LocaleContext';

const roleOptions: {value: PersonRole;label: string;}[] = [
{ value: 'director', label: 'Director' },
{ value: 'owner', label: 'Owner (25% or more)' },
{ value: 'both', label: 'Director and owner' }];


/** KYB: every director and every beneficial owner (25%+), each checked against their BVN. */
export function PeopleStep({ k, set, errors, disabled }: KycStepProps) {
  const { t: tr } = useT();
  const company = k.entity === 'company';
  const update = (id: string, patch: Partial<KycPerson>) =>
  set((c) => ({ ...c, people: c.people.map((p) => p.id === id ? { ...p, ...patch, check: patch.bvn !== undefined ? simulateIdCheck(patch.bvn) : p.check } : p) }));
  const add = (p: KycPerson = blankPerson()) => set((c) => ({ ...c, people: [...c.people, company ? p : { ...p, role: 'both', ownershipPct: c.people.length ? 0 : 100 }] }));
  const remove = (id: string) => set((c) => ({ ...c, people: c.people.filter((p) => p.id !== id) }));
  const addMe = () => add({ ...blankPerson(), fullName: k.identity.legalName, dob: k.identity.dob, bvn: k.identity.bvn, check: k.identity.checks.bvn, role: 'both', ownershipPct: 100 });
  const meAdded = k.people.some((p) => p.bvn && p.bvn === k.identity.bvn);
  const total = k.people.reduce((s, p) => s + (p.role === 'director' ? 0 : p.ownershipPct), 0);

  return (
    <div className="flex flex-col gap-5">
      <p className="text-label text-fg-muted">
        {tr(company ? 'List every director, and anyone who owns or controls 25% or more of the company. They should match your CAC status report.' : 'List every proprietor named on your BN registration.')}
      </p>

      {k.people.length > 0 &&
      <ul className="flex flex-col gap-4">
          {k.people.map((p, idx) => {
          const missing = personErrors(p);
          return (
            <li key={p.id} className="rounded-lg border border-line bg-raised p-4 md:p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-label font-semibold text-fg">{p.fullName.trim() || tr('Person {n}', { n: idx + 1 })}</p>
                  <span className="flex items-center gap-2">
                    {p.check !== 'not_run' && <CheckBadge result={p.check} label="BVN" />}
                    {!disabled && <Button size="sm" variant="tertiary" leadingIcon={Trash2Icon} aria-label={tr('Remove {name}', { name: p.fullName || tr('Person {n}', { n: idx + 1 }) })} onClick={() => remove(p.id)} />}
                  </span>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <TextInput id={`kp-name-${p.id}`} label="Full name" value={p.fullName} onChange={(e) => update(p.id, { fullName: e.target.value })} disabled={disabled} />
                  <TextInput id={`kp-dob-${p.id}`} label="Date of birth" type="date" value={p.dob} onChange={(e) => update(p.id, { dob: e.target.value })} disabled={disabled} />
                  <TextInput id={`kp-bvn-${p.id}`} label="BVN" inputMode="numeric" maxLength={11} value={p.bvn} onChange={(e) => update(p.id, { bvn: e.target.value.replace(/\D/g, '') })} disabled={disabled} />
                  <div className="grid grid-cols-[minmax(0,1fr)_7rem] gap-3">
                    {company ? <SelectInput id={`kp-role-${p.id}`} label="Role" value={p.role} onChange={(role) => update(p.id, { role, ownershipPct: role === 'director' ? 0 : p.ownershipPct })} options={roleOptions.map((o) => ({ ...o, label: tr(o.label) }))} disabled={disabled} /> : <TextInput id={`kp-role-${p.id}`} label="Role" value={tr('Proprietor')} readOnly disabled />}
                    <TextInput
                    id={`kp-own-${p.id}`}
                    label="Owns"
                    inputMode="numeric"
                    value={p.role === 'director' ? '—' : String(p.ownershipPct || '')}
                    onChange={(e) => update(p.id, { ownershipPct: Math.min(100, Number(e.target.value.replace(/\D/g, '')) || 0) })}
                    disabled={disabled || p.role === 'director'}
                    placeholder="%" />
                  
                  </div>
                </div>
                <div className="mt-4">
                  <ConsentCheck id={`kp-pep-${p.id}`} checked={p.pep} onChange={(pep) => update(p.id, { pep })} disabled={disabled} label="This person holds, or is closely related to someone who holds, a prominent public role (PEP)" />
                </div>
                {missing.length > 0 && errors.people && <p className="mt-3 text-caption font-medium text-danger">{tr('Still needed: {list}.', { list: missing.map((m) => tr(m)).join(', ') })}</p>}
              </li>);

        })}
        </ul>
      }

      {!disabled &&
      <div className="flex flex-wrap gap-2">
          {!meAdded && k.identity.legalName &&
        <Button variant="secondary" leadingIcon={UserPlusIcon} onClick={addMe}>
              {tr('Add me ({name})', { name: k.identity.legalName.split(' ')[0] })}
            </Button>
        }
          <Button variant="secondary" leadingIcon={PlusIcon} onClick={() => add()}>
            {tr(company ? 'Add a director or owner' : 'Add a proprietor')}
          </Button>
        </div>
      }

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4 text-caption">
        <span className="text-fg-muted">
          {tr(k.people.length === 1 ? '{n} person listed' : '{n} people listed', { n: k.people.length })}
        </span>
        <span className={total > 100 ? 'font-medium text-danger' : 'text-fg-muted'}>{tr('Declared ownership: {n}%', { n: total })}</span>
      </div>
      {errors.people &&
      <p className="text-caption font-medium text-danger" role="alert">
          {tr(errors.people)}
        </p>
      }
    </div>);

}