import React from 'react';
import { BadgeCheckIcon, AlertTriangleIcon, XCircleIcon, PlusIcon, CheckIcon } from 'lucide-react';
import type { BankAccount } from '../../../types/money';
import { verifiedName } from '../../../utils/money/kyc';
import type { KycStepProps } from '../stepProps';
import { Button } from '../../ui/Button';
import { cn } from '../../../utils/cn';
import { useT } from '../../../contexts/LocaleContext';

interface PayoutStepProps extends KycStepProps {
  /** Bank accounts with their name match worked out against the verified name. */
  banks: BankAccount[];
  onAddBank: () => void;
}

const matchCopy = {
  match: { icon: BadgeCheckIcon, text: 'Name matches', cls: 'text-success' },
  close: { icon: AlertTriangleIcon, text: 'Partly matches — a reviewer will check', cls: 'text-warning' },
  mismatch: { icon: XCircleIcon, text: 'Name doesn’t match — can’t be used', cls: 'text-danger' },
};

/** The account payouts go to. Its name must match the verified person or registered business. */
export function PayoutStep({ k, set, errors, disabled, banks, onAddBank }: PayoutStepProps) {
  const { t: tr } = useT();
  const name = verifiedName(k).trim();
  return (
    <div className="flex flex-col gap-4">
      <p className="text-label text-fg-muted">
        {tr('Payouts can only go to an account in the name')} <span className="font-semibold text-fg">{name || '—'}</span>
        {k.entity === 'company' ? `. ${tr('Use a corporate account, not a personal one.')}` : '.'}
      </p>
      {banks.length > 0 ? (
        <fieldset aria-describedby={errors.payoutBankId ? 'kyc-bank-error' : undefined}>
          <legend className="sr-only">{tr('Payout account')}</legend>
          <ul className="flex flex-col gap-2">
            {banks.map((b) => {
              const m = matchCopy[b.nameMatch];
              const on = k.payoutBankId === b.id;
              const unusable = b.nameMatch === 'mismatch';
              return (
                <li key={b.id}>
                  <label
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors duration-150 ease-out focus-within:ring-2 focus-within:ring-focus',
                      on ? 'border-select bg-action-soft' : 'border-line bg-raised hover:border-line-strong',
                      (disabled || unusable) && 'cursor-not-allowed opacity-60',
                    )}
                  >
                    <input type="radio" name="kyc-bank" className="sr-only" checked={on} disabled={disabled || unusable} onChange={() => set((c) => ({ ...c, payoutBankId: b.id }))} />
                    <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full border', on ? 'border-action bg-action text-action-fg' : 'border-line-strong')} aria-hidden>
                      {on && <CheckIcon size={12} strokeWidth={3} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-label font-semibold text-fg">
                        {b.bankName} ····{b.last4}
                      </span>
                      <span className="block truncate text-caption text-fg-subtle">{b.accountName}</span>
                    </span>
                    <span className={cn('flex shrink-0 items-center gap-1 text-caption font-medium', m.cls)}>
                      <m.icon size={14} aria-hidden /> <span className="hidden sm:inline">{tr(m.text)}</span>
                      <span className="sr-only sm:hidden">{tr(m.text)}</span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>
      ) : (
        <p className="rounded-md bg-sunken px-4 py-3 text-label text-fg-muted">{tr('No bank accounts yet. Add one in the verified name.')}</p>
      )}
      {errors.payoutBankId && (
        <p id="kyc-bank-error" role="alert" className="text-caption font-medium text-danger">
          {tr(errors.payoutBankId)}
        </p>
      )}
      {!disabled && (
        <div>
          <Button variant="secondary" leadingIcon={PlusIcon} onClick={onAddBank}>
            Add a bank account
          </Button>
        </div>
      )}
    </div>
  );
}
