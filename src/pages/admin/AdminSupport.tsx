import React, { useState } from 'react';
import { toast } from 'sonner';
import { LifeBuoyIcon, MegaphoneIcon, PlusIcon } from 'lucide-react';
import type { Announcement, AnnouncementTone, SupportTicket, TicketStatus } from '../../types/admin';
import type { WorkspacePlan } from '../../types/plan';
import { ticketTopicLabels } from '../../data/featureFlags';
import { planOrder, plans } from '../../data/plans';
import { useT } from '../../contexts/LocaleContext';
import { staffActor, staffReplyName, audit, useAdminStore } from '../../utils/admin/store';
import { uid } from '../../utils/id';
import { formatRelative, formatTimestamp } from '../../utils/format';
import { PageHeader } from '../../components/shell/PageHeader';
import { Tabs } from '../../components/ui/Tabs';
import { Badge, type BadgeTone } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Sheet } from '../../components/ui/Sheet';
import { Dialog } from '../../components/ui/Dialog';
import { TextArea } from '../../components/ui/TextArea';
import { TextInput } from '../../components/ui/TextInput';
import { SelectInput } from '../../components/ui/SelectInput';
import { Switch } from '../../components/ui/Switch';
import { Segmented } from '../../components/ui/Segmented';
import { EmptyState } from '../../components/ui/EmptyState';
import { SampleTag } from '../../components/commerce/StatusBadges';
import { cn } from '../../utils/cn';

type Tab = 'open' | 'waiting' | 'solved' | 'announcements';
const statusTone: Record<TicketStatus, BadgeTone> = { open: 'info', waiting: 'warning', solved: 'neutral' };
const statusLabel: Record<TicketStatus, string> = { open: 'Needs reply', waiting: 'Waiting on customer', solved: 'Solved' };

const blankAnnouncement = { title: '', body: '', tone: 'info' as AnnouncementTone, audience: 'all' as 'all' | WorkspacePlan };

/**
 * Super admin → Support & announcements: tickets from the in-app Help menu, and banners for workspaces (D75b).
 * Follows the staff console language (D500). Ticket messages, announcement text and audit entries stay as written.
 */
