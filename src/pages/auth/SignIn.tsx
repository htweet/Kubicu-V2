import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRightIcon, Building2Icon, KeyRoundIcon, MailIcon } from 'lucide-react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { PasswordInput } from '../../components/auth/PasswordInput';
import { TextInput } from '../../components/ui/TextInput';
import { Button } from '../../components/ui/Button';
import { InlineAlert } from '../../components/ui/InlineAlert';
import { isValidEmail } from '../../utils/validation';
import { focusFirstError } from '../../utils/a11y';
import { readAccount } from '../../utils/account/store';
import { providerInfo, ssoForEmail } from '../../utils/sso';
import { startPageOptions } from '../../data/accountOptions';
import { useT } from '../../contexts/LocaleContext';

type Mode = 'password' | 'sso';

const inputClass = 'h-12 rounded-xl pl-10';

export function SignIn() {
  const navigate = useNavigate();
  const { t } = useT();
  const [mode, setMode] = useState<Mode>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [required, setRequired] = useState(false);
  const [ssoMessage, setSsoMessage] = useState('');

  const errors = {
    email: isValidEmail(email) ? '' : mode === 'sso' ? 'Enter your work email' : 'Enter the email you signed up with',
    password: password ? '' : 'Enter your password',
  };

  // Lands on the start screen chosen in Account → Preferences (D80).
  const go = () => {
    const start = startPageOptions.find((o) => o.value === readAccount().prefs.startPage)?.to ?? '/app';
    window.setTimeout(() => navigate(start), 400);
  };

  const submit = (e: React.FormEvent, ownerOverride = false) => {
    e.preventDefault();
    setSubmitted(true);
    if (errors.email || errors.password) return focusFirstError();
    // Company requires single sign-on for this domain (D115); the Owner keeps a password + two-step way in.
    if (!ownerOverride && ssoForEmail(email)?.requireSso) return setRequired(true);
    setLoading(true);
    go();
  };

  const submitSso = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (errors.email) return focusFirstError();
    const found = ssoForEmail(email);
    if (!found) return setSsoMessage(t('Single sign-on isn’t set up for @{domain}. Sign in with your password, or ask your workspace admin.', { domain: email.split('@')[1] }));
    setSsoMessage('');
    setLoading(true);
    // Simulated redirect to the identity provider and back.
    window.setTimeout(() => go(), 900);
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setSubmitted(false);
    setRequired(false);
    setSsoMessage('');
    setLoading(false);
  };

  const sso = mode === 'sso' ? ssoForEmail(email) : null;

  return (
    <AuthLayout
      showcase="signin"
      title={mode === 'sso' ? t('Sign in with single sign-on') : t('Welcome back')}
      description={mode === 'sso' ? t('For teams on Enterprise. We’ll send you to your company’s sign-in page.') : t('Sign in to manage your pages, orders and bookings.')}
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
      }
    >
      {mode === 'password' ? (
        <form onSubmit={submit} noValidate className="flex flex-col gap-5">
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
            onChange={(e) => {
              setEmail(e.target.value);
              setRequired(false);
            }}
            error={submitted ? errors.email || undefined : undefined}
          />
          <PasswordInput
            id="si-password"
            label="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={submitted ? errors.password || undefined : undefined}
            trailing={
              <Link to="/reset" className="text-caption font-semibold text-fg-muted underline-offset-4 hover:text-fg hover:underline">
                {t('Forgot password?')}
              </Link>
            }
          />
          {required && (
            <InlineAlert tone="warning" title="Your company uses single sign-on">
              <span className="block">{t('Sign in with your work account instead of a password.')}</span>
              <span className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                <button type="button" className="font-semibold underline underline-offset-2" onClick={() => switchMode('sso')}>
                  {t('Use single sign-on')}
                </button>
                <button type="button" className="underline underline-offset-2" onClick={(e) => submit(e as unknown as React.FormEvent, true)}>
                  {t('I’m the Owner — continue with password and two-step code')}
                </button>
              </span>
            </InlineAlert>
          )}
          <Button type="submit" variant="brand" size="lg" fullWidth loading={loading} trailingIcon={ArrowRightIcon} className="mt-1 h-12 rounded-xl">
            Sign in
          </Button>
          <div className="flex items-center gap-3 text-caption text-fg-subtle" aria-hidden>
            <span className="h-px flex-1 bg-line" />
            {t('or')}
            <span className="h-px flex-1 bg-line" />
          </div>
          <Button type="button" variant="secondary" size="lg" fullWidth leadingIcon={KeyRoundIcon} className="h-12 rounded-xl" onClick={() => switchMode('sso')}>
            Sign in with single sign-on
          </Button>
        </form>
      ) : (
        <form onSubmit={submitSso} noValidate className="flex flex-col gap-5">
          <TextInput
            id="si-sso-email"
            label="Work email"
            type="email"
            inputMode="email"
            autoComplete="email"
            leadingIcon={Building2Icon}
            placeholder="you@company.com"
            className={inputClass}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setSsoMessage('');
            }}
            error={submitted ? errors.email || undefined : undefined}
            hint={sso ? `${sso.workspaceName} · ${providerInfo[sso.provider].label}` : undefined}
          />
          {ssoMessage && <InlineAlert tone="warning" title="No single sign-on for this email">{ssoMessage}</InlineAlert>}
          <Button type="submit" variant="brand" size="lg" fullWidth loading={loading} className="h-12 rounded-xl">
            {loading && sso ? t('Opening {provider}…', { provider: providerInfo[sso.provider].label }) : t('Continue')}
          </Button>
          <button type="button" onClick={() => switchMode('password')} className="self-center text-caption font-semibold text-fg-muted underline-offset-4 hover:text-fg hover:underline">
            {t('Sign in with a password instead')}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
