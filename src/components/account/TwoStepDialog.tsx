import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { CopyIcon, DownloadIcon, SmartphoneIcon, MessageSquareIcon } from 'lucide-react';
import type { TwoStepMethod } from '../../types/account';
import { useAccount, updateAccount, fakeSecret, newBackupCodes } from '../../utils/account/store';
import { styleOf } from '../../utils/domains/qr';
import { QrPreview } from '../domains/QrPreview';
import { Dialog } from '../ui/Dialog';
import { TextInput } from '../ui/TextInput';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';
import { signOutOthers } from '../../utils/account/signOutOthers';
import { useT } from '../../contexts/LocaleContext';

type Step = 'method' | 'setup' | 'codes';

/** Turn on two-step sign-in: choose a method, prove it works, keep backup codes. */
export function TwoStepDialog({ open, onClose }: {open: boolean;onClose: () => void;}) {
  const { t: tr } = useT();
  const account = useAccount();
  const [step, setStep] = useState<Step>('method');
  const [method, setMethod] = useState<Exclude<TwoStepMethod, 'none'>>('app');
  const [code, setCode] = useState('');
  const [tried, setTried] = useState(false);
  const [codes, setCodes] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const secret = useMemo(() => fakeSecret(), [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const qrStyle = useMemo(() => styleOf({ centreKind: 'none' }, ''), []);
  const smsReady = !!account.profile.phone && account.phoneVerified;

  useEffect(() => {
    if (!open) return;
    setStep('method');
    setMethod('app');
    setCode('');
    setTried(false);
    setSaved(false);
  }, [open]);

  const codeError = tried && !/^\d{6}$/.test(code) ? 'Enter the 6-digit code' : tried && code === '000000' ? 'That code didn’t match. Codes change every 30 seconds — try the newest one.' : undefined;

  const verify = () => {
    setTried(true);
    if (!/^\d{6}$/.test(code) || code === '000000') return;
    setCodes(newBackupCodes());
    setStep('codes');
  };

  const finish = () => {
    // Turning on two-step signs out other devices so they have to pass it too (D125).
    updateAccount((a) => signOutOthers({ ...a, security: { ...a.security, twoStep: method, twoStepSince: new Date().toISOString(), backupCodes: codes } }, 'two_step_on'));
    toast.success(tr('Two-step sign-in is on'), { description: tr(method === 'app' ? 'You’ll enter a code from your app when signing in on a new device.' : 'We’ll text you a code when signing in on a new device.') });
    onClose();
  };

  const download = () => {
    const blob = new Blob([`KUBICU backup codes for ${account.profile.email}\nEach code works once.\n\n${codes.join('\n')}\n`], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'kubicu-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(a.href);
    setSaved(true);
  };

  const title = step === 'method' ? 'Turn on two-step sign-in' : step === 'setup' ? method === 'app' ? 'Connect your authenticator app' : 'Confirm your phone' : 'Save your backup codes';
  const description =
  step === 'method' ?
  'After your password, you’ll confirm it’s you with a code. It stops someone who only knows your password.' :
  step === 'setup' ?
  method === 'app' ?
  'Scan this with Google Authenticator, Microsoft Authenticator or 1Password, then enter the 6-digit code it shows.' :
  tr('We texted a code to {phone}.', { phone: account.profile.phone }) :
  'If you lose your phone, each of these codes lets you in once. Keep them somewhere safe — we can’t show them again.';

  const footer =
  step === 'method' ?
  <>
        <Button variant="tertiary" onClick={onClose}>
          Cancel
        </Button>
        <Button
      onClick={() => {
        setStep('setup');
        if (method === 'sms') toast(tr('Code sent'), { description: tr('Prototype: any 6 digits work except 000000.') });
      }}>
      
          Continue
        </Button>
      </> :
  step === 'setup' ?
  <>
        <Button variant="tertiary" onClick={() => setStep('method')}>
          Back
        </Button>
        <Button onClick={verify}>Verify</Button>
      </> :

  <>
        <Button variant="secondary" leadingIcon={CopyIcon} onClick={() => navigator.clipboard?.writeText(codes.join('\n')).then(() => {setSaved(true);toast.success(tr('Codes copied'));})}>
          Copy
        </Button>
        <Button variant="secondary" leadingIcon={DownloadIcon} onClick={download}>
          Download
        </Button>
        <Button disabled={!saved} title={saved ? undefined : tr('Copy or download the codes first')} onClick={finish}>
          I’ve saved them
        </Button>
      </>;


  return (
    <Dialog open={open} onClose={onClose} title={title} description={description} footer={footer}>
      {step === 'method' &&
      <fieldset className="flex flex-col gap-3">
          <legend className="sr-only">{tr('How you’ll get codes')}</legend>
          <MethodOption icon={SmartphoneIcon} checked={method === 'app'} onSelect={() => setMethod('app')} title="Authenticator app" text="Recommended. Works without signal or airtime." />
          <MethodOption
          icon={MessageSquareIcon}
          checked={method === 'sms'}
          disabled={!smsReady}
          onSelect={() => setMethod('sms')}
          title="Text message"
          text={smsReady ? tr('Codes go to {phone}.', { phone: account.profile.phone }) : 'Add and verify a phone on your Profile first.'} />
        
        </fieldset>
      }

      {step === 'setup' &&
      <div className="flex flex-col gap-5">
          {method === 'app' &&
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <div className="w-40 shrink-0 rounded-md border border-line bg-white p-2">
                <QrPreview url={`otpauth://totp/KUBICU:${encodeURIComponent(account.profile.email)}?secret=${secret}&issuer=KUBICU`} style={qrStyle} alt={tr('QR code for your authenticator app')} />
              </div>
              <div className="min-w-0 text-caption text-fg-muted">
                <p>{tr('Can’t scan? Type this key into the app instead:')}</p>
                <p className="mt-2 break-all rounded-md bg-sunken px-3 py-2 font-mono text-label tracking-wider text-fg">{secret.match(/.{1,4}/g)?.join(' ')}</p>
              </div>
            </div>
        }
          <TextInput id="twostep-code" label="6-digit code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} error={codeError} hint="Prototype: any 6 digits work except 000000." onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} />
        </div>
      }

      {step === 'codes' &&
      <ol className="grid grid-cols-2 gap-2 rounded-md border border-line bg-sunken p-4 font-mono text-label text-fg">
          {codes.map((c) =>
        <li key={c} className="tabular-nums">
              {c}
            </li>
        )}
        </ol>
      }
    </Dialog>);

}

function MethodOption({ icon: Icon, checked, disabled, onSelect, title, text }: {icon: typeof SmartphoneIcon;checked: boolean;disabled?: boolean;onSelect: () => void;title: string;text: string;}) {
  const { t } = useT();
  title = t(title);
  text = t(text);
  return (
    <label className={cn('flex cursor-pointer items-start gap-3 rounded-md border p-4 transition-colors duration-150 focus-within:ring-2 focus-within:ring-focus', checked ? 'border-action bg-action-soft' : 'border-line hover:bg-sunken', disabled && 'cursor-not-allowed opacity-60 hover:bg-transparent')}>
      <input type="radio" name="twostep-method" className="sr-only" checked={checked} disabled={disabled} onChange={onSelect} />
      <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-md', checked ? 'bg-action text-action-fg' : 'bg-sunken text-fg-muted')}>
        <Icon size={17} aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block text-label font-semibold text-fg">{title}</span>
        <span className="block text-caption text-fg-muted">{text}</span>
      </span>
    </label>);

}