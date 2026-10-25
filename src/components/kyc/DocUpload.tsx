import React, { useRef } from 'react';
import { FileCheck2Icon, UploadIcon } from 'lucide-react';
import type { KycDoc } from '../../types/kyc';
import { formatRelative } from '../../utils/format';
import { Button } from '../ui/Button';
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

/** Document picker. In the prototype only the file's name and size are kept — nothing is uploaded (D93). */
export function DocUpload({ id, label, hint, value, onChange, error, disabled }: DocUploadProps) {
  const { t: tr } = useT();
  const input = useRef<HTMLInputElement>(null);
  const [sizeError, setSizeError] = React.useState('');
  const shown = sizeError || error && tr(error);

  const pick = (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_MB * 1024 * 1024) return setSizeError(tr('That file is over {n} MB. Use a smaller photo or PDF.', { n: MAX_MB }));
    setSizeError('');
    onChange({ name: file.name, sizeKb: Math.max(1, Math.round(file.size / 1024)), uploadedAt: new Date().toISOString() });
  };

  return (
    <div>
      <p id={`${id}-label`} className="text-label font-medium text-fg">
        {tr(label)}
      </p>
      {hint && <p className="mt-0.5 text-caption text-fg-subtle">{tr(hint)}</p>}
      <input ref={input} id={id} type="file" accept="image/*,application/pdf" className="sr-only" aria-labelledby={`${id}-label`} aria-describedby={shown ? `${id}-error` : undefined} onChange={(e) => pick(e.target.files?.[0])} disabled={disabled} />
      {value ?
      <div className="mt-2 flex items-center gap-3 rounded-md border border-line bg-raised px-3 py-2.5">
          <FileCheck2Icon size={18} className="shrink-0 text-success" aria-hidden />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-label font-medium text-fg">{value.name}</span>
            <span className="block text-caption text-fg-subtle">
              {value.sizeKb.toLocaleString()} KB · {tr('added {when}', { when: formatRelative(value.uploadedAt) })}
            </span>
          </span>
          {!disabled &&
        <span className="flex shrink-0 gap-1">
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
        disabled={disabled}
        onClick={() => input.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          pick(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          'mt-2 flex w-full flex-wrap items-center justify-center gap-x-2 gap-y-0.5 rounded-md border border-dashed px-4 py-5 text-label font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
          shown ? 'border-danger text-danger' : 'border-line-strong text-fg-muted hover:border-action hover:text-action',
          disabled && 'cursor-not-allowed opacity-50'
        )}>
        
          <UploadIcon size={16} aria-hidden /> {tr('Choose a photo or PDF')}
          <span className="font-normal text-fg-subtle">· {tr('up to {n} MB', { n: MAX_MB })}</span>
        </button>
      }
      {shown &&
      <p id={`${id}-error`} role="alert" className="mt-1.5 text-caption font-medium text-danger">
          {shown}
        </p>
      }
    </div>);

}