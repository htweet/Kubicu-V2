import React, { useState } from 'react';
import { ArrowLeftIcon, MailCheckIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { CopilotDraft } from '../../../types/copilot';
import type { ClaimStep, PendingClaim } from '../../../utils/copilot/claim';
import { TextInput } from '../../ui/TextInput';
import { Button } from '../../ui/Button';
import { isValidEmail } from '../../../utils/validation';

interface Props {
  step: Extract<ClaimStep, 'signup' | 'verify' | 'setup'>;
  pending: PendingClaim;
  draft: CopilotDraft;
  /** The WhatsApp number from the chat, if one was given. */
  chatPhone: string;
  /** Reviewer switch: the first code or sign-in attempt fails. */
  failFirst: boolean;
  onStep: (step: ClaimStep, patch?: Partial<PendingClaim>) => void;
  onFinish: (input: {workspaceName: string;ownerName: string;whatsapp: string;}) => void;
  /** Signing in to an existing account can also end in a new workspace. */
  backTo?: ClaimStep;
}

const PHONE = /^(\+?234|0)[789][01]\d{8}$/;

/** New account: sign up → confirm email → a short setup already filled in from the brief (D264). */
export function ClaimNewAccount({ step, pending, draft, chatPhone, failFirst, onStep, onFinish, backTo }: Props) {
  if (step === 'signup') return <SignUpStep onStep={onStep} />;
  if (step === 'verify') return <VerifyStep email={pending.email ?? ''} failFirst={failFirst} onStep={onStep} />;
  return <SetupStep pending={pending} draft={draft} chatPhone={chatPhone} onStep={onStep} onFinish={onFinish} backTo={backTo ?? 'verify'} />;
}

function SignUpStep({ onStep }: {onStep: Props['onStep'];}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const errors = {
    name: name.trim() ? '' : 'Enter your name',
    email: isValidEmail(email) ? '' : 'Enter a valid email, like you@example.com',
    password: password.length >= 8 ? '' : 'Use at least 8 characters',
    agreed: agreed ? '' : 'Please agree to continue'
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.values(errors).some(Boolean)) return;
    onStep('verify', { name: name.trim(), email: email.trim() });
  };
  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <BackButton onClick={() => onStep('choose')} />
      <TextInput id="cc-name" label="Your name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} error={submitted ? errors.name : undefined} />
      <TextInput id="cc-email" label="Email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={submitted ? errors.email : undefined} />
      <TextInput id="cc-password" label="Password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} hint="At least 8 characters" error={submitted ? errors.password : undefined} />
      <div>
        <label className="flex items-start gap-2.5 text-label text-fg-muted">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[rgb(var(--action))]" />
          <span>
            I agree to the{' '}
            <Link to="/about/terms" target="_blank" className="font-medium text-fg underline underline-offset-2">
              Terms
            </Link>{' '}
            and{' '}
            <Link to="/about/privacy" target="_blank" className="font-medium text-fg underline underline-offset-2">
              Privacy policy
            </Link>
            .
          </span>
        </label>
        {submitted && errors.agreed && <p className="mt-1.5 text-caption text-danger">{errors.agreed}</p>}
      </div>
      <Button type="submit" variant="brand" size="lg" fullWidth className="mt-2">
        Create account
      </Button>
      <p className="text-caption text-fg-subtle">We never create an account from your WhatsApp number — only from the email you type here.</p>
    </form>);

}

