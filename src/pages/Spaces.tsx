import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  AlertTriangleIcon,
  ArchiveIcon,
  ArchiveRestoreIcon,
  CheckCircle2Icon,
  CopyIcon,
  ExternalLinkIcon,
  EyeOffIcon,
  MoreHorizontalIcon,
  PenToolIcon,
  PlusIcon,
  UsersIcon,
  XCircleIcon } from
'lucide-react';
import { useEditor } from '../contexts/EditorContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useCan, useTeam } from '../contexts/TeamContext';
import { SpaceAccessDialog } from '../components/spaces/SpaceAccessDialog';
import type { Space } from '../types/workspace';
import { PageHeader } from '../components/shell/PageHeader';
import { PageStatusBadge } from '../components/canvas/PageStatusBadge';
import { PageMiniPreview } from '../components/overview/PageMiniPreview';
import { CopyLinkButton } from '../components/overview/CopyLinkButton';
import { SpacesList, type SpaceRow } from '../components/spaces/SpacesList';
import { NewSpaceDialog } from '../components/spaces/NewSpaceDialog';
import { spaceKinds } from '../data/spaceKinds';
import { extraSpaceLimits, MAIN_SPACE_ID, readSpacePage, spaceStatus, workspaceSpaces } from '../utils/spaces';
import { Button } from '../components/ui/Button';
import { IconButton } from '../components/ui/IconButton';
import { Menu } from '../components/ui/Menu';
import { Dialog } from '../components/ui/Dialog';
import { TextInput } from '../components/ui/TextInput';
import { docSignature, cloneDocument } from '../utils/blocks';
import { suggestHandles, takenHandles } from '../utils/handles';
import { formatRelative, publicUrl } from '../utils/format';
import { cn } from '../utils/cn';

