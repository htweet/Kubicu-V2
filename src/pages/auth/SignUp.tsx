import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { TextInput } from '../../components/ui/TextInput';
import { Button } from '../../components/ui/Button';
import { isValidEmail } from '../../utils/validation';

export function SignUp() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const errors = {
    name: name.trim() ? '' : 'Enter your name',
    email: isValidEmail(email) ? '' : 'Enter a valid email, like you@example.com',
    password: password.length >= 8 ? '' : 'Use at least 8 characters',
    agreed: agreed ? '' : 'Please agree to continue'
  };
  const valid = Object.values(errors).every((e) => !e);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!valid) return;
    setLoading(true);
    const kit = params.get('kit');
    window.setTimeout(() => navigate(`/verify?email=${encodeURIComponent(email.trim())}${kit ? `&kit=${kit}` : ''}`), 400);
  };

  return (
    <AuthLayout
      title="Create your KUBICU account"
      description="Free to start. You’ll build your page right after this."
      footer={
      <>
          Already have an account?{' '}
          <Link to="/signin" className="font-semibold text-action hover:underline">
            Sign in
          </Link>
        </>
      }>
      
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <TextInput id="su-name" label="Your name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} error={submitted ? errors.name : undefined} />
        <TextInput id="su-email" label="Email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={submitted ? errors.email : undefined} />
        <TextInput
          id="su-password"
          label="Password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          hint="At least 8 characters"
          error={submitted ? errors.password : undefined} />
        
        <div>
          <label className="flex items-start gap-2.5 text-label text-fg-muted">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[rgb(var(--action))]" />
            <span>
              I agree to the{' '}
              <Link to="/about/terms" className="font-medium text-fg underline underline-offset-2">
                Terms
              </Link>{' '}
              and{' '}
              <Link to="/about/privacy" className="font-medium text-fg underline underline-offset-2">
                Privacy policy
              </Link>
              .
            </span>
          </label>
          {submitted && errors.agreed && <p className="mt-1.5 text-caption text-danger">{errors.agreed}</p>}
        </div>
        <Button type="submit" variant="brand" size="lg" fullWidth loading={loading} className="mt-2">
          Create account
        </Button>
      </form>
    </AuthLayout>);

}