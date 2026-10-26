import React, { useState } from 'react';
import { CheckIcon, Trash2Icon } from 'lucide-react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useTeam } from '../../contexts/TeamContext';
import { DEMO_WARN_DAYS, demoDataCovers, demoDaysLeft } from '../../utils/demoData';
import { formatDate } from '../../utils/billing';
import { Card } from '../ui/layout/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { InlineAlert } from '../ui/InlineAlert';

/**
 * Settings → Business → Demo data (D200). Only appears for workspaces created with demo data.
 * Demo data can't be added back afterwards — it's offered only during setup.
 */
export function DemoDataCard() {
  const { current, removeDemoData } = useWorkspace();
  const can = useTeam().can('billing.manage');
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const days = demoDaysLeft(current);
  if (days === null || !current.demoData) return null;
  const warn = days <= DEMO_WARN_DAYS;

  const remove = () => {
    setBusy(true);
    removeDemoData('manual');
  };

  return (
    <Card
      id="demo-data"
      title="Demo data"
      description="Labelled sample records added when this workspace was set up, so every area had something to try."
      actions={
      <Badge tone={warn ? 'warning' : 'info'} dot>
          {days <= 1 ? 'Deleted tomorrow' : `${days} days left`}
        </Badge>
      }>
      
      <div className="flex flex-col gap-5">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-caption text-fg-subtle">Added</dt>
            <dd className="mt-0.5 text-label font-medium text-fg">{formatDate(current.demoData.seededAt)}</dd>
          </div>
          <div>
            <dt className="text-caption text-fg-subtle">Deleted automatically</dt>
            <dd className="mt-0.5 text-label font-medium text-fg">{formatDate(current.demoData.expiresAt)}</dd>
          </div>
        </dl>
        <div>
          <p className="text-label font-medium text-fg">What it includes</p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {demoDataCovers.map((c) =>
            <li key={c} className="flex gap-2 text-label text-fg-muted">
                <CheckIcon size={14} className="mt-1 shrink-0 text-fg-subtle" aria-hidden />
                {c}
              </li>
            )}
          </ul>
        </div>
        {!can.allowed &&
        <InlineAlert tone="info" title="Only the Owner can remove demo data">
            {can.reason}
          </InlineAlert>
        }
        <div className="flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-caption text-fg-subtle">Removing it can’t be undone, and demo data can’t be added back later.</p>
          <Button variant="destructive" leadingIcon={Trash2Icon} disabled={!can.allowed} onClick={() => setConfirming(true)} className="shrink-0">
            Remove demo data now
          </Button>
        </div>
      </div>

      <Dialog
        open={confirming}
        onClose={() => !busy && setConfirming(false)}
        size="sm"
        title="Remove all demo data?"
        description="Everything labelled “Sample” in this workspace is deleted. The app reloads when it’s done."
        footer={
        <>
            <Button variant="secondary" disabled={busy} onClick={() => setConfirming(false)}>
              Keep it for now
            </Button>
            <Button variant="destructive" loading={busy} onClick={remove}>
              Remove demo data
            </Button>
          </>
        }>
        
        <ul className="flex list-disc flex-col gap-1.5 pl-4 text-label text-fg-muted">
          <li>Sample products, orders, bookings, contacts, forms, links, visits and teammates go.</li>
          <li>The seven sample spaces and their pages are deleted.</li>
          <li className="font-medium text-fg">Anything you added or edited yourself that isn’t labelled “Sample” stays.</li>
        </ul>
      </Dialog>
    </Card>);

}