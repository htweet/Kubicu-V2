import React, { useState } from "react";
import { toast } from "sonner";
import { InboxIcon, LifeBuoyIcon, BoxIcon } from "lucide-react";
import { TicketTopic } from "../../types/admin";
import { ticketTopicLabels } from "../../data/featureFlags";
import { useWorkspace } from "../../contexts/WorkspaceContext";
import { useTeam } from "../../contexts/TeamContext";
import { updateAdminStore, useAdminStore } from "../../utils/admin/store";
import { uid } from "../../utils/id";
import { formatRelative } from "../../utils/format";
import { SideTip } from "../../hooks/useSideTip";
import { Menu } from "../ui/Menu";
import { Dialog } from "../ui/Dialog";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { TextInput } from "../ui/TextInput";
import { TextArea } from "../ui/TextArea";
import { SelectInput } from "../ui/SelectInput";
import { EmptyState } from "../ui/EmptyState";
import { cn } from "../../utils/cn";
/** Sidebar Help: contact KUBICU support and read replies (D75b). Requests land in Super admin → Support. */
export function HelpMenu({
  collapsed,
  tip



}: {collapsed?: boolean;tip?: SideTip;}) {
  const {
    current
  } = useWorkspace();
  const {
    me
  } = useTeam();
  const [store] = useAdminStore();
  const [dialog, setDialog] = useState<'contact' | 'requests' | null>(null);
  const [form, setForm] = useState({
    topic: 'other' as TicketTopic,
    subject: '',
    body: ''
  });
  const [tried, setTried] = useState(false);
  const mine = store.tickets.filter((t) => t.workspaceId === current.id).sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  const replies = mine.filter((t) => t.status === 'waiting').length;
  const send = () => {
    setTried(true);
    if (!form.subject.trim() || form.body.trim().length < 10) return;
    const now = new Date().toISOString();
    updateAdminStore((s) => ({
      ...s,
      tickets: [{
        id: uid('tkt'),
        number: Math.max(1000, ...s.tickets.map((t) => t.number)) + 1,
        workspaceId: current.id,
        workspaceName: current.name,
        from: me.name,
        topic: form.topic,
        subject: form.subject.trim(),
        status: 'open',
        createdAt: now,
        updatedAt: now,
        messages: [{
          id: uid('msg'),
          by: 'customer',
          name: me.name,
          text: form.body.trim(),
          at: now
        }]
      }, ...s.tickets]
    }));
    toast.success('Request sent', {
      description: 'Replies appear under Help → My requests.'
    });
    setForm({
      topic: 'other',
      subject: '',
      body: ''
    });
    setTried(false);
    setDialog('requests');
  };
  return <>
      <Menu side="top" align="start" className={collapsed ? 'mx-auto' : 'w-full'} items={[{
      id: 'contact',
      label: 'Contact support',
      icon: BoxIcon,
      onSelect: () => setDialog('contact')
    }, {
      id: 'requests',
      label: replies ? `My requests · ${replies} new` : 'My requests',
      icon: InboxIcon,
      onSelect: () => setDialog('requests')
    }]} trigger={(props) => <button type="button" {...props} aria-label="Help" onMouseEnter={collapsed ? tip?.show('Help') : undefined} onMouseLeave={tip?.hide} className={cn('relative flex h-10 items-center gap-3 rounded-md text-label transition-colors duration-150 hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus', collapsed ? 'w-10 justify-center' : 'w-full px-2')}>
            <LifeBuoyIcon size={collapsed ? 20 : 18} strokeWidth={2.1} className="shrink-0 text-fg-muted" aria-hidden />
            {!collapsed && <span className="flex-1 text-left font-medium text-fg">Help</span>}
            {replies > 0 && <span className={cn('rounded-full bg-action px-1.5 text-[11px] font-semibold leading-[18px] text-white', collapsed && 'absolute -right-0.5 -top-0.5')}>{replies}</span>}
          </button>} />

      <Dialog open={dialog === 'contact'} onClose={() => setDialog(null)} title="Contact support" description="A person on the KUBICU team replies, usually within a working day (example figure)." footer={<>
            <Button variant="secondary" onClick={() => setDialog(null)}>
              Cancel
            </Button>
            <Button onClick={send}>Send</Button>
          </>}>
        <div className="flex flex-col gap-4">
          <SelectInput<TicketTopic> id="help-topic" label="It’s about" value={form.topic} onChange={(topic) => setForm((f) => ({
          ...f,
          topic
        }))} options={(Object.keys(ticketTopicLabels) as TicketTopic[]).map((t) => ({
          value: t,
          label: ticketTopicLabels[t]
        }))} />
          <TextInput id="help-subject" label="Subject" value={form.subject} error={tried && !form.subject.trim() ? 'Add a short subject' : undefined} placeholder="e.g. My domain is stuck on Verifying" onChange={(e) => setForm((f) => ({
          ...f,
          subject: e.target.value
        }))} />
          <TextArea id="help-body" label="What’s happening?" rows={4} value={form.body} error={tried && form.body.trim().length < 10 ? 'Tell us a little more' : undefined} hint="Don’t include card numbers or passwords." onChange={(e) => setForm((f) => ({
          ...f,
          body: e.target.value
        }))} />
        </div>
      </Dialog>

      <Dialog open={dialog === 'requests'} onClose={() => setDialog(null)} title="My requests" description={`Support requests from ${current.name}.`} footer={<Button onClick={() => setDialog('contact')}>New request</Button>}>
        {mine.length === 0 ? <EmptyState icon={InboxIcon} title="No requests yet" description="Anything you send to support shows here with our replies." /> : <ul className="flex flex-col gap-4">
            {mine.map((t) => <li key={t.id} className="rounded-lg border border-line p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-label font-semibold text-fg">
                    #{t.number} · {t.subject}
                  </p>
                  <Badge tone={t.status === 'waiting' ? 'info' : t.status === 'solved' ? 'neutral' : 'warning'}>{t.status === 'waiting' ? 'Reply from KUBICU' : t.status === 'solved' ? 'Solved' : 'With support'}</Badge>
                </div>
                <ol className="mt-3 flex flex-col gap-2 border-t border-line pt-3">
                  {t.messages.filter((m) => !m.internal).map((m) => <li key={m.id} className="text-caption">
                        <span className="font-semibold text-fg">{m.by === 'staff' ? 'KUBICU support' : m.name}</span>
                        <span className="text-fg-subtle"> · {formatRelative(m.at)}</span>
                        <p className="mt-0.5 text-label text-fg-muted">{m.text}</p>
                      </li>)}
                </ol>
              </li>)}
          </ul>}
      </Dialog>
    </>;
}