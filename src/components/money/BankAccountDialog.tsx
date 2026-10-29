import React, { useEffect, useState } from 'react';
import { CheckCircle2Icon, AlertTriangleIcon, XCircleIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { BankAccount, MoneyData } from '../../types/money';
import { BANK_COOLDOWN_HOURS, nameMatchOf } from '../../utils/money/store';
import { uid } from '../../utils/id';
import { useT } from '../../contexts/LocaleContext';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { TextInput } from '../ui/TextInput';
import { SelectInput } from '../ui/SelectInput';
import { ConfirmMoneyDialog } from './ConfirmMoneyDialog';

const banks = ['Access Bank', 'First Bank', 'GTBank', 'Kuda', 'Moniepoint', 'Opay', 'Stanbic IBTC', 'UBA', 'Wema Bank', 'Zenith Bank'];

interface BankAccountDialogProps {
  open: boolean;
  onClose: () => void;
  data: MoneyData;
  update: (fn: (d: MoneyData) => MoneyData) => void;
  businessName: string;
}

/** Add a payout account. The name on the account is checked against the business (D92). */
export function BankAccountDialog({ open, onClose, data, update, businessName }: BankAccountDialogProps) {
  const { t: tr } = useT();
  const [bank, setBank] = useState('GTBank');
  const [number, setNumber] = useState('');
  const [looked, setLooked] = useState<string | null>(null);
  const [looking, setLooking] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!open) return;
    setNumber('');
    setLooked(null);
    setLooking(false);
    setConfirming(false);
  }, [open]);

  useEffect(() => setLooked(null), [number, bank]);

  const valid = /^\d{10}$/.test(number);
  const match = looked ? nameMatchOf(looked, businessName) : null;
  const first = data.banks.length === 0;

  const lookUp = () => {
    if (!valid) return;
    setLooking(true);
    window.setTimeout(() => {
      setLooking(false);
      // Simulated bank name lookup: test account numbers ending in 0000 belong to someone else (D242).
      setLooked(number.endsWith('0000') ? 'CHINEDU OKORO' : businessName.toUpperCase());
    }, 700);
  };

  const save = () => {
    if (!looked || !match) return;
    const now = Date.now();
    const account: BankAccount = {
      id: uid('bank'),
      bankName: bank,
      last4: number.slice(-4),
      accountName: looked,
      nameMatch: match,
      addedAt: new Date(now).toISOString(),
      usableAt: new Date(first ? now : now + BANK_COOLDOWN_HOURS * 3_600_000).toISOString(),
      primary: first
    };
    update((d) => ({ ...d, banks: [...d.banks, account] }));
    setConfirming(false);
    onClose();
    toast.success(tr('Bank account added'), { description: first ? tr('You can pay out to it now.') : tr('For your safety it can receive payouts in {n} hours. We’ve emailed you about this change.', { n: BANK_COOLDOWN_HOURS }) });
  };

  return (
    <>
      <Dialog
        open={open && !confirming}
        onClose={onClose}
        title="Add a bank account"
        description="Payouts can only go to an account in your business’s name."
        footer={
        <>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            {looked ?
          <Button onClick={() => setConfirming(true)} disabled={match === 'mismatch'}>
                Add account
              </Button> :

          <Button onClick={lookUp} loading={looking} disabled={!valid}>
                Check account
              </Button>
          }
          </>
        }>
        
        <div className="flex flex-col gap-4">
          <SelectInput id="bank-name" label={tr('Bank')} value={bank} onChange={setBank} options={banks.map((b) => ({ value: b, label: b }))} />
          <TextInput id="bank-number" label="Account number" inputMode="numeric" maxLength={10} value={number} onChange={(e) => setNumber(e.target.value.replace(/\D/g, ''))} hint={tr('10 digits (NUBAN)')} error={number.length > 0 && number.length !== 10 ? tr('Account numbers have 10 digits.') : undefined} />
          {!looked && <p className="text-caption text-fg-subtle">{tr('We’ll ask your bank for the name on this account and check it matches {name}.', { name: businessName })}</p>}
          {looked && match &&
          <div className={match === 'mismatch' ? 'rounded-md bg-danger-soft px-4 py-3 text-danger' : match === 'close' ? 'rounded-md bg-warning-soft px-4 py-3 text-warning' : 'rounded-md bg-success-soft px-4 py-3 text-success'} role="status">
              <p className="flex items-center gap-2 text-label font-semibold">
                {match === 'match' ? <CheckCircle2Icon size={16} aria-hidden /> : match === 'close' ? <AlertTriangleIcon size={16} aria-hidden /> : <XCircleIcon size={16} aria-hidden />}
                {looked}
              </p>
              <p className="mt-1 text-caption">
                {match === 'match' ?
              tr('Matches {name}.', { name: businessName }) :
              match === 'close' ?
              tr('Partly matches {name}. Payouts to this account may be checked by KUBICU first.', { name: businessName }) :
              tr('Doesn’t match {name}. Use an account in your business’s name, or update your business name in Settings.', { name: businessName })}
              </p>
            </div>
          }
          {!first && <p className="text-caption text-fg-subtle">{tr('New accounts wait {n} hours before they can receive payouts. This protects you if someone gets into your account.', { n: BANK_COOLDOWN_HOURS })}</p>}
        </div>
      </Dialog>
      <ConfirmMoneyDialog open={confirming} onClose={() => setConfirming(false)} title={tr('Confirm new bank account')} summary={tr('Add {bank} ····{last4} for payouts.', { bank, last4: number.slice(-4) })} confirmLabel={tr('Add account')} onConfirm={save} />
    </>);

}