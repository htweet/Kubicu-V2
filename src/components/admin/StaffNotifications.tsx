import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellIcon, BellOffIcon, CheckCheckIcon, SlidersHorizontalIcon } from 'lucide-react';
import { useStaffNotifications } from '../../contexts/StaffNotificationsContext';
import type { StaffNotif } from '../../utils/admin/staffFeed';
import { adminNavItems } from '../../data/adminNavigation';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { formatRelative } from '../../utils/format';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { Switch } from '../ui/Switch';
import { EmptyState } from '../ui/EmptyState';
import { cn } from '../../utils/cn';

const areaInfo = (id: string) => adminNavItems.find((i) => i.id === id) ?? { id, label: id, icon: BellIcon };

/** The staff bell (D168): unread count, red when something urgent is unread. */
export function StaffNotificationBell({ size = 'sm', className, onMouseEnter, onMouseLeave }: { size?: 'sm' | 'md'; className?: string; onMouseEnter?: React.MouseEventHandler<HTMLButtonElement>; onMouseLeave?: React.MouseEventHandler<HTMLButtonElement> }) {
  const n = useStaffNotifications();
  const label = n.unread ? `Staff notifications, ${n.unread} unread${n.urgentUnread ? `, ${n.urgentUnread} urgent` : ''}` : 'Staff notifications';
  return (
    <button
      type="button"
      onClick={() => n.setOpen(true)}
      aria-label={label}
      aria-haspopup="dialog"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        'relative flex shrink-0 items-center justify-center rounded-md text-fg-subtle transition-colors duration-150 hover:bg-sunken hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
        size === 'sm' ? 'h-8 w-8' : 'h-10 w-10',
        className,
      )}
    >
      <BellIcon size={size === 'sm' ? 18 : 20} strokeWidth={2.1} aria-hidden />
      {n.unread > 0 && (
        <span aria-hidden className={cn('absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none ring-2 ring-raised', n.urgentUnread ? 'bg-danger text-white' : 'bg-inverse text-fg-inverse')}>
          {n.unread > 9 ? '9+' : n.unread}
        </span>
      )}
    </button>
  );
}

type Filter = 'all' | 'urgent' | string;

