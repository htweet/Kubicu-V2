import type { AssistantAction, AssistantAnswers, AssistantFeel, AssistantImage, AssistantPlan } from '../../types/assistant';
import type { Block, PageDocument } from '../../types/page';
import type { CopilotBrief, CopilotInput, CopilotKind, CopilotMessage, CopilotQuestion, CopilotSession, CopilotTopic } from '../../types/copilot';
import {
  COPILOT_GREETING,
  MAX_PHOTOS,
  audienceWords,
  confusedWords,
  decideWords,
  helpMore,
  helps,
  goalLabels,
  goalReplies,
  kindDefaults,
  kindLabels,
  kindReplies,
  lookLabels,
  lookReplies,
  lookWords,
  prompts,
  sensitivePatterns,
  skipWords } from
'../../data/copilotQuestions';
import { actionWords, offerWords } from '../../data/assistantQuestions';
import { blankTemplateDoc } from '../../data/templates';
import { analyzeBrief } from '../ai/brief';
import { makePlan } from '../assistant/layout';
import { parsePriceList } from '../assistant/priceList';
import { uid } from '../id';
import { findMobileNumber } from '../phone';
import { currentLang } from '../localeFormat';
import { understand } from './understand';
import { readDraft } from './store';
import { findGuide, readQuestion } from './askAnything';
import { helpArticleHref } from '../help';
import { COPILOT_ANSWER_THEN_DRAFT, COPILOT_ANSWER_THEN_KIND, COPILOT_ANSWER_THEN_QUESTION, COPILOT_GUIDE_LEAD, COPILOT_UNKNOWN_ANSWER } from '../../data/copilotHelpTopics';

/**
 * KUBICU Copilot's conversation (D262) — rule-based in the prototype. It reads everything from what the
 * person already said, then asks only what's missing: 3–6 questions after the opening, one per message.
 * A real model replaces `respond` and `readFacts` without changing the screens.
 */

export const MIN_QUESTIONS = 3;
export const MAX_QUESTIONS = 6;

const now = () => new Date().toISOString();

function msg(from: CopilotMessage['from'], text: string, extra: Partial<CopilotMessage> = {}): CopilotMessage {
  return { id: uid('cm'), from, text, createdAt: now(), ...extra };
}

export function newSession(channel: CopilotSession['channel'], chatPhone?: string): CopilotSession {
  const question: CopilotQuestion = { topic: 'kind', text: COPILOT_GREETING, replies: kindReplies, input: 'choice', skippable: false, placeholder: 'Or describe it in your own words…' };
  return {
    id: uid('cps'),
    channel,
    stage: 'asking',
    answers: { brief: '' },
    asked: [],
    question,
    messages: [msg('copilot', COPILOT_GREETING, { replies: kindReplies })],
    images: [],
    brief: null,
    progress: 0,
    chatPhone,
    createdAt: now(),
    updatedAt: now()
  };
}

const lookByKind: Record<CopilotKind, AssistantFeel> = { business: 'warm', portfolio: 'editorial', creator: 'glass', shop: 'bold', service: 'light', event: 'bold', other: 'light' };

function kindFromText(text: string): CopilotKind {
  const offer = offerWords.find(([, re]) => re.test(text))?.[0];
  if (/\b(portfolio|designer|photograph|illustrat|architect)/i.test(text)) return 'portfolio';
  if (/\b(creator|influencer|youtube|tiktok|podcast|music|artist)/i.test(text)) return 'creator';
  if (offer === 'products') return 'shop';
  if (offer === 'services') return 'service';
  if (offer === 'events') return 'event';
  return 'business';
}

/**
 * Facts the person typed. Fills gaps only, unless `override` (they asked to change something).
 * `hints` (D518): English words for what they typed in another language — used for matching meanings only;
 * names, places and numbers are always read from their own words.
 */
