import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  AlertTriangleIcon,
  ArchiveIcon,
  CheckCircle2Icon,
  CopyIcon,
  ExternalLinkIcon,
  EyeOffIcon,
  MoreHorizontalIcon,
  PenToolIcon,
  PlusIcon,
  XCircleIcon } from
'lucide-react';
import { useEditor } from '../contexts/EditorContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { PageHeader } from '../components/shell/PageHeader';
import { PageStatusBadge } from '../components/canvas/PageStatusBadge';
import { PageMiniPreview } from '../components/overview/PageMiniPreview';
import { CopyLinkButton } from '../components/overview/CopyLinkButton';
import { SpacesList, type SpaceRow, type SpaceStatus } from '../components/spaces/SpacesList';
import { Button } from '../components/ui/Button';
import { IconButton } from '../components/ui/IconButton';
import { Menu } from '../components/ui/Menu';
import { Dialog } from '../components/ui/Dialog';
import { TextInput } from '../components/ui/TextInput';
import { readPersistedPage } from '../utils/workspaceStorage';
import { docSignature, cloneDocument } from '../utils/blocks';
import { suggestHandles, takenHandles } from '../utils/handles';
import { formatRelative, publicUrl } from '../utils/format';
import { cn } from '../utils/cn';

const comingNext = ['Campaign pages for a sale or launch', 'Micro-sites with several pages under one link', 'DealRooms for group buys'];

