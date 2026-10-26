import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import type { AssistantChange, AssistantCreated, AssistantImage, AssistantInput, AssistantMessage, AssistantSession } from '../types/assistant';
import { proposeChange, type RefineResult } from '../utils/assistant/refine';
import { blockName } from '../utils/blocks';
import type { Block } from '../types/page';
import type { Product } from '../types/commerce';
import type { Service } from '../types/ops';
import type { CampaignLink, QrDesign } from '../types/domains';
import { useCommerce } from '../contexts/CommerceContext';
import { useOps } from '../contexts/OpsContext';
import { useDomains } from '../contexts/DomainsContext';
import { blankProduct } from '../components/commerce/ProductEditor';
import { upsertProduct } from '../utils/commerce/ops';
import { slugError, slugify } from '../utils/domains/links';
import { useEditor } from '../contexts/EditorContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { usePlan } from '../contexts/PlanContext';
import { useMarketplace } from '../contexts/MarketplaceContext';
import { useLibrary } from '../contexts/LibraryContext';
import { useOptionalMedia } from '../contexts/MediaContext';
import { useTeam } from '../contexts/TeamContext';
import { useAiUsage } from './useAiUsage';
import { aiCost } from '../data/aiLimits';
import { planAtLeast } from '../data/plans';
import { askPricesDuringBuild, newSession, respond, type EngineContext } from '../utils/assistant/engine';
import { processUpload, imageSize } from '../utils/image';
import { uid } from '../utils/id';

const keyFor = (workspaceId: string, pageId: string) => `kubicu.assistant.${workspaceId}.${pageId}`;
const BUILD_STEP_MS = 150;

function readSession(key: string): AssistantSession | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) as AssistantSession : null;
  } catch {
    return null;
  }
}

