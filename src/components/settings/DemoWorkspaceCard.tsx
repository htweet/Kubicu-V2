import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2Icon } from 'lucide-react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useTeam } from '../../contexts/TeamContext';
import { DEMO_WORKSPACE_ID } from '../../utils/workspaceStorage';
import { Card } from '../ui/layout/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { RemoveDemoWorkspaceDialog } from './RemoveDemoWorkspaceDialog';
import { useT } from '../../contexts/LocaleContext';

/** Settings → Business, only inside the built-in demo workspace (D201). */
export function DemoWorkspaceCard() {
  const { t: tr } = useT();
  const { current, workspaces } = useWorkspace();
  const can = useTeam().can('billing.manage');
  const [open, setOpen] = useState(false);
  if (current.id !== DEMO_WORKSPACE_ID) return null;
  const hasOwn = workspaces.some((w) => w.id !== DEMO_WORKSPACE_ID);

  return (
    <Card
      id="demo-workspace"
      title="Demo workspace"
      description="Adaeze Atelier is a ready-made workspace for exploring KUBICU. Everything in it is sample data, labelled “Sample”, and it never takes real payments."
      actions={<Badge tone="info">Demo</Badge>}>
      
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-label text-fg-muted">
          {hasOwn ? tr('Finished exploring? Remove it to keep only your own workspaces.') :
          <>
              {tr('Create your own workspace first, then you can remove this one.')}{' '}
              <Link to="/start" className="font-medium text-fg underline underline-offset-4 hover:text-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                {tr('Create a workspace')}
              </Link>
            </>
          }
        </p>
        <Button variant="destructive" leadingIcon={Trash2Icon} disabled={!hasOwn || !can.allowed} title={!can.allowed ? can.reason : undefined} onClick={() => setOpen(true)} className="shrink-0">
          Remove demo workspace
        </Button>
      </div>
      <RemoveDemoWorkspaceDialog open={open} onClose={() => setOpen(false)} />
    </Card>);

}