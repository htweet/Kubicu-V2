import React, { useEffect, useState } from 'react';
import { CheckCircle2Icon, AlertTriangleIcon, XCircleIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { BankAccount, MoneyData } from '../../types/money';
import { BANK_COOLDOWN_HOURS, nameMatchOf } from '../../utils/money/store';
import { uid } from '../../utils/id';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { TextInput } from '../ui/TextInput';
import { SelectInput } from '../ui/SelectInput';
import { Segmented } from '../ui/Segmented';
import { Field } from '../ui/Field';
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
  const [bank, setBank] = useState('GTBank');
  const [number, setNumber] = useState('');
  const [looked, setLooked] = useState<string | null>(null);
  const [looking, setLooking] = useState(false);
  const [simulate, setSimulate] = useState<'same' | 'different'>('same');
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!open) return;
    setNumber('');
    setLooked(null);
    setLooking(false);
    setConfirming(false);
  }, [open]);

  useEffect(() => setLooked(null), [number, bank, simulate]);

  const valid = /^\d{10}$/.test(number);
  const match = looked ? nameMatchOf(looked, businessName) : null;
  const first = data.banks.length === 0;

  const lookUp = () => {
    if (!valid) return;
    setLooking(true);
    window.setTimeout(() => {
      setLooking(false);
      setLooked(simulate === 'same' ? businessName.toUpperCase() : 'CHINEDU OKORO');
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
    toast.success('Bank account added', { description: first ? 'You can pay out to it now.' : `For your safety it can receive payouts in ${BANK_COOLDOWN_HOURS} hours. We’ve emailed you about this change.` });
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
          <SelectInput id="bank-name" label="Bank" value={bank} onChange={setBank} options={banks.map((b) => ({ value: b, label: b }))} />
          <TextInput id="bank-number" label="Account number" inputMode="numeric" maxLength={10} value={number} onChange={(e) => setNumber(e.target.value.replace(/\D/g, ''))} hint="10 digits (NUBAN)" error={number.length > 0 && number.length !== 10 ? 'Account numbers have 10 digits.' : undefined} />
          <Field id="bank-sim" label="Prototype: name on the account">
            <Segmented ariaLabel="Simulated account name" value={simulate} onChange={setSimulate} options={[{ value: 'same', label: 'Business name' }, { value: 'different', label: 'Someone else' }]} />
          </Field>
          {looked && match &&
          <div className={match === 'mismatch' ? 'rounded-md bg-danger-soft px-4 py-3 text-danger' : match === 'close' ? 'rounded-md bg-warning-soft px-4 py-3 text-warning' : 'rounded-md bg-success-soft px-4 py-3 text-success'} role="status">
              <p className="flex items-center gap-2 text-label font-semibold">
                {match === 'match' ? <CheckCircle2Icon size={16} aria-hidden /> : match === 'close' ? <AlertTriangleIcon size={16} aria-hidden /> : <XCircleIcon size={16} aria-hidden />}
                {looked}
              </p>
              <p className="mt-1 text-caption">
                {match === 'match' ?
              `Matches ${businessName}.` :
              match === 'close' ?
              `Partly matches ${businessName}. Payouts to this account may be checked by KUBICU first.` :
              `Doesn’t match ${businessName}. Use an account in your business’s name, or update your business name in Settings.`}
              </p>
            </div>
          }
          {!first && <p className="text-caption text-fg-subtle">New accounts wait {BANK_COOLDOWN_HOURS} hours before they can receive payouts. This protects you if someone gets into your account.</p>}
        </div>
      </Dialog>
      <ConfirmMoneyDialog open={confirming} onClose={() => setConfirming(false)} title="Confirm new bank account" summary={`Add ${bank} ····${number.slice(-4)} for payouts.`} confirmLabel="Add account" onConfirm={save} />
    </>);

}