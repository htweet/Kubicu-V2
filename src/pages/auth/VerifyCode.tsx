import React, { useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRightIcon, KeyRoundIcon } from 'lucide-react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { TextInput } from '../../components/ui/TextInput';
import { Button } from '../../components/ui/Button';
import { InlineAlert } from '../../components/ui/InlineAlert';
import { focusFirstError } from '../../utils/a11y';
import { useT } from '../../contexts/LocaleContext';
import { useAuth } from '../../contexts/AuthContext';
import { ApiError, describeError, requestCode, signInWithCode } from '../../utils/auth/session';
import { useResendCooldown } from '../../components/auth/useResendCooldown';

/**
 * Confirm the e-mail with a 6-digit code after sign-up (D-UI-1, step 5). Shown at /verify when real
 * sign-in is on; then the same /start onboarding as today.
 */
export function VerifyCode() {
  const navigate = useNavigate();
  const { t } = useT();
  const auth = useAuth();
  const [params] = useSearchParams();
  const email = params.get('email') ?? '';
  const kit = params.get('kit');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [problem, setProblem] = useState<ReturnType<typeof describeError> | null>(null);
  const { wait, restart } = useResendCooldown(t);
  const ref = useRef<HTMLInputElement>(null);

  const confirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setError('Enter the 6-digit code');
      return focusFirstError();
    }
    setLoading(true);
    setError('');
    setProblem(null);
    try {
      await signInWithCode(email, code);
      await auth.refresh();
      navigate(kit ? `/start?kit=${kit}` : '/start', { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.code === 'invalid_code') {
        setError('That code didn’t match or has expired. Check the newest email, or ask for a new code.');
        focusFirstError();
      } else setProblem(describeError(err));
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <AuthLayout title="Confirm your email" footer={<Link to="/signup" className="font-semibold text-action hover:underline">{t('Back to sign up')}</Link>}>
        <InlineAlert tone="warning" title="We don’t know which email to confirm">
          Start again from sign up.
        </InlineAlert>
      </AuthLayout>);

  }

  return (
    <AuthLayout title="Confirm your email" description={<>{t('We sent a 6-digit code to')} <span className="font-semibold text-fg">{email}</span>. {t('It works for {n} minutes.', { n: 10 })}</>}>
      <form onSubmit={confirm} noValidate className="flex flex-col gap-4">
        {problem && <InlineAlert tone={problem.tone} title={problem.title}>{problem.body}</InlineAlert>}
        <TextInput
          ref={ref}
          id="verify-code"
          label="6-digit code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          autoFocus
          leadingIcon={KeyRoundIcon}
          className="h-12 rounded-xl pl-10"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          error={error || undefined} />
        
        <Button type="submit" size="lg" fullWidth loading={loading} trailingIcon={ArrowRightIcon}>
          Confirm and start building
        </Button>
        <Button
          type="button"
          variant="tertiary"
          fullWidth
          disabled={wait > 0}
          onClick={() => {
            restart();
            setProblem(null);
            requestCode(email, { createUser: true }).catch((err: unknown) => setProblem(describeError(err)));
          }}>
          
          {wait > 0 ? t('Resend code in {n}s', { n: wait }) : t('Resend code')}
        </Button>
      </form>
    </AuthLayout>);

}
