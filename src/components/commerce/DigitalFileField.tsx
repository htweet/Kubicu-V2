import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2Icon, FileIcon, Loader2Icon, ShieldAlertIcon, UploadIcon } from 'lucide-react';
import type { Product } from '../../types/commerce';
import { formatBytes } from '../../utils/commerce/catalog';
import { formatTimestamp } from '../../utils/format';
import { Button } from '../ui/Button';
import { TextInput } from '../ui/TextInput';
import { TextArea } from '../ui/TextArea';
import { InlineAlert } from '../ui/InlineAlert';
import { Switch } from '../ui/Switch';
import { PlanLock } from '../ui/PlanLock';
import { usePlan } from '../../contexts/PlanContext';
import { planAtLeast } from '../../data/plans';

const MAX_BYTES = 500 * 1024 * 1024;
const statusCopy = {
  processing: { icon: Loader2Icon, text: 'Uploading…', cls: 'text-fg-muted', spin: true },
  scanning: { icon: Loader2Icon, text: 'Scanning for viruses…', cls: 'text-fg-muted', spin: true },
  ready: { icon: CheckCircle2Icon, text: 'Scanned and ready to sell', cls: 'text-success', spin: false },
  failed: { icon: ShieldAlertIcon, text: 'Upload failed — try again', cls: 'text-danger', spin: false }
};

interface DigitalFileFieldProps {
  product: Product;
  onChange: (patch: Partial<Product>) => void;
  error?: string;
}

/**
 * File, access rules and licence for a digital product. In this prototype only the file’s
 * name and size are kept — nothing is uploaded anywhere.
 */
