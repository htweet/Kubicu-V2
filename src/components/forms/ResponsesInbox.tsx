import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ResponseRecords } from './ResponseRecords';
import { ArchiveIcon, ArchiveRestoreIcon, DownloadIcon, InboxIcon, MailIcon, MailOpenIcon } from 'lucide-react';
import type { FormDef, FormSubmission } from '../../types/forms';
import { useTeam } from '../../contexts/TeamContext';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { answerText } from '../../utils/forms/logic';
import { downloadCsv, toCsv } from '../../utils/csv';
import { formatNgn } from '../../utils/format';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Segmented } from '../ui/Segmented';
import { SelectInput } from '../ui/SelectInput';
import { Sheet } from '../ui/Sheet';
import { EmptyState } from '../ui/EmptyState';
import { cn } from '../../utils/cn';

type Filter = 'new' | 'all' | 'archived';

interface ResponsesInboxProps {
  form: FormDef;
  submissions: FormSubmission[];
  onUpdate: (id: string, patch: Partial<FormSubmission>) => void;
  disabled: boolean;
}

const when = (iso: string) => new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

/** One form's responses: filter, read, assign, archive and export (D79). */
export function ResponsesInbox({ form, submissions, onUpdate, disabled }: ResponsesInboxProps) {
  const team = useTeam();
  const wide = useMediaQuery('(min-width: 1024px)');
  const [params, setParams] = useSearchParams();
  const [filter, setFilter] = useState<Filter>('all');
  const [mine, setMine] = useState(false);
  // Bank account numbers stay masked until someone chooses to see them (D194).
  const [revealed, setRevealed] = useState<string | null>(null);
  const openId = params.get('response');

  const list = useMemo(
    () =>
    submissions.
    filter((s) => s.formId === form.id).
    filter((s) => filter === 'archived' ? s.status === 'archived' : s.status !== 'archived' && (filter === 'all' || s.status === 'new')).
    filter((s) => !mine || s.assigneeId === team.me.id).
    sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [submissions, form.id, filter, mine, team.me.id]
  );
  const open = submissions.find((s) => s.id === openId && s.formId === form.id) ?? null;

  const select = (id: string | null) => {
    const next = new URLSearchParams(params);
    if (id) next.set('response', id);else
    next.delete('response');
    setParams(next, { replace: true });
  };

  // Opening a response marks it read.
  useEffect(() => {
    if (open && open.status === 'new' && !disabled) onUpdate(open.id, { status: 'read' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open?.id]);

  const exportCsv = () => {
    const cols = form.fields.filter((f) => f.type !== 'payment' && f.type !== 'section');
    const rows = submissions.
    filter((s) => s.formId === form.id).
    map((s) => [s.createdAt, s.status, ...cols.map((f) => answerText(s.answers[f.id], f)), s.payment ? s.payment.amountNgn : '', s.source ?? '', s.marketingConsent ? 'yes' : 'no', s.email ? s.email.status === 'sent' ? 'sent (simulated)' : 'not sent' : '', s.orderNumber ? `#${s.orderNumber}` : '', s.bookingRef ?? '']);
    downloadCsv(`${form.name.replace(/\W+/g, '-').toLowerCase()}-responses.csv`, toCsv(['Sent at', 'Status', ...cols.map((f) => f.label), 'Paid (₦, test)', 'Source', 'Marketing consent', 'Confirmation email', 'Order', 'Booking'], rows));
  };

  const memberName = (id: string | null) => id ? team.data.members.find((m) => m.id === id)?.name ?? 'Former member' : null;

  const detail = open &&
  <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="text-heading font-semibold text-fg">{open.contactName || 'No name given'}</p>
        <p className="text-caption text-fg-muted">
          {when(open.createdAt)}
          {open.source ? ` · from ${open.source}` : ''}
          {open.sample ? ' · sample' : ''}
        </p>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {open.payment && <Badge tone="success">Paid {formatNgn(open.payment.amountNgn)} · test</Badge>}
          <Badge tone={open.marketingConsent ? 'info' : 'neutral'}>{open.marketingConsent ? 'Agreed to marketing' : 'No marketing consent'}</Badge>
        </div>
      </div>

      <dl className="flex flex-col divide-y divide-line border-y border-line">
        {form.fields.
      filter((f) => f.type !== 'payment' && f.type !== 'consent' && f.type !== 'section').
      map((f) => {
        const showFull = revealed === `${open.id}:${f.id}`;
        const v = answerText(open.answers[f.id], f, { mask: f.type === 'bank' && !showFull });
        const canReveal = f.type === 'bank' && !!v && !showFull;
        const raw = open.answers[f.id];
        const drawn = f.type === 'signature' && typeof raw === 'string' && raw.startsWith('data:image/') ? raw : null;
        return (
          <div key={f.id} className="grid gap-1 py-3 sm:grid-cols-[minmax(0,10rem)_minmax(0,1fr)] sm:gap-4">
                <dt className="text-caption text-fg-subtle">{f.label}</dt>
                <dd className={cn('whitespace-pre-wrap break-words text-label', v ? 'text-fg' : 'text-fg-subtle')}>
                  {drawn ? <img src={drawn} alt={`Signature drawn by ${open.contactName || 'the sender'}`} className="h-16 w-auto max-w-full rounded-md border border-line bg-white p-1" /> : v || 'Not answered'}
                  {canReveal &&
              <button type="button" onClick={() => setRevealed(`${open.id}:${f.id}`)} className="ml-2 text-caption font-medium text-action underline-offset-2 hover:underline">
                      Show number
                    </button>
              }
                </dd>
              </div>);

      })}
      </dl>

      <div className="flex flex-col gap-4">
        <SelectInput
        id={`assign-${open.id}`}
        label="Assigned to"
        value={open.assigneeId ?? ''}
        disabled={disabled}
        options={[{ value: '', label: 'Nobody' }, ...team.data.members.map((m) => ({ value: m.id, label: m.id === team.me.id ? `${m.name} (you)` : m.name }))]}
        onChange={(v) => onUpdate(open.id, { assigneeId: v || null })} />
      
        <div className="flex flex-wrap gap-2">
          {open.status === 'archived' ?
        <Button size="sm" variant="secondary" leadingIcon={ArchiveRestoreIcon} disabled={disabled} onClick={() => onUpdate(open.id, { status: 'read' })}>
              Move back to inbox
            </Button> :

        <>
              <Button size="sm" variant="secondary" leadingIcon={MailIcon} disabled={disabled} onClick={() => onUpdate(open.id, { status: 'new' })}>
                Mark unread
              </Button>
              <Button size="sm" variant="secondary" leadingIcon={ArchiveIcon} disabled={disabled} onClick={() => onUpdate(open.id, { status: 'archived' })}>
                Archive
              </Button>
            </>
        }
        </div>
      </div>

      <ResponseRecords form={form} submission={open} onUpdate={(patch) => onUpdate(open.id, patch)} disabled={disabled} />
    </div>;


  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented<Filter>
          ariaLabel="Show"
          value={filter}
          onChange={setFilter}
          options={[
          { value: 'all', label: 'Inbox' },
          { value: 'new', label: 'Unread' },
          { value: 'archived', label: 'Archived' }]
          }
          size="sm" />
        
        <div className="flex items-center gap-2">
          <Button size="sm" variant={mine ? 'primary' : 'secondary'} aria-pressed={mine} onClick={() => setMine((m) => !m)}>
            Mine
          </Button>
          <Button size="sm" variant="secondary" leadingIcon={DownloadIcon} onClick={exportCsv}>
            Export CSV
          </Button>
        </div>
      </div>

      {list.length === 0 ?
      <EmptyState framed icon={InboxIcon} title={filter === 'archived' ? 'Nothing archived' : mine ? 'Nothing assigned to you' : 'No responses yet'} description={form.status === 'live' ? 'Responses appear here as soon as someone sends the form from your page.' : 'Set the form live and add a Form block to a page to start collecting responses.'} /> :

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
          <ul className="flex flex-col overflow-hidden rounded-lg border border-line bg-raised">
            {list.map((s, i) =>
          <li key={s.id} className={cn(i > 0 && 'border-t border-line')}>
                <button type="button" onClick={() => select(s.id)} aria-current={s.id === openId ? 'true' : undefined} className={cn('flex w-full items-start gap-3 px-4 py-3 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus', s.id === openId ? 'bg-action-soft' : 'hover:bg-sunken')}>
                  {s.status === 'new' ? <MailIcon size={16} className="mt-0.5 shrink-0 text-action" aria-label="Unread" /> : <MailOpenIcon size={16} className="mt-0.5 shrink-0 text-fg-subtle" aria-hidden />}
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className={cn('truncate text-label text-fg', s.status === 'new' ? 'font-semibold' : 'font-medium')}>{s.contactName || 'No name given'}</span>
                      <span className="shrink-0 text-caption tabular-nums text-fg-subtle">{when(s.createdAt)}</span>
                    </span>
                    <span className="block truncate text-caption text-fg-muted">
                      {s.payment ? `Paid ${formatNgn(s.payment.amountNgn)} · ` : ''}
                      {memberName(s.assigneeId) ? `Assigned to ${memberName(s.assigneeId)}` : 'Unassigned'}
                    </span>
                  </span>
                </button>
              </li>
          )}
          </ul>
          {wide && <section aria-label="Response" className="rounded-lg border border-line bg-raised p-5 lg:sticky lg:top-6">{detail || <p className="py-10 text-center text-caption text-fg-muted">Select a response to read it.</p>}</section>}
        </div>
      }

      {!wide &&
      <Sheet open={!!open} onClose={() => select(null)} title="Response" side="bottom" height="full">
          {detail}
        </Sheet>
      }
    </div>);

}