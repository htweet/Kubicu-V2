import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAccount, updateAccount, passwordStrength } from '../../utils/account/store';
import { Dialog } from '../ui/Dialog';
import { TextInput } from '../ui/TextInput';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';
import { signOutOthers } from '../../utils/account/signOutOthers';

const barTone = ['bg-danger', 'bg-danger', 'bg-warning', 'bg-success', 'bg-success'];

/** Change password: current, new (with strength), confirm, and sign out elsewhere. */
export function PasswordDialog({ open, onClose }: {open: boolean;onClose: () => void;}) {
  const account = useAccount();
  const [f, setF] = useState({ current: '', next: '', confirm: '', signOutOthers: true });
  const [tried, setTried] = useState(false);
  const strength = passwordStrength(f.next);
  const others = account.sessions.filter((s) => !s.current).length;

  useEffect(() => {
    if (open) {
      setF({ current: '', next: '', confirm: '', signOutOthers: true });
      setTried(false);
    }
  }, [open]);

  const errors = {
    current: f.current.length < 8 ? 'Enter your current password' : undefined,
    next: f.next.length < 8 ? 'Use at least 8 characters' : strength.score < 2 ? 'Too easy to guess — add length, numbers or symbols' : f.next === f.current ? 'Choose a password you haven’t used here' : undefined,
    confirm: f.confirm !== f.next ? 'The passwords don’t match' : undefined
  };

  const save = () => {
    setTried(true);
    if (errors.current || errors.next || errors.confirm) return;
    updateAccount((a) => {
      const next = { ...a, security: { ...a.security, passwordSetAt: new Date().toISOString() } };
      return f.signOutOthers ? signOutOthers(next, 'password') : next;
    });
    toast.success('Password changed', { description: f.signOutOthers && others ? `Signed out of ${others} other ${others === 1 ? 'device' : 'devices'}.` : 'You’ll use it next time you sign in.' });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="sm"
      title="Change password"
      footer={
      <>
          <Button variant="tertiary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>Change password</Button>
        </>
      }>
      
      <div className="flex flex-col gap-4">
        <TextInput id="pw-current" label="Current password" type="password" autoComplete="current-password" value={f.current} error={tried ? errors.current : undefined} onChange={(e) => setF((x) => ({ ...x, current: e.target.value }))} />
        <div className="flex flex-col gap-2">
          <TextInput id="pw-next" label="New password" type="password" autoComplete="new-password" value={f.next} error={tried ? errors.next : undefined} hint="At least 8 characters. A short sentence is easy to remember and hard to guess." onChange={(e) => setF((x) => ({ ...x, next: e.target.value }))} />
          {f.next &&
          <div className="flex items-center gap-3" aria-live="polite">
              <div className="grid flex-1 grid-cols-4 gap-1" aria-hidden>
                {[1, 2, 3, 4].map((i) =>
              <span key={i} className={cn('h-1.5 rounded-full', i <= strength.score ? barTone[strength.score] : 'bg-sunken')} />
              )}
              </div>
              <span className="w-16 text-right text-caption font-medium text-fg-muted">{strength.label}</span>
            </div>
          }
        </div>
        <TextInput id="pw-confirm" label="Type it again" type="password" autoComplete="new-password" value={f.confirm} error={tried ? errors.confirm : undefined} onChange={(e) => setF((x) => ({ ...x, confirm: e.target.value }))} />
        {others > 0 &&
        <label className="flex items-start gap-3 text-label text-fg">
            <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[rgb(var(--action))]" checked={f.signOutOthers} onChange={(e) => setF((x) => ({ ...x, signOutOthers: e.target.checked }))} />
            <span>
              Sign out of my other {others} {others === 1 ? 'device' : 'devices'}
              <span className="block text-caption text-fg-subtle">Recommended if you think someone else knows your password.</span>
            </span>
          </label>
        }
      </div>
    </Dialog>);

}