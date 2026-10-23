import React, { useEffect, useState } from 'react';
import { ShieldCheckIcon } from 'lucide-react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { TextInput } from '../ui/TextInput';

interface ConfirmMoneyDialogProps {
  open: boolean;
  title: string;
  /** What's about to happen, in one sentence. */
  summary: React.ReactNode;
  confirmLabel: string;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Sensitive money actions (payouts, bank changes) need your password and a two-step code (D92).
 * Prototype: any password of 8+ characters and any 6 digits except 000000.
 */
export function ConfirmMoneyDialog({ open, title, summary, confirmLabel, onClose, onConfirm }: ConfirmMoneyDialogProps) {
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [codeRejected, setCodeRejected] = useState(false);

  useEffect(() => {
    if (!open) return;
    setPassword('');
    setCode('');
    setTried(false);
    setBusy(false);
    setCodeRejected(false);
  }, [open]);

  const passwordError = tried && password.length < 8 ? 'Enter your account password.' : undefined;
  const codeError = codeRejected ? 'That code didn’t work. Check your authenticator app and try again.' : tried && !/^\d{6}$/.test(code) ? 'Enter the 6-digit code.' : undefined;

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    setTried(true);
    setCodeRejected(false);
    if (password.length < 8 || !/^\d{6}$/.test(code)) return;
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      if (code === '000000') return setCodeRejected(true);
      onConfirm();
    }, 600);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      onTop
      size="sm"
      title={title}
      footer={
      <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => submit()} loading={busy}>
            {confirmLabel}
          </Button>
        </>
      }>
      
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        <p className="flex items-start gap-2 text-label text-fg-muted">
          <ShieldCheckIcon size={16} className="mt-0.5 shrink-0 text-success" aria-hidden />
          <span>{summary}</span>
        </p>
        <TextInput id="money-password" label="Password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} error={passwordError} />
        <TextInput
          id="money-code"
          label="Two-step code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          error={codeError}
          hint="From your authenticator app. Prototype: any 6 digits except 000000." />
        
        <button type="submit" className="sr-only">
          {confirmLabel}
        </button>
      </form>
    </Dialog>);

}