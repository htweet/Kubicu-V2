import React, { useEffect, useState } from 'react';
import { CheckCircle2Icon, AlertTriangleIcon, XCircleIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { BankAccount, MoneyData } from '../../types/money';
import { BANK_COOLDOWN_HOURS, nameMatchOf } from '../../utils/money/store';
import { uid } from '../../utils/id';
import { activeCountryInfo } from '../../utils/country';
import { isValidPhone } from '../../utils/validation';
import { phoneIssueIn } from '../../utils/phone';
import { useT } from '../../contexts/LocaleContext';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { TextInput } from '../ui/TextInput';
import { PhoneInput } from '../ui/PhoneInput';
import { SelectInput } from '../ui/SelectInput';
import { Segmented } from '../ui/Segmented';
import { ConfirmMoneyDialog } from './ConfirmMoneyDialog';

interface BankAccountDialogProps {
  open: boolean;
  onClose: () => void;
  data: MoneyData;
  update: (fn: (d: MoneyData) => MoneyData) => void;
  businessName: string;
}

type Kind = 'bank' | 'mobile_money';

/**
 * Add a payout account. The name on the account is checked against the business (D92).
 * Banks and the account-number length follow the workspace's country; in Kenya and Ghana payouts can
 * also go to an M-Pesa or MTN MoMo wallet (D355). The name lookup is simulated.
 */
export function BankAccountDialog({ open, onClose, data, update, businessName }: BankAccountDialogProps) {
  const { t: tr } = useT();
  const country = activeCountryInfo();
  const banks = country.banks;
  const rule = country.accountNumber;
  const wallet = country.mobileMoney;
  const [kind, setKind] = useState<Kind>('bank');
  // Ghana: payouts go to MTN MoMo, Telecel Cash or AirtelTigo Money (D433).
  const networks = wallet?.networks ?? null;
  const [networkId, setNetworkId] = useState(networks?.[0]?.id ?? '');
  const [bank, setBank] = useState(banks.includes('GTBank') ? 'GTBank' : banks[0]);
  const [number, setNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [looked, setLooked] = useState<string | null>(null);
  const [looking, setLooking] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!open) return;
    setNumber('');
    setPhone('');
    setLooked(null);
    setLooking(false);
    setConfirming(false);
  }, [open]);

  useEffect(() => setLooked(null), [number, bank, phone, kind]);

  const isWallet = kind === 'mobile_money' && !!wallet;
  const lengthOk = number.length >= rule.min && number.length <= rule.max;
  const valid = isWallet ? isValidPhone(phone) : lengthOk;
  const match = looked ? nameMatchOf(looked, businessName) : null;
  const first = data.banks.length === 0;
  const digits = isWallet ? phone.replace(/\D/g, '') : number;
  const label = isWallet && wallet ? networks?.find((n) => n.id === networkId)?.name ?? wallet.name : bank;

  const lookUp = () => {
    if (!valid) return;
    setLooking(true);
    window.setTimeout(() => {
      setLooking(false);
      // Simulated name lookup: test numbers ending in 0000 belong to someone else (D242).
      setLooked(digits.endsWith('0000') ? 'CHINEDU OKORO' : businessName.toUpperCase());
    }, 700);
  };

  const save = () => {
    if (!looked || !match) return;
    const now = Date.now();
    const account: BankAccount = {
      id: uid('bank'),
      bankName: label,
      last4: digits.slice(-4),
      accountName: looked,
      nameMatch: match,
      addedAt: new Date(now).toISOString(),
      usableAt: new Date(first ? now : now + BANK_COOLDOWN_HOURS * 3_600_000).toISOString(),
      primary: first,
      kind: isWallet ? 'mobile_money' : 'bank',
    };
    update((d) => ({ ...d, banks: [...d.banks, account] }));
    setConfirming(false);
    onClose();
    toast.success(tr(isWallet ? 'Payout wallet added' : 'Bank account added'), { description: first ? tr('You can pay out to it now.') : tr('For your safety it can receive payouts in {n} hours. We’ve emailed you about this change.', { n: BANK_COOLDOWN_HOURS }) });
  };

  const numberError = number.length > 0 && !lengthOk ? (country.code === 'NG' ? tr('Account numbers have 10 digits.') : tr('Account numbers here are {rule}.', { rule: tr(rule.label) })) : undefined;

  return (
    <>
      <Dialog
        open={open && !confirming}
        onClose={onClose}
        title={wallet ? 'Add a payout account' : 'Add a bank account'}
        description="Payouts can only go to an account in your business’s name."
        footer={
          <>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            {looked ? (
              <Button onClick={() => setConfirming(true)} disabled={match === 'mismatch'}>
                Add account
              </Button>
            ) : (
              <Button onClick={lookUp} loading={looking} disabled={!valid}>
                Check account
              </Button>
            )}
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {wallet && (
            <Segmented<Kind>
              ariaLabel={tr('Pay out to')}
              fullWidth
              value={kind}
              onChange={setKind}
              options={[
                { value: 'bank', label: 'Bank account' },
                { value: 'mobile_money', label: wallet.name },
              ]}
            />
          )}
          {isWallet && networks && (
            <SelectInput id="wallet-network" required label={tr('Network')} value={networkId} onChange={setNetworkId} options={networks.map((n) => ({ value: n.id, label: n.name }))} />
          )}
          {isWallet && wallet ? (
            <PhoneInput id="wallet-number" label={tr('{wallet} number', { wallet: wallet.name })} value={phone} onChange={setPhone} error={phone.trim() ? phoneIssueIn(tr, phone) ?? undefined : undefined} hint={tr('The phone number your {wallet} wallet is registered to.', { wallet: wallet.name })} />
          ) : (
            <>
              <SelectInput id="bank-name" label={tr('Bank')} value={bank} onChange={setBank} options={banks.map((b) => ({ value: b, label: b }))} required />
              <TextInput
                id="bank-number"
                label="Account number"
                inputMode="numeric"
                maxLength={rule.max}
                value={number}
                onChange={(e) => setNumber(e.target.value.replace(/\D/g, ''))}
                hint={country.code === 'NG' ? tr('10 digits (NUBAN)') : tr(rule.label)}
                error={numberError}
              />
            </>
          )}
          {!looked && <p className="text-caption text-fg-subtle">{tr(isWallet ? 'We’ll ask for the name on this wallet and check it matches {name}.' : 'We’ll ask your bank for the name on this account and check it matches {name}.', { name: businessName })}</p>}
          {looked && match && (
            <div className={match === 'mismatch' ? 'rounded-md bg-danger-soft px-4 py-3 text-danger' : match === 'close' ? 'rounded-md bg-warning-soft px-4 py-3 text-warning' : 'rounded-md bg-success-soft px-4 py-3 text-success'} role="status">
              <p className="flex items-center gap-2 text-label font-semibold">
                {match === 'match' ? <CheckCircle2Icon size={16} aria-hidden /> : match === 'close' ? <AlertTriangleIcon size={16} aria-hidden /> : <XCircleIcon size={16} aria-hidden />}
                {looked}
              </p>
              <p className="mt-1 text-caption">
                {match === 'match'
                  ? tr('Matches {name}.', { name: businessName })
                  : match === 'close'
                    ? tr('Partly matches {name}. Payouts to this account may be checked by KUBICU first.', { name: businessName })
                    : tr('Doesn’t match {name}. Use an account in your business’s name, or update your business name in Settings.', { name: businessName })}
              </p>
            </div>
          )}
          {isWallet && wallet && <p className="text-caption text-fg-subtle">{tr('Payouts to a mobile money wallet usually arrive {when}.', { when: tr(wallet.payoutArrival) })}</p>}
          {country.code !== 'NG' && <p className="text-caption text-fg-subtle">{tr('Payouts in {country} are simulated until KUBICU has a payment partner there.', { country: tr(country.name) })}</p>}
          {!first && <p className="text-caption text-fg-subtle">{tr('New accounts wait {n} hours before they can receive payouts. This protects you if someone gets into your account.', { n: BANK_COOLDOWN_HOURS })}</p>}
        </div>
      </Dialog>
      <ConfirmMoneyDialog open={confirming} onClose={() => setConfirming(false)} title={tr(isWallet ? 'Confirm new payout wallet' : 'Confirm new bank account')} summary={tr('Add {bank} ····{last4} for payouts.', { bank: label, last4: digits.slice(-4) })} confirmLabel={tr('Add account')} onConfirm={save} />
    </>
  );
}
