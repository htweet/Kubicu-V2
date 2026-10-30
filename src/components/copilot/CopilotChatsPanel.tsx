import React, { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { MessageSquareIcon, PinIcon, PinOffIcon, PlusIcon, SearchIcon, Trash2Icon, XIcon } from 'lucide-react';
import type { CopilotSession } from '../../types/copilot';
import { useCopilotChats } from '../../hooks/useCopilotChats';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useT } from '../../contexts/LocaleContext';
import { sessionTitle } from '../../utils/copilot/store';
import { formatRelative } from '../../utils/format';
import { cn } from '../../utils/cn';

const ease = [0.23, 1, 0.32, 1] as const;

interface Props {
  open: boolean;
  onClose: () => void;
  activeId: string;
  onOpenChat: (id: string) => void;
  onNewChat: () => void;
}

/** Every Copilot chat on this device: pinned first, then newest. Open, pin or delete from here. Translated in D339. */
export function CopilotChatsPanel({ open, onClose, activeId, onOpenChat, onNewChat }: Props) {
  const { t: tr } = useT();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useFocusTrap(panelRef, open, () => onCloseRef.current());
  const reduce = useReducedMotion();
  const { pinned, recent, all, togglePin, remove } = useCopilotChats();
  const [query, setQuery] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const match = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (s: CopilotSession) => !q || sessionTitle(s).toLowerCase().includes(q) || s.messages.some((m) => m.from === 'user' && m.text.toLowerCase().includes(q));
  }, [query]);
  const pinnedShown = pinned.filter(match);
  const recentShown = recent.filter(match);

  const onDelete = (id: string) => {
    remove(id);
    setConfirmId(null);
    if (id === activeId) onNewChat();
  };

  return (
    <AnimatePresence>
      {open &&
      <div className="fixed inset-0 z-40">
          <motion.div aria-hidden className="absolute inset-0 bg-black/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, ease }} onClick={onClose} />
          <motion.div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="copilot-chats-title"
          className="absolute inset-y-0 left-0 flex w-full max-w-[380px] flex-col border-r border-line bg-canvas shadow-lg"
          initial={reduce ? { opacity: 0 } : { x: -24, opacity: 0 }}
          animate={reduce ? { opacity: 1 } : { x: 0, opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { x: -24, opacity: 0 }}
          transition={{ duration: 0.22, ease }}>
          
            <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-line px-4">
              <h2 id="copilot-chats-title" className="text-label font-semibold text-fg">
                {tr('All chats')} <span className="font-normal text-fg-subtle">· {all.length}</span>
              </h2>
              <div className="flex items-center gap-1">
                <button
                type="button"
                onClick={() => {
                  onNewChat();
                  onClose();
                }}
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-action px-3 text-label font-semibold text-action-fg transition-colors duration-150 hover:bg-action-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                
                  <PlusIcon size={15} aria-hidden /> {tr('New chat')}
                </button>
                <button type="button" onClick={onClose} aria-label={tr('Close chats')} className="flex h-9 w-9 items-center justify-center rounded-full text-fg-muted transition-colors duration-150 hover:bg-sunken hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                  <XIcon size={18} aria-hidden />
                </button>
              </div>
            </div>

            {all.length > 0 &&
          <div className="shrink-0 px-4 pt-4">
                <label htmlFor="copilot-chat-search" className="sr-only">
                  {tr('Search chats')}
                </label>
                <div className="flex h-10 items-center gap-2 rounded-md border border-line-strong bg-field px-3 focus-within:ring-2 focus-within:ring-focus">
                  <SearchIcon size={16} className="shrink-0 text-fg-subtle" aria-hidden />
                  <input id="copilot-chat-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={tr('Search chats')} className="min-w-0 flex-1 bg-transparent text-label text-fg placeholder:text-fg-subtle focus:outline-none" />
                </div>
              </div>
          }

            <div className="min-h-0 flex-1 overflow-y-auto px-2 py-4">
              {all.length === 0 ?
            <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
                  <MessageSquareIcon size={22} className="text-fg-subtle" aria-hidden />
                  <p className="text-label font-semibold text-fg">{tr('No chats yet')}</p>
                  <p className="text-caption text-fg-muted">{tr('Chats you start appear here. Pin the ones you come back to and they’ll stay at the top — and in your workspace sidebar.')}</p>
                </div> :
            pinnedShown.length + recentShown.length === 0 ?
            <p className="px-4 py-8 text-center text-caption text-fg-muted">{tr('No chats match “{q}”.', { q: query.trim() })}</p> :

            <div className="flex flex-col gap-5">
                  {pinnedShown.length > 0 &&
              <ChatGroup label={tr('Pinned')}>
                      {pinnedShown.map((s) =>
                <Row key={s.id} s={s} pinned active={s.id === activeId} confirming={confirmId === s.id} onOpen={() => onOpenChat(s.id)} onPin={() => togglePin(s.id)} onAskDelete={() => setConfirmId(s.id)} onCancelDelete={() => setConfirmId(null)} onDelete={() => onDelete(s.id)} />
                )}
                    </ChatGroup>
              }
                  {recentShown.length > 0 &&
              <ChatGroup label={tr(pinnedShown.length ? 'Everything else' : 'Recent')}>
                      {recentShown.map((s) =>
                <Row key={s.id} s={s} pinned={false} active={s.id === activeId} confirming={confirmId === s.id} onOpen={() => onOpenChat(s.id)} onPin={() => togglePin(s.id)} onAskDelete={() => setConfirmId(s.id)} onCancelDelete={() => setConfirmId(null)} onDelete={() => onDelete(s.id)} />
                )}
                    </ChatGroup>
              }
                </div>
            }
            </div>
            <p className="shrink-0 border-t border-line px-4 py-3 text-caption text-fg-subtle">{tr('Chats are kept in this browser. Pinned chats are never cleared to make space.')}</p>
          </motion.div>
        </div>
      }
    </AnimatePresence>);

}

