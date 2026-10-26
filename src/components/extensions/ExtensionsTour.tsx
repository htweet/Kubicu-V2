import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2Icon, PuzzleIcon, ShieldCheckIcon, Trash2Icon, XIcon } from 'lucide-react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useTeam } from '../../contexts/TeamContext';
import { useMarketplace } from '../../contexts/MarketplaceContext';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { extensionById } from '../../data/extensions';
import { workspaceNav } from '../../data/navigation';
import { Button } from '../ui/Button';
import { ExtensionIcon } from './ExtensionIcon';
import { cn } from '../../utils/cn';

type Step = 'intro' | 'pick' | 'done';

/** Free KUBICU apps offered on the first visit, most broadly useful first. */
const SUGGESTED = ['domains', 'bookings', 'automations'];
const tourKey = (workspaceId: string) => `kubicu.extensionsTour.${workspaceId}`;
const EASE = [0.23, 1, 0.32, 1] as const;

function readDone(workspaceId: string): boolean {
  try {
    return window.localStorage.getItem(tourKey(workspaceId)) === 'done';
  } catch {
    return true;
  }
}

/**
 * First visit to a workspace (D87): spotlights Extensions, then asks the person to install one
 * suggested app so they learn how installing — and removing — works. Optional: the close button,
 * Escape or "Skip for now" ends it for good on this workspace.
 */
