import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useCommerce } from '../../contexts/CommerceContext';
import { issueGiftCard } from '../../utils/commerce/sellModes';
import { formatNgn } from '../../utils/format';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { CurrencyInput } from '../ui/CurrencyInput';
import { TextInput } from '../ui/TextInput';
import { TextArea } from '../ui/TextArea';

interface IssueGiftCardDialogProps {
  open: boolean;
  onClose: () => void;
}

const MAX_NGN = 2_000_000;
const today = () => new Date().toISOString().slice(0, 10);

/** Issue a gift card by hand: store credit, a prize, or one paid for in person (D202). */
export function IssueGiftCardDialog({ open, onClose }: IssueGiftCardDialogProps) {
  const { apply } = useCommerce();
  const [amount, setAmount] = useState<number | null>(10000);
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [note, setNote] = useState('');
  const [expires, setExpires] = useState('');
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (!open) return;
    setAmount(10000);
    setRecipient('');
    setMessage('');
    setNote('');
    setExpires('');
    setTried(false);
  }, [open]);

  const amountError = !amount || amount < 500 ? 'Enter at least ₦500' : amount > MAX_NGN ? `The most is ${formatNgn(MAX_NGN)}` : undefined;
  const expiryError = expires && expires <= today() ? 'Choose a date after today' : undefined;

  const submit = () => {
    setTried(true);
    if (amountError || expiryError || !amount) return;
    let code = '';
    const ok = apply((d) => {
      const r = issueGiftCard(d, { amountNgn: amount, recipientName: recipient.trim(), message: message.trim(), note: note.trim(), expiresAt: expires ? new Date(`${expires}T23:59:59`).toISOString() : null, buyerName: 'Issued by you' });
      code = r.card.code;
      return r.data;
    });
    if (!ok) return;
    navigator.clipboard?.writeText(code).catch(() => undefined);
    toast.success(`Gift card ${code} issued`, { description: `Worth ${formatNgn(amount)}. The code is copied — send it to ${recipient.trim() || 'the recipient'} yourself.` });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Issue a gift card"
      description="For store credit, a prize, or a card paid for in person. You get a code to send yourself — KUBICU doesn’t message anyone in this prototype."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit}>Issue card</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <CurrencyInput id="gc-amount" label="Amount" value={amount} onChange={setAmount} error={tried ? amountError : undefined} />
        <TextInput id="gc-to" label="For" optional placeholder="e.g. Chiamaka" value={recipient} maxLength={60} onChange={(e) => setRecipient(e.target.value)} />
        <TextArea id="gc-msg" label="Message" optional rows={2} maxLength={200} value={message} hint="Shown when the code is checked at checkout." onChange={(e) => setMessage(e.target.value)} />
        <TextInput id="gc-note" label="Private note" optional placeholder="e.g. Replacement for order #1007" maxLength={120} value={note} hint="Only your team sees this." onChange={(e) => setNote(e.target.value)} />
        <TextInput id="gc-exp" type="date" label="Expires" optional min={today()} value={expires} hint="Leave empty for no expiry." error={tried ? expiryError : undefined} onChange={(e) => setExpires(e.target.value)} />
      </div>
    </Dialog>
  );
}
