import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { MoneyData } from '../../types/money';
import { balances, createPayout, minPayout, paidOutToday, payoutArrival, payoutFee, payoutRulesFor, payoutTier, tierInfo, usableBanks } from '../../utils/money/store';
import { formatNgn } from '../../utils/format';
import { currencySymbol } from '../../utils/currency';
import { useT } from '../../contexts/LocaleContext';
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

/** Why a bank or wallet sends a payout back — test mode only (D433). */
const returnReasons = {
  bank: ['The bank returned the transfer: the account is closed or dormant.', 'The bank returned the transfer: the account name didn’t match.'],
  mobile_money: ['The wallet returned the payout: the wallet is full or over its limit.', 'The wallet returned the payout: the number isn’t registered for mobile money.']
};

/**
 * Pay out now: amount, where it goes (bank or mobile money wallet), fee and arrival for that account, then password +
 * two-step code (D92). Minimums, fees, arrival times and wallet caps follow the workspace's country (D432–D433).
 */
export function PayoutDialog({ open, onClose, data, update, by }: PayoutDialogProps) {
  const { t: tr } = useT();
  const banks = usableBanks(data);
  const available = balances(data).available;
  const fee = payoutFee(false);
  const min = minPayout();
  const todayLeft = Math.max(0, tierInfo[payoutTier(data)].dailyPayoutNgn - paidOutToday(data));
  const max = Math.max(0, Math.min(available - fee, todayLeft));
  const [amount, setAmount] = useState('');
  const [bankId, setBankId] = useState('');
  const [outcome, setOutcome] = useState<'paid' | 'failed'>('paid');
  const [reasonIdx, setReasonIdx] = useState('0');
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!open) return;
    setAmount(max > 0 ? String(max) : '');
    setBankId((banks.find((b) => b.primary) ?? banks[0])?.id ?? '');
    setOutcome('paid');
    setReasonIdx('0');
    setError(null);
    setConfirming(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const value = Number(amount.replace(/[^\d]/g, '')) || 0;
  const bank = banks.find((b) => b.id === bankId);
  const kind = bank?.kind ?? 'bank';
  const arrives = tr(payoutArrival(kind));
  const reasons = returnReasons[kind];
  const walletCap = kind === 'mobile_money' ? payoutRulesFor().walletMaxPerTransfer : null;

  const check = () => {
    if (value < min) return setError(tr('The smallest payout is {amount}.', { amount: formatNgn(min) }));
    if (value > max) return setError(tr(todayLeft < available - fee ? 'You can pay out up to {amount} right now (today’s limit).' : 'You can pay out up to {amount} right now.', { amount: formatNgn(max) }));
    if (!bank) return setError(tr('Choose a bank account.'));
    if (walletCap && value > walletCap) return setError(tr('{wallet} takes up to {amount} in one payout. Send the rest in another payout or to a bank account.', { wallet: bank.bankName, amount: formatNgn(walletCap) }));
    setError(null);
    setConfirming(true);
  };

  const confirm = () => {
    const res = createPayout(data, { amountNgn: value, bankId, by, outcome, auto: false, returnReason: outcome === 'failed' ? reasons[Number(reasonIdx)] : undefined });
    if ('error' in res) {
      setConfirming(false);
      return setError(res.error);
    }
    update(() => res.data);
    setConfirming(false);
    onClose();
    toast.success(tr('Payout of {amount} on its way', { amount: formatNgn(value) }), { description: tr('To {bank} · arrives {when}.', { bank: res.payout.bankLabel, when: arrives }) });
  };

  return (
    <>
      <Dialog
        open={open && !confirming}
        onClose={onClose}
        title="Pay out"
        description={tr('{available} available · up to {left} more today on {tier}.', { available: formatNgn(available), left: formatNgn(todayLeft), tier: tierInfo[payoutTier(data)].label })}
        footer={
        <>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={check} disabled={!banks.length || max < min}>
              Continue
            </Button>
          </>
        }>
        
        <div className="flex flex-col gap-4">
          <TextInput
            id="payout-amount"
            label="Amount"
            prefix={currencySymbol()}
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))}
            error={error ?? undefined}
            fieldClassName="w-full"
            hint={max >= min ? tr('Most you can pay out now: {amount}', { amount: formatNgn(max) }) : undefined} />
          
          {max >= min && value !== max &&
          <button type="button" onClick={() => setAmount(String(max))} className="-mt-2 self-start text-caption font-medium text-action underline-offset-2 hover:underline">
              {tr('Pay out {amount}', { amount: formatNgn(max) })}
            </button>
          }
          <SelectInput
            id="payout-bank"
            required
            label={tr('To')}
            value={bankId}
            onChange={setBankId}
            options={banks.map((b) => ({ value: b.id, label: `${b.bankName} ····${b.last4} · ${b.kind === 'mobile_money' ? tr('wallet') : b.accountName}` }))} />
          
          <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1.5 rounded-md bg-sunken px-4 py-3 text-label">
            <dt className="text-fg-muted">{tr('You receive')}</dt>
            <dd className="text-right font-semibold tabular-nums text-fg">{formatNgn(value)}</dd>
            <dt className="text-fg-muted">{tr('Payout fee (example)')}</dt>
            <dd className="text-right tabular-nums text-fg">{formatNgn(fee)}</dd>
            <dt className="text-fg-muted">{tr('Taken from wallet')}</dt>
            <dd className="text-right tabular-nums text-fg">{formatNgn(value + fee)}</dd>
            <dt className="col-span-2 mt-1 text-caption text-fg-subtle">
              {tr('Arrives {when}. Scheduled payouts are free.', { when: arrives })}
              {walletCap ? ` ${tr('Up to {amount} per payout to this wallet.', { amount: formatNgn(walletCap) })}` : ''}
            </dt>
          </dl>
          <Field id="payout-sim" label="Prototype: what the bank or wallet does">
            <Segmented ariaLabel={tr('Simulated bank result')} value={outcome} onChange={setOutcome} options={[{ value: 'paid', label: 'Accepts' }, { value: 'failed', label: 'Returns it' }]} />
          </Field>
          {outcome === 'failed' && <SelectInput id="payout-return" label="Reason it comes back" value={reasonIdx} onChange={setReasonIdx} options={reasons.map((r, i) => ({ value: String(i), label: r }))} />}
        </div>
      </Dialog>
      <ConfirmMoneyDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        title={tr('Confirm payout')}
        summary={<>{tr('Send {amount} to {bank}.', { amount: formatNgn(value), bank: bank ? `${bank.bankName} ····${bank.last4}` : tr('your bank') })}</>}
        confirmLabel={tr('Pay out')}
        onConfirm={confirm} />
      
    </>);

}