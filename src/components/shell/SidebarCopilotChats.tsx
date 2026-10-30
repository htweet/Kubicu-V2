import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, MessageSquareIcon, MessagesSquareIcon, PinIcon, PinOffIcon } from 'lucide-react';
import type { CopilotSession } from '../../types/copilot';
import type { SideTip } from '../../hooks/useSideTip';
import { useCopilotChats } from '../../hooks/useCopilotChats';
import { useT } from '../../contexts/LocaleContext';
import { sessionTitle } from '../../utils/copilot/store';
import { SidebarItem, SidebarGroupLabel } from './SidebarItem';

/** How many chats Recent shows before “See all chats”. */
const RECENT_LIMIT = 5;

export const copilotChatPath = (id: string) => `/copilot/chat?c=${encodeURIComponent(id)}`;
export const copilotAllChatsPath = '/copilot/chat?view=chats';

/** Pinned and recent Copilot chats, under the last sidebar menu item (D284). A pinned chat moves from Recent to Pinned. */
export function SidebarCopilotChats({ collapsed, tip }: {collapsed: boolean;tip: SideTip;}) {
  const { t } = useT();
  const { all, pinned, recent, togglePin } = useCopilotChats();

  // The narrow rail has no room for chat names — one icon opens the full list.
  if (collapsed)
  return (
    <div>
        <SidebarGroupLabel collapsed>Copilot</SidebarGroupLabel>
        <SidebarItem to={copilotAllChatsPath} label="Copilot chats" icon={MessagesSquareIcon} collapsed tip={tip} />
      </div>);


  const shown = recent.slice(0, RECENT_LIMIT);

  return (
    <section aria-labelledby="sidebar-copilot" className="mt-2 border-t border-line pt-4">
      <h2 id="sidebar-copilot" className="sr-only">
        {t('Copilot chats')}
      </h2>

      {all.length === 0 ?
      <div className="px-2.5">
          <p className="text-caption font-semibold text-fg-subtle">Copilot</p>
          <p className="mt-1 text-caption text-fg-subtle">{t('Your Copilot chats show here. Pin the ones you come back to.')}</p>
          <Link to="/copilot/chat" className="mt-2 inline-flex items-center gap-1 rounded-sm text-caption font-semibold text-action hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
            {t('Start a chat')} <ArrowRightIcon size={12} aria-hidden />
          </Link>
        </div> :

      <div className="flex flex-col gap-4">
          {pinned.length > 0 &&
        <div>
              <SidebarGroupLabel>{t('Pinned')}</SidebarGroupLabel>
              <ul className="flex flex-col gap-0.5" aria-label={t('Pinned')}>
                {pinned.map((s) =>
            <ChatRow key={s.id} session={s} pinned onTogglePin={() => togglePin(s.id)} />
            )}
              </ul>
            </div>
        }

          <div>
            {shown.length > 0 &&
          <>
                <SidebarGroupLabel>{t('Recent')}</SidebarGroupLabel>
                <ul className="flex flex-col gap-0.5" aria-label={t('Recent')}>
                  {shown.map((s) =>
              <ChatRow key={s.id} session={s} pinned={false} onTogglePin={() => togglePin(s.id)} />
              )}
                </ul>
              </>
          }
            <Link
            to={copilotAllChatsPath}
            className="mt-1 flex h-8 items-center gap-1.5 rounded-md px-2.5 text-caption font-semibold text-fg-muted transition-colors duration-150 hover:bg-sunken hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
            
              <span className="min-w-0 flex-1 truncate">{t('See all chats')}</span>
              <span className="text-meta font-medium text-fg-subtle">{all.length}</span>
              <ArrowRightIcon size={13} aria-hidden />
            </Link>
          </div>
        </div>
      }
    </section>);

}

function ChatRow({ session, pinned, onTogglePin }: {session: CopilotSession;pinned: boolean;onTogglePin: () => void;}) {
  const { t } = useT();
  const raw = sessionTitle(session);
  const title = raw === 'New chat' ? t('New chat') : raw;
  const Icon = pinned ? PinIcon : MessageSquareIcon;
  return (
    <li className="group/chat relative">
      <Link
        to={copilotChatPath(session.id)}
        title={title}
        className="flex h-9 items-center gap-3 rounded-md pl-2.5 pr-9 text-label font-medium text-fg-muted transition-colors duration-150 hover:bg-sunken hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
        
        <Icon size={16} strokeWidth={2.1} className="shrink-0 text-fg-subtle transition-colors duration-150 group-hover/chat:text-fg-muted" aria-hidden />
        <span className="min-w-0 flex-1 truncate">{title}</span>
      </Link>
      <button
        type="button"
        onClick={onTogglePin}
        aria-label={pinned ? t('Unpin “{name}”', { name: title }) : t('Pin “{name}”', { name: title })}
        aria-pressed={pinned}
        className="absolute right-1 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-fg-subtle opacity-0 transition-opacity duration-150 hover:bg-canvas hover:text-fg focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus group-hover/chat:opacity-100">
        
        {pinned ? <PinOffIcon size={14} aria-hidden /> : <PinIcon size={14} aria-hidden />}
      </button>
    </li>);

}