export function ExtensionsTour() {
  const { current } = useWorkspace();
  const can = useTeam().can('extensions.manage');
  const market = useMarketplace();
  const navigate = useNavigate();
  const desktop = useMediaQuery('(min-width: 768px)');
  const [done, setDone] = useState(() => readDone(current.id));
  const [step, setStep] = useState<Step>('intro');
  const [installed, setInstalled] = useState<string | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const options = SUGGESTED.filter((id) => !market.data.installed[id]);
  const [choice, setChoice] = useState(options[0] ?? SUGGESTED[0]);

  useEffect(() => {
    setDone(readDone(current.id));
    setStep('intro');
    setInstalled(null);
  }, [current.id]);

  const open = !done && can.allowed;
  useFocusTrap(panelRef, open);

  // Each step is a new card; move focus onto it once the previous one has left.
  useEffect(() => {
    if (!open || step === 'intro') return;
    const t = window.setTimeout(() => {
      const root = panelRef.current;
      (root?.querySelector<HTMLElement>('[data-autofocus]') ?? root)?.focus({ preventScroll: true });
    }, 260);
    return () => window.clearTimeout(t);
  }, [open, step]);

  // Follow the Extensions row in the sidebar (it moves when the sidebar collapses or apps are added).
  useLayoutEffect(() => {
    if (!open || step !== 'intro' || !desktop) return setRect(null);
    const measure = () => {
      const r = document.querySelector('[data-tour="nav-extensions"]')?.getBoundingClientRect();
      setRect(r && r.width > 0 ? r : null);
    };
    measure();
    const t = window.setInterval(measure, 300);
    window.addEventListener('resize', measure);
    return () => {
      window.clearInterval(t);
      window.removeEventListener('resize', measure);
    };
  }, [open, step, desktop]);

  // Escape closes the tour, like any dialog.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      try {
        window.localStorage.setItem(tourKey(current.id), 'done');
      } catch {

        /* ignore */}
      setDone(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, current.id]);

  if (!open) return null;

  const finish = (to?: string) => {
    try {
      window.localStorage.setItem(tourKey(current.id), 'done');
    } catch {

      /* storage full — the tour simply shows again next time */}
    setDone(true);
    if (to) navigate(to);
  };

  const install = () => {
    if (!options.includes(choice)) return;
    market.install(choice, {});
    setInstalled(choice);
    setStep('done');
  };

  const goPick = () => {
    navigate('/app/extensions');
    // Everything suggested is already on — nothing left to practise with.
    if (options.length === 0) {
      setInstalled(SUGGESTED.find((id) => market.isActive(id)) ?? SUGGESTED[0]);
      setStep('done');
    } else setStep('pick');
  };

  const spotlight = step === 'intro' && rect;
  const chosen = extensionById[choice];
  const app = installed ? extensionById[installed] : null;
  const appRoute = installed ? workspaceNav.find((n) => n.appId === installed)?.to : undefined;
  const cardTop = rect ? Math.min(Math.max(rect.top - 24, 16), window.innerHeight - 340) : 0;

  return (
    <div className="fixed inset-0 z-[80]">
      {/* Click shield + dimmer. With a spotlight, the cut-out's own shadow does the dimming. */}
      <div className={cn('absolute inset-0', spotlight ? 'bg-transparent' : 'bg-[rgb(10_10_15/0.6)]')} onClick={() => finish()} aria-hidden />
      {spotlight &&
      <div
        aria-hidden
        className="pointer-events-none absolute rounded-lg ring-2 ring-action transition-[top,left,width,height] duration-200 ease-out"
        style={{ top: rect.top - 4, left: rect.left - 4, width: rect.width + 8, height: rect.height + 8, boxShadow: '0 0 0 9999px rgb(10 10 15 / 0.6)' }} />

      }

      {/* Positioning lives on this wrapper so the animated card's transform doesn't fight it. */}
      <div className={cn('absolute', spotlight ? '' : 'inset-0 flex items-center justify-center p-4')} style={spotlight ? { top: cardTop, left: rect.right + 20 } : undefined}>
      <AnimatePresence mode="wait">
        <motion.div
            key={step}
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ext-tour-title"
            aria-describedby="ext-tour-body"
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2, ease: EASE }}
            className={cn(
              'relative flex flex-col overflow-hidden rounded-xl border border-line bg-raised shadow-lg focus:outline-none',
              spotlight ? 'w-[min(360px,calc(100vw-24px))]' : 'max-h-full w-full max-w-[520px]'
            )}>
            
          <button
              type="button"
              onClick={() => finish()}
              aria-label="Close tour"
              className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-md text-fg-muted transition-colors duration-150 hover:bg-sunken hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
              
            <XIcon size={18} aria-hidden />
          </button>
          <div className="pr-12">
            <Progress step={step} />
          </div>

          {step === 'intro' &&
            <div className="flex flex-col gap-4 p-6">
              <span className="grid h-11 w-11 place-items-center rounded-md bg-action-soft text-action" aria-hidden>
                <PuzzleIcon size={22} />
              </span>
              <div>
                <h2 id="ext-tour-title" className="text-heading font-semibold text-fg">
                  Your workspace starts lean
                </h2>
                <p id="ext-tour-body" className="mt-2 text-body text-fg-muted">
                  Only the essentials are on: your page, Commerce, Audience and Analytics. Bookings, QR codes, Automations, Forms and more live in <strong className="font-semibold text-fg">Extensions</strong> — add what you need, remove it whenever you like.
                </p>
                {!spotlight && <p className="mt-2 text-label text-fg-muted">{desktop ? 'Find it in the sidebar under Business.' : 'On your phone it’s under More → Extensions.'}</p>}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button data-autofocus onClick={goPick}>
                  Open Extensions
                </Button>
                <Button variant="tertiary" onClick={() => finish()}>
                  Skip for now
                </Button>
              </div>
            </div>
            }

          {step === 'pick' &&
            <div className="flex min-h-0 flex-col">
              <div className="px-6 pt-6">
                <h2 id="ext-tour-title" className="text-heading font-semibold text-fg">
                  Install your first app
                </h2>
                <p id="ext-tour-body" className="mt-1.5 text-body text-fg-muted">
                  Pick one to see how installing works. They’re all free, and you can uninstall in a couple of taps.
                </p>
              </div>
              <div className="scroll-quiet min-h-0 flex-1 overflow-y-auto px-6 py-5">
                <div role="radiogroup" aria-label="Suggested apps" className="flex flex-col gap-2">
                  {options.map((id, i) => {
                    const ext = extensionById[id];
                    const on = id === choice;
                    return (
                      <button
                        key={id}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        data-autofocus={on || undefined}
                        onClick={() => setChoice(id)}
                        className={cn(
                          'flex items-start gap-3 rounded-lg border p-3 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                          on ? 'border-action bg-action-soft' : 'border-line hover:border-line-strong'
                        )}>
                        
                        <ExtensionIcon ext={ext} />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="text-label font-semibold text-fg">{ext.name}</span>
                            {i === 0 && <span className="text-caption font-medium text-action">Recommended</span>}
                          </span>
                          <span className="mt-0.5 block text-caption text-fg-muted">{ext.summary}</span>
                        </span>
                        <span aria-hidden className={cn('mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full border-2', on ? 'border-action' : 'border-line-strong')}>
                          {on && <span className="h-1.5 w-1.5 rounded-full bg-action" />}
                        </span>
                      </button>);

                  })}
                </div>
                {chosen &&
                <div className="mt-5 border-t border-line pt-4">
                    <p className="text-label font-semibold text-fg">{chosen.name} will be able to:</p>
                    <ul className="mt-2 flex flex-col gap-1.5">
                      {chosen.permissions.map((p) =>
                    <li key={p} className="flex items-start gap-2 text-caption text-fg">
                          <ShieldCheckIcon size={14} className="mt-0.5 shrink-0 text-action" aria-hidden />
                          {p}
                        </li>
                    )}
                    </ul>
                  </div>
                }
              </div>
              <div className="flex flex-col-reverse gap-2 border-t border-line px-6 py-4 sm:flex-row sm:justify-end">
                <Button variant="secondary" onClick={() => finish()}>
                  Not now
                </Button>
                <Button onClick={install}>Allow and install {chosen?.name}</Button>
              </div>
            </div>
            }

          {step === 'done' && app &&
            <div className="flex flex-col gap-5 p-6">
              <div className="flex items-start gap-3">
                <CheckCircle2Icon size={26} className="mt-0.5 shrink-0 text-success" aria-hidden />
                <div>
                  <h2 id="ext-tour-title" className="text-heading font-semibold text-fg">
                    {app.name} is installed
                  </h2>
                  <p id="ext-tour-body" className="mt-1.5 text-body text-fg-muted">
                    It’s now in your {desktop ? 'sidebar under Business' : 'More menu'}. Install anything else from Extensions the same way.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg bg-sunken p-4">
                <Trash2Icon size={16} className="mt-0.5 shrink-0 text-fg-muted" aria-hidden />
                <p className="text-label text-fg">
                  <span className="font-semibold">Changed your mind?</span> Extensions → Installed → {app.name} → Uninstall. {app.uninstallNote}
                </p>
              </div>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button variant="secondary" onClick={() => finish()}>
                  Keep browsing Extensions
                </Button>
                {appRoute &&
                <Button data-autofocus onClick={() => finish(appRoute)}>
                    Open {app.name}
                  </Button>
                }
              </div>
            </div>
            }
        </motion.div>
      </AnimatePresence>
      </div>
    </div>);

}

function Progress({ step }: {step: Step;}) {
  const i = step === 'intro' ? 0 : step === 'pick' ? 1 : 2;
  return (
    <div className="flex gap-1 px-6 pt-5" aria-hidden>
      {[0, 1, 2].map((n) =>
      <span key={n} className={cn('h-1 flex-1 rounded-full transition-colors duration-200', n <= i ? 'bg-action' : 'bg-line')} />
      )}
    </div>);

}