import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CompassIcon } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { PlatformLook } from '../components/marketing/PlatformLook';
import { KubicuLogo } from '../components/shell/KubicuLogo';

export function NotFound({ embedded }: { embedded?: boolean }) {
  const navigate = useNavigate();
  const body = (
    <EmptyState
      icon={CompassIcon}
      title="We couldn’t find that"
      description="The link may be mistyped, or the page may have moved or ended."
      action={
        <div className="flex flex-wrap justify-center gap-2">
          <Button variant={embedded ? 'primary' : 'brand'} onClick={() => navigate('/')}>
            KUBICU home
          </Button>
          <Button variant="secondary" onClick={() => navigate('/app')}>
            Go to your workspace
          </Button>
        </div>
      }
    />
  );
  if (embedded) return <div className="py-16">{body}</div>;
  return (
    <PlatformLook night>
      <div className="flex min-h-screen flex-col">
        <div className="px-5 py-6 md:px-10">
          <KubicuLogo />
        </div>
        <main className="flex flex-1 items-center justify-center px-5 pb-20">
          <div>
            <p aria-hidden className="nm-text mb-6 text-center font-display text-[88px] font-semibold leading-none tracking-[-0.04em]">404</p>
            {body}
          </div>
        </main>
      </div>
    </PlatformLook>
  );
}
