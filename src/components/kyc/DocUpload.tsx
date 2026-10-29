import React, { useRef, useState } from 'react';
import { EyeIcon, FileTextIcon, Loader2Icon, LockIcon, UploadIcon } from 'lucide-react';
import type { KycDoc } from '../../types/kyc';
import { formatRelative } from '../../utils/format';
import { prepareImage, readImageFile } from '../../utils/domains/kitImages';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { cn } from '../../utils/cn';
import { useT } from '../../contexts/LocaleContext';

interface DocUploadProps {
  id: string;
  label: string;
  hint?: string;
  value: KycDoc | null;
  onChange: (doc: KycDoc | null) => void;
  error?: string;
  disabled?: boolean;
}

const MAX_MB = 10;
/** PDFs are too large to keep on the device; they can be viewed until the page is reloaded. */
const pdfSession = new Map<string, string>();
const docKey = (d: KycDoc) => `${d.name}|${d.uploadedAt}`;

/**
 * Verification document picker (D93, preview D241). Photos keep a reduced copy on this device so the
 * owner can see what they added; PDFs can be opened during this visit. Documents are private:
 * they're never added to Media. Nothing is sent anywhere in the prototype.
 */
export function DocUpload({ id, label, hint, value, onChange, error, disabled }: DocUploadProps) {
  const { t: tr } = useT();
  const input = useRef<HTMLInputElement>(null);
  const [sizeError, setSizeError] = useState('');
  const [busy, setBusy] = useState(false);
  const [viewing, setViewing] = useState(false);
  const shown = sizeError || error && tr(error);

  const pick = async (file: File | undefined) => {
    if (input.current) input.current.value = '';
    if (!file) return;
    const isPdf = file.type === 'application/pdf';
    if (!isPdf && !file.type.startsWith('image/')) return setSizeError(tr('Choose a photo (JPG or PNG) or a PDF.'));
    if (file.size > MAX_MB * 1024 * 1024) return setSizeError(tr('That file is over {n} MB. Use a smaller photo or PDF.', { n: MAX_MB }));
    setSizeError('');
    const doc: KycDoc = { name: file.name, sizeKb: Math.max(1, Math.round(file.size / 1024)), uploadedAt: new Date().toISOString(), kind: isPdf ? 'pdf' : 'image' };
    if (isPdf) {
      pdfSession.set(docKey(doc), URL.createObjectURL(file));
      onChange(doc);
      return;
    }
    setBusy(true);
    try {
      const im = await readImageFile(file);
      onChange({ ...doc, previewUrl: prepareImage(im, 1000, { jpeg: true }).dataUrl });
    } catch {
      onChange(doc); // Still counts as added; we just can't show it.
    } finally {
      setBusy(false);
    }
  };

  const pdfUrl = value && value.kind === 'pdf' ? pdfSession.get(docKey(value)) : undefined;
  const canView = !!value?.previewUrl || !!pdfUrl;

  return (
    <div>
      <p id={`${id}-label`} className="text-label font-medium text-fg">
        {tr(label)}
      </p>
      {hint && <p className="mt-0.5 text-caption text-fg-subtle">{tr(hint)}</p>}
      <input ref={input} id={id} type="file" accept="image/*,application/pdf" className="sr-only" aria-labelledby={`${id}-label`} aria-describedby={shown ? `${id}-error` : undefined} onChange={(e) => void pick(e.target.files?.[0])} disabled={disabled} />
      {value ?
      <div className="mt-2 flex items-center gap-3 rounded-md border border-line bg-raised p-2.5">
          <button
          type="button"
          onClick={() => canView && setViewing(true)}
          disabled={!canView}
          aria-label={canView ? tr('View {name}', { name: value.name }) : undefined}
          className={cn('flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-line bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus', canView && 'cursor-zoom-in')}>
          
            {busy ? <Loader2Icon size={18} className="animate-spin text-fg-subtle" aria-hidden /> : value.previewUrl ? <img src={value.previewUrl} alt="" className="h-full w-full object-cover" /> : <FileTextIcon size={22} className="text-fg-muted" aria-hidden />}
          </button>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-label font-medium text-fg">{value.name}</span>
            <span className="block text-caption text-fg-subtle">
              {value.kind === 'pdf' ? 'PDF · ' : ''}
              {value.sizeKb.toLocaleString()} KB · {tr('added {when}', { when: formatRelative(value.uploadedAt) })}
            </span>
            {value.kind === 'pdf' && !pdfUrl && <span className="block text-caption text-fg-subtle">{tr('Added earlier — choose Replace to view it again.')}</span>}
          </span>
          {!disabled &&
        <span className="flex shrink-0 flex-wrap justify-end gap-1">
              {canView &&
          <Button size="sm" variant="tertiary" leadingIcon={EyeIcon} onClick={() => setViewing(true)} className="hidden sm:inline-flex">
                  View
                </Button>
          }
              <Button size="sm" variant="tertiary" onClick={() => input.current?.click()}>
                Replace
              </Button>
              <Button size="sm" variant="tertiary" onClick={() => onChange(null)} aria-label={tr('Remove {name}', { name: value.name })}>
                Remove
              </Button>
            </span>
        }
        </div> :

      <button
        type="button"
        disabled={disabled || busy}
        onClick={() => input.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void pick(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          'mt-2 flex w-full flex-wrap items-center justify-center gap-x-2 gap-y-0.5 rounded-md border border-dashed px-4 py-5 text-label font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
          shown ? 'border-danger text-danger' : 'border-line-strong text-fg-muted hover:border-action hover:text-action',
          (disabled || busy) && 'cursor-not-allowed opacity-50'
        )}>
        
          {busy ? <Loader2Icon size={16} className="animate-spin" aria-hidden /> : <UploadIcon size={16} aria-hidden />} {tr('Choose a photo or PDF')}
          <span className="font-normal text-fg-subtle">· {tr('up to {n} MB', { n: MAX_MB })}</span>
        </button>
      }
      {shown &&
      <p id={`${id}-error`} role="alert" className="mt-1.5 text-caption font-medium text-danger">
          {shown}
        </p>
      }
      {value && canView &&
      <Dialog open={viewing} onClose={() => setViewing(false)} title={tr(label)} description={value.name}>
          {value.previewUrl ?
        <img src={value.previewUrl} alt={tr(label)} className="mx-auto max-h-[65vh] w-auto rounded-sm border border-line object-contain" /> :

        <iframe title={value.name} src={pdfUrl} className="h-[65vh] w-full rounded-sm border border-line" />
        }
          <p className="mt-3 flex items-center gap-1.5 text-caption text-fg-subtle">
            <LockIcon size={12} aria-hidden /> {tr('Only used for verification. It isn’t added to Media or shown on your pages.')}
          </p>
        </Dialog>
      }
    </div>);

}