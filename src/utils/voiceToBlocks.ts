import type { Block } from '../types/page';
import { createBlock } from './blocks';
import { uid } from './id';

/** What spoken or typed words become (D342). */
export type VoiceShape = 'text' | 'headingText' | 'faq';

const tidy = (s: string) => {
  const t = s.replace(/\s+/g, ' ').trim();
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : '';
};

/** Splits after . ! ? (keeping the mark) — spoken text often has none, so the whole thing is one sentence then. */
const sentences = (s: string) =>
s.
replace(/\s+/g, ' ').
split(/(?<=[.!?])\s+/).
map((x) => x.trim()).
filter(Boolean);

const paragraphs = (s: string) =>
s.
split(/\n\s*\n/).
map((p) => tidy(p)).
filter(Boolean).
map((p) => /[.!?…]$/.test(p) ? p : `${p}.`);

/** Builds the blocks the words turn into. Empty when there's nothing usable (e.g. no "?" for questions). */
export function voiceToBlocks(words: string, shape: VoiceShape): Block[] {
  const text = words.trim();
  if (!text) return [];
  if (shape === 'text') {
    const b = createBlock('text');
    b.content = { ...b.content, body: paragraphs(text).join('\n\n') };
    return [b];
  }
  if (shape === 'headingText') {
    const all = sentences(text);
    const first = tidy(all[0] ?? '').replace(/[.!]$/, '');
    const rest = text.slice(text.indexOf(all[0] ?? '') + (all[0] ?? '').length).trim();
    const h = createBlock('heading');
    h.content = { ...h.content, text: first };
    if (!rest) return [h];
    const b = createBlock('text');
    b.content = { ...b.content, body: paragraphs(rest).join('\n\n') };
    return [h, b];
  }
  // Questions and answers: each sentence ending in "?" starts a question; what follows is its answer.
  const items: {id: string;question: string;answer: string;}[] = [];
  sentences(text.replace(/\n+/g, ' ')).forEach((s) => {
    if (s.endsWith('?')) items.push({ id: uid('faq'), question: tidy(s), answer: '' });else
    if (items.length) items[items.length - 1].answer = tidy(`${items[items.length - 1].answer} ${s}`);
  });
  if (items.length === 0) return [];
  const f = createBlock('faq');
  f.content = { ...f.content, title: 'Questions', items };
  return [f];
}