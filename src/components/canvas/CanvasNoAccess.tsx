import React from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, LockIcon } from 'lucide-react';
import { useTeam } from '../../contexts/TeamContext';
import { roleInfo } from '../../data/permissions';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';

/** Shown instead of the canvas when your role can't edit this space (D57). */
export function CanvasNoAccess({ reason, handle, title }: {reason: string;handle: string;title: string;}) {
  const navigate = useNavigate();
  const { role } = useTeam();
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-canvas px-5">
      <EmptyState
        icon={LockIcon}
        title={`You can’t edit ${title}`}
        description={`${reason} You’re signed in as ${roleInfo[role].label}.`}
        action={
        <div className="flex flex-wrap justify-center gap-2">
            <Button variant="secondary" onClick={() => navigate('/app')}>
              Back to workspace
            </Button>
            <Button leadingIcon={EyeIcon} onClick={() => navigate(`/p/${handle}?draft=1`)}>
              Preview the draft
            </Button>
          </div>
        } />
      
    </div>);

}