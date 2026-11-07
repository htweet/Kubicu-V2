import React, { useState } from 'react';
import { CheckIcon, LockIcon, PlusIcon } from 'lucide-react';
import type { ClaimStep, PendingClaim } from '../../../utils/copilot/claim';
import { TextInput } from '../../ui/TextInput';
import { Button } from '../../ui/Button';
import { isValidEmail } from '../../../utils/validation';
import { useWorkspace } from '../../../contexts/WorkspaceContext';
import { useCan } from '../../../contexts/TeamContext';
import { cn } from '../../../utils/cn';
import { BackButton } from './ClaimNewAccount';

interface Props {
  step: Extract<ClaimStep, 'signin' | 'workspace'>;
  pending: PendingClaim;
  failFirst: boolean;
  onStep: (step: ClaimStep, patch?: Partial<PendingClaim>) => void;
  onAddSpace: () => void;
  title: string;
}

/** Existing account: sign in → choose the workspace the draft joins, as a new space (D264). */
export function ClaimExisting({ step, pending, failFirst, onStep, onAddSpace, title }: Props) {
  if (step === 'signin') return <SignInStep email={pending.email ?? ''} failFirst={failFirst} onStep={onStep} />;
  return <WorkspaceStep onStep={onStep} onAddSpace={onAddSpace} title={title} />;
}

function SignInStep({ email: initial, failFirst, onStep }: { email: string; failFirst: boolean; onStep: Props['onStep'] }) {
  const [email, setEmail] = useState(initial);
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [failed, setFailed] = useState(false);
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const errors = {
    email: isValidEmail(email) ? '' : 'Enter a valid email, like you@example.com',
    password: password ? '' : 'Enter your password',
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setAuthError('');
    if (Object.values(errors).some(Boolean)) return;
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      if (failFirst && !failed) {
        setFailed(true);
        setAuthError('That email and password don’t match. Your draft is safe — try again, or reset your password in a new tab.');
        return;
      }
      onStep('workspace', { email: email.trim() });
    }, 450);
  };
  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <BackButton onClick={() => onStep('choose')} />
      {authError && (
        <p role="alert" className="rounded-lg border border-danger/40 bg-danger-soft px-3.5 py-3 text-label text-fg">
          {authError}
        </p>
      )}
      <TextInput id="ci-email" label="Email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={submitted ? errors.email : undefined} />
      <TextInput id="ci-password" label="Password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} error={submitted ? errors.password : undefined} />
      <Button type="submit" variant="brand" size="lg" fullWidth loading={loading} className="mt-2">
        Sign in
      </Button>
      <a href="/reset" target="_blank" rel="noopener" className="self-start rounded-sm text-label font-semibold text-fg underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
        Forgot your password?
      </a>
    </form>
  );
}

function WorkspaceStep({ onStep, onAddSpace, title }: { onStep: Props['onStep']; onAddSpace: () => void; title: string }) {
  const { workspaces, current, switchTo } = useWorkspace();
  const allowed = useCan('spaces.manage');
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      <BackButton onClick={() => onStep('signin')} />
      <fieldset>
        <legend className="text-label font-semibold text-fg">Add “{title}” to</legend>
        <div role="radiogroup" aria-label="Workspace" className="mt-2 flex flex-col gap-1.5">
          {workspaces.map((w) => {
            const selected = w.id === current.id;
            return (
              <button
                key={w.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => switchTo(w.id)}
                className={cn(
                  'flex min-h-[52px] items-center gap-3 rounded-lg border px-3.5 py-2.5 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                  selected ? 'border-fg bg-raised' : 'border-line hover:border-line-strong',
                )}
              >
                <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-sunken text-caption font-bold text-fg">
                  {w.name.slice(0, 2).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-label font-semibold text-fg">{w.name}</span>
                  <span className="block text-caption text-fg-muted">{(w.spaces?.filter((s) => !s.archivedAt).length ?? 0) + 1} space{(w.spaces?.filter((s) => !s.archivedAt).length ?? 0) === 0 ? '' : 's'}</span>
                </span>
                {selected && <CheckIcon size={16} className="shrink-0 text-fg" aria-hidden />}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => onStep('setup')}
            className="flex min-h-[52px] items-center gap-3 rounded-lg border border-dashed border-line-strong px-3.5 py-2.5 text-left hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-sunken text-fg-muted">
              <PlusIcon size={16} />
            </span>
            <span className="text-label font-semibold text-fg">A new workspace instead</span>
          </button>
        </div>
      </fieldset>

      {allowed.allowed ? (
        <p className="text-caption text-fg-muted">It joins {current.name} as a new space with its own link. Your main page and other spaces don’t change.</p>
      ) : (
        <p role="status" className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning-soft px-3.5 py-3 text-label text-fg">
          <LockIcon size={15} className="mt-0.5 shrink-0" aria-hidden />
          <span>Your role in {current.name} can’t add spaces. Choose another workspace, start a new one, or ask an Owner or Admin to change your role.</span>
        </p>
      )}
      <Button
        variant="brand"
        size="lg"
        fullWidth
        loading={busy}
        disabled={!allowed.allowed}
        onClick={() => {
          setBusy(true);
          window.setTimeout(onAddSpace, 350);
        }}
      >
        <span className="truncate">Add to {current.name}</span>
      </Button>
    </div>
  );
}
