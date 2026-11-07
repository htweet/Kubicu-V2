import React from 'react';
import { BellIcon } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationsContext';
import { cn } from '../../utils/cn';

interface Props {
  size?: 'sm' | 'md';
  className?: string;
  onMouseEnter?: React.MouseEventHandler<HTMLButtonElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLButtonElement>;
  onFocus?: React.FocusEventHandler<HTMLButtonElement>;
  onBlur?: React.FocusEventHandler<HTMLButtonElement>;
}

/** Opens the notifications inbox; shows the unread count. */
export function NotificationBell({ size = 'sm', className, ...handlers }: Props) {
  const { unread, setOpen } = useNotifications();
  const label = unread ? `Notifications, ${unread} unread` : 'Notifications';
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label={label}
      aria-haspopup="dialog"
      {...handlers}
      className={cn(
        'relative flex items-center justify-center rounded-md text-fg-subtle transition-colors duration-150 hover:bg-sunken hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
        size === 'sm' ? 'h-8 w-8' : 'h-10 w-10',
        className,
      )}
    >
      <BellIcon size={size === 'sm' ? 18 : 20} strokeWidth={2.1} aria-hidden />
      {unread > 0 && (
        <span aria-hidden className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold leading-none text-white ring-2 ring-raised">
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </button>
  );
}