export function readFacts(a: AssistantAnswers, text: string, override = false, hints = ''): AssistantAnswers {
  const out = { ...a };
  const set = <K extends keyof AssistantAnswers,>(k: K, v: AssistantAnswers[K] | undefined) => {
    if (v !== undefined && v !== '' && (override || out[k] === undefined || out[k] === '')) out[k] = v;
  };
  const m = hints ? `${text}\n${hints}` : text;
  const found = analyzeBrief(text);
  set('business', found.exampleId ?? (hints ? analyzeBrief(hints).exampleId ?? undefined : undefined));
  set('name', found.name || undefined);
  set('city', found.city || undefined);
  set('phone', found.phone || undefined);
  set('action', actionWords.find(([, re]) => re.test(m))?.[0]);
  set('offer', offerWords.find(([, re]) => re.test(m))?.[0]);
  set('feel', lookWords.find(([, re]) => re.test(m))?.[0]);
  set('audience', audienceWords.find(([, re]) => re.test(m))?.[0]);
  const named = /(?:call it|name it|rename (?:it )?to|called)\s+["“]?([^"”.!?\n]{2,60})/i.exec(text);
  if (named && override) out.name = named[1].trim();
  return out;
}

function questionFor(topic: CopilotTopic, s: CopilotSession): CopilotQuestion {
  const q = baseQuestion(topic, s);
  return helps[topic] ? { ...q, help: helps[topic] } : q;
}

const hasLogo = (images: AssistantImage[]) => images.some((i) => i.role === 'logo');
const photoCount = (images: AssistantImage[]) => images.filter((i) => i.role !== 'logo').length;

function baseQuestion(topic: CopilotTopic, s: CopilotSession): CopilotQuestion {
  switch (topic) {
    case 'logo':
      return { topic, text: prompts.logo, replies: [{ value: 'nologo', label: 'I don’t have one' }], input: 'images', skippable: false, maxImages: 1 };
    case 'about':
      return { topic, text: prompts.about, replies: [], input: 'text', skippable: true, placeholder: 'e.g. I make small chops and party trays for events in Lekki' };
    case 'name':
      return { topic, text: prompts.name, replies: [], input: 'text', skippable: false, placeholder: 'Business or your own name' };
    case 'goal':
      return { topic, text: prompts.goal, replies: goalReplies, input: 'choice', skippable: false };
    case 'look':
      return { topic, text: prompts.look, replies: lookReplies, input: 'choice', skippable: false };
    case 'photos':{
        const room = MAX_PHOTOS - photoCount(s.images);
        return { topic, text: room < MAX_PHOTOS ? `You can send ${room} more photo${room === 1 ? '' : 's'} of your work, products, space or you.` : prompts.photos, replies: [], input: 'images', skippable: true, maxImages: Math.max(1, room) };
      }
    case 'items':
      return { topic, text: prompts.items, replies: [], input: 'text', skippable: true, placeholder: 'One item per line' };
    case 'phone':
      return { topic, text: prompts.phone, replies: s.chatPhone ? [{ value: s.chatPhone, label: 'Use this chat’s number' }] : [], input: 'tel', skippable: true, placeholder: '0803 123 4567' };
    case 'city':
      return { topic, text: prompts.city, replies: [{ value: 'Lagos', label: 'Lagos' }, { value: 'Abuja', label: 'Abuja' }, { value: 'online', label: 'Online only' }], input: 'text', skippable: true, placeholder: 'e.g. Lekki, Lagos' };
    case 'change':
      return { topic, text: prompts.change, replies: [], input: 'text', skippable: false, placeholder: 'e.g. Make it warmer, or call it Tolu’s Kitchen' };
    case 'more':
      return { topic, text: prompts.more, replies: [], input: 'text', skippable: true, placeholder: 'Anything else for the page' };
    default:
      return { topic: 'kind', text: COPILOT_GREETING, replies: kindReplies, input: 'choice', skippable: false };
  }
}

// The logo and photos are one step for the 3–6 count — asked separately so the logo never gets mixed up with photos.
const counted = (s: CopilotSession) => s.asked.filter((t) => t !== 'kind' && t !== 'change' && t !== 'more' && t !== 'logo').length;

