import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlaskConicalIcon, PlusIcon } from 'lucide-react';
import { DEMO_WORKSPACE_ID } from '../../utils/workspaceStorage';
import { RemoveDemoWorkspaceDialog } from '../settings/RemoveDemoWorkspaceDialog';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { readTeam } from '../../utils/team';
import { plans } from '../../data/plans';
import { roleInfo } from '../../data/permissions';
import { initialsOf } from '../../utils/account/store';
import { Card } from '../ui/layout/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

/** Account → Workspaces: every workspace this account belongs to (D80). */
export function WorkspacesTab() {
  const { workspaces, current, switchTo, restoreDemoWorkspace } = useWorkspace();
  const navigate = useNavigate();
  const [removing, setRemoving] = useState(false);
  const demoPresent = workspaces.some((w) => w.id === DEMO_WORKSPACE_ID);
  const hasOwn = workspaces.some((w) => w.id !== DEMO_WORKSPACE_ID);

  const rows = workspaces.map((w) => {
    const team = readTeam(w.id);
    const members = team?.members.length ?? 1;
    // In the prototype the account owns every workspace it created on this device.
    return { w, role: 'owner' as const, members };
  });

  return (
    <div className="flex flex-col gap-6">
      <Card
        id="acc-ws"
        title="Your workspaces"
        description={`${workspaces.length} ${workspaces.length === 1 ? 'workspace' : 'workspaces'}. Each has its own pages, products, customers, team and plan.`}
        body="flush"
        actions={
        <Button size="sm" variant="secondary" leadingIcon={PlusIcon} onClick={() => navigate('/start')}>
            New workspace
          </Button>
        }>
        
        <ul className="divide-y divide-line">
          {rows.map(({ w, role, members }) => {
            const isCurrent = w.id === current.id;
            return (
              <li key={w.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-4 md:px-6">
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-sunken text-label font-semibold text-fg">
                    {initialsOf(w.name)}
                  </span>
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-label font-semibold text-fg">{w.name}</span>
                      {isCurrent && <Badge tone="info">Open now</Badge>}
                      {w.id === DEMO_WORKSPACE_ID && <Badge tone="neutral">Demo</Badge>}
                    </span>
                    <span className="block truncate text-caption text-fg-subtle">
                      {roleInfo[role].label} · {plans[w.plan].name} plan · {members} {members === 1 ? 'member' : 'members'}
                    </span>
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-2 sm:justify-end">
                  {!isCurrent &&
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      switchTo(w.id);
                      navigate('/app');
                    }}>
                    
                      Open
                    </Button>
                  }
                  {w.id === DEMO_WORKSPACE_ID ?
                  <Button size="sm" variant="tertiary" disabled={!hasOwn} title={hasOwn ? undefined : 'Create your own workspace first'} onClick={() => setRemoving(true)}>
                      Remove
                    </Button> :

                  <Button size="sm" variant="tertiary" disabled title="Owners can’t leave. Transfer ownership in Settings → Team first.">
                      Leave
                    </Button>
                  }
                </div>
              </li>);

          })}
        </ul>
        <p className="border-t border-line px-5 py-3 text-caption text-fg-muted md:px-6">
          Owners can’t leave a workspace. To hand one over, open it and use Settings → Team → Transfer ownership.
        </p>
      </Card>

      <Card
        id="acc-demo"
        title="Demo workspace"
        description={
        demoPresent ?
        'Adaeze Atelier is a ready-made workspace with labelled sample data in every area. Remove it when you’ve finished exploring.' :
        'Want to explore again? Add a fresh copy of Adaeze Atelier, with labelled sample data in every area. It never takes real payments.'
        }
        actions={
        demoPresent ?
        <Button size="sm" variant="secondary" disabled={!hasOwn} title={hasOwn ? undefined : 'Create your own workspace first'} onClick={() => setRemoving(true)}>
              Remove
            </Button> :

        <Button size="sm" variant="secondary" leadingIcon={FlaskConicalIcon} onClick={restoreDemoWorkspace}>
              Add demo workspace
            </Button>

        } />
      
      <RemoveDemoWorkspaceDialog open={removing} onClose={() => setRemoving(false)} />
    </div>);

}