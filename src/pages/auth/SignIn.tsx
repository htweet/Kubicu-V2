import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { TextInput } from '../../components/ui/TextInput';
import { Button } from '../../components/ui/Button';
import { isValidEmail } from '../../utils/validation';
import { readAccount } from '../../utils/account/store';
import { startPageOptions } from '../../data/accountOptions';

export function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const errors = {
    email: isValidEmail(email) ? '' : 'Enter the email you signed up with',
    password: password ? '' : 'Enter your password'
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (errors.email || errors.password) return;
    setLoading(true);
    // Lands on the start screen chosen in Account → Preferences (D80).
    const start = startPageOptions.find((o) => o.value === readAccount().prefs.startPage)?.to ?? '/app';
    window.setTimeout(() => navigate(start), 400);
  };

  return (
    <AuthLayout
      title="Welcome back"
      footer={
      <>
          New to KUBICU?{' '}
          <Link to="/signup" className="font-semibold text-action hover:underline">
            Create an account
          </Link>
          <span className="mt-3 block text-caption text-fg-subtle">
            KUBICU team?{' '}
            <Link to="/admin" className="font-medium text-fg-muted underline underline-offset-2 hover:text-fg">
              Staff console
            </Link>
          </span>
        </>
      }>
      
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <TextInput id="si-email" label="Email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={submitted ? errors.email : undefined} />
        <div>
          <TextInput
            id="si-password"
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={submitted ? errors.password : undefined} />
          
          <Link to="/reset" className="mt-2 inline-block text-caption font-medium text-action hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" variant="brand" size="lg" fullWidth loading={loading} className="mt-2">
          Sign in
        </Button>
      </form>
    </AuthLayout>);

}