export function Spaces() {
  const { state, actions, issues, hasUnpublishedChanges } = useEditor();
  const navigate = useNavigate();
  const { workspaces, current, switchTo, create } = useWorkspace();
  const { draft } = state;
  const visibleCount = draft.blocks.filter((b) => !b.visibility.hidden).length;
  const canvas = `/app/canvas/${draft.id}`;
  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');

  const [dialog, setDialog] = useState<'unpublish' | 'duplicate' | null>(null);
  const [copyName, setCopyName] = useState('');

  const rows: SpaceRow[] = useMemo(
    () =>
    workspaces.map((w) => {
      if (w.id === current.id) {
        const status: SpaceStatus = !state.published ? 'draft' : hasUnpublishedChanges ? 'changes' : 'live';
        return { id: w.id, workspace: w, doc: draft, status, current: true };
      }
      const page = readPersistedPage(w.id);
      const status: SpaceStatus = !page?.published ? 'draft' : docSignature(page.draft) !== docSignature(page.published) ? 'changes' : 'live';
      return { id: w.id, workspace: w, doc: page?.draft ?? null, status, current: false };
    }),
    [workspaces, current.id, draft, state.published, hasUnpublishedChanges]
  );

  const openRow = (r: SpaceRow) => {
    if (r.current) return navigate(canvas);
    switchTo(r.workspace.id);
    toast(`Switched to ${r.workspace.name}`);
  };

  const unpublish = () => {
    if (actions.unpublish()) {
      toast('Page unpublished', { description: `${publicUrl(draft.handle)} now shows “not available”. Your draft and versions are kept.` });
      setDialog(null);
    } else {
      toast.error('Couldn’t unpublish', { description: 'Your browser storage is unavailable. Try again.' });
    }
  };

  const duplicate = () => {
    const name = copyName.trim() || `${current.name} (copy)`;
    const handle = suggestHandles(`${draft.handle}copy`, takenHandles(workspaces))[0] ?? `${draft.handle.slice(0, 24)}-copy2`;
    const doc = cloneDocument(draft, { handle, title: `${draft.title} (copy)` });
    const ws = create({ name, ownerName: current.ownerName, doc, publish: false });
    setDialog(null);
    toast(`Created ${ws.name}`, { description: `A draft copy at ${publicUrl(handle)}. You’re now in the copy.` });
  };

  const actionsMenu =
  <Menu
    align="end"
    items={[
    { id: 'open', label: 'Open canvas', icon: PenToolIcon, onSelect: () => navigate(canvas) },
    { id: 'live', label: 'View live page', icon: ExternalLinkIcon, disabled: !state.published, reason: 'Publish first.', onSelect: () => navigate(`/p/${state.published?.handle ?? draft.handle}`) },
    {
      id: 'dup',
      label: 'Duplicate as new workspace',
      icon: CopyIcon,
      onSelect: () => {
        setCopyName(`${current.name} (copy)`);
        setDialog('duplicate');
      }
    },
    { id: 'unpub', label: 'Unpublish', icon: EyeOffIcon, disabled: !state.published, reason: 'Not published.', destructive: true, onSelect: () => setDialog('unpublish') },
    { id: 'retire', label: 'Retire with redirect', icon: ArchiveIcon, disabled: true, reason: 'Arrives with redirects in Batch 5.' }]
    }
    trigger={(props) => <IconButton {...props} icon={MoreHorizontalIcon} label={`More actions for ${draft.title}`} />} />;



  const health = errors.length ?
  { icon: XCircleIcon, tone: 'text-danger', title: `${errors.length} issue${errors.length === 1 ? '' : 's'} block publishing`, items: errors } :
  warnings.length ?
  { icon: AlertTriangleIcon, tone: 'text-warning', title: `${warnings.length} thing${warnings.length === 1 ? '' : 's'} worth a look`, items: warnings } :
  { icon: CheckCircle2Icon, tone: 'text-success', title: 'Ready to publish', items: [] };

  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 py-8 md:px-10 md:py-12">
      <PageHeader
        context={current.name}
        title="My Spaces"
        description="Your pages on KUBICU. Each space has its own link, theme and publishing history."
        actions={
        <Button leadingIcon={PlusIcon} onClick={() => navigate('/start')}>
            New space
          </Button>
        } />
      

      <article aria-labelledby="space-title" className="mt-8 overflow-hidden rounded-lg border border-line bg-raised shadow-1">
        <div className="grid md:grid-cols-[300px_minmax(0,1fr)] lg:grid-cols-[360px_minmax(0,1fr)]">
          <button
            type="button"
            onClick={() => navigate(canvas)}
            aria-label={`Open ${draft.title} in the canvas`}
            className="dot-stage group flex h-[300px] items-end justify-center overflow-hidden pt-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus md:h-auto md:min-h-[360px]">
            
            <span className="block translate-y-6 transition-transform duration-200 ease-out group-hover:translate-y-3">
              <PageMiniPreview doc={draft} scale={0.56} height={330} />
            </span>
          </button>

          <div className="flex min-w-0 flex-col border-t border-line p-6 md:border-l md:border-t-0 md:p-8">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-caption font-semibold text-action">You’re here</p>
                <h2 id="space-title" className="mt-1 truncate text-[1.5rem] font-semibold leading-tight tracking-[-0.02em] text-fg">
                  {draft.title}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <PageStatusBadge />
                  <span className="text-caption text-fg-subtle">Main page · {current.name}</span>
                </div>
              </div>
              {actionsMenu}
            </div>
            <CopyLinkButton handle={draft.handle} className="mt-4 self-start" />

            <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-line pt-5 sm:grid-cols-4">
              <div>
                <dt className="text-caption text-fg-subtle">Blocks</dt>
                <dd className="mt-1 text-label font-semibold tabular-nums text-fg">
                  {visibleCount}
                  {visibleCount !== draft.blocks.length && <span className="font-normal text-fg-subtle"> · {draft.blocks.length - visibleCount} hidden</span>}
                </dd>
              </div>
              <div>
                <dt className="text-caption text-fg-subtle">Versions</dt>
                <dd className="mt-1 text-label font-semibold tabular-nums text-fg">{state.versions.length}</dd>
              </div>
              <div>
                <dt className="text-caption text-fg-subtle">Published</dt>
                <dd className="mt-1 text-label font-semibold text-fg">{state.publishedAt ? formatRelative(state.publishedAt) : 'Not yet'}</dd>
              </div>
              <div>
                <dt className="text-caption text-fg-subtle">Last edited</dt>
                <dd className="mt-1 text-label font-semibold text-fg">{formatRelative(draft.updatedAt)}</dd>
              </div>
            </dl>

            <section aria-labelledby="health-heading" className="mt-5 rounded-md bg-sunken px-4 py-3">
              <h3 id="health-heading" className="flex items-center gap-2 text-label font-semibold text-fg">
                <health.icon size={16} strokeWidth={2.25} className={health.tone} aria-hidden />
                {health.title}
              </h3>
              {health.items.length > 0 &&
              <ul className="mt-1.5 flex flex-col gap-0.5 pl-6">
                  {health.items.slice(0, 3).map((i) =>
                <li key={i.id} className="truncate text-caption text-fg-muted">
                      {i.message}
                    </li>
                )}
                  {health.items.length > 3 && <li className="text-caption text-fg-subtle">and {health.items.length - 3} more in the canvas</li>}
                </ul>
              }
            </section>

            <div className="mt-auto flex flex-wrap gap-2 pt-6">
              <Button leadingIcon={PenToolIcon} onClick={() => navigate(canvas)}>
                {errors.length ? 'Fix in canvas' : 'Open canvas'}
              </Button>
              <Button variant="secondary" trailingIcon={ExternalLinkIcon} disabled={!state.published} onClick={() => navigate(`/p/${state.published?.handle ?? draft.handle}`)}>
                View live
              </Button>
            </div>
          </div>
        </div>
      </article>

      <SpacesList rows={rows} onOpen={openRow} />

      <p className="mt-10 border-t border-line pt-5 text-caption text-fg-subtle">
        <span className="font-semibold text-fg-muted">Coming next:</span> {comingNext.join(' · ')}.
      </p>

      <Dialog
        open={dialog === 'unpublish'}
        onClose={() => setDialog(null)}
        size="sm"
        title="Unpublish this page?"
        description={`Visitors to ${publicUrl(draft.handle)} will see “This page isn’t available”. Links you’ve shared stop working until you publish again.`}
        footer={
        <>
            <Button variant="secondary" onClick={() => setDialog(null)} data-autofocus>
              Keep it live
            </Button>
            <Button variant="destructive" onClick={unpublish}>
              Unpublish
            </Button>
          </>
        }>
        
        <ul className="flex flex-col gap-1.5 text-label text-fg-muted">
          <li>Your draft, theme and all {state.versions.length} versions are kept.</li>
          <li>Your link stays reserved for you.</li>
          {state.scheduled && <li className="font-medium text-fg">Your scheduled publish is cancelled.</li>}
        </ul>
      </Dialog>

      <Dialog
        open={dialog === 'duplicate'}
        onClose={() => setDialog(null)}
        size="sm"
        title="Duplicate as a new workspace"
        description="Copies this page’s blocks and theme into a new workspace as a draft with its own link. Commerce, bookings and contacts aren’t copied."
        footer={
        <>
            <Button variant="secondary" onClick={() => setDialog(null)}>
              Cancel
            </Button>
            <Button onClick={duplicate}>Create copy</Button>
          </>
        }>
        
        <TextInput id="dup-name" label="New workspace name" value={copyName} onChange={(e) => setCopyName(e.target.value)} />
        <p className={cn('mt-3 text-caption text-fg-subtle')}>Free plan to start. You’ll switch into the copy straight away.</p>
      </Dialog>
    </div>);

}