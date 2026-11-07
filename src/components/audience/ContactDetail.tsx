import React, { useState } from 'react';
import { CheckIcon, LinkIcon, MessageCircleIcon, PlusIcon, Trash2Icon, XIcon } from 'lucide-react';
import { useMainLink } from '../../hooks/useMainLink';
import { toast } from 'sonner';
import type { Contact, ContactStage } from '../../types/ops';
import { useOps } from '../../contexts/OpsContext';
import { patchContact } from '../../utils/ops/ops';
import { uid } from '../../utils/id';
import { consentLabels, sourceLabels, stageLabels } from '../../data/audience';
import { formatTimestamp, whatsappLink } from '../../utils/format';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { IconButton } from '../ui/IconButton';
import { Segmented } from '../ui/Segmented';
import { TextInput } from '../ui/TextInput';
import { PhoneInput } from '../ui/PhoneInput';
import { Dialog } from '../ui/Dialog';
import { SampleTag } from '../commerce/StatusBadges';
import { cn } from '../../utils/cn';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useTeam } from '../../contexts/TeamContext';
import { AssigneeChip, AssigneeSelect } from '../team/AssigneeSelect';
import { CommentThread } from '../team/CommentThread';
import { LoyaltyPoints } from './LoyaltyPoints';
import { useT } from '../../contexts/LocaleContext';
import { opsSettingsOf } from '../../utils/ops/settings';
import { SelectInput } from '../ui/SelectInput';
import { ContactOrigin } from './ContactOrigin';

export function ConsentBadge({ consent }: { consent: Contact['consent'] }) {
  const { t } = useT();
  return <Badge tone={consent === 'subscribed' ? 'success' : consent === 'unsubscribed' ? 'danger' : 'neutral'}>{t(consentLabels[consent])}</Badge>;
}

