import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MailCheckIcon } from 'lucide-react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { TextInput } from '../../components/ui/TextInput';
import { Button } from '../../components/ui/Button';
import { isValidEmail } from '../../utils/validation';

export function ResetPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [sent, setSent] = useState(false);
  const error = isValidEmail(email) ? '' : 'Enter a valid email';

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!error) setSent(true);
  };

  if (sent) {
    return (
      <AuthLayout title="Check your email" footer={<Link to="/signin" className="font-semibold text-action hover:underline">Back to sign in</Link>}>
        <div className="flex gap-3">
          <MailCheckIcon size={20} className="mt-0.5 shrink-0 text-success" aria-hidden />
          <p className="text-label text-fg-muted">
            If an account exists for <span className="font-semibold text-fg">{email.trim()}</span>, we’ve sent a link to reset your password. It expires in 30 minutes. Check spam if it doesn’t arrive.
          </p>
        </div>
      </AuthLayout>);

  }

  return (
    <AuthLayout
      title="Reset your password"
      description="Enter your email and we’ll send you a reset link."
      footer={<Link to="/signin" className="font-semibold text-action hover:underline">Back to sign in</Link>}>
      
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <TextInput id="rp-email" label="Email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={submitted ? error || undefined : undefined} />
        <Button type="submit" variant="brand" size="lg" fullWidth>
          Send reset link
        </Button>
      </form>
    </AuthLayout>);

}