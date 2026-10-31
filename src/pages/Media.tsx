import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ImagesIcon, Loader2Icon, PencilIcon, SearchIcon, Trash2Icon, UploadIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { useMedia } from '../contexts/MediaContext';
import { useEditor } from '../contexts/EditorContext';
import { useCommerce } from '../contexts/CommerceContext';
import { useLibrary } from '../contexts/LibraryContext';
import { usePlan } from '../contexts/PlanContext';
import { useCan } from '../contexts/TeamContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useProviders } from '../hooks/useProviders';
import { ACCEPTED_IMAGE_TYPES } from '../utils/image';
import { formatBytes, mediaRef } from '../utils/media/refs';
import { findUses, isInUse } from '../utils/media/usage';
import { PageHeader } from '../components/shell/PageHeader';
import { Button } from '../components/ui/Button';
import { Dialog } from '../components/ui/Dialog';
import { Segmented } from '../components/ui/Segmented';
import { InlineAlert } from '../components/ui/InlineAlert';
import { UpgradeButton } from '../components/ui/UpgradeButton';
import { fieldControlClass } from '../components/ui/Field';
import { MediaImage } from '../components/media/MediaImage';
import { MediaDetail } from '../components/media/MediaDetail';
import { MediaFolderIcon } from '../components/media/MediaFolderIcon';
import { MediaFolderDialog } from '../components/media/MediaFolderDialog';
import { ALL_MEDIA, MediaFolderRail, UNFILED_MEDIA } from '../components/media/MediaFolderRail';
import { cn } from '../utils/cn';

type Filter = 'all' | 'used' | 'unused';