/** The staff inbox (D168): urgent first, then needs action, then updates; filter by area; mute areas you don't own. */
export function StaffNotificationsPanel() {
  const n = useStaffNotifications();
  const navigate = useNavigate();
  const desktop = useMediaQuery('(min-width: 768px)');
  const [filter, setFilter] = useState<Filter>('all');
  const [tuning, setTuning] = useState(false);

  const shown = filter === 'all' ? n.items : filter === 'urgent' ? n.items.filter((i) => i.urgent) : n.items.filter((i) => i.area === filter);
  const urgent = shown.filter((i) => i.urgent);
  const action = shown.filter((i) => !i.urgent && i.kind === 'action');
  const updates = shown.filter((i) => !i.urgent && i.kind === 'update');
  const areasWithItems = Array.from(new Set(n.items.map((i) => i.area)));

  const go = (item: StaffNotif) => {
    n.markRead(item);
    n.setOpen(false);
    navigate(item.href);
  };

  const list = (title: string, items: StaffNotif[]) =>
    items.length > 0 && (
      <section aria-label={title} className="flex flex-col">
        <h3 className="px-5 pb-1 pt-4 text-caption font-semibold text-fg-subtle">
          {title} · {items.length}
        </h3>
        <ul>
          {items.map((item) => {
            const A = areaInfo(item.area);
            const read = n.isRead(item);
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => go(item)}
                  className="flex w-full items-start gap-3 px-5 py-3 text-left transition-colors duration-150 hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus"
                >
                  <span className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md', item.urgent ? 'bg-danger-soft text-danger' : item.kind === 'action' ? 'bg-action-soft text-action' : 'bg-sunken text-fg-muted')}>
                    <A.icon size={16} strokeWidth={2.25} aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cn('block text-label', read ? 'text-fg-muted' : 'font-semibold text-fg')}>
                      {item.urgent && <span className="mr-1.5 rounded-sm bg-danger-soft px-1 py-px text-meta font-semibold text-danger">Urgent</span>}
                      {item.text}
                    </span>
                    {item.detail && <span className="mt-0.5 block text-caption text-fg-muted">{item.detail}</span>}
                    <span className="mt-0.5 block text-caption text-fg-subtle">
                      {A.label} · {formatRelative(item.at)}
                    </span>
                  </span>
                  {!read && <span aria-label="Unread" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-action" />}
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    );

  return (
    <Sheet
      open={n.open}
      onClose={() => n.setOpen(false)}
      side={desktop ? 'right' : 'bottom'}
      height="full"
      title="Staff notifications"
      description={n.unread ? `${n.unread} unread${n.urgentUnread ? ` · ${n.urgentUnread} urgent` : ''}` : 'Nothing new for your role'}
      bodyClassName="p-0"
      headerActions={
        n.unread > 0 ? (
          <Button size="sm" variant="tertiary" leadingIcon={CheckCheckIcon} onClick={n.markAllRead}>
            Mark all read
          </Button>
        ) : undefined
      }
      footer={
        <button
          type="button"
          aria-expanded={tuning}
          onClick={() => setTuning((v) => !v)}
          className="inline-flex items-center gap-2 text-label font-medium text-fg-muted hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <SlidersHorizontalIcon size={15} aria-hidden /> {tuning ? 'Back to notifications' : 'Choose what you hear about'}
        </button>
      }
    >
      {tuning ? (
        <div className="flex flex-col gap-1 px-5 py-4">
          <p className="pb-2 text-caption text-fg-muted">Mute areas someone else covers. Urgent items — scam reports, overdue legal deadlines, expiring approvals, major incidents — always come through.</p>
          {n.areas.length === 0 ? (
            <p className="text-label text-fg-muted">Your role has no notification sources right now.</p>
          ) : (
            n.areas.map((a) => {
              const A = areaInfo(a);
              const on = !n.muted.includes(a);
              return (
                <div key={a} className="flex min-h-[48px] items-center gap-3 border-b border-line last:border-0">
                  <A.icon size={16} className="shrink-0 text-fg-muted" aria-hidden />
                  <span className="min-w-0 flex-1 text-label text-fg">{A.label}</span>
                  <Switch id={`staff-notif-${a}`} checked={on} onChange={() => n.toggleMuted(a)} label={`Notify me about ${A.label}`} hideLabel />
                </div>
              );
            })
          )}
        </div>
      ) : (
        <>
          {areasWithItems.length > 1 && (
            <div className="scroll-quiet flex gap-1.5 overflow-x-auto overflow-y-hidden border-b border-line px-5 py-3" role="group" aria-label="Filter by area">
              {(['all', ...(n.items.some((i) => i.urgent) ? ['urgent'] : []), ...areasWithItems] as Filter[]).map((a) => (
                <button
                  key={a}
                  type="button"
                  aria-pressed={filter === a}
                  onClick={() => setFilter(a)}
                  className={cn(
                    'h-8 shrink-0 whitespace-nowrap rounded-full border px-3 text-caption font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                    filter === a ? 'border-action bg-action-soft text-action' : 'border-line text-fg-muted hover:bg-sunken',
                  )}
                >
                  {a === 'all' ? 'All' : a === 'urgent' ? 'Urgent' : areaInfo(a).label}
                </button>
              ))}
            </div>
          )}
          {shown.length === 0 ? (
            <EmptyState icon={BellOffIcon} title="All clear" description="Reviews, reports, help requests, approvals, deadlines and incidents for your role show up here." className="py-16" />
          ) : (
            <div className="pb-4">
              {list('Urgent', urgent)}
              {list('Needs action', action)}
              {list('Updates', updates)}
            </div>
          )}
        </>
      )}
    </Sheet>
  );
}