/** Session state, the build runner and everything the assistant touches outside the chat (D211). */
export function useAssistant() {
  const { state, actions } = useEditor();
  const { current, currentSpace } = useWorkspace();
  const plan = usePlan();
  const commerce = useCommerce();
  const ops = useOps();
  const domains = useDomains();
  const market = useMarketplace();
  const library = useLibrary();
  const media = useOptionalMedia();
  const team = useTeam();
  const usage = useAiUsage();
  const reduceMotion = useReducedMotion();
  const pageId = state.draft.id;
  const key = keyFor(current.id, pageId);

  const [session, setSession] = useState<AssistantSession>(() => readSession(key) ?? newSession(current.id, pageId, current.name));
  const [resumable] = useState(() => {
    const s = readSession(key);
    return !!s && s.messages.length > 2 && s.stage !== 'done';
  });
  const [typing, setTyping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const typingTimer = useRef<number>();

  const ctx: EngineContext = useMemo(
    () => ({
      owns: (id) => market.hasLicence(id),
      signatureAllowed: planAtLeast(plan.id, 'creator'),
      currentTheme: state.draft.theme,
      pageHasContent: state.draft.blocks.length > 1,
      bookingsReady: market.isActive('bookings'),
      workspaceName: current.name || undefined
    }),
    [market, plan.id, state.draft.theme, state.draft.blocks.length, current.name]
  );
  const ctxRef = useRef(ctx);
  ctxRef.current = ctx;

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(session));
    } catch {

      /* storage full — the session lasts for this visit */}
  }, [key, session]);

  useEffect(() => () => window.clearTimeout(typingTimer.current), []);

  /** Sends input to the engine after a short "typing" pause (instant with reduced motion). */
  const send = useCallback(
    (input: AssistantInput) => {
      if (typing) return;
      const run = () => {
        setSession((s) => respond(s, input, ctxRef.current));
        setTyping(false);
      };
      if (reduceMotion) return run();
      setTyping(true);
      typingTimer.current = window.setTimeout(run, 450);
    },
    [typing, reduceMotion]
  );

  /** Saves photos to Media (logo → Brand assets, product photos → Product images) and hands them to the chat. */
  const uploadImages = useCallback(
    async (files: File[], as: 'logo' | 'photos'): Promise<string | null> => {
      if (!files.length) return null;
      setUploading(true);
      const items: AssistantImage[] = [];
      let problem: string | null = null;
      const productish = session.answers.offer === 'products' || session.answers.offer === 'menu';
      const folder = as === 'logo' ? 'brand' : productish ? 'products' : undefined;
      for (const file of files.slice(0, as === 'logo' ? 1 : 8)) {
        try {
          if (media) {
            const stored = await media.addFile(file, folder);
            items.push({ src: stored.src, name: stored.asset?.name ?? file.name, role: as === 'logo' ? 'logo' : 'gallery', width: stored.asset?.width ?? 1, height: stored.asset?.height ?? 1 });
          } else {
            const dataUrl = await processUpload(file);
            const size = await imageSize(dataUrl);
            items.push({ src: dataUrl, name: file.name, role: as === 'logo' ? 'logo' : 'gallery', ...size });
          }
        } catch (e) {
          problem = e instanceof Error ? e.message : 'One photo couldn’t be added.';
        }
      }
      setUploading(false);
      if (items.length) send({ kind: 'images', items });
      return problem;
    },
    [media, send, session.answers.offer]
  );

  const approve = useCallback((): string | null => {
    if (!usage.canSpend(aiCost.page)) {
      setSession((s) => s.messages[s.messages.length - 1]?.card === 'credits' ? s : { ...s, messages: [...s.messages, msg(`Building needs ${aiCost.page} AI credits and you have ${usage.remaining} left this month. Nothing has been charged and your plan is kept — you can come back after ${usage.resetsOn}, get more credits, or build it yourself in the canvas.`, { card: 'credits' })] });
      return null;
    }
    usage.spend(aiCost.page, 'AI page assistant');
    send({ kind: 'approve' });
    return null;
  }, [usage, send]);

  /* ---- Pass D: changes by chat after the build ---- */

  const changes = session.changes ?? [];
  const pending = changes.find((c) => c.status === 'pending') ?? null;
  const lastKept = [...changes].reverse().find((c) => c.status === 'kept' || c.status === 'undone');

  /** Asks for a change. The result is a proposal shown before/after; nothing touches the page until Keep. */
  const requestChange = useCallback(
    (text: string) => {
      if (typing || session.stage !== 'done' || session.removed) return;
      const request = text.trim();
      if (!request) return;
      const focusId = session.focusId;
      setSession((s) => ({ ...s, changes: (s.changes ?? []).map((c) => c.status === 'pending' ? { ...c, status: 'discarded' } : c), messages: [...s.messages, { id: uid('msg'), role: 'user', text: request, createdAt: new Date().toISOString() }] }));
      const run = () => {
        setTyping(false);
        if (typeof navigator !== 'undefined' && navigator.onLine === false) {
          setSession((s) => ({ ...s, messages: [...s.messages, msg('I couldn’t reach the assistant — it looks like you’re offline. Nothing was changed and no credit was used.', { card: 'failed', retryText: request, tone: 'warning' })] }));
          return;
        }
        if (!usage.canSpend(aiCost.block)) {
          setSession((s) => ({ ...s, messages: [...s.messages, msg(`Each change uses ${aiCost.block} AI credit and you have none left this month. Your page is safe — you can still edit everything yourself in the canvas. Credits reset on ${usage.resetsOn}.`, { card: 'credits' })] }));
          return;
        }
        const result: RefineResult | null = (() => {
          try {
            return proposeChange({ text: request, blocks: state.draft.blocks, theme: state.draft.theme, focusId, signatureAllowed: ctxRef.current.signatureAllowed, photos: session.images.filter((i) => i.role !== 'logo').map((i) => ({ src: i.src, name: i.name })) });
          } catch {
            return null;
          }
        })();
        if (!result) {
          setSession((s) => ({ ...s, messages: [...s.messages, msg('Something went wrong on my side. Nothing was changed and no credit was used.', { card: 'failed', retryText: request, tone: 'warning' })] }));
          return;
        }
        if (result.kind === 'decline') {
          // A normal reply, not an error — warnings are kept for real problems (offline, failures).
          setSession((s) => ({ ...s, messages: [...s.messages, msg(`${result.message} (No credit used.)`)] }));
          return;
        }
        usage.spend(aiCost.block, 'AI page assistant — change');
        const change: AssistantChange = { id: uid('chg'), request, summary: result.summary, blocks: result.blocks, theme: result.theme, focusId: result.focusId, status: 'pending' };
        setSession((s) => ({ ...s, changes: [...(s.changes ?? []), change], messages: [...s.messages, msg(`${result.summary} Have a look on the right — keep it or discard it.`, { card: 'change', changeId: change.id })] }));
      };
      if (reduceMotion) return run();
      setTyping(true);
      typingTimer.current = window.setTimeout(run, 450);
    },
    [typing, session.stage, session.removed, session.focusId, session.images, usage, state.draft.blocks, state.draft.theme, reduceMotion]
  );

  const keepChange = useCallback(
    (id: string) => {
      const c = (session.changes ?? []).find((x) => x.id === id && x.status === 'pending');
      if (!c) return;
      actions.replaceBlocks(c.blocks, c.theme);
      team.log('pages', `changed ${state.draft.title || 'a page'} with the AI page assistant`);
      setSession((s) => ({ ...s, focusId: undefined, changes: (s.changes ?? []).map((x) => x.id === id ? { ...x, status: 'kept' } : x) }));
    },
    [session.changes, actions, team, state.draft.title]
  );

  const discardChange = useCallback((id: string) => {
    setSession((s) => ({ ...s, changes: (s.changes ?? []).map((x) => x.id === id && x.status === 'pending' ? { ...x, status: 'discarded' } : x) }));
  }, []);

  /** Undoes the most recent kept change (one editor undo step). */
  const undoChange = useCallback(
    (id: string) => {
      if (lastKept?.id !== id || lastKept.status !== 'kept') return;
      actions.undo();
      setSession((s) => ({ ...s, changes: (s.changes ?? []).map((x) => x.id === id ? { ...x, status: 'undone' } : x) }));
    },
    [lastKept, actions]
  );

  /** Tapping a section in the preview: "this" in the next message means it. */
  const focusSection = useCallback(
    (blockId: string | null) => {
      if (session.stage !== 'done' || session.removed) return;
      if (!blockId) return setSession((s) => ({ ...s, focusId: undefined }));
      const b = state.draft.blocks.find((x) => x.id === blockId);
      if (!b) return;
      setSession((s) => s.focusId === blockId ? s : { ...s, focusId: blockId, messages: [...s.messages, msg(`What should change about the ${blockName(b).toLowerCase()}? Tap a suggestion or tell me.`)] });
    },
    [session.stage, session.removed, state.draft.blocks]
  );

  /** Removes everything the assistant made: the page goes back to how it was, and untouched items are deleted. */
  const removeEverything = useCallback((): {kept: string[];} => {
    const s = session;
    if (!s.applied || s.removed) return { kept: [] };
    const kept: string[] = [];
    if (s.before) actions.replaceBlocks(s.before.blocks, s.before.theme);else
    actions.undo();
    const created = s.created ?? { productIds: [], serviceIds: [] };
    if (created.productIds.length) {
      const ids = new Set(created.productIds);
      const sold = new Set(commerce.data.orders.flatMap((o) => o.items.map((i) => i.productId)).filter((id) => ids.has(id)));
      if (sold.size) kept.push(`${sold.size} product${sold.size === 1 ? '' : 's'} with orders`);
      commerce.apply((d) => ({ ...d, products: d.products.filter((p) => !ids.has(p.id) || sold.has(p.id)) }));
    }
    if (created.serviceIds.length) {
      const ids = new Set(created.serviceIds);
      const booked = new Set(ops.data.bookings.map((b) => b.serviceId).filter((id) => ids.has(id)));
      if (booked.size) kept.push(`${booked.size} service${booked.size === 1 ? '' : 's'} with bookings`);
      ops.apply((d) => ({ ...d, services: d.services.filter((x) => !ids.has(x.id) || booked.has(x.id)) }));
    }
    if (created.qrId) domains.deleteQr(created.qrId);
    if (created.linkId) domains.apply((d) => ({ ...d, links: d.links.filter((l) => l.id !== created.linkId) }));
    if (s.savedTemplateId) library.deleteTemplate(s.savedTemplateId);
    team.log('pages', `removed what the AI page assistant made on ${state.draft.title || 'a page'}`);
    setSession((x) => ({
      ...x,
      removed: true,
      focusId: undefined,
      changes: (x.changes ?? []).map((c) => c.status === 'pending' ? { ...c, status: 'discarded' } : c),
      messages: [...x.messages, msg(`Done — your page is back to how it was before the build, and what I created is gone.${kept.length ? ` I kept ${kept.join(' and ')} so no customer loses anything.` : ''} Your photos stay in Media.`, { card: 'removed' })]
    }));
    return { kept };
  }, [session, actions, commerce, ops, domains, library, team, state.draft.title]);

  const setPaused = useCallback((paused: boolean) => {
    setSession((s) => s.stage === 'building' || s.stage === 'paused' ? { ...s, stage: paused ? 'paused' : 'building' } : s);
  }, []);

  /** Creates the owner's products or services, and the QR code, once the plan has been approved and built. */
  const createBusinessItems = (s: AssistantSession): AssistantCreated => {
    const p = s.plan!;
    const out: AssistantCreated = { productIds: [], serviceIds: [] };
    const now = new Date().toISOString();
    if (p.itemsAs === 'products' && p.items.length) {
      const products: Product[] = p.items.map((i) => ({
        ...blankProduct('physical'),
        id: i.id,
        name: i.name,
        priceNgn: i.priceNgn,
        status: i.priceNgn !== null ? 'active' : 'draft',
        trackStock: false,
        images: i.imageSrc ? [{ id: uid('img'), url: i.imageSrc, alt: i.name }] : []
      }));
      if (commerce.apply((d) => products.reduce((acc, prod) => upsertProduct(acc, prod), d))) out.productIds = products.map((x) => x.id);
    }
    if (p.itemsAs === 'services' && p.items.length && p.bookingsReady) {
      const services: Service[] = p.items.map((i) => ({ id: i.id, name: i.name, description: '', durationMin: 60, priceNgn: i.priceNgn, depositNgn: null, location: 'studio', locationNote: s.answers.city ?? '', bufferMin: 15, active: true }));
      if (ops.apply((d) => ({ ...d, services: [...d.services, ...services] }))) out.serviceIds = services.map((x) => x.id);
    }
    if (p.qr) {
      const base = slugify(s.answers.name || current.name || 'my-page').slice(0, 24) || 'page';
      let slug = `${base}-qr`;
      for (let n = 2; slugError(slug, domains.data) && n < 20; n++) slug = `${base}-qr-${n}`;
      const link: CampaignLink = { id: uid('lnk'), slug, name: `${s.answers.name || current.name} — page QR`, source: 'qr', destination: { spaceId: currentSpace.id, path: '' }, createdAt: now, archivedAt: null };
      const design: QrDesign = { id: uid('qr'), linkId: link.id, createdAt: now, fg: '#111111', bg: '#FFFFFF', centre: false, frameText: 'Scan to visit' };
      if (domains.saveQr(design, link)) {
        out.qrId = design.id;
        out.linkId = link.id;
      }
    }
    return out;
  };

  const restart = useCallback(() => {
    setSession(newSession(current.id, pageId, current.name));
  }, [current.id, current.name, pageId]);

  // The live build: one section at a time, then apply everything to the page as one undoable change.
  useEffect(() => {
    if (session.stage !== 'building' || !session.plan || session.question) return;
    const total = session.plan.units.length;
    // Right before the products or services go in, ask for any missing prices — the build waits.
    const offerAt = session.plan.units.findIndex((u) => u.blocks.some((b) => b.type === 'menu' || b.type === 'productGrid' || b.type === 'pricing'));
    if (session.built === Math.max(0, offerAt) && !session.asked.includes('prices') && (session.answers.items ?? []).some((i) => i.priceNgn === null)) {
      setSession((s) => askPricesDuringBuild(s));
      return;
    }
    if (session.built < total) {
      const t = window.setTimeout(() => setSession((s) => s.stage === 'building' ? { ...s, built: s.built + 1 } : s), reduceMotion ? 0 : BUILD_STEP_MS);
      return () => window.clearTimeout(t);
    }
    if (session.applied) return;
    const before = { blocks: state.draft.blocks, theme: state.draft.theme };
    const created = createBusinessItems(session);
    const blocks: Block[] = session.plan.units.flatMap((u) => u.blocks);
    if (session.answers.mode === 'add') actions.insertBlocks(blocks, 'Added by the assistant');else
    actions.replaceBlocks(blocks, session.plan.theme);
    let savedTemplateId: string | undefined;
    if (session.plan.source.kind === 'composed') savedTemplateId = library.saveTemplate(session.plan.source.name, blocks, session.plan.theme, 'assistant').id;
    team.log('pages', `built ${state.draft.title || 'a page'} with the AI page assistant`);
    const gaps = session.plan.gaps.length;
    setSession((s) => ({
      ...s,
      stage: 'done',
      applied: true,
      savedTemplateId,
      created,
      before,
      messages: [
      ...s.messages,
      {
        id: uid('msg'),
        role: 'assistant',
        text: `Your page is built.${gaps ? ` ${gaps} thing${gaps === 1 ? '' : 's'} still need${gaps === 1 ? 's' : ''} your details before you publish — they’re listed below.` : ''} Nothing is live until you publish. Want changes? Tap a suggestion, tap a section in the preview, or tell me — each change uses ${aiCost.block} credit and you keep or discard it.`,
        card: 'done',
        createdAt: new Date().toISOString()
      }]

    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.stage, session.built, session.applied, session.question]);

  /** Blocks for the live preview: the current page while talking, the plan while reviewing, the build as it grows. */
  const preview = useMemo(() => {
    if (session.stage === 'done' && pending) return { blocks: pending.blocks, theme: pending.theme, label: 'Proposed change' };
    if (session.plan && (session.stage === 'plan' || session.stage === 'building' || session.stage === 'paused')) {
      const units = session.stage === 'plan' ? session.plan.units : session.plan.units.slice(0, session.built);
      return { blocks: units.flatMap((u) => u.blocks), theme: session.plan.theme, label: session.stage === 'plan' ? 'Plan preview' : 'Building' };
    }
    return { blocks: state.draft.blocks, theme: state.draft.theme, label: session.stage === 'done' ? 'Your page' : 'Your page now' };
  }, [session.plan, session.stage, session.built, state.draft.blocks, state.draft.theme, pending]);

  /** The page as it is now, for "Before" while a change is proposed. */
  const current_ = useMemo(() => ({ blocks: state.draft.blocks, theme: state.draft.theme }), [state.draft.blocks, state.draft.theme]);

  return {
    session,
    send,
    typing,
    uploading,
    uploadImages,
    approve,
    setPaused,
    restart,
    resumable,
    preview,
    beforeChange: pending ? current_ : null,
    pending,
    lastKeptId: lastKept?.status === 'kept' ? lastKept.id : null,
    requestChange,
    keepChange,
    discardChange,
    undoChange,
    focusSection,
    removeEverything,
    undo: actions.undo,
    doc: state.draft,
    usage
  };
}

function msg(text: string, extra: Partial<AssistantMessage> = {}): AssistantMessage {
  return { id: uid('msg'), role: 'assistant', text, createdAt: new Date().toISOString(), ...extra };
}