function ChatGroup({ label, children }: {label: string;children: React.ReactNode;}) {
  return (
    <section>
      <h3 className="mb-1 px-2 text-caption font-semibold text-fg-subtle">{label}</h3>
      <ul className="flex flex-col gap-0.5">{children}</ul>
    </section>);

}

interface RowProps {
  s: CopilotSession;
  pinned: boolean;
  active: boolean;
  confirming: boolean;
  onOpen: () => void;
  onPin: () => void;
  onAskDelete: () => void;
  onCancelDelete: () => void;
  onDelete: () => void;
}

function Row({ s, pinned, active, confirming, onOpen, onPin, onAskDelete, onCancelDelete, onDelete }: RowProps) {
  const { t: tr } = useT();
  const title = sessionTitle(s);
  if (confirming)
  return (
    <li className="flex items-center gap-2 rounded-md bg-danger-soft px-2 py-2">
        <p className="min-w-0 flex-1 truncate text-label text-fg">{tr('Delete “{title}”?', { title })}</p>
        <button type="button" onClick={onDelete} className="h-8 whitespace-nowrap rounded-full bg-danger px-3 text-caption font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
          {tr('Delete')}
        </button>
        <button type="button" autoFocus onClick={onCancelDelete} className="h-8 whitespace-nowrap rounded-full px-3 text-caption font-medium text-fg-muted hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
          {tr('Keep')}
        </button>
      </li>);

  return (
    <li className={cn('group/row relative rounded-md transition-colors duration-150', active ? 'bg-raised ring-1 ring-line' : 'hover:bg-sunken')}>
      <button type="button" onClick={onOpen} aria-current={active ? 'true' : undefined} className="flex w-full items-start gap-3 rounded-md py-2.5 pl-2 pr-20 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
        {pinned ? <PinIcon size={16} className="mt-0.5 shrink-0 text-action" aria-hidden /> : <MessageSquareIcon size={16} className="mt-0.5 shrink-0 text-fg-subtle" aria-hidden />}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-label font-medium text-fg">{title}</span>
          <span className="block truncate text-caption text-fg-subtle">
            {tr(active ? 'Open now' : s.draftId ? 'Draft made' : 'In progress')} · {formatRelative(s.updatedAt)}
          </span>
        </span>
      </button>
      <div className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-0.5 opacity-100 transition-opacity duration-150 md:opacity-0 md:focus-within:opacity-100 md:group-hover/row:opacity-100">
        <button type="button" onClick={onPin} aria-pressed={pinned} aria-label={tr(pinned ? 'Unpin “{title}”' : 'Pin “{title}”', { title })} className="flex h-8 w-8 items-center justify-center rounded-md text-fg-subtle transition-colors duration-150 hover:bg-canvas hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
          {pinned ? <PinOffIcon size={15} aria-hidden /> : <PinIcon size={15} aria-hidden />}
        </button>
        <button type="button" onClick={onAskDelete} aria-label={tr('Delete “{title}”', { title })} className="flex h-8 w-8 items-center justify-center rounded-md text-fg-subtle transition-colors duration-150 hover:bg-canvas hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
          <Trash2Icon size={15} aria-hidden />
        </button>
      </div>
    </li>);

}