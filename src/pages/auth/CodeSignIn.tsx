import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRightIcon, KeyRoundIcon, MailIcon } from 'lucide-react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { TextInput } from '../../components/ui/TextInput';
import { Button } from '../../components/ui/Button';
import { InlineAlert } from '../../components/ui/InlineAlert';
import { isValidEmail } from '../../utils/validation';
import { focusFirstError } from '../../utils/a11y';
import { readAccount } from '../../utils/account/store';
import { startPageOptions } from '../../data/accountOptions';
import { workspaceNav } from '../../data/navigation';
import { useT } from '../../contexts/LocaleContext';
import { useAuth } from '../../contexts/AuthContext';
import { ApiError, describeError, requestCode, signInWithCode } from '../../utils/auth/session';
import { safeNext } from '../../utils/auth/realAuth';
import { useResendCooldown } from '../../components/auth/useResendCooldown';

const inputClass = 'h-12 rounded-xl pl-10';
/** Matches GOTRUE_MAILER_OTP_EXP (600 s) and the e-mail template. */
const CODE_MINUTES = 10;

type Step = 'email' | 'code';

/** Name of the workspace screen a `next` path points at, for "You'll go straight back to Orders". */
function screenName(next: string): string | null {
  const path = next.split(/[?#]/)[0] ?? next;
  const hit = workspaceNav.filter((n) => path === n.to || path.startsWith(`${n.to}/`)).sort((a, b) => b.to.length - a.to.length)[0];
  if (hit) return hit.label;
  return null;
}

/**
 * Sign in with an e-mail code (D-UI-1, D-A-1: no passwords). Shown at /signin when real sign-in is on;
 * otherwise the prototype's SignIn screen is used unchanged.
 */
export function CodeSignIn() {
  const navigate = useNavigate();
  const { t } = useT();
  const auth = useAuth();
  const [params] = useSearchParams();
  const nextParam = params.get('next');
  // Step-up (a sensitive action needs a recent sign-in): sign in again even though a session exists.
  const reauth = params.get('reauth') === '1';
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [problem, setProblem] = useState<ReturnType<typeof describeError> | null>(null);
  const codeRef = useRef<HTMLInputElement>(null);

  const emailError = isValidEmail(email) ? '' : 'Enter the email you signed up with';
  const next = safeNext(nextParam, startPageOptions.find((o) => o.value === readAccount().prefs.startPage)?.to ?? '/app');
  const backTo = nextParam ? screenName(next) : null;

  // Already signed in: go straight on.
  useEffect(() => {
    if (auth.status === 'signedIn' && !reauth) navigate(next, { replace: true });
  }, [auth.status, navigate, next, reauth]);

  const send = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setSubmitted(true);
    if (emailError) return focusFirstError();
    setLoading(true);
    setProblem(null);
    try {
      await requestCode(email.trim(), { createUser: false });
      setStep('code');
      setSubmitted(false);
      setCode('');
      setCodeError('');
      window.requestAnimationFrame(() => codeRef.current?.focus());
    } catch (error) {
      setProblem(describeError(error));
    } finally {
      setLoading(false);
    }
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!/^\d{6}$/.test(code)) {
      setCodeError('Enter the 6-digit code');
      return focusFirstError();
    }
    setLoading(true);
    setProblem(null);
    setCodeError('');
    try {
      await signInWithCode(email.trim(), code);
      await auth.refresh();
      navigate(next, { replace: true });
    } catch (error) {
      if (error instanceof ApiError && error.code === 'invalid_code') {
        setCodeError('That code didn’t match or has expired. Check the newest email, or ask for a new code.');
        focusFirstError();
      } else setProblem(describeError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      showcase="signin"
      title={step === 'email' ? t('Welcome back') : t('Check your email')}
      description={
      step === 'email' ?
      t('Enter your email and we’ll send you a 6-digit sign-in code. No password needed.') :
      <>
            {t('We sent a code to')} <span className="font-semibold text-fg">{email.trim()}</span>. {t('It works for {n} minutes.', { n: CODE_MINUTES })}
          </>
      }
      footer={
      <>
          {t('New to KUBICU?')}{' '}
          <Link to="/signup" className="font-semibold text-fg underline underline-offset-4 hover:no-underline">
            {t('Create an account')}
          </Link>
          <span className="mt-3 block text-caption text-fg-subtle">
            {t('KUBICU team?')}{' '}
            <Link to="/admin" className="font-medium text-fg-muted underline underline-offset-2 hover:text-fg">
              {t('Staff console')}
            </Link>
          </span>
        </>
      }>
      
      {reauth && step === 'email' &&
      <InlineAlert tone="info" title="Confirm it’s you" className="mb-5">
          {t('For your security, sign in again with a new code. You’ll go straight back afterwards.')}
        </InlineAlert>
      }
      {nextParam && !reauth && step === 'email' &&
      <InlineAlert tone="info" title="Sign in to continue" className="mb-5">
          {backTo ? t('You’ll go straight back to {screen} after signing in.', { screen: t(backTo) }) : t('You’ll go straight back to where you were after signing in.')}
        </InlineAlert>
      }
      {problem &&
      <InlineAlert tone={problem.tone} title={problem.title} className="mb-5">
          {problem.body}
        </InlineAlert>
      }
      {step === 'email' ?
      <form onSubmit={send} noValidate className="flex flex-col gap-5">
          <TextInput
          id="si-email"
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          leadingIcon={MailIcon}
          placeholder="you@example.com"
          className={inputClass}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={submitted ? emailError || undefined : undefined} />
        
          <Button type="submit" variant="brand" size="lg" fullWidth loading={loading} trailingIcon={ArrowRightIcon} className="mt-1 h-12 rounded-xl">
            Email me a code
          </Button>
        </form> :

      <CodeStep
        codeRef={codeRef}
        code={code}
        setCode={setCode}
        error={codeError}
        loading={loading}
        onSubmit={verify}
        onResend={() => void send()}
        onChangeEmail={() => {
          setStep('email');
          setProblem(null);
          setSubmitted(false);
        }} />

      }
    </AuthLayout>);

}

function CodeStep({
  codeRef,
  code,
  setCode,
  error,
  loading,
  onSubmit,
  onResend,
  onChangeEmail







}: {codeRef: React.RefObject<HTMLInputElement>;code: string;setCode: (v: string) => void;error: string;loading: boolean;onSubmit: (e: React.FormEvent) => void;onResend: () => void;onChangeEmail: () => void;}) {
  const { t } = useT();
  const { wait, restart } = useResendCooldown(t);
  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <TextInput
        ref={codeRef}
        id="si-code"
        label="6-digit code"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        leadingIcon={KeyRoundIcon}
        className={inputClass}
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
        error={error || undefined} />
      
      <Button type="submit" variant="brand" size="lg" fullWidth loading={loading} trailingIcon={ArrowRightIcon} className="mt-1 h-12 rounded-xl">
        Verify and sign in
      </Button>
      <div className="flex flex-col items-center gap-2">
        <Button
          type="button"
          variant="tertiary"
          fullWidth
          disabled={wait > 0}
          onClick={() => {
            restart();
            onResend();
          }}>
          
          {wait > 0 ? t('Resend code in {n}s', { n: wait }) : t('Resend code')}
        </Button>
        <button type="button" onClick={onChangeEmail} className="text-caption font-semibold text-fg-muted underline-offset-4 hover:text-fg hover:underline">
          {t('Use a different email')}
        </button>
      </div>
    </form>);

}
