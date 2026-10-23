import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { MoneyData } from '../../types/money';
import { balances, createPayout, paidOutToday, payoutFee, tierInfo, usableBanks } from '../../utils/money/store';
import { formatNgn } from '../../utils/format';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { TextInput } from '../ui/TextInput';
import { SelectInput } from '../ui/SelectInput';
import { Segmented } from '../ui/Segmented';
import { Field } from '../ui/Field';
import { ConfirmMoneyDialog } from './ConfirmMoneyDialog';

interface PayoutDialogProps {
  open: boolean;
  onClose: () => void;
  data: MoneyData;
  update: (fn: (d: MoneyData) => MoneyData) => void;
  by: string;
}

/** Pay out now: amount, bank, fee and arrival, then password + two-step code (D92). */
export function PayoutDialog({ open, onClose, data, update, by }: PayoutDialogProps) {
  const banks = usableBanks(data);
  const available = balances(data).available;
  const fee = payoutFee(false);
  const todayLeft = Math.max(0, tierInfo[data.verification.tier].dailyPayoutNgn - paidOutToday(data));
  const max = Math.max(0, Math.min(available - fee, todayLeft));
  const [amount, setAmount] = useState('');
  const [bankId, setBankId] = useState('');
  const [outcome, setOutcome] = useState<'paid' | 'failed'>('paid');
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!open) return;
    setAmount(max > 0 ? String(max) : '');
    setBankId((banks.find((b) => b.primary) ?? banks[0])?.id ?? '');
    setOutcome('paid');
    setError(null);
    setConfirming(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const value = Number(amount.replace(/[^\d]/g, '')) || 0;
  const bank = banks.find((b) => b.id === bankId);
  const arrives = new Date().getHours() < 15 ? 'today, usually within 2 hours' : 'by 10am the next business day';

  const check = () => {
    if (value < 1000) return setError('The smallest payout is ₦1,000.');
    if (value > max) return setError(`You can pay out up to ${formatNgn(max)} right now${todayLeft < available - fee ? ' (today’s limit)' : ''}.`);
    if (!bank) return setError('Choose a bank account.');
    setError(null);
    setConfirming(true);
  };

  const confirm = () => {
    const res = createPayout(data, { amountNgn: value, bankId, by, outcome, auto: false });
    if ('error' in res) {
      setConfirming(false);
      return setError(res.error);
    }
    update(() => res.data);
    setConfirming(false);
    onClose();
    toast.success(`Payout of ${formatNgn(value)} on its way`, { description: `To ${res.payout.bankLabel} · arrives ${arrives}.` });
  };

  return (
    <>
      <Dialog
        open={open && !confirming}
        onClose={onClose}
        title="Pay out to your bank"
        description={`${formatNgn(available)} available · up to ${formatNgn(todayLeft)} more today on ${tierInfo[data.verification.tier].label}.`}
        footer={
        <>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={check} disabled={!banks.length || max < 1000}>
              Continue
            </Button>
          </>
        }>
        
        <div className="flex flex-col gap-4">
          <TextInput
            id="payout-amount"
            label="Amount"
            prefix="₦"
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))}
            error={error ?? undefined}
            fieldClassName="w-full"
            hint={max >= 1000 ? `Most you can pay out now: ${formatNgn(max)}` : undefined} />
          
          {max >= 1000 && value !== max &&
          <button type="button" onClick={() => setAmount(String(max))} className="-mt-2 self-start text-caption font-medium text-action underline-offset-2 hover:underline">
              Pay out {formatNgn(max)}
            </button>
          }
          <SelectInput id="payout-bank" label="To" value={bankId} onChange={setBankId} options={banks.map((b) => ({ value: b.id, label: `${b.bankName} ····${b.last4} · ${b.accountName}` }))} />
          <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1.5 rounded-md bg-sunken px-4 py-3 text-label">
            <dt className="text-fg-muted">You receive</dt>
            <dd className="text-right font-semibold tabular-nums text-fg">{formatNgn(value)}</dd>
            <dt className="text-fg-muted">Payout fee (example)</dt>
            <dd className="text-right tabular-nums text-fg">{formatNgn(fee)}</dd>
            <dt className="text-fg-muted">Taken from wallet</dt>
            <dd className="text-right tabular-nums text-fg">{formatNgn(value + fee)}</dd>
            <dt className="col-span-2 mt-1 text-caption text-fg-subtle">Arrives {arrives}. Scheduled payouts are free.</dt>
          </dl>
          <Field id="payout-sim" label="Prototype: what the bank does">
            <Segmented ariaLabel="Simulated bank result" value={outcome} onChange={setOutcome} options={[{ value: 'paid', label: 'Accepts' }, { value: 'failed', label: 'Returns it' }]} />
          </Field>
        </div>
      </Dialog>
      <ConfirmMoneyDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Confirm payout"
        summary={
        <>
            Send {formatNgn(value)} to {bank ? `${bank.bankName} ····${bank.last4}` : 'your bank'}.
          </>
        }
        confirmLabel="Pay out"
        onConfirm={confirm} />
      
    </>);

}