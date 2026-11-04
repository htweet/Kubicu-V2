import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRightIcon, CheckCircle2Icon, MailIcon, SparklesIcon, UserIcon } from 'lucide-react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { PasswordInput } from '../../components/auth/PasswordInput';
import { PasswordChecklist } from '../../components/auth/PasswordChecklist';
import { TextInput } from '../../components/ui/TextInput';
import { Button } from '../../components/ui/Button';
import { isValidEmail } from '../../utils/validation';
import { focusFirstError } from '../../utils/a11y';
import { claimMinutesLeft, readHandleClaim } from '../../utils/handleClaim';
import { useT } from '../../contexts/LocaleContext';
import { cn } from '../../utils/cn';
import type { CountryCode } from '../../types/country';
import { countries } from '../../data/countries';
import { countryForLanguage, countryInfo, writeSignupCountry } from '../../utils/country';
import { formatOpeningDay, useCountryRollout } from '../../utils/admin/countryRollout';
import { SelectInput } from '../../components/ui/SelectInput';
import { InlineAlert } from '../../components/ui/InlineAlert';
import { describeError, requestCode } from '../../utils/auth/session';

const inputClass = 'h-12 rounded-xl pl-10';

/**
 * `codeFlow` (real sign-in on, D-UI-1 / D-A-1): no password; the account is created with an e-mail code
 * (next screen). Without it the prototype's screen is unchanged.
 */