/** The next most valuable thing to ask, or null when it's time for the brief. */
function nextTopic(s: CopilotSession): CopilotTopic | null {
  const a = s.answers;
  const asked = new Set(s.asked);
  const offer = a.offer;
  const wanted: CopilotTopic[] = [];
  if ((a.brief ?? '').trim().length < 20) wanted.push('about');
  if (!a.name) wanted.push('name');
  if (!a.action) wanted.push('goal');
  if (!a.feel) wanted.push('look');
  if ((offer === 'products' || offer === 'menu') && !(a.items ?? []).length) wanted.push('items');
  if (!hasLogo(s.images)) wanted.push('logo');
  if (!photoCount(s.images)) wanted.push('photos');
  if ((a.action === 'order' || a.action === 'enquire' || a.action === 'buy') && !a.phone) wanted.push('phone');
  if ((offer === 'menu' || offer === 'products' || offer === 'services') && !a.city) wanted.push('city');
  const open = wanted.filter((t) => !asked.has(t));
  // Straight after the logo, photos always follow — they're one step.
  if (s.asked[s.asked.length - 1] === 'logo' && open.includes('photos')) return 'photos';
  if (counted(s) >= MAX_QUESTIONS) return null;
  if (open.length) return open[0];
  if (counted(s) < MIN_QUESTIONS) return (['look', 'photos', 'more'] as CopilotTopic[]).find((t) => !asked.has(t)) ?? null;
  return null;
}

function ask(s: CopilotSession, topic: CopilotTopic, lead?: string): CopilotSession {
  const q = questionFor(topic, s);
  const text = `${lead ? `${lead} ` : ''}${q.text}${q.help ? `\n\n${q.help}` : ''}`;
  return { ...s, stage: 'asking', question: q, asked: s.asked.includes(topic) ? s.asked : [...s.asked, topic], messages: [...s.messages, msg('copilot', text, { replies: q.replies, card: topic === 'look' ? 'looks' : undefined })] };
}

function advance(s: CopilotSession, lead?: string): CopilotSession {
  const t = nextTopic(s);
  if (t) return ask(s, t, lead);
  return showBrief(s, lead);
}

const planCtx = { owns: () => false, signatureAllowed: true, currentTheme: blankTemplateDoc.theme, bookingsReady: false };

export function planFor(s: CopilotSession): AssistantPlan {
  return makePlan({ ...s.answers, mode: 'replace', qr: false }, s.images, planCtx);
}

export function briefFrom(s: CopilotSession, plan: AssistantPlan): CopilotBrief {
  const a = s.answers;
  const gaps = [...plan.gaps];
  if ((a.action === 'order' || a.action === 'enquire') && !a.phone) gaps.push('Your WhatsApp number');
  if (!photoCount(s.images)) gaps.push('Your photos');
  if (a.action === 'buy') gaps.push('Online checkout — set up in KUBICU before people can pay');
  if (a.action === 'book') gaps.push('Bookings — shown as an enquiry until you set it up in KUBICU');
  return {
    kindLabel: a.businessText || kindLabels[s.kind ?? 'other'],
    name: a.name || 'Not given yet',
    audience: a.audience || 'Anyone who finds your link',
    goal: a.action ? goalLabels[a.action] : 'Get in touch',
    action: a.action ?? 'enquire',
    look: a.feel ? `${lookLabels[a.feel]} · ${plan.themeName}` : plan.themeName,
    sections: plan.units.filter((u) => !u.blocks[0].visibility.hidden).map((u) => u.label),
    layout: plan.source.kind === 'template' ? `Starts from the ${plan.source.name} template` : 'A new layout from ready-made sections',
    layoutReason: plan.source.reason,
    gaps: [...new Set(gaps)].slice(0, 6)
  };
}

function showBrief(s: CopilotSession, lead?: string): CopilotSession {
  const brief = briefFrom(s, planFor(s));
  const text = `${lead ? `${lead} ` : ''}Here’s what I’ll make. Nothing is published — you’ll see a draft first.`;
  return {
    ...s,
    stage: 'brief',
    question: null,
    brief,
    messages: [...s.messages, msg('copilot', text, { card: 'brief', replies: [{ value: 'create', label: 'Create my draft' }, { value: 'change', label: 'Change something' }, { value: 'more', label: 'Add more details' }] })]
  };
}

export interface PhotoResult {
  images: AssistantImage[];
  logo: boolean;
  added: number;
  /** Photos that didn't fit (over the limit) — always reported, never silently dropped. */
  over: number;
}

