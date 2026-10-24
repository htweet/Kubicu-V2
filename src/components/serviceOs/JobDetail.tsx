import React, { useState } from 'react';
import { MessageCircleIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import type { Job, JobStatus, ServiceOsData } from '../../types/serviceOs';
import { formatDay, jobLabels, jobOrder } from '../../utils/serviceOs';
import { formatNgn, formatTimestamp, whatsappLink } from '../../utils/format';
import { uid } from '../../utils/id';
import { toast } from 'sonner';
import { hasStages, newlyDue, requestStage, type StageRow } from '../../utils/milestones';
import { StageSchedule } from './StageSchedule';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { TextInput } from '../ui/TextInput';
import { TextArea } from '../ui/TextArea';
import { Segmented } from '../ui/Segmented';
import { SampleTag } from '../commerce/StatusBadges';

interface Props {
  job: Job | null;
  data: ServiceOsData;
  onOpenInvoice: (id: string) => void;
  businessName: string;
  canEdit: boolean;
  update: (fn: (d: ServiceOsData) => ServiceOsData) => void;
  onClose: () => void;
  onOpenQuote: (id: string) => void;
}

/** Track one job: where it is, what's left, and a dated log of updates (D89). */
export function JobDetail({ job, data, onOpenInvoice, businessName, canEdit, update, onClose, onOpenQuote }: Props) {
  const [newItem, setNewItem] = useState('');
  const [note, setNote] = useState('');
  if (!job) return <Sheet open={false} onClose={onClose} title="">{null}</Sheet>;

  const quote = job.quoteId ? data.quotes.find((q) => q.id === job.quoteId) : undefined;
  const staged = !!quote && hasStages(quote);

  // A change that makes a payment stage due prompts the seller to request it (D95).
  const patch = (p: Partial<Job>) => {
    let due: StageRow[] = [];
    update((d) => {
      const next = { ...d, jobs: d.jobs.map((j) => j.id === job.id ? { ...j, ...p } : j) };
      if (job.quoteId) due = newlyDue(d, next, job.quoteId);
      return next;
    });
    for (const r of due) {
      toast(`“${r.m.label}” is now due — ${formatNgn(r.amount)}`, {
        description: 'Send your client the pay link for this stage.',
        action: canEdit && job.quoteId ?
        {
          label: 'Request payment',
          onClick: () => {
            let id = '';
            update((d) => {
              const res = requestStage(d, job.quoteId!, r.m.id);
              if (!res) return d;
              id = res.invoice.id;
              return res.data;
            });
            if (id) toast.success(`“${r.m.label}” requested`, { description: 'Copy or send its pay link from Payment stages.' });
          }
        } :
        undefined
      });
    }
  };
  const log = (text: string, extra: Partial<Job> = {}) => patch({ ...extra, updates: [{ id: uid('up'), at: new Date().toISOString(), text }, ...job.updates] });
  const done = job.checklist.filter((c) => c.done).length;

  const setStatus = (status: JobStatus) => status !== job.status && log(`Moved to ${jobLabels[status]}.`, { status });
  const addItem = () => {
    const label = newItem.trim();
    if (!label) return;
    patch({ checklist: [...job.checklist, { id: uid('chk'), label, done: false }] });
    setNewItem('');
  };
  const addNote = () => {
    const text = note.trim();
    if (!text) return;
    log(text);
    setNote('');
  };
  const shareUpdate = () => {
    const latest = job.updates[0]?.text ?? jobLabels[job.status];
    window.open(whatsappLink(job.client.phone, `Hi ${job.client.name.split(' ')[0]}, an update from ${businessName} on ${job.title}: ${latest}`), '_blank', 'noopener');
  };

  return (
    <Sheet
      open
      onClose={onClose}
      side="right"
      size="lg"
      title={job.title}
      description={`For ${job.client.name} · due ${formatDay(job.dueDate)}`}
      footer={
      <div className="flex justify-end">
          <Button variant="secondary" leadingIcon={MessageCircleIcon} disabled={!job.client.phone} onClick={shareUpdate}>
            Send latest update to client
          </Button>
        </div>
      }>
      
      <div className="flex flex-col gap-7 p-5">
        <div className="flex flex-wrap items-center gap-2">
          {job.sample && <SampleTag />}
          {job.quoteId &&
          <button type="button" onClick={() => onOpenQuote(job.quoteId!)} className="text-caption font-medium text-fg-muted underline-offset-2 hover:text-fg hover:underline">
              From quote
            </button>
          }
        </div>

        <section aria-labelledby="job-status" className="flex flex-col gap-3">
          <h3 id="job-status" className="text-label font-semibold text-fg">
            Where it is
          </h3>
          <div className="scroll-quiet overflow-x-auto overflow-y-hidden">
            <Segmented<JobStatus> ariaLabel="Job status" value={job.status} onChange={(s) => canEdit && setStatus(s)} options={jobOrder.map((s) => ({ value: s, label: jobLabels[s] }))} />
          </div>
          <TextInput id="job-due" label="Due" type="date" value={job.dueDate} disabled={!canEdit} onChange={(e) => e.target.value && patch({ dueDate: e.target.value })} fieldClassName="sm:max-w-[220px]" />
        </section>

        <section aria-labelledby="job-checklist" className="flex flex-col gap-3 border-t border-line pt-6">
          <div className="flex items-baseline justify-between">
            <h3 id="job-checklist" className="text-label font-semibold text-fg">
              Checklist
            </h3>
            <span className="text-caption tabular-nums text-fg-muted">
              {done} of {job.checklist.length} done
            </span>
          </div>
          {job.checklist.length > 0 &&
          <ul className="flex flex-col divide-y divide-line">
              {job.checklist.map((c) =>
            <li key={c.id} className="flex items-center gap-3 py-1.5">
                  <label className="flex min-h-[40px] flex-1 cursor-pointer items-center gap-3 text-label text-fg">
                    <input type="checkbox" checked={c.done} disabled={!canEdit} onChange={() => patch({ checklist: job.checklist.map((x) => x.id === c.id ? { ...x, done: !x.done } : x) })} className="h-4 w-4 accent-[rgb(var(--action))]" />
                    <span className={c.done ? 'text-fg-subtle line-through' : undefined}>{c.label}</span>
                  </label>
                  <IconButton icon={Trash2Icon} label={`Remove ${c.label}`} size="sm" disabled={!canEdit} onClick={() => patch({ checklist: job.checklist.filter((x) => x.id !== c.id) })} />
                </li>
            )}
            </ul>
          }
          <form
            className="flex items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              addItem();
            }}>
            
            <TextInput id="job-new-item" label="Add a step" placeholder="e.g. Confirm venue access time" value={newItem} maxLength={80} disabled={!canEdit} onChange={(e) => setNewItem(e.target.value)} fieldClassName="flex-1" />
            <Button type="submit" variant="secondary" leadingIcon={PlusIcon} disabled={!canEdit || !newItem.trim()}>
              Add
            </Button>
          </form>
        </section>

        {staged && quote &&
        <div className="border-t border-line pt-6">
            <StageSchedule quote={quote} data={data} businessName={businessName} canEdit={canEdit} update={update} onOpenInvoice={onOpenInvoice} headingId="job-stages" />
          </div>
        }

        <section aria-labelledby="job-updates" className="flex flex-col gap-3 border-t border-line pt-6">
          <h3 id="job-updates" className="text-label font-semibold text-fg">
            Updates
          </h3>
          <TextArea id="job-note" label="Add an update" rows={2} maxLength={300} value={note} disabled={!canEdit} onChange={(e) => setNote(e.target.value)} />
          <Button variant="secondary" size="sm" disabled={!canEdit || !note.trim()} onClick={addNote} className="self-start">
            Add update
          </Button>
          <ol className="mt-1 flex flex-col gap-3 border-l border-line pl-4">
            {job.updates.map((u) =>
            <li key={u.id} className="relative">
                <span aria-hidden className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-line-strong" />
                <p className="text-label text-fg">{u.text}</p>
                <p className="text-caption text-fg-subtle">{formatTimestamp(u.at)}</p>
              </li>
            )}
          </ol>
        </section>

        <CommentThread subject={`job:${job.id}`} subjectLabel={`the “${job.title}” job`} href="/app/services/jobs" area="bookings" className="border-t border-line pt-6" />
      </div>
    </Sheet>);

}