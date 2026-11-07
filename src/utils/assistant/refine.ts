import type { AssistantFeel } from '../../types/assistant';
import type { Block, BlockType, PageTheme } from '../../types/page';
import { feelLabels } from '../../data/assistantQuestions';
import { blockName, createBlock } from '../blocks';
import { blockDefinitions } from '../../data/blockRegistry';
import { blockSearchText } from '../../data/blockTaxonomy';
import { themeForFeel } from './layout';
import { uid } from '../id';

/**
 * Changes after the build, by chat (D211, Pass D). Each request becomes a proposed page the owner keeps or
 * discards. Rule-based in the prototype; a real model replaces `proposeChange` and must return the same shape
 * (a whole valid page, never code) so the before/after, Keep and Undo stay the same. Never invents facts.
 */

export interface RefineInput {
  text: string;
  blocks: Block[];
  theme: PageTheme;
  /** A section the owner tapped in the preview ("this"). */
  focusId?: string;
  signatureAllowed: boolean;
  /** Photos from the conversation, used when adding a gallery. */
  photos: { src: string; name: string }[];
}

export type RefineResult =
  | { kind: 'change'; blocks: Block[]; theme: PageTheme; summary: string; focusId?: string }
  | { kind: 'decline'; message: string };

/** What the owner can ask for, shown when a request isn't understood. */
export const REFINE_HELP = 'I can change the look (warmer, bolder, darker, lighter, editorial, glass) or the button colour (“make the buttons green”), add a section (gallery, FAQ, hours, location, newsletter, WhatsApp, contact form, video, share, delivery, policies, team, call to action), remove or move a section, or change the main headline to words you give me.';

const ADDABLE: [RegExp, BlockType][] = [
  [/\bgaller(y|ies)\b|\bphotos?\b|\bpictures?\b/, 'gallery'],
  [/\bfaqs?\b|\bquestions\b/, 'faq'],
  [/\b(opening )?hours\b|\bopening times\b/, 'hours'],
  [/\blocation\b|\bmap\b|\baddress\b|\bdirections\b/, 'location'],
  [/\bnewsletter\b|\bmailing list\b|\bsubscribe\b|\bsign[- ]?up\b/, 'newsletter'],
  [/\bwhatsapp\b/, 'whatsapp'],
  [/\bcontact form\b|\benquiry\b|\binquiry\b|\bform\b/, 'leadForm'],
  [/\bvideo\b|\byoutube\b/, 'video'],
  [/\bshare\b/, 'share'],
  [/\bdelivery\b|\bshipping\b/, 'delivery'],
  [/\bpolic(y|ies)\b|\breturns?\b|\brefunds?\b/, 'policies'],
  [/\bteam\b|\bstaff\b/, 'team'],
  [/\bcall to action\b|\bcta\b|\bbutton\b|\bbanner\b/, 'cta'],
  [/\bsocials?\b|\binstagram\b|\btiktok\b/, 'social'],
  [/\bcountdown\b/, 'countdown'],
  [/\breview summary\b|\breal reviews\b/, 'reviewSummary'],
  [/\bparagraph\b|\btext\b/, 'text'],
  [/\bheading\b|\btitle\b/, 'heading'],
];

/** Words that point at an existing section, for "remove the gallery" or "move the menu up". */
const NAMED: [RegExp, BlockType[]][] = [
  [/\bgaller(y|ies)\b|\bphotos\b/, ['gallery', 'carousel']],
  [/\bfaqs?\b/, ['faq']],
  [/\bhours\b/, ['hours']],
  [/\blocation\b|\bmap\b|\baddress\b/, ['location']],
  [/\bmenu\b/, ['menu']],
  [/\bproducts?\b|\bshop\b/, ['productGrid', 'product', 'shopCategories']],
  [/\bservices?\b|\bpric(es|ing)\b|\bpackages?\b/, ['pricing', 'featureGrid']],
  [/\bnewsletter\b/, ['newsletter']],
  [/\bwhatsapp\b/, ['whatsapp']],
  [/\bform\b|\benquiry\b/, ['leadForm', 'form']],
  [/\bbooking\b/, ['booking']],
  [/\bhero\b|\bbanner\b|\bheadline\b/, ['hero']],
  [/\bcontact\b/, ['contactActions', 'contact']],
  [/\babout\b/, ['text']],
  [/\bvideo\b/, ['video']],
  [/\bsocials?\b/, ['social']],
];