/**
 * Gives every photo a job (D265). The logo question's picture is the logo — whatever its file name. Other
 * photos: the first leads the page (hero), the rest are the gallery, up to MAX_PHOTOS. Sent outside those
 * questions, a file named like a logo still becomes the logo when there isn't one yet.
 */
export function rolePhotos(existing: AssistantImage[], incoming: AssistantImage[], as: 'logo' | 'photos' | 'auto'): PhotoResult {
  let images = [...existing];
  let logo = false;
  let rest = incoming;
  if (as === 'logo' || as === 'auto' && !hasLogo(images)) {
    const pick = as === 'logo' ? incoming[0] : incoming.find((i) => /logo/i.test(i.name));
    if (pick) {
      images = [{ ...pick, role: 'logo' }, ...images.filter((i) => i.role !== 'logo')];
      logo = true;
      rest = incoming.filter((i) => i !== pick);
    }
  }
  const room = Math.max(0, MAX_PHOTOS - photoCount(images));
  const taken = rest.slice(0, room);
  let hero = images.some((i) => i.role === 'hero');
  for (const img of taken) {
    images.push({ ...img, role: hero ? 'gallery' : 'hero' });
    hero = true;
  }
  return { images, logo, added: taken.length, over: rest.length - taken.length };
}

function photosLead(r: PhotoResult): string {
  const parts: string[] = [];
  if (r.logo) parts.push('Got your logo — it goes in the round picture at the top of your page.');
  const gallery = r.images.filter((i) => i.role === 'gallery').length;
  if (r.added) parts.push(`Got ${r.added} photo${r.added === 1 ? '' : 's'}. Your first photo is the big picture at the top${gallery ? `, and ${gallery === 1 ? 'the other one goes' : `the other ${gallery} go`} in a photo gallery` : ''}.`);
  if (r.over) parts.push(`I could only keep ${MAX_PHOTOS} photos, so the last ${r.over} weren’t added — you can add more later in KUBICU.`);
  return parts.join(' ');
}

/**
 * D520: Copilot is KUBICU's front door, with building as its main job. A question about KUBICU gets a short answer
 * and a link to the screen where the person does it — then the conversation carries on where it was.
 * Building always wins. In the middle of the interview only a clear question counts, so answers aren't mistaken
 * for questions. An unknown question is only answered at the start, honestly, with the Help centre — never a guess.
 */
function answerQuestion(s: CopilotSession, raw: string, hints: string): CopilotSession | null {
  const q = s.question;
  const r = readQuestion(raw, hints, currentLang());
  if (r.build) return null;
  const midInterview = !!q && q.topic !== 'kind';
  // D521: no ready answer? A clear question can still be answered from the Help centre guides.
  const guide = !r.topic && r.question ? findGuide(raw, hints) : null;
  if (midInterview && !((r.topic || guide) && r.question)) return null;
  if (!r.topic && !guide) {
    const describes = offerWords.some(([, re]) => re.test(`${raw}\n${hints}`));
    if (!(q?.topic === 'kind' && r.question && !describes)) return null;
  }
  const answer = r.topic?.answer ?? (guide ? `${COPILOT_GUIDE_LEAD}\n\n${guide.a}` : COPILOT_UNKNOWN_ANSWER);
  const links = r.topic?.links ?? (guide ? [{ label: 'Read the full guide', to: helpArticleHref(guide.id) }] : [{ label: 'Open the Help centre', to: '/about/help' }]);
  let text: string;
  let replies = q?.replies;
  if (q && q.topic !== 'kind') text = `${answer}\n\n${COPILOT_ANSWER_THEN_QUESTION}\n\n${q.text}`;else
  if (q) text = `${answer}\n\n${COPILOT_ANSWER_THEN_KIND}`;else
  {
    text = `${answer}\n\n${COPILOT_ANSWER_THEN_DRAFT}`;
    replies = [...s.messages].reverse().find((m) => m.from === 'copilot' && m.replies?.length)?.replies;
  }
  return {
    ...s,
    messages: [...s.messages, msg('user', raw.trim()), msg('copilot', text, { links, replies, card: q?.topic === 'look' ? 'looks' : undefined })]
  };
}

