import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLinkIcon, FlaskConicalIcon, MaximizeIcon, MonitorIcon, RotateCcwIcon, SmartphoneIcon, XIcon } from 'lucide-react';
import type { CopilotReply } from '../../types/copilot';
import { PlatformLook } from '../../components/marketing/PlatformLook';
import { KubicuLogo } from '../../components/shell/KubicuLogo';
import { CopilotThread } from '../../components/copilot/CopilotThread';
import { CopilotComposer } from '../../components/copilot/CopilotComposer';
import { TemplateLivePreview } from '../../components/templates/TemplateLivePreview';
import { useCopilot } from '../../hooks/useCopilot';
import { cn } from '../../utils/cn';
import { previewPath } from '../../utils/copilot/links';

const ease = [0.23, 1, 0.32, 1] as const;

/** Web Copilot (D262): the same conversation as the WhatsApp channel, with a live phone preview beside it. */
export function CopilotWeb() {
  const { session, draft, send, retry, restart, addPhotos, limits } = useCopilot('web');
  const [tab, setTab] = useState<'chat' | 'preview'>('chat');
  const [full, setFull] = useState<'phone' | 'desktop' | null>(null);
  const [confirmRestart, setConfirmRestart] = useState(false);

  const [params, setParams] = useSearchParams();

  useEffect(() => {
    document.title = 'KUBICU Copilot — tell us what you want to build';
  }, []);

  // Example starters from /copilot begin a fresh chat with their description.
  useEffect(() => {
    const start = params.get('start');
    if (!start) return;
    if (session.messages.length > 1) restart();else
    send({ kind: 'text', text: start.slice(0, 400) });
    if (session.messages.length <= 1) setParams({}, { replace: true });
  }, [params, session.messages.length, restart, send, setParams]);

  // When a fresh draft lands on a phone, show it.
  useEffect(() => {
    if (session.stage === 'ready' && draft) setTab((t) => window.matchMedia('(min-width: 1024px)').matches ? t : 'preview');
  }, [session.stage, draft?.revisions, draft]);

  const onReply = (r: CopilotReply) => {
    if (r.value === 'create') return send({ kind: 'create' });
    if (r.value === 'change') return send({ kind: 'change' });
    if (r.value === 'more') return send({ kind: 'more' });
    if (r.value === 'retry') return retry();
    if (r.value === 'open') return setFull('phone');
    return send({ kind: 'choice', value: r.value, label: r.label });
  };

  return (
    <PlatformLook night>
      <div className="flex h-[100dvh] flex-col bg-canvas">
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-line px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link to="/copilot" aria-label="KUBICU Copilot home" className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
              <KubicuLogo />
            </Link>
            <span className="hidden h-5 w-px bg-line sm:block" aria-hidden />
            <span className="hidden truncate text-label font-semibold text-fg sm:block">Copilot</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-caption text-fg-subtle md:block">
              {limits.drafts} of 3 free drafts left today
            </span>
            {confirmRestart ?
            <span className="flex items-center gap-1.5">
                <button type="button" onClick={() => {restart();setConfirmRestart(false);setTab('chat');}} className="h-9 rounded-full bg-action px-3 text-label font-semibold text-action-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                  Start a new chat
                </button>
                <button type="button" onClick={() => setConfirmRestart(false)} className="h-9 rounded-full px-3 text-label text-fg-muted hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                  Keep this one
                </button>
              </span> :

            <button type="button" onClick={() => setConfirmRestart(true)} className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-label font-medium text-fg-muted hover:bg-sunken hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                <RotateCcwIcon size={15} aria-hidden /> Start over
              </button>
            }
          </div>
        </header>

        <div role="tablist" aria-label="View" className="flex shrink-0 gap-1 border-b border-line p-1.5 lg:hidden">
          {(['chat', 'preview'] as const).map((t) =>
          <button
            key={t}
            role="tab"
            type="button"
            aria-selected={tab === t}
            disabled={t === 'preview' && !draft}
            onClick={() => setTab(t)}
            className={cn('h-10 flex-1 rounded-full text-label font-semibold transition-colors duration-150 disabled:opacity-40', tab === t ? 'bg-raised text-fg shadow-1' : 'text-fg-muted')}>
            
              {t === 'chat' ? 'Chat' : 'Preview'}
            </button>
          )}
        </div>

        <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.8fr)]">
          <main className={cn('min-h-0 flex-col', tab === 'chat' ? 'flex' : 'hidden lg:flex')}>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 md:px-8">
              <div className="mx-auto w-full max-w-[640px]">
                <CopilotThread session={session} onReply={onReply} />
              </div>
            </div>
            <div className="shrink-0 border-t border-line bg-canvas px-4 pb-4 pt-3 md:px-8">
              <div className="mx-auto w-full max-w-[640px]">
                <CopilotComposer
                  question={session.question}
                  stage={session.stage}
                  onText={(text) => send({ kind: 'text', text })}
                  onSkip={() => send({ kind: 'skip' })}
                  onPhotos={addPhotos} />
                
                <p className="mt-2 flex items-center gap-1.5 text-caption text-fg-subtle">
                  <FlaskConicalIcon size={12} aria-hidden /> Prototype: replies follow written rules, not a live AI model, and everything stays in this browser.
                </p>
              </div>
            </div>
          </main>

          <aside aria-label="Draft preview" className={cn('min-h-0 flex-col items-center justify-center gap-4 border-l border-line bg-sunken/50 p-6', tab === 'preview' ? 'flex' : 'hidden lg:flex')}>
            {draft ?
            <>
                <div className="flex w-full max-w-[390px] items-center justify-between">
                  <p className="text-label font-semibold text-fg">
                    {draft.doc.title} <span className="font-normal text-fg-subtle">· draft, not published</span>
                  </p>
                  <div className="flex items-center gap-1">
                    <Link to={previewPath(draft.id)} target="_blank" rel="noopener" aria-label="Open the private preview link in a new tab" className="flex h-9 w-9 items-center justify-center rounded-full text-fg-muted hover:bg-sunken hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                      <ExternalLinkIcon size={16} aria-hidden />
                    </Link>
                    <button type="button" onClick={() => setFull('phone')} aria-label="Open the preview full screen" className="flex h-9 w-9 items-center justify-center rounded-full text-fg-muted hover:bg-sunken hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                      <MaximizeIcon size={16} aria-hidden />
                    </button>
                  </div>
                </div>
                <AnimatePresence mode="wait">
                  <motion.div key={`${draft.id}-${draft.revisions}`} className="w-full" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22, ease }}>
                    <TemplateLivePreview doc={draft.doc} plan="creator" device="phone" name={draft.doc.title} height={Math.min(680, typeof window === 'undefined' ? 640 : window.innerHeight - 200)} />
                  </motion.div>
                </AnimatePresence>
              </> :

            <EmptyPreview generating={session.stage === 'generating'} />
            }
          </aside>
        </div>
      </div>

      <AnimatePresence>
        {full && draft &&
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`Preview of ${draft.doc.title}`}
          className="fixed inset-0 z-50 flex flex-col bg-canvas"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease }}
          onKeyDown={(e) => e.key === 'Escape' && setFull(null)}>
          
            <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-line px-4">
              <p className="truncate text-label text-fg">
                <span className="font-semibold">Draft</span> · not published · only people you share it with can see it
              </p>
              <div className="flex items-center gap-1">
                <button type="button" aria-pressed={full === 'phone'} onClick={() => setFull('phone')} aria-label="Phone view" className={cn('flex h-9 w-9 items-center justify-center rounded-full', full === 'phone' ? 'bg-raised text-fg shadow-1' : 'text-fg-muted')}>
                  <SmartphoneIcon size={16} aria-hidden />
                </button>
                <button type="button" aria-pressed={full === 'desktop'} onClick={() => setFull('desktop')} aria-label="Desktop view" className={cn('hidden h-9 w-9 items-center justify-center rounded-full md:flex', full === 'desktop' ? 'bg-raised text-fg shadow-1' : 'text-fg-muted')}>
                  <MonitorIcon size={16} aria-hidden />
                </button>
                <button type="button" autoFocus onClick={() => setFull(null)} aria-label="Close preview" className="flex h-9 w-9 items-center justify-center rounded-full text-fg-muted hover:bg-sunken hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                  <XIcon size={18} aria-hidden />
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-auto p-4">
              <TemplateLivePreview doc={draft.doc} plan="creator" device={full} name={draft.doc.title} height={typeof window === 'undefined' ? 700 : window.innerHeight - 100} />
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </PlatformLook>);

}

function EmptyPreview({ generating }: {generating: boolean;}) {
  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <div aria-hidden className="flex h-[360px] w-[190px] flex-col gap-3 rounded-[30px] border-[6px] border-line-strong bg-raised p-4">
        <div className={cn('h-24 rounded-xl bg-sunken', generating && 'animate-pulse')} />
        <div className={cn('h-3 w-3/4 rounded-full bg-sunken', generating && 'animate-pulse')} />
        <div className={cn('h-3 w-1/2 rounded-full bg-sunken', generating && 'animate-pulse')} />
        <div className={cn('mt-2 h-10 rounded-full bg-sunken', generating && 'animate-pulse')} />
        <div className={cn('h-16 rounded-xl bg-sunken', generating && 'animate-pulse')} />
      </div>
      <p className="max-w-[260px] text-label text-fg-muted">{generating ? 'Putting your page together…' : 'Your draft appears here once you confirm the brief.'}</p>
    </div>);

}