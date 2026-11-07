import React, { useRef, useState } from 'react';
import { CropIcon, ImageIcon, ImagesIcon, Loader2Icon, Trash2Icon, UploadIcon } from 'lucide-react';
import { Field } from '../ui/Field';
import { Button } from '../ui/Button';
import { ImageCropDialog } from './ImageCropDialog';
import { MediaLibraryDialog, type PickResult } from './MediaLibraryDialog';
import { MediaImage } from './MediaImage';
import { useOptionalMedia } from '../../contexts/MediaContext';
import { ACCEPTED_IMAGE_TYPES, aspectValue, isUploadedImage, processUpload, type AspectRatio } from '../../utils/image';
import { isMediaRef, mediaRefId, resolveMediaSrc } from '../../utils/media/refs';
import { cn } from '../../utils/cn';
import type { SystemMediaFolderId } from '../../data/mediaFolders';

interface MediaPickerProps {
  id: string;
  label: string;
  value: string;
  /** `meta.alt` is the library's default description, when there is one. */
  onChange: (src: string, meta?: { alt: string }) => void;
  aspect: AspectRatio;
  optional?: boolean;
  error?: string;
  hint?: string;
  /** Round preview for avatars. */
  round?: boolean;
  disabled?: boolean;
  /** Default folder new uploads from this field are filed in (e.g. 'brand' for logos, 'products' for product photos). */
  folder?: SystemMediaFolderId;
}

const aspectLabels: Record<AspectRatio, string> = { '1:1': 'square', '4:5': 'portrait 4:5', '16:9': 'wide 16:9' };

/** Image field: pick from your library, upload (saved to the library), crop a copy, or use a link. */
export function MediaPicker({ id, label, value, onChange, aspect, optional, error, hint, round, disabled, folder }: MediaPickerProps) {
  const media = useOptionalMedia();
  const fileRef = useRef<HTMLInputElement>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [crop, setCrop] = useState<{ src: string; name: string; alt: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const library = !!media?.available;
  const asset = isMediaRef(value) ? media?.get(mediaRefId(value)) : undefined;
  const uploaded = isUploadedImage(value);

  const startCrop = (src: string, name: string, alt: string) => setCrop({ src: resolveMediaSrc(src), name, alt });

  const onPick = (r: PickResult) => {
    setLibraryOpen(false);
    setProblem(null);
    if (r.crop) startCrop(r.src, r.asset?.name ?? 'Photo', r.alt);
    else onChange(r.src, { alt: r.alt });
  };

  const onCropped = async (dataUrl: string) => {
    if (!crop) return;
    setCrop(null);
    try {
      const stored = media ? await media.addDataUrl(dataUrl, `${crop.name} (${aspectLabels[aspect]})`, crop.alt, folder) : { src: dataUrl };
      onChange(stored.src, { alt: crop.alt });
    } catch (e) {
      setProblem(e instanceof Error ? e.message : 'Couldn’t save the crop. Try again.');
    }
  };

  // Without a library (storage unavailable), fall back to a direct upload embedded in the page.
  const onDirectFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setProblem(null);
    try {
      const src = await processUpload(file);
      setCrop({ src, name: 'Photo', alt: '' });
    } catch (e) {
      setProblem(e instanceof Error ? e.message : 'Upload failed. Try again.');
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const assetFolder = asset && media ? media.folderOf(asset) : undefined;
  const defaultHint = asset
    ? `From your library · ${assetFolder ? `${assetFolder.name} · ` : ''}${asset.name}`
    : uploaded
      ? 'Stored with this page. Resized for fast loading.'
      : value
        ? 'Linked from another site.'
        : library
          ? 'Choose from your uploads, upload a new photo or use a link.'
          : 'JPG, PNG or WebP up to 10 MB.';

  return (
    <Field id={`${id}-choose`} label={label} optional={optional} error={error ?? problem ?? undefined} hint={hint ?? defaultHint}>
      <div className="flex items-center gap-3">
        <span className={cn('relative flex shrink-0 items-center justify-center overflow-hidden border border-line bg-sunken text-fg-subtle', round ? 'h-14 w-14 rounded-full' : 'h-14 w-14 rounded-sm')}>
          {busy ? <Loader2Icon size={18} className="animate-spin" aria-label="Processing photo" /> : value ? <MediaImage src={value} alt="" className="h-full w-full object-cover" /> : <ImageIcon size={18} aria-hidden />}
        </span>
        <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
          {library ? (
            <Button id={`${id}-choose`} size="sm" variant="secondary" leadingIcon={ImagesIcon} disabled={disabled} onClick={() => setLibraryOpen(true)}>
              {value ? 'Change' : 'Choose image'}
            </Button>
          ) : (
            <>
              <input ref={fileRef} type="file" accept={ACCEPTED_IMAGE_TYPES.join(',')} className="sr-only" tabIndex={-1} aria-hidden disabled={disabled || busy} onChange={(e) => onDirectFile(e.target.files?.[0])} />
              <Button id={`${id}-choose`} size="sm" variant="secondary" leadingIcon={UploadIcon} disabled={disabled || busy} onClick={() => fileRef.current?.click()}>
                {value ? 'Replace' : 'Upload'}
              </Button>
            </>
          )}
          {uploaded && (
            <Button size="sm" variant="tertiary" leadingIcon={CropIcon} disabled={disabled} onClick={() => startCrop(value, asset?.name ?? 'Photo', asset?.alt ?? '')}>
              Crop
            </Button>
          )}
          {value && (
            <Button size="sm" variant="tertiary" leadingIcon={Trash2Icon} disabled={disabled} onClick={() => onChange('')} aria-label={`Remove ${label.toLowerCase()}`}>
              Remove
            </Button>
          )}
        </div>
      </div>
      {library && <MediaLibraryDialog open={libraryOpen} onClose={() => setLibraryOpen(false)} shapeLabel={aspectLabels[aspect]} folder={folder} onPick={onPick} />}
      <ImageCropDialog open={!!crop} src={crop?.src ?? ''} aspect={aspectValue[aspect]} aspectLabel={aspectLabels[aspect]} onClose={() => setCrop(null)} onCropped={onCropped} />
    </Field>
  );
}
