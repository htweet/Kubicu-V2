import React, { useEffect, useState } from 'react';
import { CopyIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { MoneyData } from '../../types/money';
import { uid } from '../../utils/id';
import { formatNgn } from '../../utils/format';
import { useT } from '../../contexts/LocaleContext';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { TextInput } from '../ui/TextInput';
import { currencySymbol } from '../../utils/currency';

interface TopUpDialogProps {
  open: boolean;
  onClose: () => void;
  update: (fn: (d: MoneyData) => MoneyData) => void;
  businessName: string;
  workspaceId: string;
  /** Pre-filled when covering a shortfall. */
  suggested?: number;
}

/** Add money by bank transfer to your wallet’s own account number — used to cover refunds (D92). Follows the interface language (D133r). */
export function TopUpDialog({ open, onClose, update, businessName, workspaceId, suggested }: TopUpDialogProps) {
  const { t: tr } = useT();
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const account = `98${String(Math.abs(hash(workspaceId))).padStart(8, '0').slice(0, 8)}`;

  useEffect(() => {
    if (open) setAmount(suggested ? String(suggested) : '');
  }, [open, suggested]);

  const value = Number(amount) || 0;

  const sent = () => {
    if (value < 100) return;
    setBusy(true);
    window.setTimeout(() => {
      update((d) => ({ ...d, ledger: [{ id: uid('led'), at: new Date().toISOString(), kind: 'topup', amountNgn: value, state: 'available', label: 'Top-up by bank transfer' }, ...d.ledger] }));
      setBusy(false);
      onClose();
      toast.success(tr('{amount} added to your wallet', { amount: formatNgn(value) }));
    }, 900);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={tr('Top up your wallet')}
      description={tr('Transfer from any Nigerian bank app to this account. It lands in your wallet within minutes.')}
      footer={
      <>
          <Button variant="secondary" onClick={onClose}>
            {tr('Cancel')}
          </Button>
          <Button onClick={sent} loading={busy} disabled={value < 100}>
            {tr('I’ve sent it (simulate)')}
          </Button>
        </>
      }>
      
      <div className="flex flex-col gap-4">
        <dl className="grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-2 rounded-md bg-sunken px-4 py-3 text-label">
          <dt className="text-fg-muted">{tr('Bank')}</dt>
          <dd className="col-span-2 font-medium text-fg">{tr('Partner Bank (test)')}</dd>
          <dt className="text-fg-muted">{tr('Account')}</dt>
          <dd className="font-semibold tabular-nums tracking-wide text-fg">{account}</dd>
          <dd>
            <Button size="sm" variant="tertiary" leadingIcon={CopyIcon} onClick={() => (void navigator.clipboard?.writeText(account), toast(tr('Account number copied')))}>
              {tr('Copy')}
            </Button>
          </dd>
          <dt className="text-fg-muted">{tr('Name')}</dt>
          <dd className="col-span-2 font-medium text-fg">KUBICU / {businessName}</dd>
        </dl>
        <TextInput id="topup-amount" label={tr('Amount you’re sending')} prefix={currencySymbol()} inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))} fieldClassName="w-full" />
      </div>
    </Dialog>);

}

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = h * 31 + s.charCodeAt(i) | 0;
  return h;
}