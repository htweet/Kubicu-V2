import React, { useRef, useState } from 'react';
import { ImagePlusIcon, ImagesIcon, PenLineIcon, RefreshCwIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { prepareImage, readImageFile, readImageSrc } from '../../utils/domains/kitImages';
import type { KitImage } from '../../utils/domains/printKit';
import { Button } from '../ui/Button';
import { SignaturePad } from './SignaturePad';
import { MediaLibraryDialog, type PickResult } from '../media/MediaLibraryDialog';
import { cn } from '../../utils/cn';
import { useOptionalMedia } from '../../contexts/MediaContext';
import { resolveMediaSrc } from '../../utils/media/refs';

const config: Record<KitImage, {maxPx: number;knockout: boolean;jpeg: boolean;label: string;hint: string;}> = {
  logo: { maxPx: 700, knockout: true, jpeg: false, label: 'Logo', hint: 'PNG with a clear background works best. Without one we use your initials.' },
  photo: { maxPx: 1800, knockout: false, jpeg: true, label: 'Photo', hint: 'A bright product or work photo. Used by the Photo design, inserts and flyers. Crop and tone it below.' },
  signature: { maxPx: 800, knockout: true, jpeg: false, label: 'Signature', hint: 'Sign on plain white paper and take a photo, or draw it here.' }
};

interface KitImageFieldProps {
  kind: KitImage;
  value: string | null;
  disabled?: boolean;
  onChange: (dataUrl: string | null, widthPx?: number) => void;
}

/** Upload (or, for signatures, draw) an image for the print kit. Shrinks it and can lift a white background. */
export function KitImageField({ kind, value, disabled, onChange }: KitImageFieldProps) {
  const c = config[kind];
  const media = useOptionalMedia();
  const input = useRef<HTMLInputElement>(null);
  const original = useRef<HTMLImageElement | null>(null);
  const [knockout, setKnockout] = useState(c.knockout);
  const [busy, setBusy] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const id = `kit-img-${kind}`;
  // Logos and photos come from (and go into) Media. Signatures stay private to the print kit.
  const useLibrary = kind !== 'signature' && !!media?.available;

  const onPick = async (r: PickResult) => {
    setLibraryOpen(false);
    setBusy(true);
    try {
      const im = await readImageSrc(resolveMediaSrc(r.src));
      original.current = im;
      process(im, knockout);
    } catch (e) {
      toast.error('Couldn’t use that image', { description: e instanceof Error ? e.message : undefined });
    } finally {
      setBusy(false);
    }
  };

  const process = (im: HTMLImageElement, ko: boolean) => {
    const out = prepareImage(im, c.maxPx, { knockout: ko, jpeg: c.jpeg });
    onChange(out.dataUrl, im.naturalWidth);
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      const im = await readImageFile(file);
      original.current = im;
      process(im, knockout);
    } catch (e) {
      toast.error('Couldn’t use that image', { description: e instanceof Error ? e.message : undefined });
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };

  const toggleKnockout = (on: boolean) => {
    setKnockout(on);
    if (original.current) process(original.current, on);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-label font-medium text-fg">
          {c.label}
        </label>
        <span className="text-caption text-fg-subtle">Optional</span>
      </div>
      {drawing ?
      <SignaturePad
        onCancel={() => setDrawing(false)}
        onSave={(url, w) => {
          original.current = null;
          onChange(url, w);
          setDrawing(false);
        }} /> :


      <div className="flex items-center gap-3">
          <div
          className={cn('flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-line', value ? 'bg-white' : 'bg-sunken')}
          style={value && kind !== 'photo' ? { backgroundImage: 'conic-gradient(#e5e5e5 25%, #fff 0 50%, #e5e5e5 0 75%, #fff 0)', backgroundSize: '10px 10px' } : undefined}>
          
            {value ? <img src={value} alt={`${c.label} preview`} className={cn('h-full w-full', kind === 'photo' ? 'object-cover' : 'object-contain p-1')} /> : <ImagePlusIcon size={18} className="text-fg-subtle" aria-hidden />}
          </div>
          <div className="flex min-w-0 flex-1 flex-wrap gap-2">
            {useLibrary ?
          <Button id={id} size="sm" variant="secondary" leadingIcon={value ? RefreshCwIcon : ImagesIcon} loading={busy} disabled={disabled} onClick={() => setLibraryOpen(true)}>
                {value ? 'Change' : 'Choose image'}
              </Button> :

          <>
                <input ref={input} id={id} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" disabled={disabled || busy} onChange={(e) => onFile(e.target.files?.[0])} />
                <Button size="sm" variant="secondary" leadingIcon={value ? RefreshCwIcon : ImagePlusIcon} loading={busy} disabled={disabled} onClick={() => input.current?.click()}>
                  {value ? 'Replace' : 'Upload'}
                </Button>
              </>
          }
            {kind === 'signature' &&
          <Button size="sm" variant="tertiary" leadingIcon={PenLineIcon} disabled={disabled} onClick={() => setDrawing(true)}>
                Draw
              </Button>
          }
            {value &&
          <Button size="sm" variant="tertiary" leadingIcon={Trash2Icon} disabled={disabled} onClick={() => {original.current = null;onChange(null);}}>
                Remove
              </Button>
          }
          </div>
        </div>
      }
      {!drawing && kind !== 'photo' &&
      <label className="flex cursor-pointer items-center gap-2 text-caption text-fg-muted">
          <input type="checkbox" className="h-4 w-4 accent-[rgb(var(--action))]" checked={knockout} disabled={disabled} onChange={(e) => toggleKnockout(e.target.checked)} />
          Remove white background{original.current ? '' : value ? ' (applies to the next upload)' : ''}
        </label>
      }
      <p className="text-caption text-fg-subtle">
        {c.hint}
        {useLibrary ? ` Pick from Media or upload a new one — uploads are saved to Media${kind === 'logo' ? ' → Brand assets' : ''}.` : ''}
      </p>
      {useLibrary && <MediaLibraryDialog open={libraryOpen} onClose={() => setLibraryOpen(false)} shapeLabel={kind === 'logo' ? 'logo' : 'photo'} folder={kind === 'logo' ? 'brand' : undefined} onPick={(r) => void onPick(r)} />}
    </div>);

}