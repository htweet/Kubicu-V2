import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CheckIcon, ImagesIcon, Link2Icon, Loader2Icon, SearchIcon, UploadIcon } from 'lucide-react';
import type { MediaAsset, MediaShape } from '../../types/media';
import { useMedia } from '../../contexts/MediaContext';
import { ACCEPTED_IMAGE_TYPES } from '../../utils/image';
import { isValidUrl } from '../../utils/validation';
import { mediaRef, shapeOf } from '../../utils/media/refs';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Tabs } from '../ui/Tabs';
import { Segmented } from '../ui/Segmented';
import { TextInput } from '../ui/TextInput';
import { fieldControlClass } from '../ui/Field';
import { MediaImage } from './MediaImage';
import { cn } from '../../utils/cn';

type Tab = 'library' | 'upload' | 'link';
type ShapeFilter = 'all' | MediaShape;

export interface PickResult {
  src: string;
  alt: string;
  asset: MediaAsset | null;
  /** Open the crop step after choosing. */
  crop: boolean;
}

interface MediaLibraryDialogProps {
  open: boolean;
  onClose: () => void;
  /** Field shape, e.g. "square", used in copy and the crop button. */
  shapeLabel: string;
  /** Default folder for this field: shown first, and where new uploads are filed. */
  folder?: string;
  onPick: (result: PickResult) => void;
}

const ALL = '__all';
const NONE = '__none';

