import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2Icon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useT } from '../../contexts/LocaleContext';
import { Button } from '../ui/Button';

/**
 * Route guard for /app/* when real sign-in is on (D-UI-3). Nothing from the workspace renders until
 * GET /v1/me succeeds; a signed-out visitor goes to /signin?next=<where they were>.
 */
export function RequireSession({ children }: { children: React.ReactNode }) {
  const { status, refresh } = useAuth();
  const { pathname, search, hash } = useLocation();
  const { t } = useT();
  if (status === 'signedIn') return <>{children}</>;
  if (status === 'signedOut') return <Navigate to={`/signin?next=${encodeURIComponent(`${pathname}${search}${hash}`)}`} replace />;
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-canvas px-5 text-center text-fg">
      {status === 'loading' ?
      <p role="status" className="flex items-center gap-2 text-label text-fg-muted">
          <Loader2Icon size={18} className="animate-spin motion-reduce:animate-none" aria-hidden />
          {t('Checking your sign-in…')}
        </p> :

      <div role="alert" className="flex max-w-sm flex-col items-center gap-3">
          <p className="text-body font-semibold">{t('Can’t reach KUBICU right now')}</p>
          <p className="text-label text-fg-muted">{t('Your browser workspaces are safe on this device. Try again in a moment.')}</p>
          <Button variant="secondary" onClick={() => void refresh()}>
            Try again
          </Button>
        </div>
      }
    </div>);

}
