import React from 'react';
import { FileTextIcon, PencilIcon } from 'lucide-react';
import type { BankAccount } from '../../types/money';
import type { KycCase, KycDoc, KycStepId } from '../../types/kyc';
import { entityInfo, fundsLabels, idTypeLabels, proofLabels, stepLabels, stepsFor, volumeLabels } from '../../utils/money/kyc';
import { formatDay } from '../../utils/serviceOs';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { CheckBadge } from './CheckBadge';

interface KycSummaryProps {
  k: KycCase;
  banks: BankAccount[];
  /** Owner view: jump back to a step. Omit for read-only (staff review). */
  onEdit?: (step: KycStepId) => void;
  /** Steps KUBICU asked to be fixed — highlighted. */
  flagged?: KycStepId[];
}

const mask = (v: string) => v ? `•••••••${v.slice(-4)}` : '—';
const date = (v: string) => v ? formatDay(v.slice(0, 10)) : '—';

/** Everything submitted for verification, grouped by step. Used for the owner's review and the staff review sheet. */
export function KycSummary({ k, banks, onEdit, flagged = [] }: KycSummaryProps) {
  const steps = stepsFor(k.entity).filter((s) => s !== 'review');
  const bank = banks.find((b) => b.id === k.payoutBankId);
  const i = k.identity;
  const b = k.business;
  const d = k.declarations;

  const content: Record<Exclude<KycStepId, 'review'>, React.ReactNode> = {
    type: <Rows rows={[['Type', k.entity ? entityInfo[k.entity].label : '—']]} />,
    identity:
    <>
        <Rows
        rows={[
        ['Legal name', i.legalName || '—'],
        ['Date of birth', date(i.dob)],
        ['Phone', i.phone ? `${i.phone}${i.phoneVerified ? ' · confirmed' : ' · not confirmed'}` : '—'],
        ['BVN', mask(i.bvn)],
        ['NIN', mask(i.nin)],
        ['ID', `${idTypeLabels[i.idType]} · ${i.idNumber || '—'}${i.idExpiry ? ` · expires ${date(i.idExpiry)}` : ''}`]]
        } />
      
        <div className="mt-3 flex flex-wrap gap-2">
          <CheckBadge result={i.checks.bvn} label="BVN" />
          <CheckBadge result={i.checks.nin} label="NIN" />
          <CheckBadge result={i.checks.liveness} label="Selfie" />
        </div>
        {i.checks.nameOnBvn && <p className="mt-2 text-caption text-fg-muted">Name on BVN: {i.checks.nameOnBvn}</p>}
        <Docs docs={[['Photo ID', i.idFront]]} />
      </>,

    address:
    <>
        <Rows rows={[['Address', [k.address.line1, k.address.city, k.address.state].filter(Boolean).join(', ') || '—'], ['Proof', proofLabels[k.address.proofType]]]} />
        <Docs docs={[['Proof of address', k.address.proof]]} />
      </>,

    business:
    <>
        <Rows
        rows={[
        ['Registered name', b.registeredName || '—'],
        [k.entity === 'company' ? 'RC number' : 'BN number', b.number || '—'],
        ['Registered on', date(b.incorporatedOn)],
        ['TIN', b.tin || 'Not given'],
        ['Industry', b.industry || '—'],
        ['What it does', b.description || '—'],
        ['Website', b.website || 'Not given']]
        } />
      
        <div className="mt-3 flex flex-wrap gap-2">
          <CheckBadge result={b.checks.cac} label="CAC" />
          {b.tin && <CheckBadge result={b.checks.tin} label="TIN" />}
        </div>
        <Docs
        docs={[
        ['CAC certificate', b.certificate],
        [k.entity === 'company' ? 'Status report' : 'BN/1 form', b.statusReport],
        ...(k.entity === 'company' ? [['MEMART', b.memart]] as [string, KycDoc | null][] : [])]
        } />
      
      </>,

    people:
    <ul className="divide-y divide-line rounded-md border border-line">
        {k.people.length === 0 && <li className="px-3 py-2.5 text-caption text-fg-muted">No one listed</li>}
        {k.people.map((p) =>
      <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5">
            <span className="min-w-0">
              <span className="block text-label font-medium text-fg">{p.fullName || 'Unnamed'}</span>
              <span className="block text-caption text-fg-subtle">
                {p.role === 'director' ? 'Director' : p.role === 'owner' ? `Owner · ${p.ownershipPct}%` : `Director and owner · ${p.ownershipPct}%`} · BVN {mask(p.bvn)}
              </span>
            </span>
            <span className="flex flex-wrap gap-1.5">
              {p.pep && <Badge tone="warning">PEP</Badge>}
              <CheckBadge result={p.check} label="BVN" />
            </span>
          </li>
      )}
      </ul>,

    payout: <Rows rows={[['Account', bank ? `${bank.bankName} ····${bank.last4} · ${bank.accountName}` : '—'], ['Name check', bank ? bank.nameMatch === 'match' ? 'Matches' : bank.nameMatch === 'close' ? 'Partly matches' : 'Doesn’t match' : '—']]} />,
    declarations:
    <Rows
      rows={[
      ['Monthly sales', d.monthlyVolume ? volumeLabels[d.monthlyVolume] : '—'],
      ['Source of funds', d.sourceOfFunds ? `${fundsLabels[d.sourceOfFunds]}${d.sourceDetail ? ` — ${d.sourceDetail}` : ''}` : '—'],
      ['Public role (PEP)', d.pep ? `Yes — ${d.pepDetail}` : 'No'],
      ['Confirmed and agreed', d.accurate && d.terms ? 'Yes' : 'No']]
      } />


  };

  return (
    <div className="flex flex-col divide-y divide-line">
      {steps.map((s) =>
      <section key={s} aria-labelledby={`kyc-sum-${s}`} className="py-5 first:pt-0 last:pb-0">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 id={`kyc-sum-${s}`} className="flex items-center gap-2 text-label font-semibold text-fg">
              {stepLabels[s].label}
              {flagged.includes(s) && <Badge tone="warning">Change requested</Badge>}
            </h3>
            {onEdit &&
          <Button size="sm" variant="tertiary" leadingIcon={PencilIcon} onClick={() => onEdit(s)} aria-label={`Edit ${stepLabels[s].label}`}>
                Edit
              </Button>
          }
          </div>
          {content[s as Exclude<KycStepId, 'review'>]}
        </section>
      )}
    </div>);

}

function Rows({ rows }: {rows: [string, string][];}) {
  return (
    <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-[10rem_minmax(0,1fr)]">
      {rows.map(([label, value]) =>
      <React.Fragment key={label}>
          <dt className="text-caption text-fg-subtle">{label}</dt>
          <dd className="break-words text-label text-fg">{value}</dd>
        </React.Fragment>
      )}
    </dl>);

}

function Docs({ docs }: {docs: [string, KycDoc | null][];}) {
  return (
    <ul className="mt-3 flex flex-wrap gap-2">
      {docs.map(([label, doc]) =>
      <li key={label} className="inline-flex max-w-full items-center gap-1.5 rounded-md bg-sunken px-2.5 py-1.5 text-caption text-fg-muted">
          <FileTextIcon size={13} aria-hidden className="shrink-0" />
          <span className="truncate">
            {label}: {doc ? doc.name : 'missing'}
          </span>
        </li>
      )}
    </ul>);

}