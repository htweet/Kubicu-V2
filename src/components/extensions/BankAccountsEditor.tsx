import React from 'react';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { TextInput } from '../ui/TextInput';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { MAX_BANK_ACCOUNTS, accountIssue, type TransferDetails } from '../../utils/commerce/bankTransfer';

interface BankAccountsEditorProps {
  accounts: TransferDetails[];
  onChange: (list: TransferDetails[]) => void;
  showErrors: boolean;
}

/** Up to three accounts buyers can transfer to, each with the name on the account (D223). */
export function BankAccountsEditor({ accounts, onChange, showErrors }: BankAccountsEditorProps) {
  const set = (i: number, p: Partial<TransferDetails>) => onChange(accounts.map((a, n) => (n === i ? { ...a, ...p } : a)));
  return (
    <div className="flex flex-col gap-4">
      <p className="text-caption text-fg-muted">Buyers see these at checkout and on their order page, with the order number as the reference. The account name helps them check they’re paying the right person.</p>
      <ol className="flex flex-col gap-4">
        {accounts.map((a, i) => {
          const err = showErrors ? accountIssue(a) : {};
          return (
            <li key={i} className="flex flex-col gap-3 rounded-md border border-line p-3.5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-label font-semibold text-fg">{accounts.length > 1 ? `Account ${i + 1}${i === 0 ? ' · shown first' : ''}` : 'Your account'}</p>
                {accounts.length > 1 && <IconButton icon={Trash2Icon} size="sm" label={`Remove account ${i + 1}`} onClick={() => onChange(accounts.filter((_, n) => n !== i))} />}
              </div>
              <TextInput id={`bt-bank-${i}`} label="Bank" placeholder="e.g. GTBank" hint="As customers know it." value={a.bank} error={err.bank} onChange={(e) => set(i, { bank: e.target.value.slice(0, 40) })} />
              <TextInput id={`bt-acct-${i}`} label="Account number" inputMode="numeric" placeholder="0123456789" hint="10-digit NUBAN." value={a.account} error={err.account} onChange={(e) => set(i, { account: e.target.value.replace(/\D/g, '').slice(0, 10) })} />
              <TextInput id={`bt-name-${i}`} label="Account name" placeholder="e.g. Adaeze Atelier Ltd" hint="Exactly as your bank shows it to people paying you." value={a.accountName} error={err.accountName} onChange={(e) => set(i, { accountName: e.target.value.slice(0, 60) })} />
            </li>
          );
        })}
      </ol>
      {accounts.length < MAX_BANK_ACCOUNTS && (
        <Button variant="secondary" size="sm" leadingIcon={PlusIcon} className="self-start" onClick={() => onChange([...accounts, { bank: '', account: '', accountName: '' }])}>
          Add another account
        </Button>
      )}
      <p className="text-caption text-fg-subtle">In this prototype the account name isn’t checked with the bank. A live version would confirm it before saving.</p>
    </div>
  );
}
