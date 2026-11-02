import type { AssistantChip, AssistantFeel, AssistantInput, AssistantMessage, AssistantQuestion, AssistantSession, QuestionId } from '../../types/assistant';
import type { PageTheme } from '../../types/page';
import { examplePages } from '../../data/examples';
import { actionChips, actionLabels, actionWords, audienceChips, cityChips, feelLabels, modeChips, offerChips, offerWords, qrChips, questionPrompts } from '../../data/assistantQuestions';
import { analyzeBrief, MIN_BRIEF } from '../ai/brief';
import { itemsAsFor, makePlan, themeForFeel } from './layout';
import { applyPrices, looksLikePriceList, parsePriceList } from './priceList';
import { proposeChange, REFINE_HELP } from './refine';
import { blockName } from '../blocks';
import { formatNgn } from '../format';
import { uid } from '../id';
import { findMobileNumber } from '../phone';

/**
 * The AI page assistant's brain (D211). One function, `respond`, takes the session and the owner's input and
 * returns the next session. In this prototype it's rule-based; a real model replaces this module on a server
 * (it must still return only these message, question and plan shapes, so the UI and safeguards don't change).
 */

export interface EngineContext {
  owns: (id: string) => boolean;
  signatureAllowed: boolean;
  currentTheme: PageTheme;
  /** The page already has more than a profile, so ask "replace or add?". */
  pageHasContent: boolean;
  /** Bookings is installed, so services can be created there. */
  bookingsReady: boolean;
  /** The workspace's name, offered as a one-tap answer to "What's the business called?". */
  workspaceName?: string;
}

/** The assistant always asks at least this many questions before it shows a plan. */
export const MIN_QUESTIONS = 3;
const starters = examplePages.filter((e) => !e.elite && !e.artwork);

const say = (text: string, extra: Partial<AssistantMessage> = {}): AssistantMessage => ({ id: uid('msg'), role: 'assistant', text, createdAt: new Date().toISOString(), ...extra });
const said = (text: string, images?: string[]): AssistantMessage => ({ id: uid('msg'), role: 'user', text, images, createdAt: new Date().toISOString() });

export function newSession(workspaceId: string, pageId: string, businessName: string): AssistantSession {
  const now = new Date().toISOString();
  return {
    id: uid('as'),
    workspaceId,
    pageId,
    // The assistant leads: it opens with a tap-to-answer question, never a blank "describe your business" box.
    stage: 'asking',
    answers: { brief: '' },
    messages: [
    say(`Hi${businessName ? ` — let’s build ${businessName}’s page together` : ''}. I’ll ask a few quick questions — tap an answer, or type your own whenever you like. Nothing changes until you approve the plan.`),
    say(questionPrompts.business)],

    question: businessQuestion(),
    asked: [],
    skipped: [],
    images: [],
    plan: null,
    built: 0,
    applied: false,
    createdAt: now,
    updatedAt: now
  };
}

function feelChips(signatureAllowed: boolean): AssistantChip[] {
  return (Object.keys(feelLabels) as AssistantFeel[]).map((f) => {
    const { theme } = themeForFeel(f, signatureAllowed);
    return { value: f, label: feelLabels[f], swatch: { background: theme.background, accent: theme.accent, text: theme.text } };
  });
}

const OTHER = '__other';

function businessQuestion(): AssistantQuestion {
  return {
    id: 'business',
    chips: [...starters.map((e) => ({ value: e.id, label: e.category })), { value: OTHER, label: 'Something else' }],
    allowText: true,
    input: 'choice',
    placeholder: 'Or type it in your own words',
    skippable: false
  };
}

