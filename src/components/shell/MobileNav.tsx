import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { MenuIcon, ChevronRightIcon, LogOutIcon, ShieldCheckIcon } from 'lucide-react';
import { useStaffSession } from '../../hooks/useStaffSession';
import { toast } from 'sonner';
import { useAccount } from '../../utils/account/store';
import { AccountAvatar } from '../account/AccountAvatar';
import { useAppearancePolicy } from '../../contexts/AppearancePolicyContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { navGroups, workspaceNav, mobilePrimaryNavIds } from '../../data/navigation';
import { Sheet } from '../ui/Sheet';
import { cn } from '../../utils/cn';
import { DirectionSwitcher } from './DirectionSwitcher';
import { HelpMenu } from './HelpMenu';
import { LanguagePicker } from '../ui/LanguagePicker';
import { useMarketplace } from '../../contexts/MarketplaceContext';
import { useT } from '../../contexts/LocaleContext';

export function MobileNav() {
  const [moreOpen, setMoreOpen] = useState(false);
  const navigate = useNavigate();
  const primary = workspaceNav.filter((n) => mobilePrimaryNavIds.includes(n.id));
  const market = useMarketplace();
  const rest = workspaceNav.filter((n) => !mobilePrimaryNavIds.includes(n.id) && (!n.appId || market.isActive(n.appId)));
  const canChoose = useAppearancePolicy().enabled.length > 1;
  const currentWorkspace = useWorkspace().current;
  const account = useAccount();
  const superAdmin = useStaffSession()?.role === 'lead';
  const { t } = useT();

  const itemCls = 'flex h-full w-full flex-col items-center justify-center gap-1 text-caption font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus';

  return (
    <>
      <nav aria-label="Workspace" className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-raised md:hidden">
        <ul className="grid h-16 grid-cols-4">
          {primary.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <NavLink to={item.to} end={item.to === '/app'} className={({ isActive }) => cn(itemCls, isActive ? 'text-action' : 'text-fg-subtle')}>
                  <Icon size={20} aria-hidden />
                  {t(item.label === 'My Spaces' ? 'Spaces' : item.label)}
                </NavLink>
              </li>);

          })}
          <li>
            <button type="button" onClick={() => setMoreOpen(true)} className={cn(itemCls, 'text-fg-subtle')} aria-haspopup="dialog">
              <MenuIcon size={20} aria-hidden />
              {t('More')}
            </button>
          </li>
        </ul>
      </nav>

      <Sheet open={moreOpen} onClose={() => setMoreOpen(false)} title={t('More')}>
        <div className="border-b border-line p-2">
          <button
            type="button"
            onClick={() => {
              setMoreOpen(false);
              navigate('/app/account');
            }}
            className="flex min-h-[60px] w-full items-center gap-3 rounded-md px-3 text-left hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
            
            <AccountAvatar name={account.profile.name} photo={account.profile.photo} size="md" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-body font-semibold text-fg">{account.profile.name}</span>
              <span className="block truncate text-caption text-fg-subtle">{t('Your account')} · {account.profile.email}</span>
            </span>
            <ChevronRightIcon size={16} className="text-fg-subtle" aria-hidden />
          </button>
        </div>
        <div className="border-b border-line p-2">
          <WorkspaceSwitcher onNavigate={() => setMoreOpen(false)} />
        </div>
        {canChoose &&
        <section aria-labelledby="mobile-appearance" className="border-b border-line p-2 pb-3">
            <h3 id="mobile-appearance" className="px-3 pt-2 text-label font-medium text-fg">
              {t('Workspace appearance')}
            </h3>
            <p className="px-3 pb-2 text-caption text-fg-subtle">
              Applies to everyone in {currentWorkspace.name}. Your public page keeps its own theme.
            </p>
            <DirectionSwitcher variant="list" />
          </section>
        }
        <ul className="flex flex-col p-2">
          {navGroups.flatMap((g) => {
            const items = rest.filter((n) => n.group === g.id);
            if (!items.length) return [];
            return [
            <li key={`h-${g.id}`} role="presentation" className="px-3 pb-1 pt-3 text-caption font-semibold text-fg-subtle first:pt-1">
                {t(g.label)}
              </li>,
            ...items.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                <button
                    type="button"
                    onClick={() => {
                      setMoreOpen(false);
                      navigate(item.to);
                    }}
                    className="flex min-h-[52px] w-full items-center gap-3 rounded-md px-3 text-left text-body text-fg hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                    
                  <Icon size={19} className="text-fg-subtle" aria-hidden />
                  <span className="flex-1">{t(item.label)}</span>
                  {item.batch && <span className="text-caption text-fg-subtle">Batch {item.batch}</span>}
                  <ChevronRightIcon size={16} className="text-fg-subtle" aria-hidden />
                </button>
              </li>);

            })];

          })}
          {superAdmin &&
          <li className="mt-1 border-t border-line pt-1">
              <button
              type="button"
              onClick={() => {
                setMoreOpen(false);
                navigate('/admin');
              }}
              className="flex min-h-[52px] w-full items-center gap-3 rounded-md px-3 text-left text-body text-fg hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
              
                <ShieldCheckIcon size={19} className="text-fg-subtle" aria-hidden />
                <span className="flex-1">{t('Super admin')}</span>
                <span className="text-caption text-fg-subtle">{t('KUBICU staff')}</span>
                <ChevronRightIcon size={16} className="text-fg-subtle" aria-hidden />
              </button>
            </li>
          }
        </ul>
        {/* Support is reachable on phones too (D76). */}
        <div className="border-t border-line p-2">
          <HelpMenu />
          <LanguagePicker variant="row" side="top" align="start" />
          <button
            type="button"
            onClick={() => {
              setMoreOpen(false);
              navigate('/signin');
              toast('Signed out', { description: 'Prototype — your data stays on this device.' });
            }}
            className="flex h-10 w-full items-center gap-3 rounded-md px-2 text-left text-label font-medium text-fg hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
            
            <LogOutIcon size={18} className="text-fg-muted" aria-hidden />
            {t('Sign out')}
          </button>
        </div>
      </Sheet>
    </>);

}