function userText(input: CopilotInput): string {
  switch (input.kind) {
    case 'text':
      return input.text.trim();
    case 'choice':
      return input.label;
    case 'images':
      return `Sent ${input.items.length} photo${input.items.length === 1 ? '' : 's'}`;
    case 'skip':
      return 'Skip';
    case 'create':
      return 'Create my draft';
    case 'change':
      return 'Change something';
    case 'more':
      return 'Add more details';
  }
}

/** One turn of the conversation. Generation itself is run by the hook once the stage is `generating`. */
export function respond(prev: CopilotSession, input: CopilotInput): CopilotSession {
  let s: CopilotSession = { ...prev, updatedAt: now() };
  const raw = input.kind === 'text' ? input.text : '';
  // Typed answers in the screen language (D518): English hints for meanings; their own words stay as typed.
  const u = input.kind === 'text' ? understand(raw, currentLang()) : null;
  const hints = u?.hints ?? '';
  const match = hints ? `${raw}\n${hints}` : raw;

  // Never keep card numbers, passwords or ID numbers.
  if (raw && sensitivePatterns.some((re) => re.test(raw))) {
    s = { ...s, messages: [...s.messages, msg('user', '[Removed — this looked like a card number, password or ID number]'), msg('copilot', 'I’ve removed that message. I never need card numbers, passwords, PINs, BVN or NIN to make your page — please don’t send them here.', { tone: 'warning' })] };
    return s.question ? { ...s, messages: [...s.messages, msg('copilot', s.question.text, { replies: s.question.replies })] } : s;
  }

  // Questions about KUBICU get a short answer and a link (D520).
  if (input.kind === 'text' && raw.trim() && s.stage !== 'generating' && s.stage !== 'limit') {
    const answered = answerQuestion(s, raw, hints);
    if (answered) return answered;
  }

  // Once a draft has moved into KUBICU, changes happen there — the chat no longer edits it (D264).
  const claimed = s.draftId ? readDraft(s.draftId)?.claimed : undefined;
  if (claimed && s.stage === 'ready' && (input.kind === 'change' || input.kind === 'text' && !s.question)) {
    return {
      ...s,
      messages: [
      ...s.messages,
      msg('user', userText(input)),
      msg('copilot', 'Your draft is in KUBICU now, so make changes there — the page assistant in the canvas can do this for you. Want to start a different page here instead? Tap Start over.', {
        replies: [{ value: 'continue', label: 'Open in KUBICU' }]
      })]

    };
  }

  // Typing after the brief or the preview means "change something".
  if (input.kind === 'text' && !s.question && (s.stage === 'brief' || s.stage === 'ready')) {
    return respond({ ...prev, question: questionFor('change', prev) }, input);
  }

  s = { ...s, messages: [...s.messages, msg('user', userText(input), { images: input.kind === 'images' ? input.items.map((i) => i.thumb ?? i.src) : undefined })] };

  // "What do you mean?" — explain more simply and ask the same thing again (D265).
  if (input.kind === 'text' && s.question && (confusedWords.test(raw) || u?.confused)) {
    const q = s.question;
    const more = helpMore[q.topic] ?? q.help ?? 'Sorry, let me put it simply.';
    const again = q.topic === 'kind' ? 'So, what are you creating today?' : q.text;
    return { ...s, messages: [...s.messages, msg('copilot', `${more}\n\n${again}`, { replies: q.replies, card: q.topic === 'look' ? 'looks' : undefined })] };
  }

  // Photos sent in the middle of another question are kept, never lost (WhatsApp allows attaching any time).
  if (input.kind === 'images' && s.question?.topic !== 'logo' && s.question?.topic !== 'photos') {
    const r = rolePhotos(s.images, input.items, 'auto');
    s = { ...s, images: r.images };
    const q = s.question;
    const lead = photosLead(r) || 'I already have the most photos I can use.';
    if (!q || q.topic === 'change') return showBrief(s, lead);
    return { ...s, messages: [...s.messages, msg('copilot', `${lead}\n\n${q.topic === 'kind' ? 'So, what are you creating today?' : q.text}`, { replies: q.replies, card: q.topic === 'look' ? 'looks' : undefined })] };
  }

  // Brief and ready actions.
  if (input.kind === 'create') return { ...s, stage: 'generating', progress: 0, question: null };
  if (input.kind === 'change') return ask(s, 'change');
  if (input.kind === 'more') return ask(s, 'more');

  const topic = s.question?.topic;
  const a = s.answers;
  const skip = input.kind === 'skip' || input.kind === 'text' && (skipWords.test(raw.trim()) || !!u?.skip);
  const decide = input.kind === 'choice' ? input.value === 'decide' : decideWords.test(raw) || !!u?.decide;

  switch (topic) {
    case 'kind':{
        const kind = (input.kind === 'choice' ? input.value : kindFromText(match)) as CopilotKind;
        const d = kindDefaults[kind];
        let answers: AssistantAnswers = { ...a, offer: a.offer ?? d.offer, action: a.action ?? d.action };
        if (input.kind === 'text') {
          answers = readFacts({ ...answers, brief: raw.trim(), businessText: kind === 'other' ? raw.trim().slice(0, 40) : undefined }, raw, false, hints);
          answers.offer = answers.offer ?? d.offer;
        }
        if (kind === 'portfolio') answers.offer = 'content';
        return advance({ ...s, kind, answers }, input.kind === 'text' ? 'Got it.' : undefined);
      }
    case 'about':{
        if (skip) return advance(s, 'No problem — I’ll keep the wording short and you can add more later.');
        const answers = readFacts({ ...a, brief: `${a.brief} ${raw}`.trim() }, raw, false, hints);
        if (s.kind === 'other' && !answers.businessText) answers.businessText = raw.trim().split(/[.!?]/)[0].slice(0, 40);
        return advance({ ...s, answers }, answers.name ? `Lovely — “${answers.name}”.` : 'Lovely.');
      }
    case 'name':{
        const name = raw.trim().replace(/[.!]+$/, '').slice(0, 60);
        if (!name || skip) return { ...s, messages: [...s.messages, msg('copilot', 'I’ll need a name for the top of the page — your business name or your own name is fine.', { tone: 'warning' })] };
        return advance({ ...s, answers: { ...a, name } });
      }
    case 'goal':{
        let action: AssistantAction | undefined;
        let offer = a.offer;
        if (input.kind === 'choice' && input.value === 'view') {
          action = 'enquire';
          offer = 'content';
        } else if (input.kind === 'choice' && !decide) action = input.value as AssistantAction;else
        action = decide ? undefined : actionWords.find(([, re]) => re.test(match))?.[0];
        const lead = decide || !action ? 'I’ll go with WhatsApp messages — it’s how most customers here reach a business.' : undefined;
        return advance({ ...s, answers: { ...a, action: action ?? kindDefaults[s.kind ?? 'other'].action ?? 'order', offer } }, lead);
      }
    case 'look':{
        const feel = input.kind === 'choice' && !decide ? input.value as AssistantFeel : decide ? undefined : lookWords.find(([, re]) => re.test(match))?.[0];
        const chosen = feel ?? lookByKind[s.kind ?? 'other'];
        return advance({ ...s, answers: { ...a, feel: chosen } }, feel ? undefined : `I’ll use ${lookLabels[chosen]} — it suits ${kindLabels[s.kind ?? 'other'].toLowerCase()}.`);
      }
    case 'logo':{
        if (input.kind === 'images') {
          const r = rolePhotos(s.images, input.items, 'logo');
          return advance({ ...s, images: r.images }, photosLead(r));
        }
        if (input.kind === 'choice' || skip || decide) return advance(s, 'No problem — lots of small businesses don’t have one. I’ll show your initials in a neat circle, and you can add a logo any time.');
        return { ...s, messages: [...s.messages, msg('copilot', 'To send your logo, tap the photo button and choose the picture. Or tap “I don’t have one”.', { replies: s.question?.replies })] };
      }
    case 'photos':{
        if (input.kind === 'images') {
          const r = rolePhotos(s.images, input.items, 'photos');
          return advance({ ...s, images: r.images }, photosLead(r));
        }
        if (skip || decide) return advance(s, 'That’s fine — the photo spaces stay hidden until you add pictures, so the page still looks finished.');
        return { ...s, messages: [...s.messages, msg('copilot', 'To send photos, tap the photo button and choose them from your phone — you can pick several at once. No photos yet? Just say “skip”.')] };
      }
    case 'items':{
        if (skip) return advance(s, 'Okay — you can add them in KUBICU later.');
        const items = parsePriceList(raw, 20);
        if (!items.length) return { ...s, messages: [...s.messages, msg('copilot', 'I couldn’t read that as a list. Try one item per line, like “Jollof tray — 25,000”, or say skip.', { tone: 'warning' })] };
        const unpriced = items.filter((i) => i.priceNgn === null).length;
        return advance({ ...s, answers: { ...a, items } }, `Got ${items.length} item${items.length === 1 ? '' : 's'}${unpriced ? ` — ${unpriced} without a price will stay marked to fill in` : ''}.`);
      }
    case 'phone':{
        if (skip) return advance(s, 'Okay — the WhatsApp button stays hidden until you add a number.');
        const value = input.kind === 'choice' ? input.value : raw;
        // Any of our four countries; a number without a country code is read as the visitor's (D420).
        const phone = findMobileNumber(value);
        if (!phone) return { ...s, messages: [...s.messages, msg('copilot', 'That doesn’t look like a complete mobile number. Check the digits or add your country code (+234, +254, +233 or +27), or say skip.', { tone: 'warning' })] };
        return advance({ ...s, answers: { ...a, phone } });
      }
    case 'city':{
        if (skip) return advance(s);
        const city = input.kind === 'choice' ? input.value === 'online' ? '' : input.value : raw.trim().slice(0, 60);
        return advance({ ...s, answers: { ...a, city: city || undefined, audience: a.audience ?? (input.kind === 'choice' && input.value === 'online' ? 'Customers across Nigeria' : undefined) } });
      }
    case 'change':{
        const answers = readFacts(a, u?.rename ? `${raw}\n${u.rename}` : raw, true, hints);
        const notes: string[] = [];
        if (/\b(remove|no) (the |my )?(photos?|pictures?|gallery)\b/i.test(match) && photoCount(s.images)) {
          s = { ...s, images: s.images.filter((i) => i.role === 'logo') };
          notes.push('Photos: removed (the photo spaces will be hidden)');
        }
        if (/\b(remove|no) (the |my )?logo\b/i.test(match) && hasLogo(s.images)) {
          s = { ...s, images: s.images.filter((i) => i.role !== 'logo') };
          notes.push('Logo: removed (your initials show instead)');
        }
        if (/\b(add|use|change|new|send|replace)\b.*\blogo\b/i.test(match)) return ask(s, 'logo', 'Sure.');
        if (/\b(add|use|more|new|send|replace)\b.*\b(photos?|pictures?|images?)\b/i.test(match)) {
          if (photoCount(s.images) >= MAX_PHOTOS) return showBrief(s, `You already have ${MAX_PHOTOS} photos, the most I can use here — you can add more in KUBICU after you continue.`);
          return ask(s, 'photos', 'Sure.');
        }
        notes.push(...describeChanges(a, answers));
        if (!notes.length) {
          return { ...s, messages: [...s.messages, msg('copilot', 'I want to get this right. Is it the name, the main action, the look, or something else? For example “make it warmer” or “call it Tolu’s Kitchen”.')] };
        }
        const lead = `Here’s what will change:\n${notes.map((n) => `• ${n}`).join('\n')}\nEverything else stays the same. Nothing changes on your draft until you tap “Create my draft”.`;
        return showBrief({ ...s, answers }, lead);
      }
    case 'more':{
        if (skip) return showBrief(s);
        const answers = readFacts({ ...a, brief: `${a.brief} ${raw}`.trim() }, raw, false, hints);
        return showBrief({ ...s, answers }, 'Added.');
      }
    default:
      return s;
  }
}