function questionFor(id: QuestionId, ctx: EngineContext): AssistantQuestion {
  switch (id) {
    case 'business':
      return businessQuestion();
    case 'name':
      return { id, chips: ctx.workspaceName ? [{ value: ctx.workspaceName, label: `Use “${ctx.workspaceName}”` }] : [], allowText: true, input: ctx.workspaceName ? 'choice' : 'text', placeholder: ctx.workspaceName ? 'Or type a different name' : 'Business name', skippable: false };
    case 'audience':
      return { id, chips: audienceChips, allowText: true, input: 'choice', placeholder: 'Or describe them', skippable: false };
    case 'action':
      return { id, chips: actionChips, allowText: true, input: 'choice', placeholder: 'Or say it your way', skippable: false };
    case 'offer':
      return { id, chips: offerChips, allowText: true, input: 'choice', placeholder: 'Or say it your way', skippable: false };
    case 'city':
      return { id, chips: cityChips, allowText: true, input: 'choice', placeholder: 'Or type your area', skippable: true };
    case 'phone':
      return { id, chips: [], allowText: true, input: 'tel', placeholder: '0803 123 4567', skippable: true };
    case 'feel':
      return { id, chips: feelChips(ctx.signatureAllowed), allowText: false, input: 'choice', skippable: true };
    case 'logo':
      return { id, chips: [], allowText: false, input: 'image', skippable: true };
    case 'photos':
      return { id, chips: [], allowText: false, input: 'images', skippable: true };
    case 'mode':
      return { id, chips: modeChips, allowText: false, input: 'choice', skippable: false };
    case 'items':
      return { id, chips: [], allowText: true, input: 'text', placeholder: 'One item per line', skippable: true };
    case 'qr':
      return { id, chips: qrChips, allowText: false, input: 'choice', skippable: false };
    case 'prices':
      return { id, chips: [], allowText: true, input: 'text', placeholder: 'e.g. Asun 4500', skippable: true };
  }
}

/**
 * Asked during the build, right before the products or services go in, when some items have no price.
 * The build waits; answers update just that step (D211, Pass C).
 */
export function askPricesDuringBuild(s: AssistantSession): AssistantSession {
  const missing = (s.answers.items ?? []).filter((i) => i.priceNgn === null);
  if (!missing.length) return s;
  const names = missing.slice(0, 6).map((i) => i.name).join(', ');
  return { ...s, asked: [...s.asked, 'prices'], question: questionFor('prices', { owns: () => false, signatureAllowed: false, currentTheme: s.plan!.theme, pageHasContent: false, bookingsReady: false }), messages: [...s.messages, say(`${questionPrompts.prices}\n${names}${missing.length > 6 ? ` and ${missing.length - 6} more` : ''}`)] };
}

/** Which questions apply, in order — only what the brief and earlier answers didn't already settle. */
function nextQuestionId(s: AssistantSession, ctx: EngineContext): QuestionId | null {
  const a = s.answers;
  const done = (id: QuestionId) => s.asked.includes(id) || s.skipped.includes(id);
  const order: [QuestionId, boolean][] = [
  ['business', !a.business && !a.businessText],
  ['name', !a.name],
  ['audience', !a.audience],
  ['action', !a.action],
  ['offer', !a.offer],
  ['items', !a.items?.length && !!itemsAsFor(a.offer)],
  ['city', !a.city && (a.action === 'book' || a.action === 'order' || a.offer === 'menu' || a.offer === 'services' || a.audience === 'locals')],
  ['phone', !a.phone && (a.action === 'order' || a.action === 'enquire')],
  ['feel', !a.feel],
  ['logo', !s.images.some((i) => i.role === 'logo')],
  ['photos', !s.images.some((i) => i.role !== 'logo')],
  ['qr', a.qr === undefined],
  ['mode', ctx.pageHasContent && !a.mode]];

  return order.find(([id, needed]) => needed && !done(id))?.[0] ?? null;
}

function ack(id: QuestionId, label: string): string {
  switch (id) {
    case 'business':
      return `Got it — ${label.toLowerCase()}.`;
    case 'name':
      return `Lovely, ${label}.`;
    case 'action':
      return `“${label}” it is. I’ll put that right near the top.`;
    case 'feel':
      return `${label} — good choice.`;
    default:
      return 'Thanks.';
  }
}

function ask(s: AssistantSession, ctx: EngineContext, lead?: string): AssistantSession {
  const id = nextQuestionId(s, ctx);
  if (!id) return toPlan(s, ctx, lead);
  const q = questionFor(id, ctx);
  const text = lead ? `${lead} ${questionPrompts[id]}` : questionPrompts[id];
  return { ...s, stage: 'asking', question: q, messages: [...s.messages, say(text)] };
}