function VerifyStep({ email, failFirst, onStep }: {email: string;failFirst: boolean;onStep: Props['onStep'];}) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code.trim())) return setError('Enter the 6-digit code from the email');
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      if (failFirst && !failed) {
        setFailed(true);
        setError('That code didn’t work. Codes last 10 minutes — check you used the newest one, or send a new code.');
        return;
      }
      onStep('setup');
    }, 450);
  };
  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <BackButton onClick={() => onStep('signup')} />
      <div className="flex items-start gap-3 rounded-lg border border-line bg-raised px-3.5 py-3">
        <MailCheckIcon size={18} className="mt-0.5 shrink-0 text-fg-muted" aria-hidden />
        <p className="text-label text-fg">
          We sent a 6-digit code to <span className="font-semibold">{email}</span>.
          <span className="block text-caption text-fg-subtle">Prototype: any 6 digits work.</span>
        </p>
      </div>
      <TextInput
        id="cc-code"
        label="Confirmation code"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        value={code}
        onChange={(e) => {
          setCode(e.target.value.replace(/\D/g, ''));
          setError('');
        }}
        error={error || undefined} />
      
      <Button type="submit" variant="brand" size="lg" fullWidth loading={loading}>
        Confirm email
      </Button>
      <button
        type="button"
        onClick={() => {
          setResent(true);
          setError('');
          setCode('');
        }}
        className="self-start rounded-sm text-label font-semibold text-fg underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
        
        {resent ? 'New code sent — send another' : 'Send a new code'}
      </button>
    </form>);

}

function SetupStep({ pending, draft, chatPhone, onStep, onFinish, backTo }: {pending: PendingClaim;draft: CopilotDraft;chatPhone: string;onStep: Props['onStep'];onFinish: Props['onFinish'];backTo: ClaimStep;}) {
  const [workspaceName, setWorkspaceName] = useState(draft.brief.name || draft.doc.title);
  const [ownerName, setOwnerName] = useState(pending.name ?? '');
  const [whatsapp, setWhatsapp] = useState(chatPhone);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const errors = {
    workspaceName: workspaceName.trim() ? '' : 'Give your workspace a name',
    ownerName: ownerName.trim() ? '' : 'Enter your name',
    whatsapp: !whatsapp.trim() || PHONE.test(whatsapp.replace(/[\s-]/g, '')) ? '' : 'Use a Nigerian mobile number, like 0803 123 4567'
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.values(errors).some(Boolean)) return;
    setLoading(true);
    window.setTimeout(() => onFinish({ workspaceName: workspaceName.trim(), ownerName: ownerName.trim(), whatsapp: whatsapp.replace(/[\s-]/g, '') }), 350);
  };
  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <BackButton onClick={() => onStep(backTo)} />
      <p className="text-label text-fg-muted">Filled in from your chat — change anything that’s not right.</p>
      <TextInput id="cc-ws" label="Workspace name" hint="Usually your business name. You can rename it later." value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} error={submitted ? errors.workspaceName : undefined} />
      <TextInput id="cc-owner" label="Your name" autoComplete="name" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} error={submitted ? errors.ownerName : undefined} />
      <TextInput id="cc-wa" label="Business WhatsApp (optional)" type="tel" inputMode="tel" autoComplete="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} hint="Where order and enquiry buttons send customers." error={submitted ? errors.whatsapp : undefined} />
      <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 rounded-lg border border-line bg-raised px-3.5 py-3 text-label">
        <dt className="text-fg-muted">Your draft</dt>
        <dd className="truncate font-medium text-fg">Becomes your main page</dd>
        <dt className="text-fg-muted">Plan</dt>
        <dd className="font-medium text-fg">Free — change any time</dd>
        <dt className="text-fg-muted">Published</dt>
        <dd className="font-medium text-fg">Not until you choose to</dd>
      </dl>
      <Button type="submit" variant="brand" size="lg" fullWidth loading={loading}>
        Open my draft in KUBICU
      </Button>
    </form>);

}

export function BackButton({ onClick }: {onClick: () => void;}) {
  return (
    <button type="button" onClick={onClick} className="-ml-1 inline-flex h-9 items-center gap-1.5 self-start rounded-full px-2 text-label font-medium text-fg-muted hover:bg-sunken hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
      <ArrowLeftIcon size={15} aria-hidden /> Back
    </button>);

}