export function AdminSupport() {
  const { t: tr } = useT();
  const [store, setStore] = useAdminStore();
  const [tab, setTab] = useState<Tab>('open');
  const [openId, setOpenId] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [internal, setInternal] = useState(false);
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState(blankAnnouncement);
  const [tried, setTried] = useState(false);
  const ticket = store.tickets.find((t) => t.id === openId) ?? null;
  const count = (s: TicketStatus) => store.tickets.filter((t) => t.status === s).length;
  const tickets = tab === 'announcements' ? [] : store.tickets.filter((t) => t.status === tab).sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  const topic = (t: SupportTicket) => tr(ticketTopicLabels[t.topic]);
  const planOnly = (p: WorkspacePlan) => tr('{plan} only', { plan: tr(plans[p].name) });

  const patchTicket = (id: string, fn: (t: SupportTicket) => SupportTicket) => setStore((s) => ({ ...s, tickets: s.tickets.map((t) => (t.id === id ? fn(t) : t)) }));

  const send = (status: TicketStatus) => {
    if (!ticket) return;
    const text = reply.trim();
    const now = new Date().toISOString();
    patchTicket(ticket.id, (t) => ({
      ...t,
      status: internal ? t.status : status,
      updatedAt: now,
      messages: text ? [...t.messages, { id: uid('msg'), by: 'staff', name: internal ? staffActor() : staffReplyName(), text, at: now, internal }] : t.messages,
    }));
    setReply('');
    toast.success(internal ? tr('Note added') : status === 'solved' ? tr('Request #{number} solved', { number: ticket.number }) : tr('Reply sent'), {
      description: internal ? tr('Only staff can see it.') : tr('The customer sees it under Help → My requests. Email is a preview only.'),
    });
  };

  const publish = () => {
    setTried(true);
    if (!draft.title.trim() || !draft.body.trim()) return;
    const a: Announcement = { id: uid('ann'), ...draft, title: draft.title.trim(), body: draft.body.trim(), active: true, createdAt: new Date().toISOString() };
    setStore((s) => audit({ ...s, announcements: [a, ...s.announcements] }, { area: 'announcements', action: 'Published announcement', target: a.title, reason: `Audience: ${a.audience === 'all' ? 'everyone' : plans[a.audience].name}` }));
    toast.success(tr('Announcement live'), { description: tr('It shows as a banner at the top of the app for that audience.') });
    setComposing(false);
    setDraft(blankAnnouncement);
    setTried(false);
  };

  const setActive = (a: Announcement, active: boolean) =>
    setStore((s) => audit({ ...s, announcements: s.announcements.map((x) => (x.id === a.id ? { ...x, active } : x)) }, { area: 'announcements', action: active ? 'Turned announcement on' : 'Turned announcement off', target: a.title, reason: '—' }));

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 md:px-10 md:py-12">
      <PageHeader
        title="Support & announcements"
        description="Requests from the Help menu in the app, and banners you show to workspaces."
        actions={
          <Button leadingIcon={PlusIcon} onClick={() => setComposing(true)}>
            {tr('New announcement')}
          </Button>
        }
      />

      <div className="mt-8">
        <Tabs<Tab>
          idPrefix="sup"
          ariaLabel={tr('Support')}
          value={tab}
          onChange={setTab}
          items={[
            { id: 'open', label: tr('Needs reply'), badge: count('open') || undefined },
            { id: 'waiting', label: tr('Waiting'), badge: count('waiting') || undefined },
            { id: 'solved', label: tr('Solved') },
            { id: 'announcements', label: tr('Announcements'), badge: store.announcements.filter((a) => a.active).length || undefined },
          ]}
        />
      </div>

      <div className="mt-6" role="tabpanel" id={`sup-panel-${tab}`} aria-labelledby={`sup-tab-${tab}`}>
        {tab === 'announcements' ? (
          store.announcements.length === 0 ? (
            <EmptyState
              icon={MegaphoneIcon}
              title={tr('No announcements')}
              description={tr('Tell workspaces about maintenance, a new feature or a policy change. It shows as a banner in the app.')}
              action={<Button onClick={() => setComposing(true)}>{tr('New announcement')}</Button>}
            />
          ) : (
            <ul className="flex flex-col divide-y divide-line border-y border-line">
              {store.announcements.map((a) => (
                <li key={a.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-fg">{a.title}</span>
                      <Badge tone={a.tone === 'warning' ? 'warning' : 'info'}>{a.tone === 'warning' ? tr('Warning') : tr('Info')}</Badge>
                    </span>
                    <span className="mt-0.5 block text-caption text-fg-subtle">
                      {a.audience === 'all' ? tr('Everyone') : planOnly(a.audience)} · {formatTimestamp(a.createdAt)}
                    </span>
                  </span>
                  <Switch id={`ann-${a.id}`} label={a.active ? tr('Showing') : tr('Hidden')} checked={a.active} onChange={(v) => setActive(a, v)} />
                </li>
              ))}
            </ul>
          )
        ) : tickets.length === 0 ? (
          <EmptyState icon={LifeBuoyIcon} title={tr('Nothing here')} description={tr('Workspaces send requests from Help → Contact support in the app.')} />
        ) : (
          <ul className="flex flex-col divide-y divide-line border-y border-line">
            {tickets.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => {
                    setOpenId(t.id);
                    setReply('');
                    setInternal(false);
                  }}
                  className="flex w-full flex-col gap-1 py-4 text-left transition-colors duration-150 hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus sm:flex-row sm:items-center sm:gap-4 sm:px-2"
                >
                  <span className="w-14 shrink-0 font-mono text-caption text-fg-subtle">#{t.number}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-fg">{t.subject}</span>
                      {t.sample && <SampleTag />}
                    </span>
                    <span className="mt-0.5 block truncate text-caption text-fg-subtle">
                      {t.workspaceName} · {t.from} · {topic(t)}
                    </span>
                  </span>
                  <span className="shrink-0 text-caption text-fg-subtle">{formatRelative(t.updatedAt)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Sheet
        open={!!ticket}
        onClose={() => setOpenId(null)}
        side="right"
        size="lg"
        title={ticket ? `#${ticket.number} · ${ticket.subject}` : tr('Request')}
        description={ticket ? `${ticket.workspaceName} · ${ticket.from} · ${topic(ticket)}` : undefined}
        headerActions={ticket ? <Badge tone={statusTone[ticket.status]}>{tr(statusLabel[ticket.status])}</Badge> : undefined}
        footer={
          ticket ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <Segmented<'reply' | 'note'>
                  ariaLabel={tr('Message type')}
                  value={internal ? 'note' : 'reply'}
                  onChange={(v) => setInternal(v === 'note')}
                  options={[
                    { value: 'reply', label: tr('Reply') },
                    { value: 'note', label: tr('Internal note') },
                  ]}
                />
              </div>
              <TextArea id="sup-reply" label={internal ? tr('Note for staff') : tr('Reply to customer')} rows={3} value={reply} onChange={(e) => setReply(e.target.value)} />
              <div className="flex flex-wrap justify-end gap-2">
                {internal ? (
                  <Button disabled={!reply.trim()} onClick={() => send(ticket.status)}>
                    {tr('Add note')}
                  </Button>
                ) : (
                  <>
                    <Button variant="secondary" onClick={() => send('solved')}>
                      {reply.trim() ? tr('Send and solve') : tr('Mark solved')}
                    </Button>
                    <Button disabled={!reply.trim()} onClick={() => send('waiting')}>
                      {tr('Send reply')}
                    </Button>
                  </>
                )}
              </div>
            </div>
          ) : undefined
        }
      >
        {ticket && (
          <ol className="flex flex-col gap-4">
            {ticket.messages.map((m) => (
              <li key={m.id} className={cn('flex flex-col gap-1', m.by === 'staff' && 'items-end')}>
                <div
                  className={cn(
                    'max-w-[85%] rounded-lg px-4 py-3 text-label',
                    m.internal ? 'border border-dashed border-warning bg-warning-soft text-fg' : m.by === 'staff' ? 'bg-action-soft text-fg' : 'border border-line bg-raised text-fg',
                  )}
                >
                  {m.internal && <span className="mb-1 block text-caption font-semibold text-warning">{tr('Internal note')}</span>}
                  {m.text}
                </div>
                <span className="text-caption text-fg-subtle">
                  {m.name} · {formatRelative(m.at)}
                </span>
              </li>
            ))}
          </ol>
        )}
      </Sheet>

      <Dialog
        open={composing}
        onClose={() => setComposing(false)}
        title={tr('New announcement')}
        description={tr('Shows as a banner at the top of the app. Owners can dismiss it on their own device.')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setComposing(false)}>
              {tr('Cancel')}
            </Button>
            <Button onClick={publish}>{tr('Publish')}</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <TextInput
            id="ann-title"
            label={tr('Title')}
            value={draft.title}
            error={tried && !draft.title.trim() ? tr('Add a title') : undefined}
            placeholder={tr('e.g. Scheduled maintenance on Sunday')}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          />
          <TextArea
            id="ann-body"
            label={tr('Message')}
            rows={3}
            value={draft.body}
            error={tried && !draft.body.trim() ? tr('Add a message') : undefined}
            placeholder={tr('e.g. Checkout pauses from 2–3am. Your pages stay up.')}
            onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectInput<AnnouncementTone>
              id="ann-tone"
              label={tr('Tone')}
              value={draft.tone}
              onChange={(tone) => setDraft((d) => ({ ...d, tone }))}
              options={[
                { value: 'info', label: tr('Info') },
                { value: 'warning', label: tr('Warning') },
              ]}
            />
            <SelectInput<'all' | WorkspacePlan>
              id="ann-aud"
              label={tr('Who sees it')}
              value={draft.audience}
              onChange={(audience) => setDraft((d) => ({ ...d, audience }))}
              options={[{ value: 'all', label: tr('Every workspace') }, ...planOrder.map((p) => ({ value: p, label: planOnly(p) }))]}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
