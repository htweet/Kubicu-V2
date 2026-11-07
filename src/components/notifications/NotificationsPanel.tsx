import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellOffIcon, CheckCheckIcon, SettingsIcon } from 'lucide-react';
import type { AppNotification, NotifArea } from '../../types/notifications';
import { useNotifications } from '../../contexts/NotificationsContext';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { notifAreas } from '../../data/notificationEvents';
import { formatRelative } from '../../utils/format';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { cn } from '../../utils/cn';

/** The inbox: Needs action, then Updates; filter by area (D66). */
export function NotificationsPanel() {
  const n = useNotifications();
  const navigate = useNavigate();
  const desktop = useMediaQuery('(min-width: 768px)');
  const [area, setArea] = useState<NotifArea | 'all'>('all');

  const areas = useMemo(() => Array.from(new Set(n.items.map((i) => i.area))), [n.items]);
  const shown = area === 'all' ? n.items : n.items.filter((i) => i.area === area);
  const action = shown.filter((i) => i.kind === 'action');
  const updates = shown.filter((i) => i.kind === 'update');

  const go = (item: AppNotification) => {
    n.markRead(item);
    n.setOpen(false);
    navigate(item.href);
  };

  const list = (title: string, items: AppNotification[]) =>
    items.length > 0 && (
      <section aria-label={title} className="flex flex-col">
        <h3 className="px-5 pb-1 pt-4 text-caption font-semibold text-fg-subtle">
          {title} · {items.length}
        </h3>
        <ul>
          {items.map((item) => {
            const A = notifAreas[item.area];
            const read = n.isRead(item);
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => go(item)}
                  className="flex w-full items-start gap-3 px-5 py-3 text-left transition-colors duration-150 hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus"
                >
                  <span className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md', item.kind === 'action' ? 'bg-action-soft text-action' : 'bg-sunken text-fg-muted')}>
                    <A.icon size={16} strokeWidth={2.25} aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cn('block text-label', read ? 'text-fg-muted' : 'font-semibold text-fg')}>{item.text}</span>
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
      title="Notifications"
      description={n.unread ? `${n.unread} unread` : 'You’re all caught up'}
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
          onClick={() => {
            n.setOpen(false);
            navigate('/app/settings/notifications');
          }}
          className="inline-flex items-center gap-2 text-label font-medium text-fg-muted hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <SettingsIcon size={15} aria-hidden /> Notification settings
        </button>
      }
    >
      {areas.length > 1 && (
        <div className="scroll-quiet flex gap-1.5 overflow-x-auto overflow-y-hidden border-b border-line px-5 py-3" role="group" aria-label="Filter by area">
          {(['all', ...areas] as const).map((a) => (
            <button
              key={a}
              type="button"
              aria-pressed={area === a}
              onClick={() => setArea(a)}
              className={cn(
                'h-8 shrink-0 rounded-full border px-3 text-caption font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                area === a ? 'border-action bg-action-soft text-action' : 'border-line text-fg-muted hover:bg-sunken',
              )}
            >
              {a === 'all' ? 'All' : notifAreas[a].label}
            </button>
          ))}
        </div>
      )}
      {shown.length === 0 ? (
        <EmptyState icon={BellOffIcon} title="Nothing here" description="New orders, bookings, reviews and anything that needs you will show up here." className="py-16" />
      ) : (
        <div className="pb-4">
          {list('Needs action', action)}
          {list('Updates', updates)}
        </div>
      )}
    </Sheet>
  );
}
