import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { TextInput } from '../../components/ui/TextInput';
import { Button } from '../../components/ui/Button';
import { isValidEmail } from '../../utils/validation';

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
    window.setTimeout(() => navigate('/app'), 400);
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
        <Button type="submit" size="lg" fullWidth loading={loading} className="mt-2">
          Sign in
        </Button>
      </form>
    </AuthLayout>);

}