export function Spaces() {
  const { state, actions, issues, hasUnpublishedChanges } = useEditor();
  const navigate = useNavigate();
  const { workspaces, current, switchTo, switchSpace, create, setSpaceArchived } = useWorkspace();
  const [newSpace, setNewSpace] = useState<{kind: 'campaign' | 'dealroom' | null;} | null>(null);
  const [archiving, setArchiving] = useState<SpaceRow | null>(null);
  const spacesAllowed = useCan('spaces.manage');
  const teamAllowed = useCan('team.manage');
  const team = useTeam();
  const [accessFor, setAccessFor] = useState<Space | null>(null);
  const extras = current.spaces ?? [];
  const { draft } = state;
  const visibleCount = draft.blocks.filter((b) => !b.visibility.hidden).length;
  const canvas = `/app/canvas/${draft.id}`;
  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');

  const [dialog, setDialog] = useState<'unpublish' | 'duplicate' | null>(null);
  const [copyName, setCopyName] = useState('');

  // Workspace screens always hold the main space in the editor; other spaces are read from storage.
  const rows: SpaceRow[] = useMemo(
    () =>
    workspaces.flatMap((w) =>
    workspaceSpaces(w).map((s) => {
      const inCurrentWorkspace = w.id === current.id;
      if (inCurrentWorkspace && s.id === MAIN_SPACE_ID) {
        return { id: `${w.id}:${s.id}`, workspace: w, space: s, doc: draft, status: spaceStatus(s, state, hasUnpublishedChanges), inCurrentWorkspace };
      }
      const page = readSpacePage(w.id, s.id);
      const changed = !!page?.published && docSignature(page.draft) !== docSignature(page.published);
      return { id: `${w.id}:${s.id}`, workspace: w, space: s, doc: page?.draft ?? null, status: spaceStatus(s, page, changed), inCurrentWorkspace };
    })
    ),
    [workspaces, current.id, draft, state, hasUnpublishedChanges]
  );

  // Spaces you can't edit in this workspace aren't listed for you (D57).
  const visibleRows = rows.filter((r) => !r.inCurrentWorkspace || team.canAccessSpace(r.space.id));
  const hiddenCount = rows.length - visibleRows.length;

  const openRow = (r: SpaceRow) => {
    if (r.inCurrentWorkspace) {
      if (r.space.id === MAIN_SPACE_ID) return navigate(canvas);
      if (r.status === 'ended') return;
      switchSpace(r.space.id);
      return navigate('/app/canvas');
    }
    switchTo(r.workspace.id, r.space.id);
    if (r.space.id !== MAIN_SPACE_ID) navigate('/app/canvas');
    toast(`Switched to ${r.workspace.name}`);
  };

  const accessItem = (r: SpaceRow) => ({
    id: 'access',
    label: 'Who can edit',
    icon: UsersIcon,
    disabled: !teamAllowed.allowed,
    reason: teamAllowed.reason,
    onSelect: () => setAccessFor(r.space)
  });

  const rowMenu = (r: SpaceRow) =>
  r.inCurrentWorkspace && r.space.kind === 'main' ?
  <Menu align="end" items={[accessItem(r)]} trigger={(props) => <IconButton {...props} size="sm" icon={MoreHorizontalIcon} label={`More actions for ${r.space.name}`} />} /> :
  r.inCurrentWorkspace ?
  <Menu
    align="end"
    items={[
    accessItem(r),
    {
      id: 'live',
      label: 'View live',
      icon: ExternalLinkIcon,
      disabled: !(r.status === 'live' || r.status === 'changes') || !r.doc,
      reason: r.status === 'ended' ? 'Archived — its link forwards to your main page.' : 'Publish first.',
      onSelect: () => r.doc && navigate(`/p/${r.doc.handle}`)
    },
    r.status === 'ended' ?
    { id: 'restore', label: 'Restore', icon: ArchiveRestoreIcon, onSelect: () => restore(r) } :
    { id: 'archive', label: 'Archive', icon: ArchiveIcon, destructive: true, disabled: !spacesAllowed.allowed, reason: spacesAllowed.reason, onSelect: () => setArchiving(r) }]
    }
    trigger={(props) => <IconButton {...props} size="sm" icon={MoreHorizontalIcon} label={`More actions for ${r.space.name}`} />} /> :

  null;

  const archive = () => {
    if (!archiving) return;
    setSpaceArchived(archiving.space.id, true);
    toast(`${archiving.space.name} archived`, { description: 'Its link now forwards to your main page. Orders and contacts are kept.' });
    setArchiving(null);
  };

  const restore = (r: SpaceRow) => {
    setSpaceArchived(r.space.id, false);
    const over = extras.filter((s) => !s.archivedAt).length >= extraSpaceLimits[current.plan];
    toast(`${r.space.name} restored`, { description: over ? 'It’s over your plan’s space limit, so it can be edited but not published.' : 'Publish it again when you’re ready.' });
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
        description="Your main page plus campaigns and DealRooms. Each has its own link, look and publishing; all share this workspace’s products, orders and contacts."
        actions={
        <Button leadingIcon={PlusIcon} disabled={!spacesAllowed.allowed} title={spacesAllowed.allowed ? undefined : spacesAllowed.reason} onClick={() => setNewSpace({ kind: null })}>
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

      {extras.length === 0 &&
      <section aria-labelledby="more-spaces-heading" className="mt-8 grid gap-5 border-y border-line py-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div>
            <h2 id="more-spaces-heading" className="text-label font-semibold text-fg">
              Run a sale or a group buy on its own link
            </h2>
            <p className="mt-1 max-w-xl text-label text-fg-muted">Campaigns and DealRooms sell from the same products and stock as your main page, so orders and contacts all land in one place.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['campaign', 'dealroom'] as const).map((k) => {
            const K = spaceKinds[k];
            return (
              <Button key={k} variant="secondary" leadingIcon={K.icon} onClick={() => setNewSpace({ kind: k })}>
                  {k === 'dealroom' ? 'New DealRoom' : 'New campaign'}
                </Button>);

          })}
          </div>
        </section>
      }

      <SpacesList rows={visibleRows} onOpen={openRow} menuFor={rowMenu} />
      {hiddenCount > 0 &&
      <p className="mt-3 text-caption text-fg-subtle">
          {hiddenCount} space{hiddenCount === 1 ? ' is' : 's are'} limited to other people on the team. Ask an Admin if you need access.
        </p>
      }
      <SpaceAccessDialog space={accessFor} onClose={() => setAccessFor(null)} />

      <NewSpaceDialog open={!!newSpace} onClose={() => setNewSpace(null)} mainDoc={draft} initialKind={newSpace?.kind ?? null} />

      <Dialog
        open={!!archiving}
        onClose={() => setArchiving(null)}
        size="sm"
        title={`Archive ${archiving?.space.name ?? 'this space'}?`}
        description={archiving?.doc ? `${publicUrl(archiving.doc.handle)} will forward visitors to your main page.` : undefined}
        footer={
        <>
            <Button variant="secondary" onClick={() => setArchiving(null)} data-autofocus>
              Keep it
            </Button>
            <Button variant="destructive" onClick={archive}>
              Archive
            </Button>
          </>
        }>
        
        <ul className="flex flex-col gap-1.5 text-label text-fg-muted">
          <li>Its orders, contacts and discount history are kept.</li>
          <li>Its draft and versions are kept — you can restore it later.</li>
          <li>It no longer counts towards your plan’s space limit.</li>
        </ul>
      </Dialog>


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