export function DigitalFileField({ product, onChange, error }: DigitalFileFieldProps) {
  const asset = product.digital!;
  const inputRef = useRef<HTMLInputElement>(null);
  const [note, setNote] = useState('');
  const [sizeError, setSizeError] = useState('');
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const setAsset = (patch: Partial<typeof asset>) => onChange({ digital: { ...asset, ...patch } });
  const plan = usePlan();
  const protectionAllowed = planAtLeast(plan.id, 'creator');

  const onFile = (file: File) => {
    setSizeError('');
    if (file.size > MAX_BYTES) {
      setSizeError(`That file is ${formatBytes(file.size)}. The limit is 500 MB.`);
      return;
    }
    const version = asset.version + 1;
    const next = {
      ...asset,
      fileName: file.name,
      sizeBytes: file.size,
      status: 'processing' as const,
      version,
      versions: [{ version, fileName: file.name, sizeBytes: file.size, uploadedAt: new Date().toISOString(), note: note.trim() }, ...asset.versions]
    };
    onChange({ digital: next });
    setNote('');
    // Simulated processing → scan → ready.
    timers.current.push(window.setTimeout(() => onChange({ digital: { ...next, status: 'scanning' } }), 700));
    timers.current.push(window.setTimeout(() => onChange({ digital: { ...next, status: 'ready' } }), 1900));
  };

  const st = statusCopy[asset.status];
  const StatusIcon = st.icon;

  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="mb-1 text-label font-medium text-fg">File and access</legend>

      <div className="rounded-md border border-line p-4">
        {asset.fileName ?
        <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-sunken text-fg-muted">
              <FileIcon size={18} aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-label font-semibold text-fg">{asset.fileName}</p>
              <p className="text-caption text-fg-subtle">
                {formatBytes(asset.sizeBytes)} · Version {asset.version}
              </p>
              <p className={`mt-1 flex items-center gap-1.5 text-caption font-medium ${st.cls}`} aria-live="polite">
                <StatusIcon size={13} className={st.spin ? 'animate-spin' : ''} aria-hidden />
                {st.text}
              </p>
            </div>
          </div> :

        <p className="text-label text-fg-muted">No file yet. PDF, ZIP, EPUB, presets, audio or video up to 500 MB.</p>
        }
        {asset.fileName && asset.version > 0 &&
        <TextInput id="dig-note" label="What changed in the next version?" optional value={note} placeholder="e.g. Added size 18" fieldClassName="mt-4" onChange={(e) => setNote(e.target.value)} />
        }
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
            e.target.value = '';
          }} />
        
        <Button variant="secondary" size="sm" leadingIcon={UploadIcon} className="mt-3" onClick={() => inputRef.current?.click()} disabled={asset.status === 'processing' || asset.status === 'scanning'}>
          {asset.fileName ? 'Upload a new version' : 'Choose file'}
        </Button>
        {(sizeError || error) && <p className="mt-2 text-caption text-danger">{sizeError || error}</p>}
        <p className="mt-2 text-caption text-fg-subtle">Prototype: only the file name and size are kept. Nothing is uploaded.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput
          id="dig-limit"
          label="Downloads per buyer"
          inputMode="numeric"
          value={asset.downloadLimit === null ? '' : String(asset.downloadLimit)}
          placeholder="Unlimited"
          hint="Leave blank for unlimited."
          onChange={(e) => {
            const v = e.target.value.replace(/[^0-9]/g, '').slice(0, 3);
            setAsset({ downloadLimit: v === '' ? null : Math.max(1, Number(v)) });
          }} />
        
        <TextInput
          id="dig-expiry"
          label="Link works for (days)"
          inputMode="numeric"
          value={asset.expiryDays === null ? '' : String(asset.expiryDays)}
          placeholder="No expiry"
          hint="Counted from purchase."
          onChange={(e) => {
            const v = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
            setAsset({ expiryDays: v === '' ? null : Math.max(1, Number(v)) });
          }} />
        
      </div>
      <TextArea id="dig-licence" label="Licence note" optional rows={2} value={asset.licence} placeholder="e.g. For personal use only. Please don’t resell or share." hint="Shown on the receipt and download page." onChange={(e) => setAsset({ licence: e.target.value })} />

      <div className="flex flex-col gap-4 rounded-md border border-line p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-label font-medium text-fg">Extra protection</p>
          {!protectionAllowed && <PlanLock kind="plan">Creator plan</PlanLock>}
        </div>
        <Switch
          id="dig-stamp"
          label="Stamp PDFs with the buyer’s details"
          description="Every page carries their name, email and order number in the footer, so a shared copy points back to them. PDF files only."
          checked={!!asset.stamp}
          disabled={!protectionAllowed}
          onChange={(stamp) => setAsset({ stamp })} />
        
        {asset.stamp &&
        <div className="rounded-sm border border-dashed border-line-strong bg-sunken px-3 py-2 text-caption text-fg-muted" aria-label="Stamp preview">
            <span className="font-medium text-fg">Preview, bottom of each page:</span> Licensed to Chiamaka Obi · chiamaka@example.com · Order #1042 · Not for resale
          </div>
        }
        <Switch
          id="dig-keys"
          label="Issue a licence key to each buyer"
          description="For presets, software, courses and templates. Keys show on the buyer’s download page; you can revoke or replace them."
          checked={!!asset.keys?.enabled}
          disabled={!protectionAllowed}
          onChange={(enabled) => setAsset({ keys: { prefix: asset.keys?.prefix ?? '', activations: asset.keys?.activations ?? 2, enabled } })} />
        
        {asset.keys?.enabled &&
        <div className="grid gap-4 sm:grid-cols-2">
            <TextInput
            id="dig-key-prefix"
            label="Key starts with"
            optional
            value={asset.keys.prefix}
            placeholder="e.g. ADAZ"
            hint={`Looks like ${asset.keys.prefix.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) || ''}${asset.keys.prefix.trim() ? '-' : ''}7K2Q-M4XP-9WTR`}
            onChange={(e) => setAsset({ keys: { ...asset.keys!, prefix: e.target.value.slice(0, 6) } })} />
          
            <TextInput
            id="dig-key-acts"
            label="Devices per key"
            inputMode="numeric"
            value={String(asset.keys.activations)}
            hint="How many devices one buyer can use it on."
            onChange={(e) => setAsset({ keys: { ...asset.keys!, activations: Math.min(50, Math.max(1, Number(e.target.value.replace(/[^0-9]/g, '') || '1'))) } })} />
          
          </div>
        }
      </div>

      <InlineAlert tone="info" title="What protection really means">
        Limits and expiring links reduce casual sharing, but once someone downloads a file they can copy it. Your licence note sets expectations.
      </InlineAlert>

      {asset.versions.length > 1 &&
      <div>
          <p className="text-label font-medium text-fg">Version history</p>
          <ol className="mt-2 flex flex-col divide-y divide-line border-y border-line">
            {asset.versions.map((v) =>
          <li key={v.version} className="flex items-baseline justify-between gap-3 py-2 text-caption">
                <span className="min-w-0">
                  <span className="font-semibold text-fg">v{v.version}</span> <span className="text-fg-muted">{v.fileName}</span>
                  {v.note && <span className="block text-fg-subtle">{v.note}</span>}
                </span>
                <span className="shrink-0 text-fg-subtle">{formatTimestamp(v.uploadedAt)}</span>
              </li>
          )}
          </ol>
        </div>
      }
    </fieldset>);

}