export function SignUp({ codeFlow = false }: {codeFlow?: boolean;} = {}) {
  const navigate = useNavigate();
  const { t, lang } = useT();
  const [params] = useSearchParams();
  // Where the business sells from (D494): a first guess from the language, and checked against the country rollout.
  const [country, setCountry] = useState<CountryCode>(() => countryForLanguage(lang));
  const rollout = useCountryRollout();
  const closed = !rollout.open(country);
  const opensOn = rollout.opensOn(country);
  const countryName = t(countryInfo(country).name);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [claim] = useState(() => readHandleClaim());
  const [problem, setProblem] = useState<ReturnType<typeof describeError> | null>(null);

  const errors = {
    name: name.trim() ? '' : 'Enter your name',
    email: isValidEmail(email) ? '' : 'Enter a valid email, like you@example.com',
    password: codeFlow || password.length >= 8 ? '' : 'Use at least 8 characters',
    agreed: agreed ? '' : 'Please agree to continue',
    country: closed ? 'Choose a country where KUBICU is open' : ''
  };
  const valid = Object.values(errors).every((e) => !e);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!valid) return focusFirstError();
    setLoading(true);
    writeSignupCountry(country);
    const kit = params.get('kit');
    if (codeFlow) {
      setProblem(null);
      requestCode(email.trim(), { createUser: true, name: name.trim() }).then(
        () => navigate(`/verify?email=${encodeURIComponent(email.trim())}${kit ? `&kit=${kit}` : ''}`),
        (error: unknown) => {
          setLoading(false);
          setProblem(describeError(error));
        }
      );
      return;
    }
    window.setTimeout(() => navigate(`/verify?email=${encodeURIComponent(email.trim())}${kit ? `&kit=${kit}` : ''}`), 400);
  };

  const minutes = claim ? claimMinutesLeft(claim) : 0;

  return (
    <AuthLayout
      showcase="signup"
      title={t('Create your account')}
      description={t('Free to start. You’ll build your page right after this.')}
      eyebrow={<Journey />}
      footer={
      <>
          {t('Already have an account?')}{' '}
          <Link to="/signin" className="font-semibold text-fg underline underline-offset-4 hover:no-underline">
            {t('Sign in')}
          </Link>
        </>
      }>
      
      {claim ?
      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-success/40 bg-success-soft px-4 py-3.5">
          <CheckCircle2Icon size={18} className="mt-0.5 shrink-0 text-success" aria-hidden />
          <p className="text-label text-fg">
            {t('{link} is held for you for {n} more minutes. Create your account to make it yours.', { link: `kub.icu/${claim.handle}`, n: minutes })}
          </p>
        </div> :

      <Link
        to="/copilot"
        className="group mb-6 flex items-center gap-3 rounded-2xl border border-line bg-sunken/60 px-4 py-3.5 transition-colors duration-150 hover:border-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
        
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-fg text-raised">
            <SparklesIcon size={16} aria-hidden />
          </span>
          <span className="min-w-0 flex-1 text-label leading-snug text-fg-muted">
            <span className="block font-semibold text-fg">{t('Never made a website?')}</span>
            {t('Tell Copilot about your business and see a draft first.')}
          </span>
          <ArrowRightIcon size={16} className="shrink-0 text-fg-subtle transition-transform duration-150 ease-out group-hover:translate-x-0.5" aria-hidden />
        </Link>
      }

      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        <TextInput id="su-name" label="Your name" autoComplete="name" leadingIcon={UserIcon} placeholder="Adaeze Okafor" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} error={submitted ? errors.name || undefined : undefined} />
        <TextInput id="su-email" label="Email" type="email" inputMode="email" autoComplete="email" leadingIcon={MailIcon} placeholder="you@example.com" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} error={submitted ? errors.email || undefined : undefined} />
        {!codeFlow &&
        <div className="flex flex-col gap-3">
          <PasswordInput id="su-password" label="Password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} error={submitted ? errors.password || undefined : undefined} />
          <PasswordChecklist password={password} />
        </div>
        }
        <div className="flex flex-col gap-3">
          <SelectInput<CountryCode>
            id="su-country"
            required
            label="Where is your business?"
            hint={closed ? undefined : 'Sets your currency, phone code and how customers pay. You can change it later in Settings.'}
            value={country}
            onChange={setCountry}
            error={submitted && errors.country ? errors.country : undefined}
            options={countries.map((c) => ({ value: c.code, label: c.name }))} />
          
          {closed &&
          <InlineAlert tone="info" title={t('KUBICU isn’t open for businesses in {country} yet', { country: countryName })}>
              {opensOn ? t('We plan to open there on {date}. Buyers can already shop on KUBICU pages.', { date: formatOpeningDay(opensOn) }) : t('We’re opening one country at a time. Buyers can already shop on KUBICU pages.')}
            </InlineAlert>
          }
        </div>
        <div>
          <label className={cn('flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-label text-fg-muted transition-colors duration-150', submitted && errors.agreed ? 'border-danger' : 'border-line hover:border-line-strong')}>
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} aria-invalid={submitted && !!errors.agreed} aria-describedby={submitted && errors.agreed ? 'su-agree-error' : undefined} className="mt-0.5 h-4 w-4 shrink-0 accent-[rgb(var(--action))]" />
            <span>
              {t('I agree to the')}{' '}
              <Link to="/about/terms" className="font-semibold text-fg underline underline-offset-2">
                {t('Terms')}
              </Link>{' '}
              {t('and')}{' '}
              <Link to="/about/privacy" className="font-semibold text-fg underline underline-offset-2">
                {t('Privacy policy')}
              </Link>
              .
            </span>
          </label>
          {submitted && errors.agreed &&
          <p id="su-agree-error" role="alert" className="mt-1.5 text-caption text-danger">
              {t(errors.agreed)}
            </p>
          }
        </div>
        {problem && <InlineAlert tone={problem.tone} title={problem.title}>{problem.body}</InlineAlert>}
        <Button type="submit" variant="brand" size="lg" fullWidth loading={loading} trailingIcon={ArrowRightIcon} className="mt-1 h-12 rounded-xl">
          Create account
        </Button>
      </form>
    </AuthLayout>);

}

/** Where sign-up sits in the journey: account → confirm email → your page. */
function Journey() {
  const { t } = useT();
  const steps = [t('Account'), t('Confirm email'), t('Your page')];
  return (
    // Each step stays on one line; in longer languages whole steps move to the next row instead of splitting.
    <ol aria-label={t('Getting started')} className="flex flex-wrap items-center gap-x-1.5 gap-y-2 text-[12px] font-semibold sm:gap-x-2 sm:text-caption">
      {steps.map((s, i) =>
      <li key={s} className="flex items-center gap-1.5 sm:gap-2">
          <span aria-current={i === 0 ? 'step' : undefined} className={cn('whitespace-nowrap rounded-full px-2.5 py-1', i === 0 ? 'bg-fg text-raised' : 'bg-sunken text-fg-subtle')}>
            {s}
          </span>
          {i < steps.length - 1 && <span className="h-px w-2 bg-line-strong sm:w-3" aria-hidden />}
        </li>
      )}
    </ol>);

}