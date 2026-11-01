import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CopyIcon } from 'lucide-react';
import { activityFile, activityFormats, downloadText, fingerprint, type ActivityFormat, type ActivityRow } from '../../utils/activityExport';
import { useT } from '../../contexts/LocaleContext';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

interface ActivityExportDialogProps {
  open: boolean;
  rows: ActivityRow[];
  scopeText: string;
  onClose: () => void;
  onExported: (summary: string) => void;
}

/** Download the filtered activity log as CSV or JSON Lines, with a SHA-256 fingerprint (D439). */
export function ActivityExportDialog({ open, rows, scopeText, onClose, onExported }: ActivityExportDialogProps) {
  const { t: tr } = useT();
  const [format, setFormat] = useState<ActivityFormat>('csv');
  const [hash, setHash] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) setHash('');
  }, [open]);

  const download = async () => {
    setBusy(true);
    const text = activityFile(rows, format);
    const h = await fingerprint(text);
    const f = activityFormats[format];
    downloadText(`kubicu-activity-${new Date().toISOString().slice(0, 10)}.${f.ext}`, text, f.mime);
    setHash(h);
    setBusy(false);
    // Stays English: it goes into the activity log, which is recorded in English.
    onExported(`${rows.length} events · ${f.label}`);
  };

  const copy = () => {
    void navigator.clipboard?.writeText(hash);
    toast.success(tr('Fingerprint copied'));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={tr('Export activity')}
      description={`${tr('Events: {n}', { n: rows.length })} · ${scopeText}`}
      footer={
      <>
          <Button variant="secondary" onClick={onClose}>
            {hash ? tr('Done') : tr('Cancel')}
          </Button>
          {!hash &&
        <Button onClick={download} loading={busy} disabled={rows.length === 0}>
              {tr('Download')}
            </Button>
        }
        </>
      }>
      
      {hash ?
      <div className="flex flex-col gap-3">
          <p className="text-label text-fg">{tr('Downloaded. Keep this fingerprint with the file — if anyone changes even one character, the fingerprint won’t match.')}</p>
          <div className="flex items-center gap-2 rounded-md border border-line bg-sunken px-3 py-2.5">
            <code className="min-w-0 flex-1 break-all font-mono text-caption text-fg">SHA-256 {hash}</code>
            <Button size="sm" variant="tertiary" leadingIcon={CopyIcon} onClick={copy}>
              {tr('Copy')}
            </Button>
          </div>
          <p className="text-caption text-fg-subtle">{tr('The export itself is recorded in the activity log.')}</p>
        </div> :

      <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-label font-semibold text-fg">{tr('Format')}</legend>
          {(Object.keys(activityFormats) as ActivityFormat[]).map((f) =>
        <label key={f} className={cn('flex cursor-pointer items-start gap-3 rounded-md border px-3 py-3 transition-colors duration-150', format === f ? 'border-action bg-action-soft' : 'border-line hover:bg-sunken')}>
              <input type="radio" name="act-format" value={f} checked={format === f} onChange={() => setFormat(f)} className="mt-1 accent-[rgb(var(--action))]" />
              <span className="min-w-0">
                <span className="block text-label font-medium text-fg">{tr(activityFormats[f].label)}</span>
                <span className="block text-caption text-fg-muted">{tr(activityFormats[f].hint)}</span>
              </span>
            </label>
        )}
        </fieldset>
      }
    </Dialog>);

}