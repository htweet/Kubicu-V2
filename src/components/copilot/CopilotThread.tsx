import React, { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { SparklesIcon } from 'lucide-react';
import type { CopilotMessage, CopilotReply, CopilotSession } from '../../types/copilot';
import { CopilotBriefCard } from './CopilotBriefCard';
import { CopilotProgress } from './CopilotProgress';
import { CopilotLookOptions } from './CopilotLookOptions';
import { CopilotPrivacyNotice } from './CopilotPrivacyNotice';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { CopyIcon } from 'lucide-react';
import { CopilotPagePicture } from './CopilotPagePicture';
import { readDraft } from '../../utils/copilot/store';
import { expiryLabel, previewDisplayUrl, previewHref, previewPath } from '../../utils/copilot/links';
import { progressSteps } from '../../utils/copilot/engine';
import { cn } from '../../utils/cn';

interface Props {
  session: CopilotSession;
  onReply: (r: CopilotReply) => void;
}

const ease = [0.23, 1, 0.32, 1] as const;

/** The web Copilot conversation (D262): short bubbles, cards only where they carry the decision. */
export function CopilotThread({ session, onReply }: Props) {
  const end = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const lastCopilot = [...session.messages].reverse().find((m) => m.from === 'copilot');
  const lastBriefId = [...session.messages].reverse().find((m) => m.card === 'brief')?.id;
  const lastProgressId = [...session.messages].reverse().find((m) => m.card === 'progress')?.id;

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'end' });
  }, [session.messages.length, session.progress, reduce]);

  const repliesFor = (m: CopilotMessage) => {
    if (m.id !== lastCopilot?.id || !m.replies?.length || m.card === 'looks') return null;
    if (session.stage === 'generating') return null;
    return m.replies;
  };

  return (
    <ol className="flex flex-col gap-4" aria-label="Conversation with KUBICU Copilot" aria-live="polite">
      <li className="list-none">
        <CopilotPrivacyNotice channel="web" />
      </li>
      {session.messages.map((m) => {
        const mine = m.from === 'user';
        const replies = repliesFor(m);
        return (
          <motion.li
            key={m.id}
            className={cn('flex list-none flex-col gap-2', mine ? 'items-end' : 'items-start')}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease }}>
            
            {!mine &&
            <span className="flex items-center gap-1.5 text-caption font-semibold text-fg-subtle">
                <SparklesIcon size={12} aria-hidden /> Copilot
              </span>
            }
            {m.text &&
            <p
              className={cn(
                'max-w-[86%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-body leading-relaxed',
                mine ? 'rounded-br-md bg-action text-action-fg' : m.tone === 'warning' ? 'rounded-bl-md border border-warning/40 bg-warning-soft text-fg' : 'rounded-bl-md bg-raised text-fg shadow-1'
              )}>
              
                {m.text}
              </p>
            }
            {m.images && m.images.length > 0 &&
            <div className="flex max-w-[86%] flex-wrap justify-end gap-1.5">
                {m.images.map((src, i) =>
              <img key={i} src={src} alt="" className="h-20 w-20 rounded-xl object-cover" />
              )}
              </div>
            }
            {m.card === 'looks' && <CopilotLookOptions replies={m.replies ?? []} kind={session.kind} exampleId={session.answers.business} active={m.id === lastCopilot?.id && session.question?.topic === 'look'} onPick={onReply} />}
            {m.card === 'brief' && session.brief && m.id === lastBriefId && <CopilotBriefCard brief={session.brief} />}
            {m.card === 'brief' && m.id !== lastBriefId && <p className="text-caption text-fg-subtle">Earlier version — replaced below.</p>}
            {m.card === 'progress' && <CopilotProgress step={m.id === lastProgressId && session.stage === 'generating' ? session.progress : m.id === lastProgressId && session.stage === 'failed' ? progressSteps().length - 1 : progressSteps().length} failed={m.id === lastProgressId && session.stage === 'failed'} />}
            {m.card === 'preview' && m.draftId && <PreviewCard draftId={m.draftId} onOpen={() => onReply({ value: 'open', label: 'Open preview' })} />}
            {replies &&
            <div className="flex max-w-full flex-wrap gap-2">
                {replies.map((r) =>
              <button
                key={r.value}
                type="button"
                onClick={() => onReply(r)}
                className="inline-flex min-h-10 items-center rounded-full border border-line-strong bg-raised px-4 text-label font-medium text-fg transition-[background-color,transform] duration-150 ease-out hover:bg-sunken active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                
                    {r.label}
                  </button>
              )}
              </div>
            }
          </motion.li>);

      })}
      <div ref={end} />
    </ol>);

}

function PreviewCard({ draftId, onOpen }: {draftId: string;onOpen: () => void;}) {
  const draft = readDraft(draftId);
  if (!draft) return null;
  const copy = () => {
    navigator.clipboard?.writeText(previewHref(draft.id)).then(
      () => toast.success('Preview link copied', { description: 'Anyone with it can look. Only this chat can continue the draft.' }),
      () => toast.error('Couldn’t copy the link')
    );
  };
  return (
    <div className="w-[262px] overflow-hidden rounded-[22px] border border-line bg-raised">
      <button type="button" onClick={onOpen} aria-label={`Open the preview of ${draft.doc.title}`} className="block w-full p-2 transition-transform duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus">
        <span className="block overflow-hidden rounded-2xl">
          <CopilotPagePicture doc={draft.doc} width={244} />
        </span>
      </button>
      <div className="flex items-center gap-1 border-t border-line px-3 py-2">
        <Link to={previewPath(draft.id)} target="_blank" rel="noopener" className="min-w-0 flex-1 truncate text-caption font-semibold text-fg underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
          {previewDisplayUrl(draft.id)}
        </Link>
        <button type="button" onClick={copy} aria-label="Copy preview link" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-fg-muted hover:bg-sunken hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
          <CopyIcon size={14} aria-hidden />
        </button>
      </div>
      <p className="px-3 pb-2.5 text-caption text-fg-subtle">Private link · {expiryLabel(draft)}</p>
    </div>);

}