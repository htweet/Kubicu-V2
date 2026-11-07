import { useCallback, useEffect, useRef, useState } from 'react';
import type { AssistantImage } from '../types/assistant';
import type { CopilotChannel, CopilotDraft, CopilotInput, CopilotSession } from '../types/copilot';
import { draftDocFrom, briefFrom, failedMessage, limitMessage, newSession, planFor, progressSteps, readyMessage, respond, copilotMessage } from '../utils/copilot/engine';
import { currentSessionId, isExpired, newDraftIds, readDraft, readSession, remaining, saveDraft, saveSession, setCurrentSession, spend, usageKey } from '../utils/copilot/store';
import { useCopilotSim } from '../contexts/CopilotSimContext';
import { downscale, imageSize, processLogo, processUpload } from '../utils/image';
import { MAX_PHOTOS } from '../data/copilotQuestions';
import { toast } from 'sonner';
import { useT } from '../contexts/LocaleContext';
import { countryForLanguage, setActiveCountry } from '../utils/country';

/** Generation steps are real work in production; here each gets a short, honest pause. */
const STEP_MS = 520;

/** Runs one Copilot chat (D262): the conversation, generation, limits and the resulting draft. */
export function useCopilot(channel: CopilotChannel, chatPhone?: string, openId?: string | null) {
  const sim = useCopilotSim();
  const { lang } = useT();
  // Copilot has no workspace behind it, so numbers typed without a country code follow the screen language (D420).
  setActiveCountry(countryForLanguage(lang));
  const [session, setSession] = useState<CopilotSession>(() => {
    const requested = openId ? readSession(openId) : null;
    const id = currentSessionId(channel);
    const saved = requested?.channel === channel ? requested : id ? readSession(id) : null;
    // A chat interrupted mid-generation picks up by generating again.
    if (saved) return resume(saved);
    return newSession(channel, chatPhone);
  });
  const timer = useRef<number | null>(null);

  // Opening a chat from the sidebar or the chat list switches to it.
  useEffect(() => {
    if (!openId) return;
    setSession((s) => {
      if (s.id === openId) return s;
      const saved = readSession(openId);
      return saved && saved.channel === channel ? resume(saved) : s;
    });
  }, [openId, channel]);

  const warned = useRef(false);
  useEffect(() => {
    const ok = saveSession(session);
    setCurrentSession(channel, session.id);
    if (!ok && !warned.current) {
      warned.current = true;
      toast.warning('This browser is running out of space', { description: 'Your chat works for now, but photos may not be kept if you close this page. Continue to KUBICU to keep everything safely.' });
    }
  }, [session, channel]);

  const send = useCallback((input: CopilotInput) => setSession((s) => respond(s, input)), []);

  const retry = useCallback(() => {
    setSession((s) => ({ ...s, stage: 'generating', progress: 0, messages: [...s.messages, copilotMessage('user', 'Try again')] }));
  }, []);

  const restart = useCallback(() => {
    const fresh = newSession(channel, chatPhone);
    setSession(fresh);
  }, [channel, chatPhone]);

  const topic = session.question?.topic;
  const addPhotos = useCallback(
    async (files: File[]): Promise<string | null> => {
      const items: AssistantImage[] = [];
      const asLogo = topic === 'logo';
      // A few extra are read so the chat can say exactly how many didn't fit, rather than losing them quietly.
      for (const file of files.slice(0, asLogo ? 1 : MAX_PHOTOS + 3)) {
        if (file.size > 5 * 1024 * 1024) return `${file.name} is over 5 MB. Try a smaller photo.`;
        try {
          // Drafts live in this browser's storage, so photos are kept light: 1080px main photos, 512px logos.
          const src = asLogo ? await processLogo(file) : await downscale(await processUpload(file), 1080, 0.8);
          const { width, height } = await imageSize(src);
          const thumb = await downscale(src, 200, 0.7).catch(() => undefined);
          items.push({ src, name: file.name, role: 'gallery', width, height, thumb });
        } catch (e) {
          return e instanceof Error ? e.message : 'That photo couldn’t be read.';
        }
      }
      if (items.length) send({ kind: 'images', items });
      return null;
    },
    [send, topic],
  );

  // Generation: limits first, then the real steps (plan → layout → blocks → gaps → preview).
  useEffect(() => {
    if (session.stage !== 'generating') return undefined;
    const key = usageKey(session);
    const isRevision = !!session.draftId;
    const left = remaining(key);
    if ((isRevision ? left.changes : left.drafts) <= 0) {
      setSession((s) => ({ ...s, stage: s.draftId ? 'ready' : 'limit', messages: [...s.messages, limitMessage(!!s.draftId)] }));
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
        const draft: CopilotDraft = existing && !existing.claimed && !isExpired(existing)
          ? { ...existing, doc, brief, themeName: plan.themeName, revisions: existing.revisions + 1 }
          : { ...newDraftIds(), sessionId: s.id, doc, brief, themeName: plan.themeName, createdAt: new Date().toISOString(), revisions: 0 };
        if (!saveDraft(draft)) return { ...s, stage: 'failed', messages: [...s.messages, failedMessage()] };
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

function resume(s: CopilotSession): CopilotSession {
  return s.stage === 'generating' ? { ...s, progress: 0 } : s;
}