export function Media() {
  const media = useMedia();
  const plan = usePlan();
  const workspaceId = useWorkspace().current.id;
  const storage = useProviders().active('storage');
  const { state } = useEditor();
  const products = useCommerce().data.products;
  const { sections } = useLibrary();
  const fileRef = useRef<HTMLInputElement>(null);
  const mediaAllowed = useCan('media.manage');
  const [folderView, setFolderView] = useState<string>(ALL_MEDIA);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [uploading, setUploading] = useState<{done: number;total: number;} | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [folderDialog, setFolderDialog] = useState<'create' | 'rename' | null>(null);
  const [confirmFolderDelete, setConfirmFolderDelete] = useState(false);

  const usage = useMemo(() => {
    const src = { draft: state.site, published: state.published, versions: state.versions, products, sections };
    return new Map(media.assets.map((a) => [a.id, findUses(a.id, src)]));
  }, [media.assets, state.site, state.published, state.versions, products, sections]);

  // One-time tidy-up: images already used as product photos (uploaded before folders existed) go to Product images.
  useEffect(() => {
    if (!mediaAllowed.allowed) return;
    const key = `kubicu.mediaFoldersFiled.${workspaceId}`;
    if (localStorage.getItem(key)) return;
    const loose = media.assets.filter((a) => !media.folderOf(a) && (usage.get(a.id) ?? []).some((u) => u.kind === 'product')).map((a) => a.id);
    localStorage.setItem(key, '1');
    if (loose.length) void media.moveTo(loose, 'products');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  const folder = media.folders.find((f) => f.id === folderView);
  useEffect(() => {
    if (folderView !== ALL_MEDIA && folderView !== UNFILED_MEDIA && !folder) setFolderView(ALL_MEDIA);
  }, [folderView, folder]);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const a of media.assets) {
      const f = media.folderOf(a)?.id;
      if (f) m.set(f, (m.get(f) ?? 0) + 1);
    }
    return m;
  }, [media]);
  const unfiledCount = media.assets.filter((a) => !media.folderOf(a)).length;

  const inView = media.assets.filter((a) => {
    const f = media.folderOf(a)?.id;
    if (folderView === UNFILED_MEDIA) return !f;
    if (folderView !== ALL_MEDIA) return f === folderView;
    return true;
  });
  const visible = inView.filter((a) => {
    const used = isInUse(usage.get(a.id) ?? []);
    if (filter === 'used' && !used) return false;
    if (filter === 'unused' && used) return false;
    const q = query.trim().toLowerCase();
    return !q || `${a.name} ${a.alt}`.toLowerCase().includes(q);
  });
  const unusedCount = inView.filter((a) => !isInUse(usage.get(a.id) ?? [])).length;
  const allUnused = media.assets.filter((a) => !isInUse(usage.get(a.id) ?? [])).length;
  const pct = Math.min(100, media.usedBytes / media.quotaBytes * 100);
  const nextStoragePlan = plan.id === 'free' ? 'creator' : plan.id === 'creator' ? 'pro' : plan.id === 'pro' ? 'business' : null;
  const full = media.usedBytes >= media.quotaBytes;
  const uploadTarget = folder?.id;

  const uploadMany = async (files: FileList | File[] | null) => {
    const list = Array.from(files ?? []);
    if (list.length === 0) return;
    if (!mediaAllowed.allowed) {
      toast.error('You can’t upload here', { description: mediaAllowed.reason });
      return;
    }
    setUploading({ done: 0, total: list.length });
    let added = 0;
    let dupes = 0;
    const problems: string[] = [];
    for (const [i, file] of list.entries()) {
      try {
        const r = await media.addFile(file, uploadTarget);
        if (r.duplicate) dupes += 1;else
        added += 1;
      } catch (e) {
        problems.push(`${file.name}: ${e instanceof Error ? e.message : 'failed'}`);
      }
      setUploading({ done: i + 1, total: list.length });
    }
    setUploading(null);
    if (fileRef.current) fileRef.current.value = '';
    const parts = [added && `${added} added${folder ? ` to ${folder.name}` : ''}`, dupes && `${dupes} already in your library`].filter(Boolean).join(' · ');
    if (problems.length) toast.error(`${problems.length} couldn’t be added`, { description: problems.slice(0, 3).join('\n') });
    if (parts) toast(parts);
  };

  const deleteFolder = async () => {
    if (!folder) return;
    const name = folder.name;
    const moved = await media.deleteFolder(folder.id);
    setConfirmFolderDelete(false);
    setFolderView(ALL_MEDIA);
    toast(`Deleted the folder “${name}”`, { description: moved ? `${moved} image${moved === 1 ? '' : 's'} moved to Not in a folder.` : undefined });
  };

  const openAsset = media.assets.find((a) => a.id === openId) ?? null;
  const viewTitle = folder ? folder.name : folderView === UNFILED_MEDIA ? 'Not in a folder' : 'All images';
  const viewDescription = folder ?
  folder.description ?? 'Your own folder.' :
  folderView === UNFILED_MEDIA ?
  'Images you uploaded without choosing a folder.' :
  'Everything in your library, whatever folder it’s in.';

  return (
    <div
      className="mx-auto w-full max-w-[1200px] px-5 py-8 md:px-10 md:py-12"
      onDragOver={(e) => {
        if (!media.available) return;
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setDragOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        if (media.available) void uploadMany(e.dataTransfer.files);
      }}>
      
      <PageHeader
        title="Media"
        description="Every photo you upload, in one place. Brand and product uploads are filed for you; reuse anything anywhere."
        actions={
        <Button leadingIcon={UploadIcon} disabled={!media.available || full || !!uploading || !mediaAllowed.allowed} title={mediaAllowed.allowed ? undefined : mediaAllowed.reason} onClick={() => fileRef.current?.click()}>
            {folder ? `Upload to ${folder.name}` : 'Upload'}
          </Button>
        } />
      
      <input ref={fileRef} type="file" multiple accept={ACCEPTED_IMAGE_TYPES.join(',')} className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => uploadMany(e.target.files)} />

      {!media.available ?
      <InlineAlert tone="warning" title="Media storage isn’t available in this browser" className="mt-8">
          Photos you upload are saved inside each page or product instead, so they can’t be reused here. Private browsing often blocks this storage.
        </InlineAlert> :

      <>
          <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-sunken" role="meter" aria-label="Media storage used" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)}>
              <div className={cn('h-full rounded-full', pct > 90 ? 'bg-danger' : pct > 70 ? 'bg-warning' : 'bg-action')} style={{ width: `${Math.max(pct, media.usedBytes ? 2 : 0)}%` }} />
            </div>
            <p className="flex items-center gap-2 text-caption text-fg-muted">
              <span>
                <span className="font-semibold tabular-nums text-fg">{formatBytes(media.usedBytes)}</span> of {formatBytes(media.quotaBytes)} on {plan.name}
              </span>
              <span aria-hidden>·</span>
              <span>
                Stored in{' '}
                <Link to="/app/settings/integrations" className="font-medium text-fg underline-offset-2 hover:underline">
                  {!storage || storage.builtIn ? 'this browser' : `${storage.name} (simulated — files stay in this browser)`}
                </Link>
              </span>
            </p>
          </div>
          {full &&
        <InlineAlert tone="danger" title="Storage full" className="mt-4" action={nextStoragePlan ? <UpgradeButton plan={nextStoragePlan} feature="More media storage" /> : undefined}>
              New uploads are paused. {allUnused > 0 ? `${allUnused} image${allUnused === 1 ? ' isn’t' : 's aren’t'} used anywhere — delete them to make room.` : 'Delete images you no longer need, or upgrade your plan.'}
            </InlineAlert>
        }

          <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:gap-10">
            <MediaFolderRail
            folders={media.folders}
            counts={counts}
            total={media.assets.length}
            unfiled={unfiledCount}
            value={folderView}
            onChange={(id) => {
              setFolderView(id);
              setFilter('all');
            }}
            onNewFolder={() => setFolderDialog('create')}
            canManage={mediaAllowed.allowed} />
          

            <section aria-labelledby="media-view-title" className="min-w-0 flex-1">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  {folder && <MediaFolderIcon folder={folder} open className="mt-0.5" />}
                  <div className="min-w-0">
                    <h2 id="media-view-title" className="flex items-center gap-2 text-heading font-semibold text-fg">
                      {viewTitle}
                      {folder?.system && <span className="rounded-sm bg-sunken px-1.5 py-0.5 text-caption font-medium text-fg-muted">Default</span>}
                    </h2>
                    <p className="mt-0.5 max-w-xl text-label text-fg-muted">{viewDescription}</p>
                  </div>
                </div>
                {folder && !folder.system && mediaAllowed.allowed &&
              <div className="flex shrink-0 gap-1">
                    <Button size="sm" variant="tertiary" leadingIcon={PencilIcon} onClick={() => setFolderDialog('rename')}>
                      Rename
                    </Button>
                    <Button size="sm" variant="tertiary" leadingIcon={Trash2Icon} className="text-danger hover:text-danger" onClick={() => setConfirmFolderDelete(true)}>
                      Delete folder
                    </Button>
                  </div>
              }
              </div>

              {inView.length === 0 ?
            <button
              type="button"
              disabled={!mediaAllowed.allowed}
              onClick={() => fileRef.current?.click()}
              className={cn(
                'disabled:cursor-not-allowed disabled:opacity-60',
                'mt-6 flex w-full flex-col items-center gap-3 rounded-lg border-2 border-dashed px-6 py-16 text-center transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                dragOver ? 'border-action bg-action-soft' : 'border-line-strong hover:bg-sunken'
              )}>
              
                  <ImagesIcon size={26} className="text-fg-subtle" aria-hidden />
                  <span className="text-heading font-semibold text-fg">{media.assets.length === 0 ? 'Your library is empty' : folder ? `${folder.name} is empty` : 'Nothing here yet'}</span>
                  <span className="max-w-sm text-label text-fg-muted">
                    {folder?.id === 'brand' ?
                'Logos and profile photos you upload anywhere in KUBICU land here. You can also drop brand images straight in.' :
                folder?.id === 'products' ?
                'Photos you add to products in Commerce or product blocks land here. You can also drop product photos straight in.' :
                folder ?
                'Drop images here, or move images in from their details panel.' :
                'Drop photos here or choose several from your device. Images you upload from the canvas or Commerce land here too.'}
                  </span>
                  <span className="mt-1 inline-flex h-10 items-center gap-2 rounded-md bg-action px-4 text-label font-medium text-action-fg">
                    <UploadIcon size={16} aria-hidden /> Choose photos
                  </span>
                </button> :

            <>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Segmented<Filter>
                  ariaLabel="Show"
                  value={filter}
                  onChange={setFilter}
                  options={[
                  { value: 'all', label: `All · ${inView.length}` },
                  { value: 'used', label: 'In use' },
                  { value: 'unused', label: `Not used · ${unusedCount}` }]
                  } />
                
                    <div className="relative w-full sm:w-64">
                      <SearchIcon size={15} aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle" />
                      <label htmlFor="media-search" className="sr-only">
                        Search media
                      </label>
                      <input id="media-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name or description" className={cn(fieldControlClass, 'h-9 pl-9 text-label')} />
                    </div>
                  </div>

                  {uploading &&
              <p role="status" className="mt-4 flex items-center gap-2 text-label text-fg-muted">
                      <Loader2Icon size={15} className="animate-spin" aria-hidden /> Uploading {uploading.done} of {uploading.total}…
                    </p>
              }

                  <div className={cn('relative mt-5 rounded-lg transition-colors duration-150', dragOver && 'outline-dashed outline-2 outline-offset-4 outline-action')}>
                    {visible.length === 0 ?
                <p className="py-16 text-center text-label text-fg-muted">{filter === 'unused' ? 'Every image here is in use.' : 'Nothing matches.'}</p> :

                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                        {visible.map((a) => {
                    const uses = usage.get(a.id) ?? [];
                    const count = uses.filter((u) => u.kind !== 'history').length;
                    const f = folderView === ALL_MEDIA ? media.folderOf(a) : undefined;
                    return (
                      <li key={a.id}>
                              <button type="button" onClick={() => setOpenId(a.id)} className="group block w-full overflow-hidden rounded-md border border-line bg-raised text-left transition-colors duration-150 hover:border-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                                <span className="block overflow-hidden bg-sunken">
                                  <MediaImage src={mediaRef(a.id)} alt={a.alt} loading="lazy" className="aspect-square w-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.03]" />
                                </span>
                                <span className="block px-2.5 py-2">
                                  <span className="block truncate text-label font-medium text-fg">{a.name}</span>
                                  <span className={cn('block truncate text-caption', count ? 'text-fg-muted' : 'text-fg-subtle')}>
                                    {f ? `${f.name} · ` : ''}
                                    {count ? `Used in ${count}` : 'Not used'}
                                    {!a.alt.trim() && ' · no description'}
                                  </span>
                                </span>
                              </button>
                            </li>);

                  })}
                      </ul>
                }
                  </div>
                  <p className="mt-6 text-caption text-fg-subtle">Drop photos anywhere on this page to upload{folder ? ` to ${folder.name}` : ''}. Stored in this browser for the prototype.</p>
                </>
            }
            </section>
          </div>
        </>
      }

      <MediaDetail asset={openAsset} uses={openAsset ? usage.get(openAsset.id) ?? [] : []} onClose={() => setOpenId(null)} />

      <MediaFolderDialog
        open={!!folderDialog}
        mode={folderDialog ?? 'create'}
        initialName={folderDialog === 'rename' ? folder?.name : ''}
        onClose={() => setFolderDialog(null)}
        onSubmit={(name) => {
          if (folderDialog === 'rename' && folder) {
            media.renameFolder(folder.id, name);
            toast('Folder renamed');
          } else {
            const created = media.createFolder(name);
            setFolderView(created.id);
            toast(`Created “${created.name}”`);
          }
          setFolderDialog(null);
        }} />
      

      <Dialog
        open={confirmFolderDelete}
        onClose={() => setConfirmFolderDelete(false)}
        size="sm"
        title={`Delete “${folder?.name ?? ''}”?`}
        description={`The folder goes, but no images are deleted. ${folder && counts.get(folder.id) ? `Its ${counts.get(folder.id)} image${counts.get(folder.id) === 1 ? '' : 's'} move to Not in a folder.` : 'It’s empty.'}`}
        footer={
        <>
            <Button variant="secondary" onClick={() => setConfirmFolderDelete(false)} data-autofocus>
              Keep it
            </Button>
            <Button variant="destructive" onClick={() => void deleteFolder()}>
              Delete folder
            </Button>
          </>
        }>
        
        {null}
      </Dialog>
    </div>);

}