/** Plain-language list of what a change request altered, so people see it before the draft is rebuilt (D266). */
function describeChanges(before: AssistantAnswers, after: AssistantAnswers): string[] {
  const out: string[] = [];
  const goalLabel = (v?: string) => goalReplies.find((r) => r.value === v)?.label ?? v ?? 'not set';
  if (before.name !== after.name) out.push(`Name: “${before.name ?? 'not set'}” → “${after.name ?? 'not set'}”`);
  if (before.feel !== after.feel) out.push(`Look: ${before.feel ? lookLabels[before.feel] : 'not set'} → ${after.feel ? lookLabels[after.feel] : 'not set'}`);
  if (before.action !== after.action) out.push(`Main action: ${goalLabel(before.action)} → ${goalLabel(after.action)}`);
  if (before.phone !== after.phone) out.push(`WhatsApp number: ${after.phone ?? 'removed'}`);
  if (before.city !== after.city) out.push(`Location: ${after.city || 'removed'}`);
  if (JSON.stringify(before.items ?? []) !== JSON.stringify(after.items ?? [])) out.push(`Items: ${(after.items ?? []).length} on the list`);
  const known = ['name', 'feel', 'action', 'phone', 'city', 'items'];
  const other = (Object.keys({ ...before, ...after }) as Array<keyof AssistantAnswers>).filter((k) => !known.includes(k as string) && JSON.stringify(before[k]) !== JSON.stringify(after[k]));
  if (other.length && !out.length) out.push('The wording, based on what you just said');
  return out;
}

