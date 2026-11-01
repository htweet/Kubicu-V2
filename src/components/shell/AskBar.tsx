import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpIcon, ChevronDownIcon, MicIcon, PanelLeftIcon, SquareIcon } from 'lucide-react';
import { useT } from '../../contexts/LocaleContext';
import { useSpeechInput } from '../../hooks/useSpeechInput';
import { cn } from '../../utils/cn';
import { KubicuLogo } from './KubicuLogo';

const STORE_KEY = 'kubicu.askBar.minimised';
const ease = [0.23, 1, 0.32, 1] as const;

/**
 * Copilot and KUBICU AI screens have their own chat, so the bar stays out of them (D374). Sellers' published pages
 * and shared shops are the seller's own space, so buyers never see KUBICU's bar there (D431).
 */
function hiddenOn(path: string): boolean {
  return (
    path.startsWith('/p/') ||
    path.startsWith('/m/') ||
    path === '/copilot' ||
    path.startsWith('/copilot/') ||
    path.startsWith('/d/') ||
    path === '/ai' ||
    path.startsWith('/app/assistant') ||
    path.startsWith('/app/coach') ||
    path.startsWith('/app/canvas/') ||
    path.startsWith('/admin/ai'));

}

/** Lifts the bar above bars that already sit at the bottom, such as the workspace phone nav. */
function bottomOffset(path: string): string {
  if (path.startsWith('/app')) return 'bottom-[calc(76px+env(safe-area-inset-bottom))] md:bottom-5';
  return 'bottom-[calc(16px+env(safe-area-inset-bottom))] md:bottom-5';
}

/**
 * A floating "Ask me anything" bar on every page except Copilot and KUBICU AI (D374). Sending opens Copilot
 * with the question already asked. It hides while you scroll down, and the KUBICU mark tucks it into a corner.
 */
export function AskBar() {
  const { t, lang } = useT();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);
  const [scrolledAway, setScrolledAway] = useState(false);
  const [atEnd, setAtEnd] = useState(false);
  const [minimised, setMinimised] = useState(() => {
    try {
      return localStorage.getItem(STORE_KEY) === '1';
    } catch {
      return false;
    }
  });
  const input = useRef<HTMLInputElement>(null);
  const speech = useSpeechInput(lang, setText);

  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, minimised ? '1' : '0');
    } catch {

      /* private mode: remember for this visit only */}
  }, [minimised]);

  // Get out of the way while reading down a page, and at the very bottom so footers stay readable; come back on the way up.
  useEffect(() => {
    let last = window.scrollY;
    const update = () => {
      const y = window.scrollY;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight > window.innerHeight + 200;
      const nearEnd = scrollable && window.innerHeight + y >= doc.scrollHeight - 160;
      if (nearEnd) {
        setAtEnd(true);
        last = y;
        return;
      }
      setAtEnd(false);
      if (Math.abs(y - last) < 8) return;
      setScrolledAway(y > last && y > 120);
      last = y;
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [pathname]);

  // Leave room under the last line of every page so the bar never sits on top of it.
  // Workspace and staff screens are full-height app layouts that scroll inside, so extra page padding would add a stray scrollbar there.
  const shown = !hiddenOn(pathname) && !minimised && !pathname.startsWith('/app') && !pathname.startsWith('/admin');
  useEffect(() => {
    if (!shown) return;
    const prev = document.body.style.paddingBottom;
    document.body.style.paddingBottom = 'calc(88px + env(safe-area-inset-bottom))';
    return () => {
      document.body.style.paddingBottom = prev;
    };
  }, [shown]);

  if (hiddenOn(pathname)) return null;

  const ask = (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = text.trim();
    if (!q) return;
    speech.stop();
    setText('');
    navigate(`/copilot/chat?start=${encodeURIComponent(q)}`);
  };

  const tuck = () => {
    speech.stop();
    setMinimised(true);
  };

  const open = () => {
    setMinimised(false);
    requestAnimationFrame(() => input.current?.focus());
  };

  const away = (scrolledAway || atEnd) && !focused && !text && !speech.listening;
  const canSend = text.trim().length > 0;

  return (
    <div className={cn('pointer-events-none fixed inset-x-0 z-40 flex px-3 print:hidden', bottomOffset(pathname), minimised ? 'justify-end md:px-5' : 'justify-center')}>
      <AnimatePresence mode="wait" initial={false}>
        {minimised ?
        <motion.button
          key="tucked"
          type="button"
          onClick={open}
          aria-label={t('Ask KUBICU Copilot')}
          title={t('Ask KUBICU Copilot')}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: away ? 0.4 : 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.18, ease }}
          className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-line bg-raised shadow-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
          
            <KubicuLogo withWordmark={false} />
          </motion.button> :

        <motion.form
          key="bar"
          role="search"
          onSubmit={ask}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: away ? 0 : 1, y: away ? 24 : 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.22, ease }}
          className={cn('flex h-14 w-full max-w-[560px] items-center gap-1 rounded-full border border-line bg-raised pl-2 pr-2 shadow-3', away ? 'pointer-events-none' : 'pointer-events-auto')}
          aria-hidden={away || undefined}
          // While it's slid away, its controls also leave the Tab order (D429).
          {...away ? { inert: '' } : {}}>
          
            <button
            type="button"
            onClick={tuck}
            aria-label={t('Minimise')}
            title={t('Minimise')}
            className="group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors duration-150 ease-out hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
            
              <span className="transition-opacity duration-150 ease-out group-hover:opacity-0 group-focus-visible:opacity-0">
                <KubicuLogo withWordmark={false} />
              </span>
              <ChevronDownIcon size={18} aria-hidden className="absolute text-fg-muted opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100 group-focus-visible:opacity-100" />
            </button>

            <label htmlFor="kubicu-ask" className="sr-only">
              {t('Ask KUBICU Copilot')}
            </label>
            <input
            id="kubicu-ask"
            ref={input}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.currentTarget.blur();
                tuck();
              }
            }}
            placeholder={speech.listening ? t('Listening…') : t('Ask me anything')}
            autoComplete="off"
            enterKeyHint="send"
            className="h-full min-w-0 flex-1 bg-transparent px-1 text-[16px] text-fg placeholder:text-fg-subtle focus:outline-none md:text-[15px]" />
          

            {speech.supported &&
          <button
            type="button"
            onClick={speech.toggle}
            aria-label={speech.listening ? t('Stop listening') : t('Speak your question')}
            aria-pressed={speech.listening}
            title={speech.listening ? t('Stop listening') : t('Speak your question')}
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
              speech.listening ? 'bg-danger-soft text-danger' : 'text-fg hover:bg-sunken'
            )}>
            
                {speech.listening ? <SquareIcon size={14} fill="currentColor" aria-hidden /> : <MicIcon size={18} aria-hidden />}
              </button>
          }

            <button
            type="submit"
            disabled={!canSend}
            aria-label={t('Send to Copilot')}
            title={t('Send to Copilot')}
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
              canSend ? 'bg-action text-action-fg' : 'bg-sunken text-fg-subtle'
            )}>
            
              <ArrowUpIcon size={18} aria-hidden />
            </button>

            <span aria-hidden className="mx-1 h-6 w-px shrink-0 bg-line" />

            <button
            type="button"
            onClick={() => navigate('/copilot/chat')}
            aria-label={t('Open Copilot')}
            title={t('Open Copilot')}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-fg transition-colors duration-150 ease-out hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
            
              <PanelLeftIcon size={19} aria-hidden />
            </button>
          </motion.form>
        }
      </AnimatePresence>
    </div>);

}