export function ContactDetail({ contactId, onClose }: { contactId: string | null; onClose: () => void }) {
  const { data, apply } = useOps();
  const { t: tr } = useT();
  const c = data.contacts.find((x) => x.id === contactId);
  const settings = opsSettingsOf(data);
  const [tag, setTag] = useState('');
  const [note, setNote] = useState('');
  const [task, setTask] = useState('');
  const team = useTeam();
  const { mainHandle } = useMainLink();
  const [taskFor, setTaskFor] = useState<string | null>(team.me.id);
  const [confirm, setConfirm] = useState<'delete' | 'unsub' | null>(null);
  // Phones split the record into tabs instead of one long scroll.
  const [tab, setTab] = useState<'details' | 'followups' | 'activity'>('details');
  const wide = useMediaQuery('(min-width: 768px)');
  const show = (t: typeof tab) => wide || tab === t;
  if (!c) return <Sheet open={!!contactId} onClose={onClose} side="right" title="Contact not found"><p className="p-5 text-label text-fg-muted">{tr('It may have been merged or deleted.')}</p></Sheet>;

  const set = (p: Partial<Contact>, activity?: { kind: Contact['activity'][number]['kind']; label: string }) => apply((d) => patchContact(d, c.id, p, activity));

  return (
    <>
      <Sheet
        open={!!contactId}
        onClose={onClose}
        side="right"
        size="lg"
        title={c.name || c.email || c.phone}
        description={tr('Since {date}', { date: formatTimestamp(c.createdAt) })}
        footer={
          <div className="flex justify-between">
            <Button variant="tertiary" size="sm" leadingIcon={Trash2Icon} className="text-danger hover:text-danger" onClick={() => setConfirm('delete')}>
              Delete contact
            </Button>
            {c.phone && (
              <a href={whatsappLink(c.phone, `Hi ${c.name.split(' ')[0]}, `)} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-2 rounded-md bg-action px-4 text-label font-medium text-action-fg">
                <MessageCircleIcon size={16} aria-hidden /> WhatsApp
              </a>
            )}
          </div>
        }
      >
        <div className="flex flex-col gap-6 px-5 py-5">
          {!wide && (
            <Segmented<typeof tab>
              ariaLabel="Contact sections"
              value={tab}
              onChange={setTab}
              options={[
                { value: 'details', label: 'Details' },
                { value: 'followups', label: `${tr('Follow-ups')}${c.tasks.some((t) => !t.done) ? ` ${c.tasks.filter((t) => !t.done).length}` : ''}` },
                { value: 'activity', label: 'Activity' },
              ]}
            />
          )}
          {show('details') && (
          <>
          <div className="flex flex-wrap items-center gap-2">
            <ConsentBadge consent={c.consent} />
            {c.sources.map((s) => (
              <Badge key={s}>{tr(sourceLabels[s])}</Badge>
            ))}
            {c.sample && <SampleTag />}
            <LoyaltyPoints phone={c.phone} />
          </div>
          <ContactOrigin contact={c} onSave={set} />

          <div className="grid gap-4 sm:grid-cols-3">
            <TextInput id="ct-name" label="Name" value={c.name} onChange={(e) => set({ name: e.target.value })} />
            <TextInput id="ct-email" label="Email" type="email" value={c.email} onChange={(e) => set({ email: e.target.value })} />
            <PhoneInput id="ct-phone" label="Phone" value={c.phone} onChange={(phone) => set({ phone })} />
          </div>

          {/* The business's own fields (D259). */}
          {settings.contactFields.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              {settings.contactFields.map((f) => {
                const v = c.fields?.[f.id] ?? '';
                const setV = (val: string) => set({ fields: { ...(c.fields ?? {}), [f.id]: val } });
                return f.type === 'choice' ? (
                  <SelectInput<string> key={f.id} id={`ct-f-${f.id}`} label={f.label} value={v} options={[{ value: '', label: tr('Not set') }, ...f.options.map((o) => ({ value: o, label: o }))]} onChange={setV} />
                ) : (
                  <TextInput key={f.id} id={`ct-f-${f.id}`} label={f.label} optional type={f.type === 'date' ? 'date' : 'text'} inputMode={f.type === 'number' ? 'decimal' : undefined} value={v} maxLength={120} onChange={(e) => setV(f.type === 'number' ? e.target.value.replace(/[^0-9.,-]/g, '') : e.target.value)} />
                );
              })}
            </div>
          )}

          <AssigneeSelect
            id="ct-assignee"
            label="Looked after by"
            value={c.assigneeId}
            className="max-w-xs"
            onChange={(assigneeId) => {
              const who = team.data.members.find((m) => m.id === assigneeId)?.name;
              set({ assigneeId }, { kind: 'note', label: who ? `Assigned to ${who}` : 'Unassigned' });
              team.log('audience', who ? `assigned ${c.name || 'a contact'} to ${who}` : `unassigned ${c.name || 'a contact'}`, `/app/audience?contact=${c.id}`);
            }}
          />

          <section aria-labelledby="ct-consent" className="rounded-md border border-line p-4">
            <h3 id="ct-consent" className="text-label font-semibold text-fg">
              {tr('Consent')}
            </h3>
            <p className="mt-1 text-caption text-fg-muted">
              {tr(
                c.consent === 'subscribed'
                  ? 'Agreed to updates and offers. You can include them in marketing.'
                  : c.consent === 'unsubscribed'
                    ? 'Opted out. They’re excluded from every marketing message and automation. Only they can opt back in.'
                    : 'Only messages about their orders and bookings. Don’t send them marketing.',
              )}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {c.consent !== 'unsubscribed' && (
                <Button size="sm" variant="secondary" onClick={() => setConfirm('unsub')}>
                  Record an opt-out
                </Button>
              )}
              <Button
                size="sm"
                variant="tertiary"
                leadingIcon={LinkIcon}
                onClick={() => {
                  const url = `${window.location.origin}/p/${mainHandle}/preferences/${c.id}`;
                  navigator.clipboard?.writeText(url).then(
                    () => toast.success(tr('Preferences link copied'), { description: tr('Put it at the bottom of every marketing message. They can unsubscribe or opt back in themselves.') }),
                    () => toast.error(tr('Couldn’t copy'), { description: url }),
                  );
                }}
              >
                Copy their preferences link
              </Button>
            </div>
          </section>

          <div className="grid gap-6 sm:grid-cols-2">
            <section aria-labelledby="ct-stage">
              <h3 id="ct-stage" className="mb-2 text-label font-semibold text-fg">
                {tr('Stage')}
              </h3>
              <Segmented<ContactStage> ariaLabel="Stage" value={c.stage} onChange={(stage) => set({ stage }, { kind: 'stage', label: `Moved to ${stageLabels[stage]}` })} options={(Object.keys(stageLabels) as ContactStage[]).map((s) => ({ value: s, label: stageLabels[s] }))} />
            </section>
            <section aria-labelledby="ct-tags">
              <h3 id="ct-tags" className="mb-2 text-label font-semibold text-fg">
                {tr('Tags')}
              </h3>
              <div className="flex flex-wrap items-center gap-1.5">
                {c.tags.map((t) => (
                  <span key={t} className="inline-flex h-7 items-center gap-1 rounded-full bg-sunken pl-2.5 pr-1 text-caption font-medium text-fg">
                    {t}
                    <button type="button" aria-label={tr('Remove tag {tag}', { tag: t })} onClick={() => set({ tags: c.tags.filter((x) => x !== t) })} className="flex h-5 w-5 items-center justify-center rounded-full text-fg-subtle hover:text-fg">
                      <XIcon size={11} aria-hidden />
                    </button>
                  </span>
                ))}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const v = tag.trim();
                    if (!v || c.tags.includes(v)) return;
                    set({ tags: [...c.tags, v] });
                    setTag('');
                  }}
                >
                  <label htmlFor="ct-tag" className="sr-only">{tr('Add tag')}</label>
                  <input id="ct-tag" list="ct-tag-saved" value={tag} onChange={(e) => setTag(e.target.value)} placeholder={tr('+ Add tag')} className="h-7 w-28 rounded-full border border-dashed border-line-strong bg-transparent px-2.5 text-caption text-fg placeholder:text-fg-subtle focus:border-action focus:outline-none" />
                  <datalist id="ct-tag-saved">
                    {settings.savedTags.filter((t) => !c.tags.includes(t)).map((t) => (
                      <option key={t} value={t} />
                    ))}
                  </datalist>
                </form>
              </div>
              {/* Saved tags (D259): one tap, spelled the same way every time. */}
              {settings.savedTags.some((t) => !c.tags.includes(t)) && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {settings.savedTags
                    .filter((t) => !c.tags.includes(t))
                    .slice(0, 8)
                    .map((t) => (
                      <button key={t} type="button" onClick={() => set({ tags: [...c.tags, t] })} className="inline-flex h-7 items-center gap-0.5 rounded-full px-2 text-caption text-fg-subtle hover:bg-sunken hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                        <PlusIcon size={11} aria-hidden /> {t}
                      </button>
                    ))}
                </div>
              )}
            </section>
          </div>
          </>
          )}

          {show('followups') && (
          <section aria-labelledby="ct-tasks">
            <h3 id="ct-tasks" className="text-label font-semibold text-fg">
              {tr('Follow-ups')}
            </h3>
            <ul className="mt-2 flex flex-col gap-1">
              {c.tasks.map((t) => (
                <li key={t.id} className="flex items-center gap-2.5">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={t.done}
                    aria-label={tr('Done: {task}', { task: t.text })}
                    onClick={() => set({ tasks: c.tasks.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)) }, t.done ? undefined : { kind: 'task', label: `Done: ${t.text}` })}
                    className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] border', t.done ? 'border-success bg-success text-canvas' : 'border-line-strong')}
                  >
                    {t.done && <CheckIcon size={12} strokeWidth={3} aria-hidden />}
                  </button>
                  <span className={cn('flex-1 text-label', t.done ? 'text-fg-subtle line-through' : 'text-fg')}>{t.text}</span>
                  {t.assigneeId && <AssigneeChip memberId={t.assigneeId} />}
                  {t.due && <span className={cn('text-caption', !t.done && Date.parse(t.due) < Date.now() ? 'font-semibold text-danger' : 'text-fg-subtle')}>{tr('Due {date}', { date: formatTimestamp(t.due) })}</span>}
                  <IconButton icon={XIcon} size="sm" label="Remove task" onClick={() => set({ tasks: c.tasks.filter((x) => x.id !== t.id) })} />
                </li>
              ))}
            </ul>
            <form
              className="mt-2 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!task.trim()) return;
                set({ tasks: [...c.tasks, { id: uid('task'), text: task.trim(), due: new Date(Date.now() + 86400000).toISOString(), done: false, assigneeId: taskFor }] }, { kind: 'task', label: `Task added: ${task.trim()}` });
                setTask('');
              }}
            >
              <TextInput id="ct-task" label="New follow-up" placeholder={tr('e.g. Send fabric options (due tomorrow)')} value={task} fieldClassName="flex-1 [&>div:first-child]:sr-only" onChange={(e) => setTask(e.target.value)} />
              <Button type="submit" variant="secondary" leadingIcon={PlusIcon} disabled={!task.trim()}>
                Add
              </Button>
            </form>
            <AssigneeSelect id="ct-task-who" label="For" value={taskFor} onChange={setTaskFor} className="mt-2 max-w-xs" />
          </section>
          )}

          {show('activity') && (
          <section aria-labelledby="ct-act">
            <h3 id="ct-act" className="text-label font-semibold text-fg">
              {tr('Activity')}
            </h3>
            <form
              className="mt-2 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!note.trim()) return;
                set({ notes: [...c.notes, { id: uid('note'), at: new Date().toISOString(), text: note.trim() }] }, { kind: 'note', label: note.trim() });
                setNote('');
              }}
            >
              <TextInput id="ct-note" label="Add a note" placeholder={tr('Only you see notes')} value={note} fieldClassName="flex-1 [&>div:first-child]:sr-only" onChange={(e) => setNote(e.target.value)} />
              <Button type="submit" variant="secondary" disabled={!note.trim()}>
                Add note
              </Button>
            </form>
            <ol className="relative mt-4 flex flex-col gap-4 pl-6">
              <span aria-hidden className="absolute bottom-1 left-[7px] top-1 w-px bg-line" />
              {c.activity.map((a) => (
                <li key={a.id} className="relative">
                  <span aria-hidden className={cn('absolute -left-6 top-1 h-[15px] w-[15px] rounded-full border-2 bg-raised', a.kind === 'consent' ? 'border-warning' : a.kind === 'note' ? 'border-line-strong' : 'border-action')} />
                  <p className="text-label text-fg">{tr(a.label)}</p>
                  <p className="text-caption text-fg-subtle">{formatTimestamp(a.at)}</p>
                </li>
              ))}
            </ol>
          </section>
          )}

          <CommentThread subject={`contact:${c.id}`} subjectLabel={c.name || c.email || c.phone || 'a contact'} href={`/app/audience?contact=${c.id}`} area="audience" className="border-t border-line pt-6" />
        </div>
      </Sheet>

      <Dialog
        open={confirm === 'unsub'}
        onClose={() => setConfirm(null)}
        size="sm"
        title="Record an opt-out?"
        description="Use this when someone asks you to stop. They’ll be excluded from marketing and automations. You can’t re-subscribe them — only they can, through a signup form."
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                set({ consent: 'unsubscribed' }, { kind: 'consent', label: 'Opted out (recorded by you)' });
                setConfirm(null);
              }}
            >
              Record opt-out
            </Button>
          </>
        }
      />
      <Dialog
        open={confirm === 'delete'}
        onClose={() => setConfirm(null)}
        size="sm"
        title={c.name ? tr('Delete {name}?', { name: c.name }) : tr('Delete this contact?')}
        description="Their details, notes and tasks are removed. Orders and bookings keep the customer details they were placed with."
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirm(null)} data-autofocus>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (apply((d) => ({ ...d, contacts: d.contacts.filter((x) => x.id !== c.id) }))) {
                  toast(tr('Contact deleted'));
                  setConfirm(null);
                  onClose();
                }
              }}
            >
              Delete
            </Button>
          </>
        }
      />
    </>
  );
}
