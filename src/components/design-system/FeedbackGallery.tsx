import React, { useState } from 'react';
import { toast } from 'sonner';
import { LayersIcon, MoreHorizontalIcon, PenToolIcon, CopyIcon, EyeOffIcon } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { InlineAlert } from '../ui/InlineAlert';
import { EmptyState } from '../ui/EmptyState';
import { Skeleton } from '../ui/Skeleton';
import { PlanLock } from '../ui/PlanLock';
import { IllustrativeTag } from '../ui/IllustrativeTag';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { Dialog } from '../ui/Dialog';
import { Sheet } from '../ui/Sheet';
import { Menu } from '../ui/Menu';
import { SaveIndicator } from '../canvas/SaveIndicator';
import { DsLabel } from './DsSection';

export function FeedbackGallery() {
  const [dialog, setDialog] = useState(false);
  const [sheet, setSheet] = useState(false);

  return (
    <div className="flex flex-col gap-10">
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <DsLabel>Status labels — always icon or text, never colour alone</DsLabel>
          <div className="flex flex-wrap gap-2">
            <Badge tone="success" dot>Live</Badge>
            <Badge tone="accent" dot>Unpublished changes</Badge>
            <Badge tone="neutral" dot>Draft · not published</Badge>
            <Badge tone="info">Snapshot</Badge>
            <Badge tone="warning">Worth checking</Badge>
            <Badge tone="danger">Needs a fix</Badge>
            <Badge tone="action">New</Badge>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <PlanLock kind="plan">Pro plan</PlanLock>
            <PlanLock kind="planned">Batch 5</PlanLock>
            <IllustrativeTag />
          </div>
        </div>
        <div>
          <DsLabel>Autosave states</DsLabel>
          <ul className="flex flex-col gap-2.5">
            <li><SaveIndicator status="saved" lastSavedAt={new Date(Date.now() - 120000).toISOString()} onRetry={() => undefined} /></li>
            <li><SaveIndicator status="saving" lastSavedAt={null} onRetry={() => undefined} /></li>
            <li><SaveIndicator status="offline" lastSavedAt={null} onRetry={() => undefined} /></li>
            <li><SaveIndicator status="error" lastSavedAt={null} onRetry={() => toast('Retrying save…')} /></li>
            <li><SaveIndicator status="conflict" lastSavedAt={null} onRetry={() => undefined} /> <span className="text-caption text-fg-subtle">— edited in another tab</span></li>
          </ul>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <InlineAlert tone="info" title="Submissions aren’t stored yet">Entries are saved once Audience arrives in Batch 4.</InlineAlert>
        <InlineAlert tone="success" title="Everything checks out">Links are complete and colours are readable.</InlineAlert>
        <InlineAlert tone="warning" title="2 worth checking">Add alt text to the studio photo.</InlineAlert>
        <InlineAlert tone="danger" title="We couldn’t publish" action={<Button size="sm" variant="secondary">Try again</Button>}>
          Your draft is safe and your live page hasn’t changed.
        </InlineAlert>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="rounded-md border border-line bg-raised">
          <EmptyState icon={LayersIcon} title="No blocks yet" description="Blocks you add appear here in page order." action={<Button size="sm">Add a block</Button>} />
        </div>
        <div className="flex flex-col gap-3 rounded-md border border-line bg-raised p-5" aria-label="Loading example">
          <DsLabel>Loading skeleton</DsLabel>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>

      <div>
        <DsLabel>Overlays</DsLabel>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={() => setDialog(true)}>Open dialog</Button>
          <Button variant="secondary" onClick={() => setSheet(true)}>Open sheet</Button>
          <Button
            variant="secondary"
            onClick={() => toast('Link button deleted', { action: { label: 'Undo', onClick: () => toast('Restored') } })}>
            
            Show toast
          </Button>
          <Menu
            align="start"
            items={[
            { id: 'a', label: 'Open canvas', icon: PenToolIcon },
            { id: 'b', label: 'Duplicate', icon: CopyIcon, disabled: true, reason: 'Needs multiple spaces — planned.' },
            { id: 'c', label: 'Hide from live page', icon: EyeOffIcon, destructive: true }]
            }
            trigger={(props) => <IconButton {...props} icon={MoreHorizontalIcon} label="Open menu" variant="outline" />} />
          
        </div>
      </div>

      <Dialog
        open={dialog}
        onClose={() => setDialog(false)}
        title="Replace your draft?"
        description="We’ll save your current draft as a snapshot first."
        footer={
        <>
            <Button variant="secondary" onClick={() => setDialog(false)}>Cancel</Button>
            <Button onClick={() => setDialog(false)} data-autofocus>Replace draft</Button>
          </>
        } />
      
      <Sheet open={sheet} onClose={() => setSheet(false)} title="Example sheet" side="right">
        <p className="p-5 text-label text-fg-muted">Sheets hold secondary tasks like version history or, on mobile, block settings.</p>
      </Sheet>
    </div>);

}