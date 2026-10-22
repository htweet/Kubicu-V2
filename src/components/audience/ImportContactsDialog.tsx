import React, { useRef, useState } from 'react';
import { AlertCircleIcon, UploadIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useOps } from '../../contexts/OpsContext';
import { parseCsv } from '../../utils/csv';
import { upsertContact } from '../../utils/ops/ops';
import { isValidEmail, isValidPhone } from '../../utils/validation';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { SelectInput } from '../ui/SelectInput';
import { Switch } from '../ui/Switch';

type Target = 'skip' | 'name' | 'email' | 'phone' | 'tags';
const targets: {value: Target;label: string;}[] = [
{ value: 'skip', label: 'Don’t import' },
{ value: 'name', label: 'Name' },
{ value: 'email', label: 'Email' },
{ value: 'phone', label: 'Phone' },
{ value: 'tags', label: 'Tags' }];


function guess(h: string): Target {
  const s = h.toLowerCase();
  if (s.includes('mail')) return 'email';
  if (s.includes('phone') || s.includes('mobile') || s.includes('whatsapp')) return 'phone';
  if (s.includes('name')) return 'name';
  if (s.includes('tag')) return 'tags';
  return 'skip';
}

/** CSV import: map columns, see row errors, confirm consent basis. Imported contacts are never auto-subscribed. */
export function ImportContactsDialog({ open, onClose }: {open: boolean;onClose: () => void;}) {
  const { apply } = useOps();
  const [table, setTable] = useState<string[][] | null>(null);
  const [map, setMap] = useState<Target[]>([]);
  const [error, setError] = useState('');
  const [lawful, setLawful] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const reset = () => {
    setTable(null);
    setMap([]);
    setError('');
    setLawful(false);
  };

  const onFile = async (f: File) => {
    reset();
    if (!/\.csv$/i.test(f.name)) return setError('Choose a .csv file.');
    const t = parseCsv(await f.text());
    if (t.length < 2) return setError('The file has no rows under the header.');
    setTable(t);
    setMap(t[0].map(guess));
  };

  const rows = (table?.slice(1) ?? []).map((r, i) => {
    const get = (k: Target) => map.map((m, idx) => m === k ? (r[idx] ?? '').trim() : '').filter(Boolean).join(' ');
    const email = get('email');
    const phone = get('phone');
    const errors: string[] = [];
    if (!email && !phone) errors.push('Needs an email or phone');
    if (email && !isValidEmail(email)) errors.push('Email looks wrong');
    if (phone && !isValidPhone(phone)) errors.push('Phone looks wrong');
    return { line: i + 2, name: get('name'), email, phone, tags: get('tags').split(/[;|]/).map((t) => t.trim()).filter(Boolean), errors };
  });
  const valid = rows.filter((r) => r.errors.length === 0);

  const run = () => {
    if (!lawful) return;
    const ok = apply((d) =>
    valid.reduce((acc, r) => {
      const next = upsertContact(acc, { name: r.name, email: r.email, phone: r.phone }, 'import', 'Imported from CSV', { consent: 'transactional' });
      return r.tags.length ? { ...next, contacts: next.contacts.map((c) => r.email && c.email === r.email || r.phone && c.phone === r.phone ? { ...c, tags: Array.from(new Set([...c.tags, ...r.tags])) } : c) } : next;
    }, d)
    );
    if (ok) {
      toast(`Imported ${valid.length} contact${valid.length === 1 ? '' : 's'}`, { description: 'Existing contacts were updated, not duplicated.' });
      reset();
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      size="lg"
      title="Import contacts"
      description="Map your columns, check the rows, then import. Matching emails or phones update existing contacts."
      footer={
      table ?
      <Button onClick={run} disabled={valid.length === 0 || !lawful}>
            Import {valid.length}
          </Button> :

      <Button leadingIcon={UploadIcon} onClick={() => ref.current?.click()} data-autofocus>
            Choose CSV file
          </Button>

      }>
      
      <input ref={ref} type="file" accept=".csv,text/csv" className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => {const f = e.target.files?.[0];if (f) void onFile(f);e.target.value = '';}} />
      {error &&
      <p className="flex items-start gap-2 rounded-md bg-danger-soft px-3 py-2.5 text-label text-danger" role="alert">
          <AlertCircleIcon size={15} className="mt-0.5 shrink-0" aria-hidden /> {error}
        </p>
      }
      {!table && !error && <p className="text-label text-fg-muted">Exports from Google Contacts, Excel or another tool work. Headers in the first row.</p>}
      {table &&
      <div className="flex flex-col gap-4">
          <fieldset>
            <legend className="mb-2 text-label font-semibold text-fg">Match columns</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {table[0].map((h, i) =>
            <SelectInput key={i} id={`map-${i}`} label={h || `Column ${i + 1}`} value={map[i]} options={targets} onChange={(v) => setMap((m) => m.map((x, idx) => idx === i ? v : x))} />
            )}
            </div>
          </fieldset>
          <p className="text-label text-fg" aria-live="polite">
            <span className="font-semibold">{valid.length} ready</span>
            {rows.length - valid.length > 0 && <span className="text-danger"> · {rows.length - valid.length} with errors (skipped)</span>}
          </p>
          {rows.some((r) => r.errors.length) &&
        <ul className="max-h-32 overflow-auto rounded-md border border-line text-caption">
              {rows.filter((r) => r.errors.length).map((r) =>
          <li key={r.line} className="border-t border-line px-3 py-1.5 first:border-t-0">
                  <span className="font-mono text-fg-subtle">Row {r.line}</span> <span className="text-danger">{r.errors.join(' · ')}</span>
                </li>
          )}
            </ul>
        }
          <Switch id="imp-lawful" label="I have a lawful reason to hold these contacts" description="E.g. they’re existing customers. Imported contacts get service messages only — never marketing unless they opt in themselves." checked={lawful} onChange={setLawful} />
        </div>
      }
    </Dialog>);

}