function toPlan(s: AssistantSession, ctx: EngineContext, lead?: string, forceExampleId?: string): AssistantSession {
  const plan = makePlan(s.answers, s.images, { owns: ctx.owns, signatureAllowed: ctx.signatureAllowed, currentTheme: ctx.currentTheme, bookingsReady: ctx.bookingsReady, forceExampleId });
  const intro = plan.source.kind === 'template' ? `Here’s my plan, using the “${plan.source.name}” template.` : 'Here’s my plan. Nothing fit closely, so I’ve composed a new layout for you.';
  return { ...s, stage: 'plan', question: null, plan, messages: [...s.messages, say(`${lead ? `${lead} ` : ''}${intro} Have a look — nothing changes until you approve it.`, { card: 'plan' })] };
}

/** Pulls facts from free text: an action, an offer, a phone number. Never invents anything. */
function readFacts(text: string) {
  const action = actionWords.find(([, re]) => re.test(text))?.[0];
  const offer = offerWords.find(([, re]) => re.test(text))?.[0];
  return { action, offer };
}

export function respond(s: AssistantSession, input: AssistantInput, ctx: EngineContext): AssistantSession {
  const next = respondInner(s, input, ctx);
  return { ...next, updatedAt: new Date().toISOString() };
}

function respondInner(s: AssistantSession, input: AssistantInput, ctx: EngineContext): AssistantSession {
  // A question asked during the build (missing prices). The build waits until it's answered or skipped.
  if ((s.stage === 'building' || s.stage === 'paused') && s.question?.id === 'prices') {
    if (input.kind === 'skip') return { ...s, question: null, messages: [...s.messages, said('Skip for now'), say('No problem — those stay as drafts until you add prices in Commerce. Carrying on.')] };
    if (input.kind !== 'text') return s;
    const { items, filled } = applyPrices(s.answers.items ?? [], input.text);
    const withUser = { ...s, messages: [...s.messages, said(input.text)] };
    if (!filled) return { ...withUser, messages: [...withUser.messages, say('I couldn’t match that to an item — try “name price”, one per item, or skip.', { tone: 'warning' })] };
    const answers = { ...s.answers, items };
    // Rebuild the plan with the new prices; sections already shown stay the same shape.
    const plan = makePlan(answers, s.images, { owns: ctx.owns, signatureAllowed: ctx.signatureAllowed, currentTheme: ctx.currentTheme, bookingsReady: ctx.bookingsReady, forceExampleId: s.plan?.source.exampleId });
    const left = items.filter((i) => i.priceNgn === null).length;
    return { ...withUser, answers, plan: { ...plan, source: s.plan?.source ?? plan.source }, question: null, messages: [...withUser.messages, say(`Added ${filled} price${filled === 1 ? '' : 's'}.${left ? ` ${left} still without a price — they’ll stay as drafts.` : ''} Carrying on.`)] };
  }

  // After the build, photos are saved for later changes ("add a gallery").
  if (s.stage === 'done' && input.kind === 'images') {
    const items = input.items.slice(0, 8).map((i) => ({ ...i, role: 'gallery' as const }));
    return { ...s, images: [...s.images, ...items], messages: [...s.messages, said(`${items.length} photo${items.length === 1 ? '' : 's'}`, items.map((i) => i.src)), say(`Saved to Media. Say “add a gallery” and I’ll use ${items.length === 1 ? 'it' : 'them'}, or add ${items.length === 1 ? 'it' : 'them'} to any section in the canvas.`)] };
  }

  // Plan stage: approve, change, or pick another template.
  if (s.stage === 'plan') {
    if (input.kind === 'approve') return { ...s, stage: 'building', built: 0, messages: [...s.messages, said('Looks good — build it.'), say('Building now. Watch it come together on the right — you can pause any time.')] };
    if (input.kind === 'alternative') {
      const ex = examplePages.find((e) => e.id === input.exampleId);
      return toPlan({ ...s, messages: [...s.messages, said(`Try the ${ex?.category ?? 'other'} template instead.`)] }, ctx, 'Sure.', input.exampleId);
    }
    if (input.kind === 'change') return { ...s, stage: 'asking', question: null, messages: [...s.messages, said('I’d like to change something.'), say('Of course — tell me what to change. For example “make it bolder”, “add testimonials after the menu”, “remove the FAQ”, “make the buttons green” or “it’s mainly for bookings”.')] };
    if (input.kind === 'text') return applyChange(s, input.text, ctx);
    if (input.kind === 'images') {
      const items = input.items.slice(0, 8).map((i, n) => ({ ...i, role: n === 0 && !s.images.some((x) => x.role === 'hero') ? 'hero' as const : 'gallery' as const }));
      return toPlan({ ...s, images: [...s.images, ...items], messages: [...s.messages, said(`${items.length} photo${items.length === 1 ? '' : 's'}`, items.map((i) => i.src))] }, ctx, 'Added your photos to the plan.');
    }
    return s;
  }

  // Intro: the brief.
  if (s.stage === 'intro') {
    if (input.kind === 'images') return { ...s, images: [...s.images, ...input.items], messages: [...s.messages, said(`${input.items.length} photo${input.items.length === 1 ? '' : 's'}`, input.items.map((i) => i.src)), say('Thanks — I’ve saved those to Media. Now tell me a little about the business.')] };
    if (input.kind !== 'text') return s;
    const text = input.text.trim();
    const withUser = { ...s, messages: [...s.messages, said(text)] };
    if (text.length < MIN_BRIEF) return { ...withUser, messages: [...withUser.messages, say('Tell me a bit more — what you offer and who it’s for, in a sentence or two.', { tone: 'warning' })] };
    const analysis = analyzeBrief(text);
    const facts = readFacts(text);
    let heardItems = 0;
    // A pasted price list in the brief becomes the item list straight away.
    const listed = looksLikePriceList(text) ? parsePriceList(text).filter((i) => i.priceNgn !== null) : [];
    const answers = { ...s.answers, brief: text, business: analysis.exampleId ?? undefined, name: analysis.name || undefined, city: analysis.city || undefined, phone: analysis.phone || undefined, offer: facts.offer, items: listed.length ? listed : undefined };
    if (listed.length) heardItems = listed.length;
    const heard = [analysis.name && `you’re ${analysis.name}`, analysis.city && `based in ${analysis.city}`, analysis.exampleId && `closest to ${examplePages.find((e) => e.id === analysis.exampleId)?.category.toLowerCase()}`, heardItems && `${heardItems} items with prices`].filter(Boolean);
    return ask({ ...withUser, answers }, ctx, heard.length ? `Great — I’ve got that ${heard.join(', ')}. A few quick questions so I build the right thing.` : 'Great. A few quick questions so I build the right thing.');
  }

  if (s.stage !== 'asking') return s;

  // Free-form change request after "Change something".
  if (!s.question) {
    if (input.kind === 'text') return applyChange(s, input.text, ctx);
    return s;
  }

  const q = s.question;
  const asked = [...s.asked, q.id];

  if (input.kind === 'skip' && q.skippable) {
    const lead = q.id === 'logo' || q.id === 'photos' ? 'No problem — I’ll leave clear spots for those.' : 'No problem, you can add that later.';
    return ask({ ...s, question: null, skipped: [...s.skipped, q.id], messages: [...s.messages, said('Skip for now')] }, ctx, lead);
  }

  if ((q.input === 'images' || q.input === 'image') && input.kind === 'images') {
    const items = q.input === 'image' ? input.items.slice(0, 1).map((i) => ({ ...i, role: 'logo' as const })) : input.items.slice(0, 8).map((i, n) => ({ ...i, role: n === 0 && !s.images.some((x) => x.role === 'hero') ? 'hero' as const : 'gallery' as const }));
    const lead = q.input === 'image' ? 'That’s going at the top, and it’s saved in Media → Brand assets.' : `Got ${items.length}. The first becomes the main image${items.length > 1 ? ', the rest go in a gallery' : ''}.`;
    return ask({ ...s, asked, question: null, images: [...s.images, ...items], messages: [...s.messages, said(`${items.length} image${items.length === 1 ? '' : 's'}`, items.map((i) => i.src))] }, ctx, lead);
  }

  // Photos dropped while answering something else: keep them, keep the question.
  if (input.kind === 'images') {
    const items = input.items.slice(0, 8).map((i, n) => ({ ...i, role: n === 0 && !s.images.some((x) => x.role === 'hero') ? 'hero' as const : 'gallery' as const }));
    return { ...s, images: [...s.images, ...items], messages: [...s.messages, said(`${items.length} photo${items.length === 1 ? '' : 's'}`, items.map((i) => i.src)), say(`Saved ${items.length === 1 ? 'it' : 'them'} to Media — I’ll use ${items.length === 1 ? 'it' : 'them'} on the page. ${questionPrompts[q.id]}`)] };
  }

  const value = input.kind === 'choice' ? input.value : input.kind === 'text' ? input.text.trim() : '';
  const label = input.kind === 'choice' ? input.label : value;
  if (!value) return s;
  const withUser = { ...s, messages: [...s.messages, said(label)] };
  const a = { ...s.answers };

  switch (q.id) {
    case 'business':
      if (input.kind === 'choice' && value === OTHER) {
        // Keep the same question open, as a short text answer.
        return { ...withUser, question: { ...q, chips: [], input: 'text', placeholder: 'e.g. small chops in Yaba' }, messages: [...withUser.messages, say('Tell me in a few words what you do — anything you add, like your area or a WhatsApp number, saves a question later.')] };
      }
      if (input.kind === 'choice') a.business = value;else
      {
        // A typed answer can carry more than the business type — pick up anything it already says.
        const m = analyzeBrief(value);
        const facts = readFacts(value);
        if (m.exampleId) a.business = m.exampleId;else
        a.businessText = value;
        a.brief = a.brief || value;
        a.name = a.name ?? (m.name || undefined);
        a.city = a.city ?? (m.city || undefined);
        a.phone = a.phone ?? (m.phone || undefined);
        a.offer = a.offer ?? facts.offer;
        a.action = a.action ?? facts.action;
        if (!a.items?.length && looksLikePriceList(value)) {
          const listed = parsePriceList(value).filter((i) => i.priceNgn !== null);
          if (listed.length) a.items = listed;
        }
      }
      break;
    case 'name':
      a.name = value.slice(0, 60);
      break;
    case 'audience':
      a.audience = value.slice(0, 80);
      break;
    case 'action':{
        const chosen = input.kind === 'choice' ? value as typeof a.action : readFacts(value).action;
        if (!chosen) return { ...withUser, messages: [...withUser.messages, say('I didn’t quite catch that — is it closest to one of these?', { tone: 'warning' })] };
        a.action = chosen;
        break;
      }
    case 'offer':{
        const chosen = input.kind === 'choice' ? value as typeof a.offer : readFacts(value).offer;
        a.offer = chosen ?? 'content';
        break;
      }
    case 'city':
      // "Online only" answers the question without putting an address on the page.
      if (!(input.kind === 'choice' && value === 'online')) a.city = value.slice(0, 60);
      break;
    case 'phone':{
        // The workspace's country, or any of our four with a country code (D420).
        const clean = findMobileNumber(value);
        if (!clean) return { ...withUser, messages: [...withUser.messages, say('That doesn’t look like a complete mobile number. Check the digits or add your country code (+234, +254, +233 or +27), or say skip.', { tone: 'warning' })] };
        a.phone = clean;
        break;
      }
    case 'feel':
      a.feel = value as AssistantFeel;
      break;
    case 'mode':
      a.mode = value === 'add' ? 'add' : 'replace';
      break;
    case 'items':{
        const items = parsePriceList(value);
        if (!items.length) return { ...withUser, messages: [...withUser.messages, say('I couldn’t read a list from that — put each item on its own line, like “Party tray (small) — 15,000”. Or skip and add them later.', { tone: 'warning' })] };
        a.items = items;
        const priced = items.filter((i) => i.priceNgn !== null);
        const summary = items.slice(0, 4).map((i) => i.priceNgn !== null ? `${i.name} ${formatNgn(i.priceNgn)}` : i.name).join(' · ');
        return ask({ ...withUser, answers: a, asked, question: null }, ctx, `Got ${items.length} item${items.length === 1 ? '' : 's'}${priced.length < items.length ? ` (${items.length - priced.length} without a price — I’ll ask while I build)` : ''}: ${summary}${items.length > 4 ? ' …' : ''}.`);
      }
    case 'qr':
      a.qr = value === 'yes';
      break;
    default:
      break;
  }

  const lead = ack(q.id, q.id === 'name' && a.name ? a.name : q.id === 'action' && a.action ? actionLabels[a.action] : q.id === 'business' && a.business ? examplePages.find((e) => e.id === a.business)?.category ?? label : label);
  const progressed = { ...withUser, answers: a, asked, question: null };
  // Always ask at least MIN_QUESTIONS before showing a plan.
  if (!nextQuestionId(progressed, ctx) && asked.length < MIN_QUESTIONS) {
    const extra: QuestionId = !asked.includes('audience') ? 'audience' : !asked.includes('feel') ? 'feel' : 'action';
    return { ...progressed, question: questionFor(extra, ctx), messages: [...progressed.messages, say(`${lead} ${questionPrompts[extra]}`)] };
  }
  return ask(progressed, ctx, lead);
}

