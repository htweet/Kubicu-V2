import { useCallback, useEffect, useRef, useState } from 'react';
import type { AssistantImage } from '../types/assistant';
import type { CopilotChannel, CopilotDraft, CopilotInput, CopilotSession } from '../types/copilot';
import { draftDocFrom, briefFrom, failedMessage, limitMessage, newSession, planFor, progressSteps, readyMessage, respond, copilotMessage } from '../utils/copilot/engine';
import { currentSessionId, isExpired, newDraftIds, readDraft, readSession, remaining, saveDraft, saveSession, setCurrentSession, spend, usageKey } from '../utils/copilot/store';
import { useCopilotSim } from '../contexts/CopilotSimContext';
import { processUpload, imageSize } from '../utils/image';

/** Generation steps are real work in production; here each gets a short, honest pause. */
const STEP_MS = 520;

/** Runs one Copilot chat (D262): the conversation, generation, limits and the resulting draft. */
export function useCopilot(channel: CopilotChannel, chatPhone?: string) {
  const sim = useCopilotSim();
  const [session, setSession] = useState<CopilotSession>(() => {
    const id = currentSessionId(channel);
    const saved = id ? readSession(id) : null;
    // A chat interrupted mid-generation picks up by generating again.
    if (saved) return saved.stage === 'generating' ? { ...saved, progress: 0 } : saved;
    return newSession(channel, chatPhone);
  });
  const timer = useRef<number | null>(null);

  useEffect(() => {
    saveSession(session);
    setCurrentSession(channel, session.id);
  }, [session, channel]);

  const send = useCallback((input: CopilotInput) => setSession((s) => respond(s, input)), []);

  const retry = useCallback(() => {
    setSession((s) => ({ ...s, stage: 'generating', progress: 0, messages: [...s.messages, copilotMessage('user', 'Try again')] }));
  }, []);

  const restart = useCallback(() => {
    const fresh = newSession(channel, chatPhone);
    setSession(fresh);
  }, [channel, chatPhone]);

  const addPhotos = useCallback(
    async (files: File[]): Promise<string | null> => {
      const items: AssistantImage[] = [];
      for (const file of files.slice(0, 6)) {
        if (file.size > 5 * 1024 * 1024) return `${file.name} is over 5 MB. Try a smaller photo.`;
        try {
          const src = await processUpload(file);
          const { width, height } = await imageSize(src);
          items.push({ src, name: file.name, role: 'gallery', width, height });
        } catch (e) {
          return e instanceof Error ? e.message : 'That photo couldn’t be read.';
        }
      }
      if (items.length) send({ kind: 'images', items });
      return null;
    },
    [send]
  );

  // Generation: limits first, then the real steps (plan → layout → blocks → gaps → preview).
  useEffect(() => {
    if (session.stage !== 'generating') return undefined;
    const key = usageKey(session);
    const isRevision = !!session.draftId;
    const left = remaining(key);
    if ((isRevision ? left.changes : left.drafts) <= 0) {
      setSession((s) => ({ ...s, stage: s.draftId ? 'ready' : 'limit', messages: [...s.messages, limitMessage()] }));
      return undefined;
    }
    if (session.messages[session.messages.length - 1]?.card !== 'progress') {
      setSession((s) => ({ ...s, progress: 0, messages: [...s.messages, copilotMessage('copilot', isRevision ? 'Updating your draft…' : 'Making your draft…', { card: 'progress' })] }));
      return undefined;
    }
    const steps = progressSteps().length;
    timer.current = window.setTimeout(() => {
      setSession((s) => {
        if (s.stage !== 'generating') return s;
        if (s.progress < steps - 1) return { ...s, progress: s.progress + 1 };
        if (sim.failure === 'generation' && !s.failedOnce) {
          return { ...s, stage: 'failed', failedOnce: true, messages: [...s.messages, failedMessage()] };
        }
        const plan = planFor(s);
        const brief = briefFrom(s, plan);
        const doc = draftDocFrom(s, plan);
        const existing = s.draftId ? readDraft(s.draftId) : null;
        // An expired or claimed draft is never revived: changes after that make a fresh draft and link.
        const draft: CopilotDraft = existing && !existing.claimed && !isExpired(existing) ?
        { ...existing, doc, brief, themeName: plan.themeName, revisions: existing.revisions + 1 } :
        { ...newDraftIds(), sessionId: s.id, doc, brief, themeName: plan.themeName, createdAt: new Date().toISOString(), revisions: 0 };
        saveDraft(draft);
        spend(key, isRevision ? 'changes' : 'drafts');
        return { ...s, stage: 'ready', brief, draftId: draft.id, progress: steps, messages: [...s.messages, readyMessage(s, draft.id, brief.gaps.length)] };
      });
    }, STEP_MS);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [session, sim.failure]);

  const draft = session.draftId ? readDraft(session.draftId) : null;
  return { session, draft, send, retry, restart, addPhotos, limits: remaining(usageKey(session)) };
}