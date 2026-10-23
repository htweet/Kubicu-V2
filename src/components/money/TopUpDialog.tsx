import React, { useEffect, useState } from 'react';
import { CopyIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { MoneyData } from '../../types/money';
import { uid } from '../../utils/id';
import { formatNgn } from '../../utils/format';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { TextInput } from '../ui/TextInput';

interface TopUpDialogProps {
  open: boolean;
  onClose: () => void;
  update: (fn: (d: MoneyData) => MoneyData) => void;
  businessName: string;
  workspaceId: string;
  /** Pre-filled when covering a shortfall. */
  suggested?: number;
}

/** Add money by bank transfer to your wallet’s own account number — used to cover refunds (D92). */
export function TopUpDialog({ open, onClose, update, businessName, workspaceId, suggested }: TopUpDialogProps) {
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
      toast.success(`${formatNgn(value)} added to your wallet`);
    }, 900);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Top up your wallet"
      description="Transfer from any Nigerian bank app to this account. It lands in your wallet within minutes."
      footer={
      <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={sent} loading={busy} disabled={value < 100}>
            I’ve sent it (simulate)
          </Button>
        </>
      }>
      
      <div className="flex flex-col gap-4">
        <dl className="grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-2 rounded-md bg-sunken px-4 py-3 text-label">
          <dt className="text-fg-muted">Bank</dt>
          <dd className="col-span-2 font-medium text-fg">Partner Bank (test)</dd>
          <dt className="text-fg-muted">Account</dt>
          <dd className="font-semibold tabular-nums tracking-wide text-fg">{account}</dd>
          <dd>
            <Button size="sm" variant="tertiary" leadingIcon={CopyIcon} onClick={() => (void navigator.clipboard?.writeText(account), toast('Account number copied'))}>
              Copy
            </Button>
          </dd>
          <dt className="text-fg-muted">Name</dt>
          <dd className="col-span-2 font-medium text-fg">KUBICU / {businessName}</dd>
        </dl>
        <TextInput id="topup-amount" label="Amount you’re sending" prefix="₦" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))} fieldClassName="w-full" />
      </div>
    </Dialog>);

}

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = h * 31 + s.charCodeAt(i) | 0;
  return h;
}