/** Builds the draft page document from the session — the same plan the brief described. */
export function draftDocFrom(s: CopilotSession, plan: AssistantPlan): PageDocument {
  const items = plan.items;
  const blocks: Block[] = plan.units.flatMap((u) => u.blocks).map((b) => {
    // Signed out there's no Commerce yet, so a product grid lists the person's own items directly.
    if (b.type === 'productGrid' && b.content.source === 'catalog') {
      return {
        ...b,
        visibility: { ...b.visibility, hidden: !items.length },
        content: { ...b.content, source: 'manual', productIds: [], collectionId: null, orderAction: 'whatsapp', ctaLabel: 'Order', items: items.map((i) => ({ id: i.id, name: i.name, priceNgn: i.priceNgn, imageUrl: i.imageSrc ?? '', imageAlt: i.imageSrc ? i.name : '', note: '', soldOut: false, url: '' })) }
      } as Block;
    }
    return b;
  });
  const title = s.answers.name || 'Your page';
  return { ...blankTemplateDoc, id: uid('cpdoc'), handle: 'draft', title, updatedAt: now(), seo: { title, description: '' }, theme: { ...plan.theme }, blocks };
}

export function progressSteps(): string[] {
  return ['Organising your brief', 'Choosing a layout and theme', 'Arranging the sections', 'Checking details that are still missing', 'Preparing your preview'];
}

