import React, { useId } from 'react';
import { PaperclipIcon, XIcon } from 'lucide-react';
import { MAX_FILES } from '../../utils/money/escrow';

/** Photos or documents as evidence. Prototype: only file names are kept, nothing is uploaded. */
export function ProofPicker({ label, hint, value, onChange }: {label: string;hint?: string;value: string[];onChange: (names: string[]) => void;}) {
  const id = useId();
  const full = value.length >= MAX_FILES;
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-label font-medium text-fg" id={`${id}-label`}>
        {label} <span className="font-normal text-fg-subtle">· optional, up to {MAX_FILES}</span>
      </span>
      {hint && <p className="text-caption text-fg-subtle">{hint}</p>}
      {value.length > 0 &&
      <ul className="flex flex-col gap-1" aria-labelledby={`${id}-label`}>
          {value.map((n, i) =>
        <li key={`${n}-${i}`} className="flex items-center justify-between gap-2 rounded-md bg-sunken px-3 py-1.5 text-label text-fg">
              <span className="flex min-w-0 items-center gap-2">
                <PaperclipIcon size={14} className="shrink-0 text-fg-subtle" aria-hidden />
                <span className="truncate">{n}</span>
              </span>
              <button type="button" aria-label={`Remove ${n}`} onClick={() => onChange(value.filter((_, j) => j !== i))} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-fg-subtle hover:bg-raised hover:text-fg">
                <XIcon size={14} aria-hidden />
              </button>
            </li>
        )}
        </ul>
      }
      {!full &&
      <label className="inline-flex cursor-pointer items-center gap-1.5 self-start rounded-md border border-line px-3 py-1.5 text-label font-medium text-fg hover:bg-sunken focus-within:ring-2 focus-within:ring-focus">
          <PaperclipIcon size={14} aria-hidden /> Add files
          <input
          type="file"
          multiple
          accept="image/*,.pdf"
          className="sr-only"
          onChange={(e) => {
            const names = Array.from(e.target.files ?? []).map((f) => f.name);
            onChange([...value, ...names].slice(0, MAX_FILES));
            e.target.value = '';
          }} />
        
        </label>
      }
    </div>);

}