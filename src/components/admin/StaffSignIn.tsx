import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, CheckIcon, CopyIcon, DownloadIcon, KeyRoundIcon, LifeBuoyIcon, ShieldCheckIcon } from 'lucide-react';
import type { StaffMember } from '../../types/admin';
import { audit, useAdminStore } from '../../utils/admin/store';
import { startStaffSession } from '../../utils/admin/staffSession';
import { makeBackupCodes, normaliseCode } from '../../utils/admin/approvals';
import { roleInfo, STAFF_SESSION_HOURS } from '../../data/staffRoles';
import { KubicuLogo } from '../shell/KubicuLogo';
import { TextInput } from '../ui/TextInput';
import { Button } from '../ui/Button';
import { InlineAlert } from '../ui/InlineAlert';

type Step = 'password' | 'code' | 'enrol' | 'backup' | 'codes';

/** Setup key shown when a new staff member enrols an authenticator app (illustrative). */
const SETUP_KEY = 'KUBI CU7Q 2MXA 4RTW';

const validCode = (c: string) => /^\d{6}$/.test(c) && c !== '000000';

/** Staff console sign-in: password, then a two-step code. New staff must set up two-step first (D83). */
export function StaffSignIn() {
  const [store, setStore] = useAdminStore();
  const [step, setStep] = useState<Step>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [member, setMember] = useState<StaffMember | null>(null);
  const [newCodes, setNewCodes] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  const submitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    const m = store.staff.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
    if (!m || password.length < 8) return setError('That email and password don’t match a staff account.');
    if (m.status === 'disabled') return setError('This staff account is disabled. Ask a Platform lead to turn it back on.');
    setError('');
    setMember(m);
    setCode('');
    setStep(m.twoStep ? 'code' : 'enrol');
  };

  const submitCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;
    if (!validCode(code)) return setError('That code didn’t work. Codes change every 30 seconds — try the newest one.');
    setError('');
    const enrolling = step === 'enrol';
    const current = store.staff.find((x) => x.id === member.id);
    // New staff, and anyone without backup codes yet, must save a set before they get in (D129).
    if (enrolling || !current?.backupCodes?.length) {
      const codes = makeBackupCodes();
      setNewCodes(codes);
      setSaved(false);
      setStore((s) =>
        audit(
          { ...s, staff: s.staff.map((x) => (x.id === member.id ? { ...x, twoStep: true, status: 'active', backupCodes: codes } : x)) },
          { area: 'staff', action: enrolling ? 'Set up two-step and made backup codes' : 'Made backup codes', target: member.email, reason: enrolling ? 'First sign-in: authenticator app enrolled.' : 'Backup codes are now required for every staff account.' },
        ),
      );
      setStep('codes');
      return;
    }
    finishSignIn('Signed in', 'Password and two-step code verified.');
  };

  const finishSignIn = (action: string, reason: string, patch: Partial<StaffMember> = {}) => {
    if (!member) return;
    startStaffSession(member.id);
    setStore((s) => audit({ ...s, staff: s.staff.map((x) => (x.id === member.id ? { ...x, ...patch, lastActiveAt: new Date().toISOString() } : x)) }, { area: 'staff', action, target: member.email, reason }));
  };

  const submitBackup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;
    const current = store.staff.find((x) => x.id === member.id);
    const left = current?.backupCodes ?? [];
    const match = left.find((c) => normaliseCode(c) === normaliseCode(code));
    if (!match) return setError(left.length ? 'That backup code didn’t work, or it has already been used.' : 'You have no backup codes left. Ask another Platform lead to reset your two-step sign-in.');
    const remaining = left.filter((c) => c !== match);
    finishSignIn('Signed in with a backup code', `Backup code used — ${remaining.length} left.`, { backupCodes: remaining });
  };

  const copyCodes = async () => {
    try {
      await navigator.clipboard.writeText(newCodes.join('\n'));
      setCopied(true);
    } catch {
      setError('Couldn’t copy — select the codes and copy them yourself.');
    }
  };

  const downloadCodes = () => {
    const blob = new Blob([`KUBICU staff backup codes for ${member?.email}\nEach code works once.\n\n${newCodes.join('\n')}\n`], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'kubicu-staff-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-canvas px-5 py-12 text-fg">
      <div className="w-full max-w-[420px]">
        <div className="flex items-center gap-2.5">
          <KubicuLogo withWordmark />
          <span className="rounded-full bg-accent-soft px-2 py-0.5 text-meta font-semibold text-accent">Staff console</span>
        </div>

        <main className="mt-8 rounded-xl border border-line bg-raised p-6 shadow-sm md:p-8">
          {step === 'password' ? (
            <form onSubmit={submitPassword} noValidate className="flex flex-col gap-5">
              <div>
                <h1 ref={headingRef} tabIndex={-1} className="text-title font-semibold text-fg focus:outline-none">
                  Sign in to the staff console
                </h1>
                <p className="mt-1 text-label text-fg-muted">For KUBICU employees only. Every action here is recorded with your name.</p>
              </div>
              {error && <InlineAlert tone="danger" title={error} />}
              <TextInput id="staff-email" label="Work email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
              <TextInput id="staff-password" label="Password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} hint="Prototype: any 8 or more characters." />
              <Button type="submit" fullWidth>
                Continue
              </Button>
            </form>
          ) : step === 'codes' ? (
            <div className="flex flex-col gap-5">
              <div>
                <span aria-hidden className="flex h-10 w-10 items-center justify-center rounded-full bg-action-soft text-action">
                  <LifeBuoyIcon size={20} />
                </span>
                <h1 ref={headingRef} tabIndex={-1} className="mt-4 text-title font-semibold text-fg focus:outline-none">
                  Save your backup codes
                </h1>
                <p className="mt-1 text-label text-fg-muted">If you lose your phone, each code lets you sign in once. Keep them somewhere safe and offline — not in WhatsApp or email. You won’t see them again.</p>
              </div>
              <ul className="grid grid-cols-2 gap-x-6 gap-y-2 rounded-lg border border-line bg-sunken px-4 py-4" aria-label="Backup codes">
                {newCodes.map((c) => (
                  <li key={c} className="font-mono text-label font-semibold tracking-wider text-fg">
                    {c}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" leadingIcon={copied ? CheckIcon : CopyIcon} onClick={copyCodes}>
                  {copied ? 'Copied' : 'Copy all'}
                </Button>
                <Button variant="secondary" size="sm" leadingIcon={DownloadIcon} onClick={downloadCodes}>
                  Download .txt
                </Button>
              </div>
              {error && <InlineAlert tone="danger" title={error} />}
              <label className="flex cursor-pointer items-start gap-3 text-label text-fg">
                <input type="checkbox" className="mt-0.5 size-4 accent-[rgb(var(--action))]" checked={saved} onChange={(e) => setSaved(e.target.checked)} />
                I’ve saved these codes somewhere safe
              </label>
              <Button fullWidth disabled={!saved} onClick={() => finishSignIn('Signed in', 'Two-step code verified and backup codes saved.')}>
                Continue to the console
              </Button>
            </div>
          ) : step === 'backup' ? (
            <form onSubmit={submitBackup} noValidate className="flex flex-col gap-5">
              <div>
                <span aria-hidden className="flex h-10 w-10 items-center justify-center rounded-full bg-action-soft text-action">
                  <LifeBuoyIcon size={20} />
                </span>
                <h1 ref={headingRef} tabIndex={-1} className="mt-4 text-title font-semibold text-fg focus:outline-none">
                  Use a backup code
                </h1>
                <p className="mt-1 text-label text-fg-muted">Enter one of the codes you saved when you set up two-step sign-in. Each code works once.</p>
              </div>
              {error && <InlineAlert tone="danger" title={error} />}
              <TextInput id="staff-backup" label="Backup code" autoComplete="one-time-code" placeholder="ABCD-EFGH" maxLength={9} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="font-mono tracking-[0.2em]" />
              <Button type="submit" fullWidth>
                Verify and sign in
              </Button>
              <button
                type="button"
                onClick={() => {
                  setStep('code');
                  setCode('');
                  setError('');
                }}
                className="self-start rounded text-label font-medium text-fg-muted hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                Use my authenticator app instead
              </button>
            </form>
          ) : (
            <form onSubmit={submitCode} noValidate className="flex flex-col gap-5">
              <div>
                <span aria-hidden className="flex h-10 w-10 items-center justify-center rounded-full bg-action-soft text-action">
                  {step === 'enrol' ? <KeyRoundIcon size={20} /> : <ShieldCheckIcon size={20} />}
                </span>
                <h1 ref={headingRef} tabIndex={-1} className="mt-4 text-title font-semibold text-fg focus:outline-none">
                  {step === 'enrol' ? 'Set up two-step sign-in' : 'Enter your code'}
                </h1>
                <p className="mt-1 text-label text-fg-muted">
                  {step === 'enrol'
                    ? `Welcome, ${member?.name.split(' ')[0]}. Staff can’t use the console without two-step sign-in. Add this key to your authenticator app, then enter the code it shows.`
                    : `Open your authenticator app and enter the 6-digit code for ${member?.email}.`}
                </p>
              </div>
              {step === 'enrol' && (
                <div className="rounded-lg border border-line bg-sunken px-4 py-3">
                  <p className="text-caption text-fg-subtle">Setup key</p>
                  <p className="mt-0.5 font-mono text-body font-semibold tracking-wider text-fg">{SETUP_KEY}</p>
                </div>
              )}
              {error && <InlineAlert tone="danger" title={error} />}
              <TextInput
                id="staff-code"
                label="6-digit code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="font-mono tracking-[0.3em]"
                hint="Prototype: any 6 digits except 000000."
              />
              <Button type="submit" fullWidth>
                {step === 'enrol' ? 'Turn on and continue' : 'Verify and sign in'}
              </Button>
              {step === 'code' && (
                <button
                  type="button"
                  onClick={() => {
                    setStep('backup');
                    setCode('');
                    setError('');
                  }}
                  className="self-start rounded text-label font-medium text-action hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                  Lost your phone? Use a backup code
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setStep('password');
                  setError('');
                }}
                className="self-start rounded text-label font-medium text-fg-muted hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                Use a different account
              </button>
            </form>
          )}
        </main>

        <section aria-labelledby="staff-demo" className="mt-6">
          <h2 id="staff-demo" className="text-caption font-semibold text-fg-subtle">
            Prototype staff accounts
          </h2>
          <ul className="mt-2 divide-y divide-line rounded-lg border border-line bg-raised">
            {store.staff
              .filter((m) => m.status !== 'disabled')
              .map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail(m.email);
                      setPassword('prototype-pass');
                      setStep('password');
                      setError('');
                    }}
                    className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors duration-150 hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-label font-semibold text-fg">{m.name}</span>
                      <span className="block truncate text-caption text-fg-subtle">{m.email}</span>
                    </span>
                    <span className="shrink-0 text-caption text-fg-muted">
                      {roleInfo(m.role).label}
                      {!m.twoStep && ' · new'}
                    </span>
                  </button>
                </li>
              ))}
          </ul>
          <p className="mt-2 text-caption text-fg-subtle">Pick one to fill the form. Sessions end after {STAFF_SESSION_HOURS} hours (example figure).</p>
        </section>

        <Link to="/signin" className="mt-6 inline-flex items-center gap-1.5 rounded text-label font-medium text-fg-muted hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
          <ArrowLeftIcon size={16} aria-hidden />
          Back to customer sign-in
        </Link>
      </div>
    </div>
  );
}
