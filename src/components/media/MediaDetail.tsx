import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRightIcon, HistoryIcon, Loader2Icon, RefreshCwIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import type { MediaAsset, MediaUse } from '../../types/media';
import { useMedia } from '../../contexts/MediaContext';
import { useEditor } from '../../contexts/EditorContext';
import { useCommerce } from '../../contexts/CommerceContext';
import { useLibrary } from '../../contexts/LibraryContext';
import { ACCEPTED_IMAGE_TYPES, processUpload } from '../../utils/image';
import { containsString, formatBytes, mapStrings, mediaRef, shapeOf } from '../../utils/media/refs';
import { isInUse, needsKeeping } from '../../utils/media/usage';
import { formatTimestamp } from '../../utils/format';
import { Sheet } from '../ui/Sheet';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { TextInput } from '../ui/TextInput';
import { TextArea } from '../ui/TextArea';
import { MediaImage } from './MediaImage';

interface MediaDetailProps {
  asset: MediaAsset | null;
  uses: MediaUse[];
  onClose: () => void;
}

const shapeText = { square: 'Square', portrait: 'Portrait', wide: 'Wide' };

/** One library image: describe it, see where it's used, replace it everywhere, or delete it safely. */
export function MediaDetail({ asset, uses, onClose }: MediaDetailProps) {
  const media = useMedia();
  const { state, actions } = useEditor();
  const commerce = useCommerce();
  const { sections } = useLibrary();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [alt, setAlt] = useState('');
  const [replacement, setReplacement] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setName(asset?.name ?? '');
    setAlt(asset?.alt ?? '');
    setReplacement(null);
    setConfirmDelete(false);
  }, [asset?.id, asset?.name, asset?.alt]);

  if (!asset) return <Sheet open={false} onClose={onClose} title="" side="right">{null}</Sheet>;

  const ref = mediaRef(asset.id);
  const inUse = isInUse(uses);
  const placeCount = uses.filter((u) => u.kind !== 'history').length;

  const pickReplacement = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      setReplacement(await processUpload(file));
    } catch (e) {
      toast.error('Can’t use that file', { description: e instanceof Error ? e.message : undefined });
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const confirmReplace = async () => {
    if (!replacement) return;
    setBusy(true);
    try {
      await media.replaceWithDataUrl(asset.id, replacement);
      toast('Image replaced', { description: inUse ? `Updated in ${placeCount} place${placeCount === 1 ? '' : 's'}.` : undefined });
      setReplacement(null);
    } catch (e) {
      toast.error('Couldn’t replace', { description: e instanceof Error ? e.message : undefined });
    } finally {
      setBusy(false);
    }
  };

  const doDelete = async () => {
    setBusy(true);
    try {
      if (containsString(state.site, ref)) actions.transformDocument((doc) => mapStrings(doc, (s) => s === ref ? '' : s));
      if (commerce.data.products.some((p) => containsString(p.images, ref))) {
        // Removing a deleted image from products is part of the media action, allowed by media.manage.
        commerce.applySystem((d) => ({ ...d, products: d.products.map((p) => containsString(p.images, ref) ? { ...p, images: p.images.filter((i) => i.url !== ref) } : p) }));
      }
      const keep = needsKeeping(asset.id, state) || sections.some((s) => containsString(s.blocks, ref));
      const removed = await media.remove(asset.id, keep);
      setConfirmDelete(false);
      onClose();
      if (removed && !inUse && !keep) {
        toast(`Deleted “${removed.name}”`, { action: { label: 'Undo', onClick: () => void media.restore(removed) } });
      } else {
        toast(`Deleted “${asset.name}”`, {
          description: inUse ? `Removed from ${placeCount} place${placeCount === 1 ? '' : 's'}${keep ? '. A copy is kept for your live page and version history.' : '.'}` : keep ? 'A copy is kept for version history.' : undefined
        });
      }
    } catch {
      toast.error('Couldn’t delete. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Sheet
        open={!!asset}
        onClose={onClose}
        side="right"
        title={asset.name}
        description={`${shapeText[shapeOf(asset.width, asset.height)]} · ${asset.width}×${asset.height} · ${formatBytes(asset.bytes)}`}
        footer={
        <div className="flex items-center justify-between gap-2">
            <Button variant="tertiary" size="sm" leadingIcon={Trash2Icon} className="text-danger hover:text-danger" onClick={() => inUse ? setConfirmDelete(true) : doDelete()} disabled={busy}>
              Delete
            </Button>
            <Button variant="secondary" leadingIcon={RefreshCwIcon} onClick={() => fileRef.current?.click()} disabled={busy}>
              Replace
            </Button>
          </div>
        }>
        
        <input ref={fileRef} type="file" accept={ACCEPTED_IMAGE_TYPES.join(',')} className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => pickReplacement(e.target.files?.[0])} />
        <div className="flex flex-col gap-6 px-5 py-5">
          <div className="dot-stage flex items-center justify-center rounded-md p-4">
            <MediaImage src={ref} alt={asset.alt} className="max-h-[300px] max-w-full rounded-sm object-contain shadow-1" />
          </div>

          <div className="flex flex-col gap-4">
            <TextInput id="media-name" label="Name" value={name} hint="Only you see this. Helps you find it later." onChange={(e) => setName(e.target.value)} onBlur={() => name.trim() && name !== asset.name && media.update(asset.id, { name: name.trim() })} />
            <TextArea
              id="media-alt"
              label="Default description"
              rows={2}
              value={alt}
              placeholder="What’s in the photo, for screen readers"
              hint="Filled in when you place this image somewhere. Each spot can still change it."
              onChange={(e) => setAlt(e.target.value)}
              onBlur={() => alt !== asset.alt && media.update(asset.id, { alt: alt.trim() })} />
            
          </div>

          <section aria-labelledby="media-uses">
            <h3 id="media-uses" className="text-label font-semibold text-fg">
              Where it’s used
            </h3>
            {uses.length === 0 ?
            <p className="mt-1.5 text-label text-fg-muted">Not used anywhere. Safe to delete.</p> :

            <ul className="mt-2 flex flex-col divide-y divide-line rounded-md border border-line">
                {uses.map((u, i) =>
              <li key={`${u.kind}-${i}`} className="flex items-center gap-3 px-3 py-2.5">
                    {u.kind === 'history' && <HistoryIcon size={15} className="shrink-0 text-fg-subtle" aria-hidden />}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-label font-medium text-fg">{u.label}</span>
                      <span className="block text-caption text-fg-subtle">{u.detail}</span>
                    </span>
                    {u.to &&
                <Link to={u.to} className="inline-flex shrink-0 items-center gap-1 text-caption font-semibold text-action hover:underline">
                        Open <ArrowUpRightIcon size={12} aria-hidden />
                      </Link>
                }
                  </li>
              )}
              </ul>
            }
          </section>

          <p className="text-caption text-fg-subtle">Uploaded {formatTimestamp(asset.createdAt)}{asset.updatedAt !== asset.createdAt ? ` · changed ${formatTimestamp(asset.updatedAt)}` : ''}</p>
        </div>
      </Sheet>

      <Dialog
        open={!!replacement}
        onClose={() => setReplacement(null)}
        title="Replace everywhere?"
        description={inUse ? `The new picture appears in all ${placeCount} place${placeCount === 1 ? '' : 's'} below${uses.some((u) => u.kind === 'live') || state.published ? ', including your live page' : ''}.` : 'This image isn’t used yet, so nothing else changes.'}
        footer={
        <>
            <Button variant="secondary" onClick={() => setReplacement(null)}>
              Cancel
            </Button>
            <Button onClick={confirmReplace} loading={busy}>
              Replace
            </Button>
          </>
        }>
        
        <div className="grid grid-cols-2 gap-3">
          <figure>
            <MediaImage src={ref} alt="" className="aspect-square w-full rounded-md bg-sunken object-cover" />
            <figcaption className="mt-1 text-caption text-fg-subtle">Now</figcaption>
          </figure>
          <figure>
            {replacement ? <img src={replacement} alt="" className="aspect-square w-full rounded-md bg-sunken object-cover" /> : <Loader2Icon className="animate-spin" />}
            <figcaption className="mt-1 text-caption text-fg-subtle">New</figcaption>
          </figure>
        </div>
        {inUse &&
        <ul className="mt-4 flex flex-col gap-1 text-label text-fg-muted">
            {uses.filter((u) => u.kind !== 'history').map((u, i) =>
          <li key={i}>· {u.label} <span className="text-fg-subtle">({u.detail.toLowerCase()})</span></li>
          )}
          </ul>
        }
      </Dialog>

      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        size="sm"
        title={`Delete “${asset.name}”?`}
        description={`It’s used in ${placeCount} place${placeCount === 1 ? '' : 's'}. Deleting removes it from your draft and products, leaving those spots empty.`}
        footer={
        <>
            <Button variant="secondary" onClick={() => setConfirmDelete(false)} data-autofocus>
              Keep it
            </Button>
            <Button variant="destructive" onClick={doDelete} loading={busy}>
              Remove and delete
            </Button>
          </>
        }>
        
        <ul className="flex flex-col gap-1 text-label text-fg-muted">
          {uses.filter((u) => u.kind !== 'history').map((u, i) =>
          <li key={i}>· {u.label}</li>
          )}
        </ul>
        {(uses.some((u) => u.kind === 'live') || state.published) && <p className="mt-3 text-caption text-fg-subtle">Your live page keeps showing it until you next publish. You can undo on the canvas.</p>}
      </Dialog>
    </>);

}