export function readyMessage(s: CopilotSession, draftId: string, gaps: number): CopilotMessage {
  const lead = `Your draft is ready${s.answers.name ? `, ${s.answers.name}` : ''}. It’s not published — only people you share the preview link with can see it.`;
  const tail = gaps ? ` ${gaps} detail${gaps === 1 ? '' : 's'} still need${gaps === 1 ? 's' : ''} filling in before you publish.` : '';
  return msg('copilot', lead + tail, {
    card: 'preview',
    draftId,
    replies: [
    { value: 'open', label: 'Open preview' },
    { value: 'change', label: 'Make changes' },
    { value: 'continue', label: 'Continue to KUBICU' }]

  });
}

export function failedMessage(): CopilotMessage {
  return msg('copilot', 'I couldn’t finish your draft just now. Your answers are saved, and this didn’t count toward today’s limit.', { card: 'failed', tone: 'warning', replies: [{ value: 'retry', label: 'Try again' }] });
}

export function limitMessage(hasDraft = false): CopilotMessage {
  return msg('copilot', 'You’ve reached today’s free drafts and changes (3 drafts and 10 changes a day). Your answers and your last draft are saved — come back tomorrow, or continue in KUBICU with a free account.', {
    card: 'limit',
    replies: hasDraft ? [{ value: 'continue', label: 'Continue to KUBICU' }] : undefined
  });
}

export { msg as copilotMessage };