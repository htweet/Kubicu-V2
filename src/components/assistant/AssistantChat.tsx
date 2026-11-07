import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PauseIcon, PenToolIcon, PlayIcon, RotateCwIcon, SparklesIcon, ZapIcon } from 'lucide-react';
import { AssistantChangeCard } from './AssistantChangeCard';
import { blockName } from '../../utils/blocks';
import { MediaImage } from '../media/MediaImage';
import { Button } from '../ui/Button';
import { AssistantPlanCard } from './AssistantPlanCard';
import { AssistantDoneCard } from './AssistantDoneCard';
import { AssistantComposer } from './AssistantComposer';
import { cn } from '../../utils/cn';
import type { useAssistant } from '../../hooks/useAssistant';

type Assistant = ReturnType<typeof useAssistant>;

interface AssistantChatProps {
  assistant: Assistant;
  onRestart: () => void;
  onUndo: () => void;
}

/** The conversation: messages, the plan and finish cards, and the reply box (D211). */
export function AssistantChat({ assistant, onRestart, onUndo }: AssistantChatProps) {
  const { session, send, typing, uploading, uploadImages, approve, setPaused } = assistant;
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const listRef = useRef<HTMLDivElement>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const lastPlanId = [...session.messages].reverse().find((m) => m.card === 'plan')?.id;
  const building = session.stage === 'building' || session.stage === 'paused';

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [session.messages.length, typing]);

  const latest = session.messages[session.messages.length - 1];
  const refining = session.stage === 'done' && !session.removed;
  const focused = session.focusId ? assistant.doc.blocks.find((b) => b.id === session.focusId) : undefined;
  const suggestions = focused
    ? [
        { value: 'up', label: 'Move this up' },
        { value: 'down', label: 'Move this down' },
        { value: 'remove', label: 'Remove this' },
        { value: 'after', label: 'Add a call to action after this' },
      ]
    : [
        { value: 'warm', label: 'Make it warmer' },
        { value: 'bold', label: 'Make it bolder' },
        ...(!assistant.doc.blocks.some((b) => b.type === 'gallery') ? [{ value: 'gallery', label: 'Add a gallery' }] : []),
        ...(!assistant.doc.blocks.some((b) => b.type === 'faq') ? [{ value: 'faq', label: 'Add an FAQ' }] : []),
        ...(!assistant.doc.blocks.some((b) => b.type === 'hours' || b.type === 'location') ? [{ value: 'hours', label: 'Add opening hours' }] : []),
      ];

  return (
    <section aria-label="Conversation with the assistant" className="flex min-h-0 flex-1 flex-col">
      <div ref={listRef} className="scroll-quiet min-h-0 flex-1 overflow-y-auto px-4 py-5">
        <ol className="flex flex-col gap-3">
          {session.messages.map((m) => {
            const mine = m.role === 'user';
            return (
              <motion.li
                key={m.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                className={cn('flex flex-col gap-2', mine ? 'items-end' : 'items-start')}
              >
                {m.text && (
                  <div
                    className={cn(
                      'max-w-[88%] whitespace-pre-line rounded-lg px-3.5 py-2.5 text-label leading-relaxed',
                      mine ? 'bg-action text-action-fg' : m.tone === 'warning' ? 'border border-warning/40 bg-warning-soft text-fg' : 'bg-sunken text-fg',
                    )}
                  >
                    {!mine && <span className="sr-only">Assistant: </span>}
                    {m.text}
                  </div>
                )}
                {m.images && m.images.length > 0 && (
                  <div className="flex max-w-[88%] flex-wrap justify-end gap-1.5">
                    {m.images.slice(0, 8).map((src, i) => (
                      <MediaImage key={`${m.id}-${i}`} src={src} alt="" className="h-16 w-16 rounded-md border border-line object-cover" />
                    ))}
                  </div>
                )}
                {m.card === 'plan' && session.plan && (
                  <div className="w-full">
                    <AssistantPlanCard
                      plan={session.plan}
                      active={m.id === lastPlanId && session.stage === 'plan'}
                      busy={typing}
                      onApprove={() => setProblem(approve())}
                      onChange={() => send({ kind: 'change' })}
                      onRestart={onRestart}
                      onAlternative={(exampleId) => send({ kind: 'alternative', exampleId })}
                    />
                  </div>
                )}
                {m.card === 'done' && (
                  <div className="w-full">
                    <AssistantDoneCard session={session} onUndo={onUndo} />
                  </div>
                )}
                {m.card === 'change' && m.changeId && (() => {
                  const change = (session.changes ?? []).find((c) => c.id === m.changeId);
                  return change ? (
                    <div className="w-full max-w-[88%]">
                      <AssistantChangeCard change={change} canUndo={assistant.lastKeptId === change.id} onKeep={() => assistant.keepChange(change.id)} onDiscard={() => assistant.discardChange(change.id)} onUndo={() => assistant.undoChange(change.id)} />
                    </div>
                  ) : null;
                })()}
                {m.card === 'failed' && m.retryText && m.id === latest?.id && (
                  <Button size="sm" variant="secondary" leadingIcon={RotateCwIcon} onClick={() => assistant.requestChange(m.retryText as string)}>
                    Try again
                  </Button>
                )}
                {m.card === 'credits' && (
                  <div className="flex max-w-[88%] flex-wrap gap-2">
                    <Button size="sm" variant="secondary" leadingIcon={ZapIcon} onClick={() => navigate('/app/settings/billing')}>
                      Get more credits
                    </Button>
                    <Button size="sm" variant="tertiary" leadingIcon={PenToolIcon} onClick={() => navigate(`/app/canvas/${session.pageId}`)}>
                      Edit in the canvas
                    </Button>
                  </div>
                )}
              </motion.li>
            );
          })}
          {typing && (
            <li className="flex items-center gap-2 text-caption text-fg-muted" role="status">
              <SparklesIcon size={13} className="text-action" aria-hidden />
              <span className="flex gap-1" aria-hidden>
                {[0, 1, 2].map((i) =>
                  reduceMotion ? (
                    <span key={i} className="h-1.5 w-1.5 rounded-full bg-fg-subtle" />
                  ) : (
                    <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-fg-subtle" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }} />
                  ),
                )}
              </span>
              <span className="sr-only">Assistant is typing</span>
            </li>
          )}
        </ol>
        {/* Read new assistant messages aloud as they arrive. */}
        <p className="sr-only" aria-live="polite">
          {latest?.role === 'assistant' ? latest.text : ''}
        </p>
        {problem && (
          <p role="alert" className="mt-3 rounded-md bg-danger-soft px-3 py-2 text-label text-danger">
            {problem}
          </p>
        )}
      </div>

      {building && !session.question ? (
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-line bg-raised px-4 py-3">
          <p className="text-label text-fg-muted">{session.stage === 'paused' ? 'Paused. Nothing is applied until the build finishes.' : 'Building your page…'}</p>
          <Button variant="secondary" leadingIcon={session.stage === 'paused' ? PlayIcon : PauseIcon} onClick={() => setPaused(session.stage !== 'paused')}>
            {session.stage === 'paused' ? 'Resume' : 'Pause'}
          </Button>
        </div>
      ) : (
        <>
        {refining && focused && (
          <div className="flex shrink-0 items-center gap-2 border-t border-line bg-action-soft px-4 py-2">
            <p className="min-w-0 flex-1 truncate text-caption text-fg">
              Talking about: <span className="font-semibold">{blockName(focused)}</span>
            </p>
            <button type="button" onClick={() => assistant.focusSection(null)} className="inline-flex h-8 shrink-0 items-center rounded-md px-2 text-caption font-semibold text-action hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
              Whole page
            </button>
          </div>
        )}
        <AssistantComposer
          question={session.stage === 'asking' || building ? session.question : null}
          disabled={typing || (session.stage === 'done' && !!session.removed)}
          uploading={uploading}
          suggestions={refining ? suggestions : []}
          placeholder={
            session.stage === 'plan'
              ? 'Ask for a change…'
              : session.stage === 'done'
                ? session.removed
                  ? 'Start over to build again'
                  : focused
                    ? `Change the ${blockName(focused).toLowerCase()}…`
                    : 'Ask for a change…'
                : 'Type your answer…'
          }
          onText={(text) => {
            setProblem(null);
            if (session.stage === 'done') assistant.requestChange(text);
            else send({ kind: 'text', text });
          }}
          onChoice={(value, label) => {
            setProblem(null);
            send({ kind: 'choice', value, label });
          }}
          onSkip={() => send({ kind: 'skip' })}
          onFiles={async (files, as) => {
            const p = await uploadImages(files, session.stage === 'asking' && session.question?.input === 'image' ? 'logo' : as);
            setProblem(p);
          }}
        />
        </>
      )}
    </section>
  );
}
