import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MailIcon } from 'lucide-react';
import { toast } from 'sonner';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { Button } from '../../components/ui/Button';

const COOLDOWN = 30;

export function VerifyEmail() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const email = params.get('email') || 'your inbox';
  const kit = params.get('kit');
  const [wait, setWait] = useState(COOLDOWN);

  useEffect(() => {
    if (wait <= 0) return;
    const t = window.setTimeout(() => setWait((w) => w - 1), 1000);
    return () => window.clearTimeout(t);
  }, [wait]);

  return (
    <AuthLayout title="Confirm your email" description={<>We sent a confirmation link to <span className="font-semibold text-fg">{email}</span>.</>}>
      <div className="flex flex-col gap-4">
        <div className="flex gap-3 rounded-md border border-line p-4">
          <MailIcon size={18} className="mt-0.5 shrink-0 text-fg-subtle" aria-hidden />
          <p className="text-label text-fg-muted">You can start building now. In the live product you’ll confirm your email before your page goes public; in this prototype, publishing works without it.</p>
        </div>
        <Button size="lg" fullWidth onClick={() => navigate(kit ? `/start?kit=${kit}` : '/start')}>
          Start building my page
        </Button>
        <Button
          variant="tertiary"
          fullWidth
          disabled={wait > 0}
          onClick={() => {
            setWait(COOLDOWN);
            toast('Confirmation email sent again', { description: 'Prototype — no email is actually sent.' });
          }}
        >
          {wait > 0 ? `Resend email in ${wait}s` : 'Resend email'}
        </Button>
      </div>
    </AuthLayout>
  );
}