const CLOSERS: BlockType[] = ['contactActions', 'contact', 'social', 'share', 'whatsapp'];

export function proposeChange(input: RefineInput): RefineResult {
  const lower = input.text.toLowerCase();
  const top = input.blocks.filter((b) => !b.parentId);

  // Never write facts only the owner knows.
  // (Adding an empty Testimonial block is fine — the owner fills it with real quotes.)
  if (/\b(write|invent|generate|make up|fake)\b.*\b(reviews?|testimonials?|ratings?|stars)\b/.test(lower) && !/review summary|real reviews/.test(lower))
    return { kind: 'decline', message: 'I won’t write reviews or testimonials — they have to come from real customers. I can add a Review summary that shows only reviews people actually left, or you can send review requests from Audience.' };
  if (/\b(make up|invent|guess|suggest)\b.*\bpric/.test(lower))
    return { kind: 'decline', message: 'I only use prices you give me. Tell me them like “Asun 4500” and I’ll add them, or set them in Commerce.' };
  if (/\b(guarantee|certified|award|qualified|licensed)\b/.test(lower) && /\b(add|say|write|claim)\b/.test(lower))
    return { kind: 'decline', message: 'I don’t add guarantees, awards or qualifications for you. If you have them, add them yourself in the canvas so the wording is exactly yours.' };

  // A whole new look.
  const feel = (Object.keys(feelLabels) as AssistantFeel[]).find(
    (f) => lower.includes(f) || (f === 'warm' && /warmer|cosy|cozy/.test(lower)) || (f === 'bold' && /bolder|louder|brighter|vibrant/.test(lower)) || (f === 'dark' && /darker/.test(lower)) || (f === 'light' && /lighter|airy|cleaner|brighter background/.test(lower)) || (f === 'editorial' && /magazine|elegant/.test(lower)),
  );
  if (feel && !/\b(add|remove|delete|move)\b/.test(lower) && !/\b(button|buttons|accent)\b/.test(lower)) {
    const { theme, name } = themeForFeel(feel, input.signatureAllowed);
    return { kind: 'change', blocks: input.blocks, theme, summary: `Changed the look to ${name} (${feelLabels[feel].toLowerCase()}). Your sections and words stay the same.` };
  }

  // Button / accent colour. Buttons share the theme's accent, so this changes every button on the page.
  if ((/\b(colou?rs?|accent)\b/.test(lower) || readColour(lower)) && /\b(button|buttons|accent|brand|main|subscribe|cta|link)\b/.test(lower)) {
    const colour = readColour(lower);
    if (!colour) return { kind: 'decline', message: 'Which colour should the buttons be? For example green, navy, gold or a code like #1F7A4D.' };
    const theme: PageTheme = { ...input.theme, accent: colour.hex, accentText: readableOn(colour.hex) };
    return { kind: 'change', blocks: input.blocks, theme, summary: `Buttons and highlights are now ${colour.name}. Buttons share one colour across the page, so every button changes together.`, focusId: input.focusId };
  }

  const focus = input.focusId ? top.find((b) => b.id === input.focusId) : undefined;
  const isAdd = /\b(add|adding|include|insert|put in|create|give me|append)\b/.test(lower) || /\b(i want|i need|can you put|let'?s have)\b.*\b(a|an|some)\b/.test(lower);
  const target = focus && /\b(this|it|that|here)\b/.test(lower) ? focus : findNamed(top, lower) ?? (focus && /\b(remove|delete|hide|move|up|down|top|bottom|change|rename|set|duplicate|copy)\b/.test(lower) ? focus : undefined);

  // Add a section — checked first so "add a gallery below the hero" doesn't move the hero.
  if (isAdd && !/\b(remove|delete)\b/.test(lower)) return addSection(input, lower, top, focus);

  // Duplicate a section.
  if (/\b(duplicate|copy|repeat)\b/.test(lower)) {
    if (!target) return { kind: 'decline', message: 'Which section should I copy? Tap it in the preview, or name it.' };
    const kids = input.blocks.filter((b) => b.parentId === target.id);
    const copy = { ...target, id: uid('blk') } as Block;
    const copies = [copy, ...kids.map((k) => ({ ...k, id: uid('blk'), parentId: copy.id }) as Block)];
    const order = [...top];
    order.splice(order.findIndex((b) => b.id === target.id) + 1, 0, copy);
    return { kind: 'change', blocks: reassemble([...input.blocks, ...copies], order), theme: input.theme, summary: `Copied the ${blockName(target).toLowerCase()} section — the copy is right below it.`, focusId: copy.id };
  }

  // Remove a section (and anything inside it).
  if (/\b(remove|delete|take out|get rid of|drop|hide)\b/.test(lower)) {
    if (!target) return { kind: 'decline', message: 'Which section should I remove? Tap it in the preview, or name it — for example “remove the FAQ”.' };
    if (top.length <= 1) return { kind: 'decline', message: 'That’s the only section on the page, so I’ll leave it.' };
    const blocks = input.blocks.filter((b) => b.id !== target.id && b.parentId !== target.id);
    return { kind: 'change', blocks, theme: input.theme, summary: `Removed the ${blockName(target).toLowerCase()} section.` };
  }

  // Move a section.
  const dir = /\b(to the top|first)\b/.test(lower) ? 'top' : /\b(to the bottom|to the end|last)\b/.test(lower) ? 'bottom' : /\b(up|higher|earlier|above)\b/.test(lower) ? 'up' : /\b(down|lower|later|below)\b/.test(lower) ? 'down' : null;
  if (/\bmove\b/.test(lower) || (dir && target)) {
    if (!target) return { kind: 'decline', message: 'Which section should I move? Tap it in the preview, or name it — for example “move the menu up”.' };
    if (!dir) return { kind: 'decline', message: `Where should the ${blockName(target).toLowerCase()} go — up, down, to the top or to the end?` };
    const i = top.findIndex((b) => b.id === target.id);
    const order = top.filter((b) => b.id !== target.id);
    const at = dir === 'top' ? 0 : dir === 'bottom' ? order.length : dir === 'up' ? Math.max(0, i - 1) : Math.min(order.length, i + 1);
    if (at === i) return { kind: 'decline', message: `The ${blockName(target).toLowerCase()} is already ${dir === 'up' || dir === 'top' ? 'at the top' : 'at the end'}.` };
    order.splice(at, 0, target);
    return { kind: 'change', blocks: reassemble(input.blocks, order), theme: input.theme, summary: `Moved the ${blockName(target).toLowerCase()} ${dir === 'top' ? 'to the top' : dir === 'bottom' ? 'to the end' : dir}.`, focusId: target.id };
  }

  // New headline, only in the owner's own words.
  const headline = /(?:headline|heading|title)\s*(?:to|:|say|says|should say)\s*["“']?(.+?)["”']?\s*$/i.exec(input.text);
  if (headline) {
    const words = headline[1].trim().slice(0, 90);
    const host = focus && (focus.type === 'hero' || focus.type === 'heading') ? focus : top.find((b) => b.type === 'hero') ?? top.find((b) => b.type === 'heading');
    if (!host || !words) return { kind: 'decline', message: 'There’s no headline on the page yet — ask me to “add a heading” first.' };
    const blocks = input.blocks.map((b) => (b.id !== host.id ? b : b.type === 'hero' ? ({ ...b, content: { ...b.content, title: words } } as Block) : b.type === 'heading' ? ({ ...b, content: { ...b.content, text: words } } as Block) : b));
    return { kind: 'change', blocks, theme: input.theme, summary: `The headline now reads “${words}”.`, focusId: host.id };
  }
  // Any section's words, in the owner's own words: "change this title to …", "make the button say …".
  const said = /\b(?:to|say|says|read|reads|into)\s*:?\s*["“'](.+?)["”']\s*$/i.exec(input.text) ?? (/\b(change|set|rename|update|make)\b/.test(lower) ? /\b(?:to|say|says|read|reads)\s*:?\s+(.+?)\s*$/i.exec(input.text) : null);
  if (said && /\b(change|set|rename|update|make|edit)\b/.test(lower)) {
    const host = target ?? focus;
    if (!host) return { kind: 'decline', message: 'Which section’s words should change? Tap it in the preview first, or name it — for example “change the FAQ title to Questions”.' };
    const words = said[1].trim().slice(0, 140);
    const wantsLabel = /\b(button|label|cta)\b/.test(lower);
    const wantsSub = /\b(subtitle|description|intro|paragraph|body|text under|tagline)\b/.test(lower);
    const keys = wantsLabel ? ['primaryLabel', 'buttonLabel', 'ctaLabel', 'submitLabel', 'label'] : wantsSub ? ['subtitle', 'description', 'intro', 'tagline', 'text', 'body'] : ['title', 'text', 'name', 'body', 'label'];
    const content = host.content as Record<string, unknown>;
    const key = keys.find((k) => typeof content[k] === 'string');
    if (!key) return { kind: 'decline', message: `The ${blockName(host).toLowerCase()} doesn’t have ${wantsLabel ? 'a button label' : 'that kind of text'} I can change from here. Open it in the canvas to edit its words.` };
    const blocks = input.blocks.map((b) => (b.id === host.id ? ({ ...b, content: { ...b.content, [key]: words } } as Block) : b));
    return { kind: 'change', blocks, theme: input.theme, summary: `The ${blockName(host).toLowerCase()} ${wantsLabel ? 'button now says' : wantsSub ? 'text now reads' : 'now reads'} “${words}”.`, focusId: host.id };
  }

  if (/\b(rewrite|shorter|longer|catchier|better)\b.*\b(headline|text|copy|words)\b/.test(lower))
    return { kind: 'decline', message: 'In this preview I can’t rewrite your words yet. Give me the exact words — “change the headline to …” — or edit any text in the canvas.' };

  // Last try: a section type named on its own ("testimonials", "a pricing table").
  if (lower.split(/\s+/).length <= 4 && matchAnyBlock(lower)) return addSection(input, lower, top, focus);

  return { kind: 'decline', message: REFINE_HELP };
}

/** Adds a section of the requested type where the owner asked: top, end, or next to a tapped or named section. */
function addSection(input: RefineInput, lower: string, top: Block[], focus: Block | undefined): RefineResult {
  // What to add comes before "after/below/…"; what follows is where it goes.
  const head = lower.split(/\b(?:after|below|under|before|above|next to)\b/)[0];
  const type = ADDABLE.find(([re]) => re.test(head))?.[1] ?? matchAnyBlock(head);
  if (!type) return { kind: 'decline', message: `Which kind of section? For example a gallery, testimonials, pricing, FAQ, opening hours, a video or a contact form. ${/\b(block|section)\b/.test(lower) ? 'You can also browse every block in the canvas.' : ''}`.trim() };
  if (!['text', 'heading', 'cta', 'image', 'link', 'divider', 'spacer', 'testimonial', 'quote'].includes(type) && top.some((b) => b.type === type)) {
    const existing = top.find((b) => b.type === type)!;
    return { kind: 'decline', message: `There’s already a ${blockName(existing).toLowerCase()} on the page. Tap it in the preview to move, copy or remove it.` };
  }
  const block = newSection(type, input.photos);
  const order = [...top];
  // A section named in the request ("below the hero") anchors the position.
  const tail = lower.slice(head.length);
  const anchor = tail ? (/\b(this|it)\b/.test(tail) ? focus : findNamed(top, tail)) : undefined;
  const at = anchor
    ? order.findIndex((b) => b.id === anchor.id) + (/\b(before|above)\b/.test(lower) ? 0 : 1)
    : /\b(top|start|first)\b/.test(lower)
      ? order[0] && (order[0].type === 'profile' || order[0].type === 'brandHeader' || order[0].type === 'hero') ? 1 : 0
      : focus && !/\b(end|bottom|last)\b/.test(lower)
        ? order.findIndex((b) => b.id === focus.id) + 1
        : /\b(end|bottom|last)\b/.test(lower) || !CLOSERS.includes(order[order.length - 1]?.type as BlockType)
          ? order.length
          : order.length - 1;
  order.splice(Math.max(0, at), 0, block);
  const filled = type === 'gallery' && input.photos.length ? ` with your ${input.photos.length} photo${input.photos.length === 1 ? '' : 's'}` : '';
  const gaps = ['faq', 'hours', 'location', 'team', 'policies', 'delivery', 'testimonial', 'pricing', 'comparison', 'timeline', 'credentials'].includes(type) ? ' It has spaces for your own details — fill them in the canvas.' : '';
  return { kind: 'change', blocks: reassemble([...input.blocks, block], order), theme: input.theme, summary: `Added a ${blockName(block).toLowerCase()} section${filled}.${gaps}`, focusId: block.id };
}

const STOP = new Set(['add', 'adding', 'the', 'and', 'section', 'sections', 'block', 'blocks', 'please', 'can', 'you', 'page', 'want', 'need', 'some', 'with', 'for', 'this', 'that', 'after', 'before', 'top', 'end', 'bottom', 'below', 'above', 'under', 'include', 'insert', 'put', 'create', 'new', 'my', 'our', 'give', 'have', 'let', 'lets', 'into', 'there', 'here', 'also', 'one', 'another']);

/** Finds the block a request names, using block names, descriptions and everyday synonyms (the picker's search). */
function matchAnyBlock(lower: string): BlockType | null {
  const words = lower.replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w));
  if (!words.length) return null;
  let best: { type: BlockType; score: number } | null = null;
  for (const type of Object.keys(blockDefinitions) as BlockType[]) {
    const name = blockDefinitions[type].name.toLowerCase();
    const text = blockSearchText(type);
    let score = lower.includes(name) ? 5 : 0;
    for (const w of words) if (new RegExp(`\\b${w.replace(/s$/, '')}`).test(text)) score += name.includes(w.replace(/s$/, '')) ? 2 : 1;
    if (score > (best?.score ?? 1)) best = { type, score };
  }
  return best?.type ?? null;
}

const COLOURS: [string, string][] = [
  ['navy', '#1A2A6C'],
  ['teal', '#00796B'],
  ['red', '#C62828'],
  ['orange', '#E65100'],
  ['yellow', '#F9A825'],
  ['gold', '#B8860B'],
  ['green', '#2E7D32'],
  ['blue', '#1565C0'],
  ['purple', '#6A1B9A'],
  ['pink', '#C2185B'],
  ['brown', '#6D4C41'],
  ['black', '#111111'],
  ['grey', '#4B5563'],
  ['gray', '#4B5563'],
];

function readColour(lower: string): { name: string; hex: string } | null {
  const hex = /#([0-9a-f]{6}|[0-9a-f]{3})\b/.exec(lower)?.[0];
  if (hex) return { name: hex.toUpperCase(), hex: hex.length === 4 ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}` : hex };
  const hit = COLOURS.find(([n]) => new RegExp(`\\b${n}\\b`).test(lower));
  return hit ? { name: hit[0], hex: hit[1] } : null;
}

/** White or near-black text, whichever reads better on the button colour. */
function readableOn(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const l = 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
  return (1.05) / (l + 0.05) >= (l + 0.05) / 0.0625 ? '#FFFFFF' : '#111111';
}

function findNamed(top: Block[], lower: string): Block | undefined {
  for (const [re, types] of NAMED) if (re.test(lower)) {
    const hit = top.find((b) => types.includes(b.type));
    if (hit) return hit;
  }
  return undefined;
}

/** Top-level blocks in a new order, each followed by its own children. */
function reassemble(all: Block[], order: Block[]): Block[] {
  return order.flatMap((b) => [b, ...all.filter((c) => c.parentId === b.id)]);
}

function newSection(type: BlockType, photos: { src: string; name: string }[]): Block {
  const b = createBlock(type) as Block;
  if (b.type === 'gallery' && photos.length) return { ...b, content: { ...b.content, images: photos.slice(0, 12).map((p) => ({ id: uid('img'), url: p.src, alt: '' })) } } as Block;
  return b;
}