/** "Change something": read the request, update answers, and show a fresh plan. */
function applyChange(s: AssistantSession, text: string, ctx: EngineContext): AssistantSession {
  const withUser = { ...s, messages: [...s.messages, said(text)] };
  const a = { ...s.answers };
  const changed: string[] = [];
  const lower = text.toLowerCase();
  const feel = (Object.keys(feelLabels) as AssistantFeel[]).find((f) => lower.includes(f) || f === 'warm' && /warmer|cosy|cozy/.test(lower) || f === 'bold' && /bolder|louder|brighter/.test(lower) || f === 'dark' && /darker/.test(lower) || f === 'light' && /lighter|airy|cleaner/.test(lower));
  if (feel) {
    a.feel = feel;
    changed.push(`the look is now ${feelLabels[feel].toLowerCase()}`);
  }
  const facts = readFacts(text);
  if (facts.action && facts.action !== a.action && /\b(main|mainly|first|instead|for)\b/.test(lower)) {
    a.action = facts.action;
    changed.push(`the main action is “${actionLabels[facts.action].toLowerCase()}”`);
  }
  const nameMatch = /(?:name is|called|spelt|spelled)\s+["“]?([A-Z][\w'&.-]*(?:\s+[A-Z&][\w'&.-]*){0,3})/.exec(text);
  if (nameMatch) {
    a.name = nameMatch[1];
    changed.push(`the name is ${nameMatch[1]}`);
  }
  // Any of the four countries' mobile numbers, with or without the code (D514); was Nigeria-only.
  const phone = findMobileNumber(text);
  if (phone) {
    a.phone = phone;
    changed.push('the WhatsApp number is updated');
  }
  if (looksLikePriceList(text)) {
    a.items = parsePriceList(text);
    changed.push(`your list now has ${a.items.length} items`);
  }
  if (/compos|from scratch|new layout|custom layout/.test(lower)) a.business = undefined;
  if (!changed.length && !/compos|from scratch|new layout/.test(lower)) {
    // Section-level edits (add, remove, move, words, button colour) work on the plan too, before anything is built.
    if (s.plan) {
      const r = proposeChange({ text, blocks: s.plan.units.flatMap((u) => u.blocks), theme: s.plan.theme, signatureAllowed: ctx.signatureAllowed, photos: s.images.filter((i) => i.role !== 'logo').map((i) => ({ src: i.src, name: i.name })) });
      if (r.kind === 'change') {
        const units = r.blocks.filter((b) => !b.parentId).map((b) => ({ id: uid('unit'), label: blockName(b), blocks: [b, ...r.blocks.filter((c) => c.parentId === b.id)] }));
        const plan = { ...s.plan, units, theme: r.theme };
        return { ...withUser, stage: 'plan', question: null, plan, messages: [...withUser.messages, say(`${r.summary} The plan is updated — nothing is built until you approve it.`, { card: 'plan' })] };
      }
      return { ...withUser, stage: 'plan', messages: [...withUser.messages, say(r.message)] };
    }
    return { ...withUser, stage: 'asking', messages: [...withUser.messages, say(REFINE_HELP)] };
  }
  return toPlan({ ...withUser, answers: a }, ctx, changed.length ? `Done — ${changed.join(', ')}.` : 'Done — composing a fresh layout.');
}