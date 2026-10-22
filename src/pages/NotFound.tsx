import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CompassIcon } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';

export function NotFound({ embedded }: {embedded?: boolean;}) {
  const navigate = useNavigate();
  return (
    <div className={embedded ? 'py-16' : 'flex min-h-screen items-center justify-center bg-canvas text-fg'}>
      <EmptyState
        icon={CompassIcon}
        title="We couldn’t find that"
        description="The link may be mistyped, or the screen may have moved."
        action={
        <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={() => navigate('/app')}>Go to your workspace</Button>
            <Button variant="secondary" onClick={() => navigate('/')}>
              KUBICU home
            </Button>
          </div>
        } />
      
    </div>);

}