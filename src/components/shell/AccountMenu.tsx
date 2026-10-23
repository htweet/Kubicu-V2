import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ChevronsUpDownIcon, LogOutIcon, ShieldCheckIcon, SlidersHorizontalIcon, UserIcon, BuildingIcon } from 'lucide-react';
import { useAccount } from '../../utils/account/store';
import { SideTip } from '../../hooks/useSideTip';
import { Menu } from '../ui/Menu';
import { AccountAvatar } from '../account/AccountAvatar';
import { cn } from '../../utils/cn';

/** Sidebar footer: who's signed in, their account, and sign out (D80). */
export function AccountMenu({ collapsed, tip }: {collapsed?: boolean;tip?: SideTip;}) {
  const account = useAccount();
  const navigate = useNavigate();
  const p = account.profile;

  return (
    <Menu
      side="top"
      align="start"
      className={collapsed ? 'mx-auto' : 'w-full'}
      header={
      <div className="min-w-0">
          <p className="truncate text-label font-semibold text-fg">{p.name}</p>
          <p className="truncate text-caption text-fg-subtle">{p.email}</p>
        </div>
      }
      items={[
      { id: 'profile', label: 'Your account', icon: UserIcon, onSelect: () => navigate('/app/account') },
      { id: 'security', label: 'Sign-in & security', icon: ShieldCheckIcon, onSelect: () => navigate('/app/account/security') },
      { id: 'prefs', label: 'Preferences', icon: SlidersHorizontalIcon, onSelect: () => navigate('/app/account/preferences') },
      { id: 'ws', label: 'Your workspaces', icon: BuildingIcon, onSelect: () => navigate('/app/account/workspaces') },
      {
        id: 'signout',
        label: 'Sign out',
        icon: LogOutIcon,
        onSelect: () => {
          navigate('/signin');
          toast('Signed out', { description: 'Prototype — your data stays on this device.' });
        }
      }]
      }
      trigger={(props) =>
      <button
        type="button"
        {...props}
        aria-label={`Account: ${p.name}`}
        onMouseEnter={collapsed ? tip?.show(p.name) : undefined}
        onMouseLeave={tip?.hide}
        className={cn('flex items-center gap-3 rounded-md text-left transition-colors duration-150 hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus', collapsed ? 'h-10 w-10 justify-center' : 'h-12 w-full px-2')}>
        
          <AccountAvatar name={p.name} photo={p.photo} size="sm" />
          {!collapsed &&
        <>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-label font-semibold text-fg">{p.displayName || p.name}</span>
                <span className="block truncate text-caption text-fg-subtle">{p.email}</span>
              </span>
              <ChevronsUpDownIcon size={15} className="shrink-0 text-fg-subtle" aria-hidden />
            </>
        }
        </button>
      } />);


}