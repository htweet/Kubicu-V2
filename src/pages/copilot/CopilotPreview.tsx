import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CircleDashedIcon, ClockIcon, LinkIcon, MessageCircleIcon, XIcon } from 'lucide-react';
import { toast } from 'sonner';
import { RenderPlanProvider } from '../../contexts/RenderPlanContext';
import { PageSurface } from '../../components/blocks/PageSurface';
import { PageLayoutView } from '../../components/blocks/PageLayoutView';
import { PlatformLook } from '../../components/marketing/PlatformLook';
import { KubicuLogo } from '../../components/shell/KubicuLogo';
import { plans } from '../../data/plans';
import { useCopilotSim } from '../../contexts/CopilotSimContext';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { isExpired, readDraft, readSession, DRAFT_DAYS } from '../../utils/copilot/store';
import { chatPathFor, expiryLabel, previewHref } from '../../utils/copilot/links';

const ease = [0.23, 1, 0.32, 1] as const;

/**
 * /d/:id — the private draft preview (D263). The page exactly as visitors would see it, with one slim bar
 * above it that is never part of the page. Not listed by search engines; viewing only, never editing.
 */
export function CopilotPreview() {
  const { id = '' } = useParams();
  const sim = useCopilotSim();
  const draft = useMemo(() => readDraft(id), [id]);
  const wide = useMediaQuery('(min-width: 768px)');
  const [gapsOpen, setGapsOpen] = useState(false);

  useEffect(() => {
    const previous = document.title;
    document.title = draft ? `${draft.doc.title} — draft preview` : 'Draft preview — KUBICU';
    const robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex, nofollow';
    document.head.appendChild(robots);
    return () => {
      robots.remove();
      document.title = previous;
    };
  }, [draft]);

  if (!draft) return <PreviewState kind="missing" />;
  const session = readSession(draft.sessionId);
  const chatPath = session ? chatPathFor(session.channel) : null;
  if (isExpired(draft) || sim.failure === 'expiredLink') return <PreviewState kind="expired" chatPath={chatPath} />;

  const visible = draft.doc.blocks.filter((b) => !b.visibility.hidden);
  const gaps = draft.brief.gaps;

  const copy = () => {
    navigator.clipboard?.writeText(previewHref(draft.id)).then(
      () => toast.success('Preview link copied', { description: 'Anyone with it can look. Only your chat can continue the draft.' }),
      () => toast.error('Couldn’t copy the link')
    );
  };

  return (
    <PlatformLook night>
      <div className="min-h-[100dvh] w-full" style={{ background: draft.doc.theme.background }}>
        <div className="sticky top-0 z-40 border-b border-line bg-canvas/95 backdrop-blur-sm">
          <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-3 px-3 md:px-6">
            <KubicuLogo />
            <p className="min-w-0 flex-1 truncate text-caption text-fg-muted">
              <span className="font-semibold text-fg">Draft preview</span>
              <span className="hidden sm:inline"> · not published</span>
              <span className="hidden md:inline">
                {' '}· <ClockIcon size={12} className="inline -translate-y-px" aria-hidden /> {expiryLabel(draft)}
              </span>
            </p>
            {gaps.length > 0 &&
            <button
              type="button"
              aria-expanded={gapsOpen}
              aria-controls="draft-gaps"
              onClick={() => setGapsOpen((o) => !o)}
              className="hidden h-9 items-center gap-1.5 rounded-full px-3 text-label font-medium text-fg-muted hover:bg-sunken hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus sm:inline-flex">
              
                <CircleDashedIcon size={14} aria-hidden /> {gaps.length} to fill in
              </button>
            }
            <button type="button" onClick={copy} aria-label="Copy preview link" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-fg-muted hover:bg-sunken hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
              <LinkIcon size={16} aria-hidden />
            </button>
            {chatPath &&
            <Link to={chatPath} className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-action px-4 text-label font-semibold text-action-fg transition-transform duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                <MessageCircleIcon size={15} aria-hidden /> Back to chat
              </Link>
            }
          </div>
          <AnimatePresence initial={false}>
            {gapsOpen &&
            <motion.div
              id="draft-gaps"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease }}
              className="overflow-hidden border-t border-line">
              
                <div className="mx-auto flex w-full max-w-6xl items-start justify-between gap-4 px-3 py-3 md:px-6">
                  <div>
                    <p className="text-label font-semibold text-fg">Still to fill in before publishing</p>
                    <ul className="mt-1.5 flex flex-col gap-1">
                      {gaps.map((g) =>
                    <li key={g} className="flex items-start gap-2 text-caption text-fg-muted">
                          <CircleDashedIcon size={12} className="mt-0.5 shrink-0" aria-hidden /> {g}
                        </li>
                    )}
                    </ul>
                    <p className="mt-2 text-caption text-fg-subtle">Copilot never makes these up — they stay marked on the page until you add them.</p>
                  </div>
                  <button type="button" onClick={() => setGapsOpen(false)} aria-label="Close list" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-fg-muted hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                    <XIcon size={15} aria-hidden />
                  </button>
                </div>
              </motion.div>
            }
          </AnimatePresence>
        </div>

        <main aria-label={`Draft of ${draft.doc.title}`}>
          <RenderPlanProvider plan={plans.creator}>
            <PageSurface theme={draft.doc.theme} fluid>
              <PageLayoutView doc={draft.doc} blocks={visible} theme={draft.doc.theme} mode="live" wide={wide} />
            </PageSurface>
          </RenderPlanProvider>
        </main>
      </div>
    </PlatformLook>);

}

function PreviewState({ kind, chatPath }: {kind: 'missing' | 'expired';chatPath?: string | null;}) {
  const expired = kind === 'expired';
  return (
    <PlatformLook night>
      <main className="flex min-h-[100dvh] w-full flex-col items-center justify-center bg-canvas px-5 py-16 text-center">
        <KubicuLogo />
        <h1 className="mt-10 max-w-md text-[28px] font-bold leading-tight text-fg">{expired ? 'This preview has expired' : 'This preview isn’t available'}</h1>
        <p className="mt-3 max-w-md text-body text-fg-muted">
          {expired ?
          `Drafts that aren’t continued into KUBICU are deleted after ${DRAFT_DAYS} days, so this link no longer opens.` :
          'The link may be incomplete, or the draft was deleted. Preview links only show a draft — they never let anyone edit it.'}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {chatPath &&
          <Link to={chatPath} className="inline-flex h-12 items-center justify-center rounded-full bg-action px-6 text-label font-semibold text-action-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
              {expired ? 'Return to your chat' : 'Back to your chat'}
            </Link>
          }
          <Link to="/copilot/chat" className="inline-flex h-12 items-center justify-center rounded-full border border-line-strong px-6 text-label font-semibold text-fg hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
            Start a new draft
          </Link>
        </div>
        {expired && chatPath && <p className="mt-4 max-w-sm text-caption text-fg-subtle">Your answers are still in the chat — ask Copilot to make the draft again.</p>}
      </main>
    </PlatformLook>);

}