/** Choose an image for a field: from your uploads, a new upload, or a link. */
export function MediaLibraryDialog({ open, onClose, shapeLabel, folder, onPick }: MediaLibraryDialogProps) {
  const media = useMedia();
  const homeFolder = folder ? media.folders.find((f) => f.id === folder) : undefined;
  const [folderFilter, setFolderFilter] = useState<string>(ALL);
  const fileRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<Tab>('library');
  const [query, setQuery] = useState('');
  const [shape, setShape] = useState<ShapeFilter>('all');
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [link, setLink] = useState('');
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTab(media.assets.length ? 'library' : 'upload');
    setFolderFilter(homeFolder && media.assets.some((a) => a.folderId === homeFolder.id) ? homeFolder.id : ALL);
    setSelected(null);
    setProblem(null);
    setNotice(null);
    setLink('');
    setQuery('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return media.assets.filter((a) => {
      const f = media.folderOf(a)?.id;
      if (folderFilter === NONE ? !!f : folderFilter !== ALL && f !== folderFilter) return false;
      return (shape === 'all' || shapeOf(a.width, a.height) === shape) && (!q || `${a.name} ${a.alt}`.toLowerCase().includes(q));
    });
  }, [media, query, shape, folderFilter]);

  const chosen = media.assets.find((a) => a.id === selected) ?? null;

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setProblem(null);
    setNotice(null);
    try {
      const stored = await media.addFile(file, homeFolder?.id);
      if (!stored.asset) {
        // Library unavailable: use the photo straight away, embedded in the page.
        onPick({ src: stored.src, alt: '', asset: null, crop: true });
        return;
      }
      setSelected(stored.asset.id);
      setNotice(stored.duplicate ? 'Already in your library — selected it for you.' : homeFolder ? `Uploaded to ${homeFolder.name} and selected.` : 'Uploaded and selected.');
      setTab('library');
      setShape('all');
      setQuery('');
      setFolderFilter(ALL);
    } catch (e) {
      setProblem(e instanceof Error ? e.message : 'Upload failed. Try again.');
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const pick = (crop: boolean) => chosen && onPick({ src: mediaRef(chosen.id), alt: chosen.alt, asset: chosen, crop });

  const footer =
    tab === 'library' ? (
      <>
        <Button variant="secondary" disabled={!chosen} onClick={() => pick(true)}>
          Crop to {shapeLabel}
        </Button>
        <Button disabled={!chosen} onClick={() => pick(false)}>
          Use image
        </Button>
      </>
    ) : tab === 'link' ? (
      <Button disabled={!isValidUrl(link)} onClick={() => onPick({ src: link.trim(), alt: '', asset: null, crop: false })}>
        Use link
      </Button>
    ) : (
      <Button variant="secondary" onClick={onClose}>
        Cancel
      </Button>
    );

  return (
    <Dialog open={open} onClose={onClose} size="lg" title="Choose an image" description={`This spot shows images ${shapeLabel}. Pick one as it is, or crop a copy — the original stays in your library.`} footer={footer}>
      <input ref={fileRef} type="file" accept={ACCEPTED_IMAGE_TYPES.join(',')} className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => upload(e.target.files?.[0])} />
      <Tabs<Tab>
        idPrefix="media-pick"
        ariaLabel="Image source"
        value={tab}
        onChange={setTab}
        items={[
          { id: 'library', label: `Your uploads · ${media.assets.length}` },
          { id: 'upload', label: 'Upload' },
          { id: 'link', label: 'Link' },
        ]}
      />
      <div role="tabpanel" id={`media-pick-panel-${tab}`} aria-labelledby={`media-pick-tab-${tab}`} className="pt-4">
        {problem && (
          <p role="alert" className="mb-3 rounded-md bg-danger-soft px-3 py-2 text-label text-danger">
            {problem}
          </p>
        )}
        {notice && tab === 'library' && (
          <p role="status" className="mb-3 rounded-md bg-success-soft px-3 py-2 text-label text-success">
            {notice}
          </p>
        )}

        {tab === 'library' &&
          (media.assets.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <ImagesIcon size={22} className="text-fg-subtle" aria-hidden />
              <p className="text-label text-fg-muted">No uploads yet. Photos you upload anywhere appear here to reuse.</p>
              <Button variant="secondary" leadingIcon={UploadIcon} onClick={() => setTab('upload')}>
                Upload a photo
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <SearchIcon size={15} aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle" />
                  <label htmlFor="media-pick-search" className="sr-only">
                    Search uploads
                  </label>
                  <input id="media-pick-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name or description" className={cn(fieldControlClass, 'h-9 pl-9 text-label')} />
                </div>
                <label htmlFor="media-pick-folder" className="sr-only">
                  Folder
                </label>
                <select id="media-pick-folder" value={folderFilter} onChange={(e) => setFolderFilter(e.target.value)} className={cn(fieldControlClass, 'h-9 text-label sm:w-44')}>
                  <option value={ALL}>All folders</option>
                  {media.folders.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                  <option value={NONE}>Not in a folder</option>
                </select>
                <Segmented<ShapeFilter>
                  ariaLabel="Shape"
                  value={shape}
                  onChange={setShape}
                  options={[
                    { value: 'all', label: 'All' },
                    { value: 'square', label: 'Square' },
                    { value: 'portrait', label: 'Portrait' },
                    { value: 'wide', label: 'Wide' },
                  ]}
                />
              </div>
              {visible.length === 0 ? (
                <p className="py-10 text-center text-label text-fg-muted">No uploads match.</p>
              ) : (
                <ul role="listbox" aria-label="Your uploads" className="scroll-quiet mt-3 grid max-h-[46vh] grid-cols-3 gap-2 overflow-y-auto pr-0.5 sm:grid-cols-4">
                  {visible.map((a) => {
                    const on = a.id === selected;
                    return (
                      <li key={a.id} role="option" aria-selected={on}>
                        <button
                          type="button"
                          onClick={() => setSelected(a.id)}
                          onDoubleClick={() => onPick({ src: mediaRef(a.id), alt: a.alt, asset: a, crop: false })}
                          className={cn(
                            'group relative block w-full overflow-hidden rounded-md border-2 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                            on ? 'border-action' : 'border-transparent hover:border-line-strong',
                          )}
                        >
                          <MediaImage src={mediaRef(a.id)} alt="" className="aspect-square w-full bg-sunken object-cover" />
                          <span className="block truncate bg-raised px-1.5 py-1 text-caption text-fg-muted">{a.name}</span>
                          {on && (
                            <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-action text-action-fg">
                              <CheckIcon size={12} strokeWidth={3} aria-hidden />
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          ))}

        {tab === 'upload' && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              upload(e.dataTransfer.files?.[0]);
            }}
            className={cn('flex flex-col items-center gap-3 rounded-lg border-2 border-dashed px-6 py-12 text-center transition-colors duration-150', dragOver ? 'border-action bg-action-soft' : 'border-line-strong')}
          >
            {busy ? <Loader2Icon size={22} className="animate-spin text-fg-subtle" aria-label="Processing photo" /> : <UploadIcon size={22} className="text-fg-subtle" aria-hidden />}
            <p className="text-label font-medium text-fg">{busy ? 'Resizing for fast loading…' : 'Drop a photo here'}</p>
            <p className="text-caption text-fg-subtle">JPG, PNG or WebP up to 10 MB. {homeFolder ? `It’s saved to ${homeFolder.name} in Media for reuse.` : 'It’s saved to your library for reuse.'}</p>
            <Button variant="secondary" disabled={busy} onClick={() => fileRef.current?.click()}>
              Choose from device
            </Button>
          </div>
        )}

        {tab === 'link' && (
          <TextInput
            id="media-pick-link"
            label="Image link"
            type="url"
            inputMode="url"
            placeholder="https://"
            value={link}
            hint="Links aren’t copied into your library and can’t be cropped. If the site removes the image, it disappears from your page."
            error={link && !isValidUrl(link) ? 'Use a full link starting with https://' : undefined}
            onChange={(e) => setLink(e.target.value)}
          />
        )}
      </div>
    </Dialog>
  );
}
